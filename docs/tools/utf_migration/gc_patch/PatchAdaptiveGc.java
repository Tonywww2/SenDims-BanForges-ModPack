import java.lang.management.GarbageCollectorMXBean;
import java.lang.reflect.Proxy;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipFile;
import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.Opcodes;
import org.objectweb.asm.tree.ClassNode;
import org.objectweb.asm.tree.MethodInsnNode;
import org.objectweb.asm.tree.MethodNode;
import org.badiff.Diff;
import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;
import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

public final class PatchAdaptiveGc {
    private static final String OWNER = "com/ishland/c2me/base/common/AdaptiveWorldGenController";
    private static final String JAR_HASH = "e73681883b2c867049800f8b2f7bdcbbbda6c9a44eb5e165c0513914364abfc6";
    private static List<GarbageCollectorMXBean> fixtures;

    public static List<GarbageCollectorMXBean> fixtureBeans() { return fixtures; }

    public static void main(String[] arguments) throws Exception {
        Path jar = Path.of(arguments[0]);
        Path builder = Path.of(arguments[1]);
        Path output = Path.of(arguments[2]);
        require(sha256(Files.readAllBytes(jar)).equals(JAR_HASH), "Exact C2MEF 9.9.6 JAR hash");
        byte[] original;
        try (ZipFile zip = new ZipFile(jar.toFile())) {
            original = zip.getInputStream(zip.getEntry(OWNER + ".class")).readAllBytes();
        }
        ClassNode target = read(original);
        MethodNode nativeClock = target.methods.stream().filter(method -> method.name.equals("totalGcMillis")
            && method.desc.equals("()J")).findFirst().orElseThrow();
        require(nativeClock.access == (Opcodes.ACC_PRIVATE | Opcodes.ACC_STATIC), "Native GC clock signature");
        ClassNode template = read(Files.readAllBytes(builder.resolve("CollectorClockTemplate.class")));
        MethodNode replacement = template.methods.stream().filter(method -> method.name.equals("totalGcMillis"))
            .findFirst().orElseThrow();
        testClock(replacement);
        target.methods.set(target.methods.indexOf(nativeClock), replacement);
        byte[] patched = write(target);
        ClassNode decoded = read(patched);
        ClassNode before = read(original);
        require(before.methods.size() == decoded.methods.size() && before.fields.size() == decoded.fields.size(),
            "Class shape is preserved");
        for (int index = 0; index < before.methods.size(); index++) {
            MethodNode method = before.methods.get(index);
            if (!method.name.equals("totalGcMillis")) {
                require(Arrays.equals(fingerprint(method), fingerprint(decoded.methods.get(index))),
                    "Unchanged method " + method.name + method.desc);
            }
        }
        Path fixture = output.resolve("fixture");
        Path classFile = fixture.resolve(OWNER + ".class");
        Files.createDirectories(classFile.getParent());
        Files.write(classFile, patched);
        byte[] converted = write(new BytecodeTransformer(fixture, Map.of(OWNER, patched)).transform(read(original), null));
        Path diffFile = fixture.resolve(OWNER + ".badiff");
        MemoryDiff diff = new MemoryDiff();
        try (var stream = Files.newInputStream(diffFile)) {
            diff.deserialize(DefaultSerialization.newInstance(), stream);
        }
        byte[] reapplied = write(new DiffTransformer(Map.<String, Diff>of(OWNER, diff)).transform(read(original), null));
        require(Arrays.equals(converted, patched) && Arrays.equals(reapplied, patched), "HotAI conversion and restart round-trip");
        Files.createDirectories(output);
        Files.write(output.resolve("AdaptiveWorldGenController.original.class"), original);
        Files.write(output.resolve("AdaptiveWorldGenController.class"), patched);
        Files.writeString(output.resolve("verification.txt"), "C2MEF JAR SHA-256 " + JAR_HASH
            + "\nOriginal class SHA-256 " + sha256(original) + "\nPatched class SHA-256 " + sha256(patched)
            + "\nOnly totalGcMillis()J changed. ZGC concurrent cycles excluded, pause timers retained.\n");
    }

    private static void testClock(MethodNode replacement) throws Exception {
        ClassNode isolated = new ClassNode();
        isolated.version = Opcodes.V17;
        isolated.access = Opcodes.ACC_PUBLIC;
        isolated.name = "CollectorClockFixture";
        isolated.superName = "java/lang/Object";
        MethodNode clock = new MethodNode(replacement.access, replacement.name, replacement.desc,
            replacement.signature, replacement.exceptions.toArray(String[]::new));
        replacement.accept(clock);
        for (var instruction : clock.instructions) {
            if (instruction instanceof MethodInsnNode call && call.owner.equals("java/lang/management/ManagementFactory")) {
                call.owner = "PatchAdaptiveGc";
                call.name = "fixtureBeans";
            }
        }
        isolated.methods.add(clock);
        byte[] bytes = write(isolated);
        Class<?> type = new ClassLoader(PatchAdaptiveGc.class.getClassLoader()) {
            Class<?> define() { return defineClass("CollectorClockFixture", bytes, 0, bytes.length); }
        }.define();
        var method = type.getDeclaredMethod("totalGcMillis");
        method.setAccessible(true);
        fixtures = List.of(bean("ZGC Minor Cycles", 1000), bean("ZGC Major Cycles", 1200),
            bean("ZGC Minor Pauses", 4), bean("ZGC Major Pauses", 2));
        require((long) method.invoke(null) == 6, "Generational ZGC counts only pause time");
        fixtures = List.of(bean("ZGC Cycles", 900), bean("ZGC Pauses", 7));
        require((long) method.invoke(null) == 7, "Non-generational ZGC counts only pause time");
        fixtures = List.of(bean("G1 Young Generation", 19), bean("G1 Old Generation", 31));
        require((long) method.invoke(null) == 50, "Existing non-ZGC accounting is preserved");
        fixtures = List.of(bean("Copy", -1), bean("MarkSweepCompact", 3));
        require((long) method.invoke(null) == 3, "Unsupported counters are ignored");
    }

    private static GarbageCollectorMXBean bean(String name, long time) {
        return (GarbageCollectorMXBean) Proxy.newProxyInstance(PatchAdaptiveGc.class.getClassLoader(),
            new Class<?>[] {GarbageCollectorMXBean.class}, (proxy, method, arguments) -> {
                if (method.getName().equals("getName")) return name;
                if (method.getName().equals("getCollectionTime")) return time;
                throw new UnsupportedOperationException(method.getName());
            });
    }

    private static byte[] fingerprint(MethodNode method) {
        ClassWriter writer = new ClassWriter(0);
        writer.visit(Opcodes.V17, Opcodes.ACC_PUBLIC, "Fingerprint", null, "java/lang/Object", null);
        method.accept(writer);
        writer.visitEnd();
        return writer.toByteArray();
    }

    private static ClassNode read(byte[] bytes) {
        ClassNode node = new ClassNode();
        new ClassReader(bytes).accept(node, 0);
        return node;
    }

    private static byte[] write(ClassNode node) {
        ClassWriter writer = new ClassWriter(0);
        node.accept(writer);
        return writer.toByteArray();
    }

    private static String sha256(byte[] bytes) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
    }

    private static void require(boolean condition, String description) {
        if (!condition) throw new IllegalStateException(description);
        System.out.println("OK " + description);
    }
}
