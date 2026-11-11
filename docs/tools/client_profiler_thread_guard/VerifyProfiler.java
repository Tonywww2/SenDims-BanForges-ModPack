import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.ConcurrentModificationException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Function;
import java.util.function.IntSupplier;
import java.util.function.LongSupplier;
import java.util.function.Supplier;
import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.Opcodes;
import org.objectweb.asm.tree.ClassNode;
import org.objectweb.asm.tree.MethodNode;
import org.badiff.Diff;
import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;
import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

public final class VerifyProfiler {
    private static int checks;
    private static final String TYPE = PatchProfiler.OWNER.replace('/', '.');

    public static void main(String[] args) throws Exception {
        Path minecraftJar = Path.of(args[0]);
        Path output = Path.of(args[1]);
        byte[] original = Files.readAllBytes(output.resolve("ActiveProfiler.original.class"));
        byte[] patched = Files.readAllBytes(output.resolve("ActiveProfiler.class"));
        check(race(minecraftJar, original), "Original native profiler reproduces computeIfAbsent CME");
        check(!race(minecraftJar, patched), "Patched native profiler prevents the same race");
        check(ownerScenario(minecraftJar, original).equals(ownerScenario(minecraftJar, patched)),
            "Owner timings, sections, counters and chart markers equal the native implementation");
        rejectAllForeignMutators(minecraftJar, patched);
        firstUseOnWorker(minecraftJar, patched);
        concurrentLoad(minecraftJar, patched);
        hotaiRoundTrip(output, original, patched);
        System.out.println("PASS " + checks + " native-bytecode and HotAI checks.");
    }

