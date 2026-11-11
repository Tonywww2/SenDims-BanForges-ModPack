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
import org.objectweb.asm.tree.AbstractInsnNode;
import org.objectweb.asm.tree.ClassNode;
import org.objectweb.asm.tree.IntInsnNode;
import org.objectweb.asm.tree.MethodNode;
import org.objectweb.asm.tree.VarInsnNode;
import org.objectweb.asm.tree.analysis.Analyzer;
import org.objectweb.asm.tree.analysis.BasicVerifier;
import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

/** Moves UTF 1.0.3 layer caves underground and gives them a thicker surface roof. */
public final class PatchLayerCaves {
    private static final String OWNER = "com/pandaismyname1/ultraterraforged/world/worldgen/cave/LayerCaves";
    private static final String ORIGINAL_SHA256 = "342e6de929af6f9ab16407408003234136630f059f7bbfd4f1234360308b40b2";

    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]);
        Path output = Path.of(args[1]);
        byte[] original;
        try (ZipFile jar = new ZipFile(root.resolve("mods/ultraterraforged-1.0.3+1.20.1-forge.jar").toFile())) {
            original = jar.getInputStream(jar.getEntry(OWNER + ".class")).readAllBytes();
        }
        require(sha256(original).equals(ORIGINAL_SHA256), "Supported UTF 1.0.3 original class");
        ClassNode target = read(original);
        int fields = 0;
        for (var field : target.fields) {
            if (field.name.equals("FIRST")) {
                require(Integer.valueOf(-40).equals(field.value), "Original first layer");
                field.value = -48;
                fields++;
            } else if (field.name.equals("BEDS")) {
                require(Integer.valueOf(12).equals(field.value), "Original layer count");
                field.value = 5;
                fields++;
            }
        }
        require(fields == 2, "Updated layer metadata");
        MethodNode constructor = target.methods.stream()
            .filter(method -> method.name.equals("<init>") && method.desc.equals("(IF)V"))
            .findFirst().orElseThrow();
        int constructorChanges = 0;
        for (var instruction : constructor.instructions) {
            if (instruction instanceof IntInsnNode number && number.getOpcode() == Opcodes.BIPUSH && number.operand == 12) {
                number.operand = 5;
                constructorChanges++;
            }
        }
        require(constructorChanges == 2, "Five allocated and initialized noise layers");
        MethodNode carve = target.methods.stream()
            .filter(method -> method.name.equals("carve") && method.desc.equals("(Lcom/pandaismyname1/ultraterraforged/world/worldgen/cave/CaveCarving;)V"))
            .findFirst().orElseThrow();
        int layerCount = 0;
        int firstLayer = 0;
        int roofChecks = 0;
        for (AbstractInsnNode instruction : carve.instructions.toArray()) {
            if (instruction instanceof IntInsnNode number && number.getOpcode() == Opcodes.BIPUSH) {
                if (number.operand == 12) {
                    number.operand = 5;
                    layerCount++;
                } else if (number.operand == -40) {
                    number.operand = -48;
                    firstLayer++;
                }
            }
            if ((instruction.getOpcode() == Opcodes.ICONST_2 || instruction.getOpcode() == Opcodes.ICONST_4)
                    && instruction.getPrevious() instanceof VarInsnNode variable
                    && variable.getOpcode() == Opcodes.ILOAD && variable.var == 6
                    && instruction.getNext().getOpcode() == Opcodes.ISUB) {
                carve.instructions.set(instruction, new IntInsnNode(Opcodes.BIPUSH, 12));
                roofChecks++;
            }
        }
        require(layerCount == 1 && firstLayer == 1 && roofChecks == 2,
            "Five layers from Y=-48, with 12-block roof checks");
        byte[] patched = write(target);
        for (MethodNode method : read(patched).methods) {
            new Analyzer<>(new BasicVerifier()).analyze(OWNER, method);
        }
        require(true, "Patched methods pass ASM verification");
        Path fixture = output.resolve("fixture");
        Path classFile = fixture.resolve(OWNER + ".class");
        Files.createDirectories(classFile.getParent());
        Files.write(classFile, patched);
        byte[] converted = write(new BytecodeTransformer(fixture, Map.of(OWNER, patched)).transform(read(original), null));
        Path diffFile = fixture.resolve(OWNER + ".badiff");
        MemoryDiff diff = new MemoryDiff();
        try (var input = Files.newInputStream(diffFile)) {
            diff.deserialize(DefaultSerialization.newInstance(), input);
        }
        byte[] reapplied = write(new DiffTransformer(Map.of(OWNER, diff)).transform(read(original), null));
        require(Arrays.equals(converted, patched) && Arrays.equals(reapplied, patched), "Actual HotAI conversion and restart round-trip");
        Path release = output.resolve("release/hotai/" + OWNER + ".badiff");
        Files.createDirectories(release.getParent());
        Files.copy(diffFile, release);
        Files.write(output.resolve("LayerCaves.class"), patched);
        Files.writeString(output.resolve("verification.txt"),
            "Original class SHA-256 " + sha256(original) + "\nPatched class SHA-256 " + sha256(patched)
            + "\nFive base layers at -48, -26, -4, 18, 40, with native +/-8 block tilt."
            + "\nMaximum carved Y is approximately 52. Surface roof checks use 12 blocks."
            + "\nNative 2-5 block cavity height and horizontal noise remain in use."
            + "\nASM bytecode verification and native HotAI conversion/restart round-trip passed.\n");
        System.out.println("PATCH_READY " + release);
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

    private static void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException(message);
        System.out.println("OK " + message);
    }
}
