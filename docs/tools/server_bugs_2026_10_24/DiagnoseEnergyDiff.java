import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.zip.ZipFile;
import org.objectweb.asm.*;
import org.objectweb.asm.tree.ClassNode;
import org.badiff.MemoryDiffs;
import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;

/** Read-only diagnosis of a HotAI FE diff against different candidate baselines. */
public final class DiagnoseEnergyDiff {
    static final String OWNER = "net/yiran/fot/common/TetraFEStore";
    static String hash(byte[] bytes) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
    }
    static byte[] entry(Path file, String name) throws Exception {
        try (ZipFile zip = new ZipFile(file.toFile())) { return zip.getInputStream(zip.getEntry(name)).readAllBytes(); }
    }
    static byte[] normalize(byte[] input) {
        ClassNode node = new ClassNode(); new ClassReader(input).accept(node, 0);
        ClassWriter out = new ClassWriter(0); node.accept(out); return out.toByteArray();
    }
    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]), diffPath = Path.of(args[1]);
        byte[] original = entry(root.resolve("mods/FluxOfTetra-6.9.0-1.0.5.jar"), OWNER + ".class");
        byte[] replacement = entry(root.resolve("docs/releases/SDBF-HotAI-2026-10-24.zip"), "hotai/" + OWNER + ".class");
        MemoryDiff diff = new MemoryDiff();
        try (var in = Files.newInputStream(diffPath)) { diff.deserialize(DefaultSerialization.newInstance(), in); }
        Map<String,byte[]> candidates = new LinkedHashMap<>();
        candidates.put("original raw JAR bytes", original);
        candidates.put("original through ASM ClassNode/ClassWriter", normalize(original));
        candidates.put("replacement bytes (class+badiff double application)", replacement);
        candidates.put("replacement through ASM ClassNode/ClassWriter", normalize(replacement));
        System.out.println("ASM " + ClassReader.class.getProtectionDomain().getCodeSource().getLocation());
        for (var candidate : candidates.entrySet()) {
            byte[] output = null;
            try {
                output = MemoryDiffs.apply(candidate.getValue(), diff);
                new ClassReader(output).accept(new ClassNode(), 0);
                System.out.println(candidate.getKey() + " -> VALID length=" + output.length + " sha256=" + hash(output)
                    + " sameAsReplacement=" + Arrays.equals(output, replacement));
            } catch (Throwable error) {
                System.out.println(candidate.getKey() + " -> INVALID length=" + (output == null ? "?" : output.length)
                    + " " + error);
            }
        }
    }
}