    private static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
        checks++;
        System.out.println("OK " + message);
    }

    private static final class NativeLoader extends URLClassLoader {
        NativeLoader(Path jar, byte[] profiler) throws Exception {
            super(new URL[] {jar.toUri().toURL()}, VerifyProfiler.class.getClassLoader());
            byte[] clock = clockStub();
            defineClass("net.minecraft.Util", clock, 0, clock.length);
            defineClass(TYPE, profiler, 0, profiler.length);
        }

        Object createProfiler() throws Exception {
            return loadClass(TYPE).getConstructor(LongSupplier.class, IntSupplier.class, boolean.class)
                .newInstance((LongSupplier) () -> 0L, (IntSupplier) () -> 1, false);
        }
    }

    private static Object invoke(Object profiler, String name, Object... arguments) throws Exception {
        Method found = null;
        for (Method method : profiler.getClass().getMethods()) {
            if (!method.getName().equals(name) || method.getParameterCount() != arguments.length) continue;
            boolean matches = true;
            for (int i = 0; i < arguments.length; i++) {
                Class<?> type = method.getParameterTypes()[i];
                if (!(type == int.class && arguments[i] instanceof Integer) && !type.isInstance(arguments[i])) {
                    matches = false;
                }
            }
            if (matches) found = method;
        }
        if (found == null) throw new NoSuchMethodException(name);
        try {
            return found.invoke(profiler, arguments);
        } catch (InvocationTargetException exception) {
            if (exception.getCause() instanceof Exception cause) throw cause;
            throw exception;
        }
    }

    private static Object field(Object object, String name) throws Exception {
        Field field = object.getClass().getDeclaredField(name);
        field.setAccessible(true);
        return field.get(object);
    }

    private static String snapshot(Object profiler) throws Exception {
        Map<String, Object> snapshot = new TreeMap<>();
        for (String name : List.of("f_18370_", "f_18371_", "f_18377_", "f_18378_", "f_145926_")) {
            snapshot.put(name, String.valueOf(field(profiler, name)));
        }
        Map<?, ?> entries = (Map<?, ?>) field(profiler, "f_18372_");
        Map<String, Object> sections = new TreeMap<>();
        for (var entry : entries.entrySet()) {
            Map<String, Object> values = new TreeMap<>();
            for (Field detail : entry.getValue().getClass().getDeclaredFields()) {
                detail.setAccessible(true);
                values.put(detail.getName(), String.valueOf(detail.get(entry.getValue())));
            }
            sections.put(String.valueOf(entry.getKey()), values);
        }
        snapshot.put("entries", sections);
        return snapshot.toString();
    }

    private static String ownerScenario(Path jar, byte[] bytes) throws Exception {
        try (NativeLoader loader = new NativeLoader(jar, bytes)) {
            Object profiler = loader.createProfiler();
            Object category = loader.loadClass("net.minecraft.util.profiling.metrics.MetricCategory")
                .getEnumConstants()[0];
            invoke(profiler, "m_7242_");
            invoke(profiler, "m_6180_", "section");
            invoke(profiler, "m_183275_", "counter", 2);
            invoke(profiler, "m_6174_", "default_counter");
            invoke(profiler, "m_142259_", category);
            invoke(profiler, "m_6182_", "next");
            invoke(profiler, "m_183536_", (Supplier<String>) () -> "supplier", 3);
            invoke(profiler, "m_6525_", (Supplier<String>) () -> "default_supplier");
            invoke(profiler, "m_6523_", (Supplier<String>) () -> "last");
            invoke(profiler, "m_6521_", (Supplier<String>) () -> "nested");
            invoke(profiler, "m_7238_");
            invoke(profiler, "m_7238_");
            invoke(profiler, "m_7241_");
            check(invoke(profiler, "m_5948_") != null, "Native profile results remain available");
            return snapshot(profiler);
        }
    }

    private static boolean race(Path jar, byte[] bytes) throws Exception {
        try (NativeLoader loader = new NativeLoader(jar, bytes)) {
            Object profiler = loader.createProfiler();
            invoke(profiler, "m_7242_");
            invoke(profiler, "m_6180_", "race");
            Thread owner = Thread.currentThread();
            CountDownLatch mappingStarted = new CountDownLatch(1);
            CountDownLatch foreignFinished = new CountDownLatch(1);
            Map<String, Object> entries = new HashMap<>() {
                @Override
                public Object computeIfAbsent(String key, Function<? super String, ?> factory) {
                    return super.computeIfAbsent(key, path -> {
                        if (Thread.currentThread() == owner) {
                            mappingStarted.countDown();
                            await(foreignFinished);
                        }
                        return factory.apply(path);
                    });
                }
            };
            Field mapField = profiler.getClass().getDeclaredField("f_18372_");
            mapField.setAccessible(true);
            mapField.set(profiler, entries);
            AtomicReference<Throwable> workerFailure = new AtomicReference<>();
            Thread worker = new Thread(() -> {
                try {
                    await(mappingStarted);
                    invoke(profiler, "m_183275_", "foreign", 1);
                } catch (Throwable error) {
                    workerFailure.set(error);
                } finally {
                    foreignFinished.countDown();
                }
            }, "profiler-race-worker");
            worker.start();
            boolean crashed = false;
            try {
                invoke(profiler, "m_183275_", "owner", 1);
            } catch (ConcurrentModificationException expected) {
                crashed = true;
            }
            worker.join(5000);
            check(!worker.isAlive() && workerFailure.get() == null, "Race worker completes safely");
            return crashed;
        }
    }

    private static void rejectAllForeignMutators(Path jar, byte[] bytes) throws Exception {
        try (NativeLoader loader = new NativeLoader(jar, bytes)) {
            Object profiler = loader.createProfiler();
            invoke(profiler, "m_7242_");
            String before = snapshot(profiler);
            AtomicInteger supplierCalls = new AtomicInteger();
            AtomicReference<Throwable> failure = new AtomicReference<>();
            List<Method> methods = new ArrayList<>();
            for (Method method : profiler.getClass().getDeclaredMethods()) {
                if (PatchProfiler.MUTATORS.contains(method.getName() + org.objectweb.asm.Type.getMethodDescriptor(method))) {
                    methods.add(method);
                }
            }
            Thread worker = new Thread(() -> {
                try {
                    for (Method method : methods) {
                        Object[] arguments = new Object[method.getParameterCount()];
                        for (int i = 0; i < arguments.length; i++) {
                            Class<?> type = method.getParameterTypes()[i];
                            if (type == String.class) arguments[i] = "foreign";
                            else if (type == int.class) arguments[i] = 99;
                            else if (type == Supplier.class) arguments[i] = (Supplier<String>) () -> {
                                supplierCalls.incrementAndGet();
                                return "foreign";
                            };
                            else arguments[i] = type.getEnumConstants()[0];
                        }
                        method.invoke(profiler, arguments);
                    }
                    invoke(profiler, "m_6174_", "foreign_default");
                    invoke(profiler, "m_6525_", (Supplier<String>) () -> {
                        supplierCalls.incrementAndGet();
                        return "foreign_default";
                    });
                } catch (Throwable error) {
                    failure.set(error);
                }
            }, "profiler-mutator-worker");
            worker.start();
            worker.join(5000);
            check(!worker.isAlive() && failure.get() == null && methods.size() == 10,
                "All ten mutating overloads reject a foreign writer");
            check(before.equals(snapshot(profiler)), "Foreign calls leave native profiling state intact");
            check(supplierCalls.get() == 0, "Foreign lazy section and counter suppliers are not evaluated");
        }
    }

    private static void firstUseOnWorker(Path jar, byte[] bytes) throws Exception {
        try (NativeLoader loader = new NativeLoader(jar, bytes)) {
            Object profiler = loader.createProfiler();
            AtomicReference<Throwable> failure = new AtomicReference<>();
            Thread worker = new Thread(() -> {
                try {
                    invoke(profiler, "m_7242_");
                    invoke(profiler, "m_6180_", "reload_preparation");
                    invoke(profiler, "m_183275_", "prepared", 1);
                    invoke(profiler, "m_7238_");
                    invoke(profiler, "m_7241_");
                } catch (Throwable error) {
                    failure.set(error);
                }
            }, "reload-preparation-worker");
            worker.start();
            worker.join(5000);
            check(!worker.isAlive() && failure.get() == null && snapshot(profiler).contains("prepared"),
                "A profiler constructed on one thread can first be used by a reload worker");
        }
    }

    private static void concurrentLoad(Path jar, byte[] bytes) throws Exception {
        try (NativeLoader loader = new NativeLoader(jar, bytes)) {
            Object profiler = loader.createProfiler();
            invoke(profiler, "m_7242_");
            AtomicReference<Throwable> failure = new AtomicReference<>();
            CountDownLatch start = new CountDownLatch(1);
            List<Thread> workers = new ArrayList<>();
            for (int index = 0; index < 4; index++) {
                Thread worker = new Thread(() -> {
                    try {
                        await(start);
                        for (int i = 0; i < 2000; i++) {
                            invoke(profiler, "m_6180_", "foreign");
                            invoke(profiler, "m_183275_", "foreign", 1);
                            invoke(profiler, "m_7238_");
                        }
                    } catch (Throwable error) {
                        failure.compareAndSet(null, error);
                    }
                }, "profiler-load-" + index);
                workers.add(worker);
                worker.start();
            }
            start.countDown();
            for (int i = 0; i < 2000; i++) {
                invoke(profiler, "m_6180_", "owner");
                invoke(profiler, "m_183275_", "owner", 1);
                invoke(profiler, "m_7238_");
            }
            for (Thread worker : workers) worker.join(10000);
            invoke(profiler, "m_7241_");
            check(failure.get() == null && workers.stream().noneMatch(Thread::isAlive),
                "Four foreign writers and the owner complete 30000 profiling calls safely");
            String state = snapshot(profiler);
            check(!state.contains("foreign") && state.contains("owner=>2000"),
                "Concurrent foreign sections cannot corrupt the owner's section stack or counters");
        }
    }

    private static void hotaiRoundTrip(Path output, byte[] original, byte[] patched) throws Exception {
        Path fixture = output.resolve("hotai-fixture");
        Path classFile = fixture.resolve(PatchProfiler.OWNER + ".class");
        Files.createDirectories(classFile.getParent());
        Files.write(classFile, patched);
        ClassNode originalNode = new ClassNode();
        new ClassReader(original).accept(originalNode, 0);
        ClassNode transformed = new BytecodeTransformer(fixture, Map.of(PatchProfiler.OWNER, patched))
            .transform(originalNode, null);
        check(!Files.exists(classFile) && Files.exists(fixture.resolve(PatchProfiler.OWNER + ".badiff")),
            "HotAI converts the replacement class into one diff in a temporary fixture");
        MemoryDiff diff = new MemoryDiff();
        try (var stream = Files.newInputStream(fixture.resolve(PatchProfiler.OWNER + ".badiff"))) {
            diff.deserialize(DefaultSerialization.newInstance(), stream);
        }
        ClassNode reapplied = new DiffTransformer(Map.<String, Diff>of(PatchProfiler.OWNER, diff))
            .transform(originalNode, null);
        check(java.util.Arrays.equals(write(transformed), write(reapplied)),
            "The generated HotAI diff reapplies to the native class exactly");
    }

    private static byte[] write(ClassNode node) {
        ClassWriter writer = new ClassWriter(0);
        node.accept(writer);
        return writer.toByteArray();
    }

    private static void await(CountDownLatch latch) {
        try {
            if (!latch.await(5, TimeUnit.SECONDS)) throw new AssertionError("Timed out coordinating profiler access");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new AssertionError(exception);
        }
    }

    private static byte[] clockStub() {
        ClassWriter writer = new ClassWriter(ClassWriter.COMPUTE_MAXS);
        writer.visit(Opcodes.V17, Opcodes.ACC_PUBLIC, "net/minecraft/Util", null, "java/lang/Object", null);
        writer.visitField(Opcodes.ACC_PRIVATE | Opcodes.ACC_STATIC, "clock", "J", null, null).visitEnd();
        var method = writer.visitMethod(Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC, "m_137569_", "()J", null, null);
        method.visitCode();
        method.visitFieldInsn(Opcodes.GETSTATIC, "net/minecraft/Util", "clock", "J");
        method.visitInsn(Opcodes.DUP2);
        method.visitLdcInsn(10L);
        method.visitInsn(Opcodes.LADD);
        method.visitFieldInsn(Opcodes.PUTSTATIC, "net/minecraft/Util", "clock", "J");
        method.visitInsn(Opcodes.LRETURN);
        method.visitMaxs(0, 0);
        method.visitEnd();
        writer.visitEnd();
        return writer.toByteArray();
    }
}
