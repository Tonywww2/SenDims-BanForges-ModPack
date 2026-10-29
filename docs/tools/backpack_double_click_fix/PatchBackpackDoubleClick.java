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

/** Version-bound removal of the double-click transfer only. */
public final class PatchBackpackDoubleClick implements Opcodes {
    static final String CLIENT = "com/locknar/backpacksidegui/client/SideBackpackClient";
    static final String SERVER = "com/locknar/backpacksidegui/server/ServerSidePanel";
    static final String CLIENT_METHOD = "tryMenuDoubleClickTransfer";
    static final String SERVER_METHOD = "transferMenuSlotToBackpackByDoubleClick";
    static final String CLIENT_DESC = "(Lnet/minecraft/client/Minecraft;Lnet/minecraft/client/gui/screens/inventory/AbstractContainerScreen;L" + CLIENT + "$PanelRect;DDI)Z";
    static final String SERVER_DESC = "(Lnet/minecraft/server/level/ServerPlayer;L" + SERVER + "$BackpackAccess;I)V";
    static int checks;
    static void check(boolean result, String message) {
        if (!result) throw new AssertionError(message);
        checks++;
    }
    static String sha(byte[] bytes) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
    }
    static ClassNode node(byte[] bytes) {
        ClassNode n = new ClassNode(); new ClassReader(bytes).accept(n, 0); return n;
    }
    static byte[] bytes(ClassNode node) {
        ClassWriter w = new ClassWriter(0); node.accept(w); return w.toByteArray();
    }
    static MethodNode method(ClassNode n, String name) {
        List<MethodNode> matches = n.methods.stream().filter(m -> m.name.equals(name)).toList();
        if (matches.size() != 1) throw new IllegalArgumentException("Ambiguous/missing method " + name);
        return matches.get(0);
    }
    static byte[] patch(byte[] original, boolean client) throws Exception {
        String hash = client ? "7cdc602166b82c386bf8db48866c1d2e9777dc840fa0db19532c853d09474157" : "5da5cfa107f98f4b0f4c04d30498b09072a37f6cd43180211f0bdbe75e17b37d";
        if (!sha(original).equals(hash)) throw new IllegalArgumentException("Unexpected original class SHA256: " + sha(original));
        ClassNode n = node(original);
        String name = client ? CLIENT_METHOD : SERVER_METHOD;
        MethodNode m = method(n, name);
        check(n.name.equals(client ? CLIENT : SERVER) && n.version == V17, "owner and Java 17 bytecode");
        check(m.desc.equals(client ? CLIENT_DESC : SERVER_DESC), "exact target descriptor");
        check(m.access == (ACC_PRIVATE | ACC_STATIC), "original access retained");
        m.instructions.clear();
        if (client) m.instructions.add(new InsnNode(ICONST_0));
        m.instructions.add(new InsnNode(client ? IRETURN : RETURN));
        m.tryCatchBlocks.clear();
        if (m.localVariables != null) m.localVariables.clear();
        m.visibleLocalVariableAnnotations = null; m.invisibleLocalVariableAnnotations = null;
        m.maxStack = client ? 1 : 0; m.maxLocals = client ? 8 : 3;
        new Analyzer<>(new BasicVerifier()).analyze(n.name, m);
        byte[] patched = bytes(n);
        ClassNode beforeOther = node(original), afterOther = node(patched);
        beforeOther.methods.removeIf(x -> x.name.equals(name));
        afterOther.methods.removeIf(x -> x.name.equals(name));
        check(Arrays.equals(bytes(beforeOther), bytes(afterOther)), "all other methods, fields and class metadata unchanged");
        return patched;
    }
    static byte[] roundTrip(byte[] before, byte[] after, String owner, Path scratch) throws Exception {
        Path classFile = scratch.resolve(owner + ".class");
        Files.createDirectories(classFile.getParent()); Files.write(classFile, after);
        byte[] first = bytes(new BytecodeTransformer(scratch, Map.of(owner, after)).transform(node(before), null));
        Path diffFile = scratch.resolve(owner + ".badiff");
        check(!Files.exists(classFile) && Files.isRegularFile(diffFile), "real HotAI class -> badiff");
        MemoryDiff diff = new MemoryDiff();
        try (var stream = Files.newInputStream(diffFile)) { diff.deserialize(DefaultSerialization.newInstance(), stream); }
        byte[] restart = bytes(new DiffTransformer(Map.of(owner, diff)).transform(node(before), null));
        check(Arrays.equals(first, restart) && Arrays.equals(restart, after), "HotAI first load and restart reproduce intended class");
        return restart;
    }
    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("Usage: PatchBackpackDoubleClick <minecraft root> <build root>");
        Path root = Path.of(args[0]), build = Path.of(args[1]);
        try (JarFile jar = new JarFile(root.resolve("mods/backpack_side_gui-1.2.9-beta.jar").toFile())) {
            for (String owner : List.of(CLIENT, SERVER)) {
                byte[] original = jar.getInputStream(jar.getJarEntry(owner + ".class")).readAllBytes();
                byte[] patched = patch(original, owner.equals(CLIENT));
                byte[] transformed = roundTrip(original, patched, owner, build.resolve("hotai-roundtrip"));
                TestBackpackDoubleClick.run(original, transformed, owner.equals(CLIENT));
                Path output = build.resolve("release/hotai/" + owner + ".class");
                Files.createDirectories(output.getParent()); Files.write(output, patched);
                System.out.println(owner + " SHA256 " + sha(patched));
            }
        }
        System.out.println("PASS " + checks + " structural/HotAI checks and " + TestBackpackDoubleClick.checks + " behavior checks; Minecraft/Forge boundaries are fixtures");
    }
}
