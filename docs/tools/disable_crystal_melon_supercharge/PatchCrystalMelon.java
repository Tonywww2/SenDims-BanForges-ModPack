import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.jar.JarFile;
import org.objectweb.asm.*;
import org.objectweb.asm.tree.*;
import org.objectweb.asm.tree.analysis.*;
import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;
import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

/** Disables only the Crystal Melon charging entry point in Darker Depths 2.0.9. */
public final class PatchCrystalMelon implements Opcodes {
    static final String OWNER = "com/naterbobber/darkerdepths/events/PlayerEvents";
    static final String METHOD = "onApplySupercharge";
    static final String DESC = "(Lnet/minecraftforge/event/entity/player/PlayerInteractEvent$RightClickItem;)V";
    static final String ORIGINAL_SHA = "0fd548a2b900b7a387ca607d9ceb7961b92c2a51771bbf5350229a67d639683a";

    static void check(boolean valid, String label) {
        if (!valid) throw new AssertionError(label);
        System.out.println("PASS " + label);
    }
    static String sha(byte[] data) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(data));
    }
    static ClassNode node(byte[] data) {
        ClassNode n = new ClassNode();
        new ClassReader(data).accept(n, 0);
        return n;
    }
    static byte[] bytes(ClassNode n) {
        ClassWriter w = new ClassWriter(0);
        n.accept(w);
        return w.toByteArray();
    }
    static MethodNode target(ClassNode n) {
        return n.methods.stream().filter(m -> m.name.equals(METHOD) && m.desc.equals(DESC))
                .findFirst().orElseThrow();
    }
    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]), build = Path.of(args[1]);
        byte[] original;
        try (JarFile jar = new JarFile(root.resolve("mods/Darker Depths-1.20.1-2.0.9.jar").toFile())) {
            original = jar.getInputStream(jar.getJarEntry(OWNER + ".class")).readAllBytes();
        }
        check(sha(original).equals(ORIGINAL_SHA), "supported original class SHA256");
        ClassNode patchedNode = node(original);
        MethodNode m = target(patchedNode);
        check(m.access == (ACC_PUBLIC | ACC_STATIC), "target is the public static charging event");
        check(Arrays.stream(m.instructions.toArray()).anyMatch(i -> i instanceof MethodInsnNode call
                && call.owner.equals("com/naterbobber/darkerdepths/util/SuperchargeHelper")
                && call.name.equals("applyUpgrades")), "original method applies the supercharge");

        // Keep the event handler registered as a no-op, allowing normal right-click behavior.
        // Other handlers still expire and revert previously charged equipment normally.
        m.instructions.clear();
        m.instructions.add(new InsnNode(RETURN));
        m.tryCatchBlocks.clear();
        if (m.localVariables != null) m.localVariables.clear();
        m.visibleLocalVariableAnnotations = null;
        m.invisibleLocalVariableAnnotations = null;
        m.maxStack = 0;
        m.maxLocals = 1;
        new Analyzer<>(new BasicVerifier()).analyze(patchedNode.name, m);
        byte[] patched = bytes(patchedNode);
        MethodNode written = target(node(patched));
        check(written.instructions.size() == 1 && written.instructions.getFirst().getOpcode() == RETURN,
                "charging cannot modify equipment, consume melons, play sounds or cancel item use");

        ClassNode beforeOthers = node(original), afterOthers = node(patched);
        beforeOthers.methods.remove(target(beforeOthers));
        afterOthers.methods.remove(target(afterOthers));
        check(Arrays.equals(bytes(beforeOthers), bytes(afterOthers)),
                "all other methods, fields and class metadata unchanged, including expiration cleanup");

        // Exercise the installed HotAI transformer, including its on-disk restart format.
        Path scratch = Files.createTempDirectory(build, "hotai-roundtrip-");
        Path file = scratch.resolve(OWNER + ".class");
        Files.createDirectories(file.getParent());
        Files.write(file, patched);
        byte[] first = bytes(new BytecodeTransformer(scratch, Map.of(OWNER, patched))
                .transform(node(original), null));
        Path diffPath = scratch.resolve(OWNER + ".badiff");
        check(!Files.exists(file) && Files.isRegularFile(diffPath), "HotAI class-to-diff conversion");
        MemoryDiff diff = new MemoryDiff();
        try (var input = Files.newInputStream(diffPath)) {
            diff.deserialize(DefaultSerialization.newInstance(), input);
        }
        byte[] restart = bytes(new DiffTransformer(Map.of(OWNER, diff)).transform(node(original), null));
        check(Arrays.equals(first, patched) && Arrays.equals(restart, patched),
                "HotAI first load and subsequent restart reconstruct the identical patch");

        Path output = build.resolve("release/hotai/" + OWNER + ".class");
        Files.createDirectories(output.getParent());
        Files.write(output, patched);
        String result = "Darker Depths 1.20.1-2.0.9; HotAI 1.0\n"
                + "Original class SHA256: " + sha(original) + "\n"
                + "Patched class SHA256: " + sha(patched) + "\n"
                + "Only onApplySupercharge is disabled. All structural and HotAI round-trip checks passed.\n"
                + "Full Minecraft runtime was not launched for this verification.\n";
        Files.writeString(build.resolve("verification-results.txt"), result);
        System.out.print(result);
        System.out.println("Output: " + output);
    }
}
