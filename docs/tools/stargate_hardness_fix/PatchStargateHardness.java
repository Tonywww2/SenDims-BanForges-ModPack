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

/** Version-bound, single-method guard. Does not modify the original mod JAR. */
public final class PatchStargateHardness implements Opcodes {
    static final String OWNER = "net/povstalec/sgjourney/common/blockstates/StargateBlockState";
    static final String RING = "net/povstalec/sgjourney/common/blocks/stargate/AbstractStargateRingBlock";
    static final String STATE = "net/minecraft/world/level/block/state/BlockState";
    static final String GETTER = "net/minecraft/world/level/BlockGetter";
    static final String POS = "net/minecraft/core/BlockPos";
    static final String BLOCK = "net/minecraft/world/level/block/Block";
    static final String METHOD = "m_60800_";
    static final String DESC = "(L" + GETTER + ";L" + POS + ";)F";
    static final String ORIGINAL_SHA = "54227e7bca559dab73330456937b037b69b1661de5355b98418658556cdcf56f";
    static final String RING_SHA = "f109fcc4d2579f4534f5cfef3ffd656c1ff969054fd2b5325b21dcabf054a0f1";
    static int checks;

    static void check(boolean valid, String label) {
        if (!valid) throw new AssertionError(label);
        checks++;
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
        ClassWriter w = new ClassWriter(0); n.accept(w); return w.toByteArray();
    }
    static MethodNode target(ClassNode n) {
        return n.methods.stream().filter(m -> m.name.equals(METHOD) && m.desc.equals(DESC)).findFirst().orElseThrow();
    }
    static byte[] patch(byte[] original) throws Exception {
        check(sha(original).equals(ORIGINAL_SHA), "exact original StargateBlockState SHA256");
        ClassNode n = node(original);
        check(n.name.equals(OWNER) && n.superName.equals(STATE) && n.version == V17, "owner, superclass and Java 17");
        MethodNode m = target(n);
        check(m.access == ACC_PUBLIC, "original target access retained");
        long fallbackCalls = Arrays.stream(m.instructions.toArray()).filter(i -> i instanceof MethodInsnNode call
                && call.getOpcode() == INVOKESPECIAL && call.owner.equals(STATE)
                && call.name.equals(METHOD) && call.desc.equals(DESC)).count();
        check(fallbackCalls == 1, "original fallback is the superclass hardness query");

        // A removed/replaced block must not be parsed as a live Stargate ring.
        // Preserve the complete upstream body for a matching block and null contexts.
        InsnList guard = new InsnList();
        LabelNode upstream = new LabelNode();
        guard.add(new VarInsnNode(ALOAD, 1));
        guard.add(new JumpInsnNode(IFNULL, upstream));
        guard.add(new VarInsnNode(ALOAD, 2));
        guard.add(new JumpInsnNode(IFNULL, upstream));
        guard.add(new VarInsnNode(ALOAD, 1));
        guard.add(new VarInsnNode(ALOAD, 2));
        guard.add(new MethodInsnNode(INVOKEINTERFACE, GETTER, "m_8055_", "(L" + POS + ";)L" + STATE + ";", true));
        guard.add(new MethodInsnNode(INVOKEVIRTUAL, STATE, "m_60734_", "()L" + BLOCK + ";", false));
        guard.add(new VarInsnNode(ALOAD, 0));
        guard.add(new MethodInsnNode(INVOKEVIRTUAL, STATE, "m_60734_", "()L" + BLOCK + ";", false));
        guard.add(new JumpInsnNode(IF_ACMPEQ, upstream));
        guard.add(new VarInsnNode(ALOAD, 0));
        guard.add(new VarInsnNode(ALOAD, 1));
        guard.add(new VarInsnNode(ALOAD, 2));
        guard.add(new MethodInsnNode(INVOKESPECIAL, STATE, METHOD, DESC, false));
        guard.add(new InsnNode(FRETURN));
        guard.add(upstream);
        guard.add(new FrameNode(F_SAME, 0, null, 0, null));
        AbstractInsnNode[] prefix = guard.toArray();
        int originalMaxStack = m.maxStack;
        m.instructions.insert(guard);
        m.maxStack = Math.max(3, m.maxStack);
        new Analyzer<>(new BasicVerifier()).analyze(n.name, m);
        check(m.tryCatchBlocks.isEmpty(), "no exception-swallowing handler added");
        byte[] patched = bytes(n);
        ClassNode beforeOthers = node(original), afterOthers = node(patched);
        beforeOthers.methods.remove(target(beforeOthers));
        afterOthers.methods.remove(target(afterOthers));
        check(Arrays.equals(bytes(beforeOthers), bytes(afterOthers)), "all other methods, fields and metadata identical");
        // Verify the original instruction stream was preserved after the new prefix.
        for (AbstractInsnNode instruction : prefix) m.instructions.remove(instruction);
        m.maxStack = originalMaxStack;
        check(Arrays.equals(bytes(n), bytes(node(original))), "entire upstream method body preserved after prefix");
        return patched;
    }
    static byte[] roundTrip(byte[] before, byte[] after, Path scratch) throws Exception {
        Path file = scratch.resolve(OWNER + ".class");
        Files.createDirectories(file.getParent()); Files.write(file, after);
        byte[] first = bytes(new BytecodeTransformer(scratch, Map.of(OWNER, after)).transform(node(before), null));
        Path diffPath = scratch.resolve(OWNER + ".badiff");
        check(!Files.exists(file) && Files.isRegularFile(diffPath), "actual HotAI class to badiff conversion");
        MemoryDiff diff = new MemoryDiff();
        try (var input = Files.newInputStream(diffPath)) { diff.deserialize(DefaultSerialization.newInstance(), input); }
        byte[] restart = bytes(new DiffTransformer(Map.of(OWNER, diff)).transform(node(before), null));
        check(Arrays.equals(first, after) && Arrays.equals(restart, after), "HotAI first load and restart reconstruct exact patch");
        return restart;
    }
    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]), build = Path.of(args[1]);
        byte[] original, ring;
        Path jarPath = root.resolve("mods/Stargate.Journey-1.20.1-0.6.51.jar");
        try (JarFile jar = new JarFile(jarPath.toFile())) {
            original = jar.getInputStream(jar.getJarEntry(OWNER + ".class")).readAllBytes();
            ring = jar.getInputStream(jar.getJarEntry(RING + ".class")).readAllBytes();
        }
        check(sha(ring).equals(RING_SHA), "exact original ring bytecode for crash reproduction");
        byte[] patched = patch(original);
        byte[] hotai = roundTrip(original, patched, build.resolve("hotai-roundtrip"));
        TestStargateHardness.run(original, hotai, ring);
        Path output = build.resolve("release/hotai/" + OWNER + ".class");
        Files.createDirectories(output.getParent()); Files.write(output, patched);
        String result = "Original SHA256: " + sha(original) + "\nPatched SHA256: " + sha(patched)
                + "\nPASS " + checks + " structural/HotAI checks; " + TestStargateHardness.checks + " behavior checks"
                + "\nActual Stargate hardness + ring lookup bytecode executed; Minecraft/Forge boundaries are fixtures.\n";
        Files.writeString(build.resolve("verification-results.txt"), result);
        System.out.print(result);
        System.out.println("Output: " + output);
    }
}
