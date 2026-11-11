import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.Map;
import java.util.zip.ZipFile;
import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.commons.ClassRemapper;
import org.objectweb.asm.commons.SimpleRemapper;
import org.objectweb.asm.tree.ClassNode;
import org.objectweb.asm.tree.MethodNode;
import org.badiff.Diff;
import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;
import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

public final class PatchAutoSave {
    private static final String OWNER = "com/ishland/c2me/opts/scheduling/mixin/idle_tasks/autosave/enhanced_autosave/MixinThreadedAnvilChunkStorage";
    private static final String JAR_HASH = "e73681883b2c867049800f8b2f7bdcbbbda6c9a44eb5e165c0513914364abfc6";

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
        ClassNode template = new ClassNode();
        new ClassReader(Files.readAllBytes(builder.resolve("AutoSaveTemplate.class"))).accept(
            new ClassRemapper(template, new SimpleRemapper("AutoSaveTemplate", OWNER)), 0);
        int changed = 0;
        for (int index = 0; index < target.methods.size(); index++) {
            MethodNode nativeMethod = target.methods.get(index);
            if (!nativeMethod.name.equals("runOneChunkAutoSave") && !nativeMethod.name.equals("lambda$runOneChunkAutoSave$0")) continue;
            MethodNode replacement = template.methods.stream().filter(method -> method.name.equals(nativeMethod.name)
                && method.desc.equals(nativeMethod.desc)).findFirst().orElseThrow();
            replacement.access = nativeMethod.access;
            replacement.visibleAnnotations = nativeMethod.visibleAnnotations;
            replacement.invisibleAnnotations = nativeMethod.invisibleAnnotations;
            target.methods.set(index, replacement);
            changed++;
        }
        require(changed == 2, "Only autosave selection and its completion callback replaced");
        byte[] patched = write(target);
        ClassNode before = read(original);
        require(before.fields.size() == target.fields.size() && before.methods.size() == target.methods.size(), "Class shape preserved");
        for (int index = 0; index < before.methods.size(); index++) {
            MethodNode method = before.methods.get(index);
            if (!method.name.equals("runOneChunkAutoSave") && !method.name.equals("lambda$runOneChunkAutoSave$0")) {
                require(Arrays.equals(fingerprint(method), fingerprint(target.methods.get(index))), "Unchanged " + method.name);
            }
        }
        Path fixture = output.resolve("fixture");
        Path classFile = fixture.resolve(OWNER + ".class");
        Files.createDirectories(classFile.getParent());
        Files.write(classFile, patched);
        byte[] converted = write(new BytecodeTransformer(fixture, Map.of(OWNER, patched)).transform(read(original), null));
        MemoryDiff diff = new MemoryDiff();
        try (var stream = Files.newInputStream(fixture.resolve(OWNER + ".badiff"))) {
            diff.deserialize(DefaultSerialization.newInstance(), stream);
        }
        byte[] reapplied = write(new DiffTransformer(Map.<String, Diff>of(OWNER, diff)).transform(read(original), null));
        require(Arrays.equals(converted, patched) && Arrays.equals(reapplied, patched), "HotAI conversion and restart round-trip");
        Files.write(output.resolve("original.class"), original);
        Files.write(output.resolve("patched.class"), patched);
        Files.writeString(output.resolve("verification.txt"), "JAR " + JAR_HASH + "\nOriginal " + sha256(original)
            + "\nPatched " + sha256(patched) + "\nSave and future callbacks execute outside dirty-queue monitor.\n");
    }

    private static byte[] fingerprint(MethodNode method) {
        ClassWriter writer = new ClassWriter(0);
        writer.visit(61, 1, "Fingerprint", null, "java/lang/Object", null);
        method.accept(writer);
        writer.visitEnd();
        return writer.toByteArray();
    }
    private static ClassNode read(byte[] bytes) { ClassNode node = new ClassNode(); new ClassReader(bytes).accept(node, 0); return node; }
    private static byte[] write(ClassNode node) { ClassWriter writer = new ClassWriter(0); node.accept(writer); return writer.toByteArray(); }
    private static String sha256(byte[] bytes) throws Exception { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
    private static void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException(message);
        System.out.println("OK " + message);
    }
}
