import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.Map;
import java.util.zip.ZipFile;
import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;
import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.Opcodes;
import org.objectweb.asm.tree.ClassNode;
import org.objectweb.asm.tree.FieldInsnNode;
import org.objectweb.asm.tree.LdcInsnNode;
import org.objectweb.asm.tree.MethodInsnNode;
import org.objectweb.asm.tree.MethodNode;
import org.objectweb.asm.tree.analysis.Analyzer;
import org.objectweb.asm.tree.analysis.BasicVerifier;
import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

/** Removes the riseUp debug println from Useful Addon 1.2.3. */
public final class PatchWitherEdgeLog {
    private static final String OWNER = "com/dinzeer/slashblade_useful_addon/events/WitherEdgeRiseUp";
    private static final String ORIGINAL_SHA256 = "27ed424dbf6ba3359905a2de9f54cf2ae1b5e35f340d5a049969ed8d73a2d58a";

    public static void main(String[] args) throws Exception {
        Path minecraftRoot = Path.of(args[0]);
        Path output = Path.of(args[1]);
        byte[] original;
        try (ZipFile jar = new ZipFile(minecraftRoot.resolve("mods/slashblade_useful_addon-1.2.3-forge.jar").toFile())) {
            original = jar.getInputStream(jar.getEntry(OWNER + ".class")).readAllBytes();
        }
        require(sha256(original).equals(ORIGINAL_SHA256), "Supported original class SHA-256");
        ClassNode target = read(original);
        MethodNode method = target.methods.stream().filter(m -> m.name.equals("riseUp")
            && m.desc.equals("(Lnet/minecraftforge/event/entity/living/LivingHurtEvent;)V"))
            .findFirst().orElseThrow();
        MethodInsnNode print = null;
        int matches = 0;
        for (var instruction : method.instructions) {
            if (instruction instanceof MethodInsnNode call && call.getOpcode() == Opcodes.INVOKEVIRTUAL
                && call.owner.equals("java/io/PrintStream") && call.name.equals("println")
                && call.desc.equals("(Ljava/lang/String;)V")) {
                print = call;
                matches++;
            }
        }
        require(matches == 1, "One riseUp println call");
        require(print.getPrevious() instanceof LdcInsnNode literal && literal.cst instanceof String,
            "The log argument is a constant string");
        var literal = print.getPrevious();
        var stream = literal.getPrevious();
        require(stream instanceof FieldInsnNode field && field.getOpcode() == Opcodes.GETSTATIC
            && field.owner.equals("java/lang/System") && field.name.equals("out")
            && field.desc.equals("Ljava/io/PrintStream;"), "The log stream is System.out");
        var preceding = stream.getPrevious();
        method.instructions.remove(stream);
        method.instructions.remove(literal);
        method.instructions.remove(print);
        byte[] patched = write(target);
        for (MethodNode candidate : read(patched).methods) {
            if ((candidate.access & (Opcodes.ACC_ABSTRACT | Opcodes.ACC_NATIVE)) == 0) {
                new Analyzer<>(new BasicVerifier()).analyze(OWNER, candidate);
            }
        }
        require(true, "Every patched method passes ASM bytecode verification");

        // Restore the three removed instructions and compare the entire class, including annotations.
        method.instructions.insert(preceding, stream);
        method.instructions.insert(stream, literal);
        method.instructions.insert(literal, print);
        require(Arrays.equals(write(target), write(read(original))),
            "The entire class differs only by the three removed printing instructions");

        Files.createDirectories(output);
        Path fixture = Files.createTempDirectory(output, "hotai-roundtrip-");
        Path fixtureClass = fixture.resolve(OWNER + ".class");
        Files.createDirectories(fixtureClass.getParent());
        Files.write(fixtureClass, patched);
        byte[] firstLoad = write(new BytecodeTransformer(fixture, Map.of(OWNER, patched))
            .transform(read(original), null));
        Path fixtureDiff = fixture.resolve(OWNER + ".badiff");
        require(!Files.exists(fixtureClass) && Files.isRegularFile(fixtureDiff),
            "HotAI class-to-diff conversion");
        MemoryDiff diff = new MemoryDiff();
        try (var input = Files.newInputStream(fixtureDiff)) {
            diff.deserialize(DefaultSerialization.newInstance(), input);
        }
        byte[] restarted = write(new DiffTransformer(Map.of(OWNER, diff)).transform(read(original), null));
        require(Arrays.equals(firstLoad, patched) && Arrays.equals(restarted, patched),
            "Actual HotAI first-load and restart output matches the patch");

        Path result = output.resolve("release/hotai/" + OWNER + ".class");
        Files.createDirectories(result.getParent());
        Files.write(result, patched);
        String report = "Removed the System.out.println at WitherEdgeRiseUp.riseUp line 55.\n"
            + "Original SHA-256: " + sha256(original) + "\n"
            + "Patched SHA-256: " + sha256(patched) + "\n"
            + "Bytecode verification, full-class change comparison and actual HotAI round-trip passed.\n";
        Files.writeString(output.resolve("verification-results.txt"), report);
        System.out.print(report);
    }

    private static ClassNode read(byte[] bytes) {
        ClassNode result = new ClassNode();
        new ClassReader(bytes).accept(result, 0);
        return result;
    }

    private static byte[] write(ClassNode node) {
        ClassWriter writer = new ClassWriter(0);
        node.accept(writer);
        return writer.toByteArray();
    }

    private static String sha256(byte[] bytes) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
    }

    private static void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException(message);
        System.out.println("OK " + message);
    }
}
