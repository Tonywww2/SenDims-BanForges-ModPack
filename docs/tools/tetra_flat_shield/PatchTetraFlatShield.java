import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.jar.JarFile;

import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;
import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.Opcodes;
import org.objectweb.asm.tree.AbstractInsnNode;
import org.objectweb.asm.tree.ClassNode;
import org.objectweb.asm.tree.FieldInsnNode;
import org.objectweb.asm.tree.FieldNode;
import org.objectweb.asm.tree.InsnList;
import org.objectweb.asm.tree.InsnNode;
import org.objectweb.asm.tree.IntInsnNode;
import org.objectweb.asm.tree.MethodInsnNode;
import org.objectweb.asm.tree.MethodNode;
import org.objectweb.asm.tree.TryCatchBlockNode;
import org.objectweb.asm.tree.VarInsnNode;
import org.objectweb.asm.tree.analysis.Analyzer;
import org.objectweb.asm.tree.analysis.BasicVerifier;

import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

/**
 * Tetra 6.9.0 modular shield -> flat item model, as a HotAI patch.
 *
 * ModularShieldItem#initializeClient registers an anonymous IClientItemExtensions whose only job is
 * getCustomRenderer() -> NonNullLazy<ModularShieldRenderer>. That BEWLR rebuilds the whole modular
 * shield (plate + grip + boss + banner + etching) on every single call, which shows up as ~4.5% of the
 * render thread in spark, plus a NoSuchElementException per frame from ModularShieldBannerModel.
 *
 * Returning IClientItemExtensions.DEFAULT.getCustomRenderer() - the plain ItemRenderer BEWLR instance -
 * makes Forge's ItemRenderer treat the item as "no custom renderer" and fall back to the baked model.
 * The baked model is supplied by the SDBF-FlatTetraShield resource pack (assets/tetra/models/item).
 */
public final class PatchTetraFlatShield {
    static final String OWNER = "se/mickelus/tetra/items/modular/impl/shield/ModularShieldItem$1";
    static final String SHIELD_OWNER = "se/mickelus/tetra/items/modular/impl/shield/ModularShieldItem";
    static final String EXT = "net/minecraftforge/client/extensions/common/IClientItemExtensions";
    static final String BEWR = "net/minecraft/client/renderer/BlockEntityWithoutLevelRenderer";
    static final String LAZY = "net/minecraftforge/common/util/NonNullLazy";
    static final String METHOD = "getCustomRenderer";
    static final String METHOD_DESC = "()L" + BEWR + ";";
    static final String CTOR_DESC = "(L" + SHIELD_OWNER + ";L" + LAZY + ";)V";
    static final String ORIGINAL_SHA = "c0f8dd64af28be2c1f8253939ca37650e53e3c1230a389f514518d8632415c6c";
    static int checks;

    static void check(boolean valid, String label) {
        if (!valid) throw new AssertionError("CHECK FAILED: " + label);
        checks++;
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

    static byte[] entry(Path jar, String name) throws Exception {
        try (JarFile file = new JarFile(jar.toFile())) {
            var e = file.getJarEntry(name);
            if (e == null) return null;
            try (InputStream in = file.getInputStream(e)) { return in.readAllBytes(); }
        }
    }

    static boolean hasField(ClassNode n, String name, String desc) {
        for (FieldNode f : n.fields) if (f.name.equals(name) && f.desc.equals(desc)) return true;
        return false;
    }

    static MethodNode find(ClassNode n, String name, String desc) {
        for (MethodNode m : n.methods) if (m.name.equals(name) && m.desc.equals(desc)) return m;
        return null;
    }

    /** Label-agnostic method dump: ASM label names contain identity hashes, so only real ops are compared. */
    static String dump(MethodNode m) {
        StringBuilder sb = new StringBuilder();
        sb.append(m.access).append(' ').append(m.name).append(m.desc)
          .append(" max=").append(m.maxStack).append('/').append(m.maxLocals)
          .append(" catches=").append(m.tryCatchBlocks.size()).append('\n');
        for (AbstractInsnNode i = m.instructions.getFirst(); i != null; i = i.getNext()) {
            int op = i.getOpcode();
            if (op < 0) continue; // Label / LineNumber / Frame pseudo nodes
            sb.append(op);
            if (i instanceof FieldInsnNode f) {
                sb.append(' ').append(f.owner).append('.').append(f.name).append(' ').append(f.desc);
            } else if (i instanceof MethodInsnNode c) {
                sb.append(' ').append(c.owner).append('.').append(c.name).append(c.desc);
            } else if (i instanceof VarInsnNode v) {
                sb.append(" var").append(v.var);
            } else if (i instanceof IntInsnNode n) {
                sb.append(" int").append(n.operand);
            }
            sb.append('\n');
        }
        return sb.toString();
    }

    static String dumpAll(ClassNode n) {
        StringBuilder sb = new StringBuilder();
        sb.append("class ").append(n.name).append(" extends ").append(n.superName)
          .append(" implements ").append(n.interfaces).append('\n');
        List<FieldNode> fields = new ArrayList<>(n.fields);
        fields.sort((a, b) -> (a.name + a.desc).compareTo(b.name + b.desc));
        for (FieldNode f : fields) sb.append("field ").append(f.access).append(' ').append(f.name).append(f.desc).append('\n');
        List<MethodNode> methods = new ArrayList<>(n.methods);
        methods.sort((a, b) -> (a.name + a.desc).compareTo(b.name + b.desc));
        for (MethodNode m : methods) sb.append(dump(m));
        return sb.toString();
    }

    static boolean originalReturnsLazy(MethodNode m) {
        boolean lazyGet = false;
        boolean areturn = false;
        for (AbstractInsnNode i = m.instructions.getFirst(); i != null; i = i.getNext()) {
            if (i instanceof FieldInsnNode f && f.getOpcode() == Opcodes.GETFIELD
                    && f.name.equals("val$renderer") && f.desc.equals("L" + LAZY + ";")) lazyGet = true;
            if (i instanceof MethodInsnNode c && c.getOpcode() == Opcodes.INVOKEINTERFACE
                    && c.owner.equals(LAZY) && c.name.equals("get")) lazyGet = true;
            if (i.getOpcode() == Opcodes.ARETURN) areturn = true;
        }
        return lazyGet && areturn;
    }

    public static void main(String[] args) throws Exception {
        Path tetra = Path.of(args[0]);
        Path build = Path.of(args[1]);

        byte[] original = entry(tetra, OWNER + ".class");
        check(original != null, "tetra jar contains " + OWNER);
        check(sha(original).equals(ORIGINAL_SHA), "original class SHA-256 matches supported Tetra 6.9.0");

        ClassNode orig = node(original);
        check(orig.name.equals(OWNER), "class name is " + OWNER);
        check("java/lang/Object".equals(orig.superName), "anonymous class extends Object");
        check(orig.interfaces.equals(List.of(EXT)), "implements IClientItemExtensions only");
        check(hasField(orig, "this$0", "L" + SHIELD_OWNER + ";"), "keeps synthetic this$0 field");
        check(hasField(orig, "val$renderer", "L" + LAZY + ";"), "keeps synthetic val$renderer field");
        MethodNode ctor = find(orig, "<init>", CTOR_DESC);
        check(ctor != null, "constructor descriptor (ModularShieldItem, NonNullLazy)V is unchanged");
        MethodNode origGet = find(orig, METHOD, METHOD_DESC);
        check(origGet != null && (origGet.access & Opcodes.ACC_PUBLIC) != 0, "public getCustomRenderer()BEWLR exists");
        check(orig.methods.size() == 2, "class has exactly a constructor and getCustomRenderer");
        check(originalReturnsLazy(origGet), "original body returns val$renderer.get()");

        ClassNode patched = node(original);
        MethodNode m = find(patched, METHOD, METHOD_DESC);
        InsnList insns = new InsnList();
        insns.add(new FieldInsnNode(Opcodes.GETSTATIC, EXT, "DEFAULT", "L" + EXT + ";"));
        insns.add(new MethodInsnNode(Opcodes.INVOKEINTERFACE, EXT, METHOD, METHOD_DESC, true));
        insns.add(new InsnNode(Opcodes.ARETURN));
        m.instructions = insns;
        m.tryCatchBlocks = new ArrayList<>();
        m.localVariables = null;
        m.visibleLocalVariableAnnotations = null;
        m.invisibleLocalVariableAnnotations = null;
        m.maxStack = 1;
        m.maxLocals = 1;
        byte[] patchedBytes = bytes(patched);

        ClassNode re = node(patchedBytes);
        check(re.name.equals(OWNER) && re.version == orig.version, "patched class keeps name and class version");
        check(hasField(re, "this$0", "L" + SHIELD_OWNER + ";") && hasField(re, "val$renderer", "L" + LAZY + ";"),
                "patched class keeps both synthetic fields");
        check(find(re, "<init>", CTOR_DESC) != null, "patched class keeps the constructor");
        check(re.methods.size() == 2, "patched class keeps exactly two methods");
        for (MethodNode other : orig.methods) {
            if (other.name.equals(METHOD) && other.desc.equals(METHOD_DESC)) continue;
            MethodNode same = find(re, other.name, other.desc);
            check(same != null && dump(other).equals(dump(same)), "untouched method unchanged: " + other.name + other.desc);
        }

        MethodNode pm = find(re, METHOD, METHOD_DESC);
        String body = dump(pm);
        check(pm.instructions.size() == 3, "patched getCustomRenderer is exactly three instructions");
        check(body.contains(EXT + ".DEFAULT"), "patched body reads IClientItemExtensions.DEFAULT");
        check(body.contains(EXT + ".getCustomRenderer" + METHOD_DESC), "patched body calls the default getCustomRenderer()");
        check(!body.contains(LAZY) && !body.contains(SHIELD_OWNER), "patched body no longer touches Tetra's lazy renderer");

        for (MethodNode mm : re.methods) new Analyzer<>(new BasicVerifier()).analyze(re.name, mm);
        check(true, "ASM verifies every method of the patched class");

        Path scratch = Files.createTempDirectory(build, "hotai-roundtrip-");
        Path classFile = scratch.resolve(OWNER + ".class");
        Files.createDirectories(classFile.getParent());
        Files.write(classFile, patchedBytes);
        byte[] first = bytes(new BytecodeTransformer(scratch, Map.of(OWNER, patchedBytes)).transform(node(original), null));
        Path diffPath = scratch.resolve(OWNER + ".badiff");
        check(!Files.exists(classFile) && Files.isRegularFile(diffPath), "HotAI converts the .class into a .badiff on first load");
        MemoryDiff diff = new MemoryDiff();
        try (var in = Files.newInputStream(diffPath)) { diff.deserialize(DefaultSerialization.newInstance(), in); }
        byte[] restart = bytes(new DiffTransformer(Map.of(OWNER, diff)).transform(node(original), null));
        check(dumpAll(node(first)).equals(dumpAll(re)), "first HotAI load produces the patched class");
        check(dumpAll(node(restart)).equals(dumpAll(re)), "restart from .badiff reproduces the patched class");

        Path release = build.resolve("release");
        Path relClass = release.resolve("hotai/" + OWNER + ".class");
        Path relDiff = release.resolve("hotai/" + OWNER + ".badiff");
        Files.createDirectories(relClass.getParent());
        Files.write(relClass, patchedBytes);
        Files.copy(diffPath, relDiff, StandardCopyOption.REPLACE_EXISTING);

        String result = "Tetra 6.9.0 modular shield -> flat baked model; HotAI 1.0\n"
                + "Original class SHA-256: " + sha(original) + "\n"
                + "Patched  class SHA-256: " + sha(patchedBytes) + "\n"
                + "Diff bytes: " + Files.size(relDiff) + "\n"
                + checks + " structural, verifier and HotAI round-trip checks passed. Minecraft was not launched.\n";
        Files.writeString(build.resolve("verification-results.txt"), result);
        System.out.print(result);
        System.out.println("Release class: " + relClass);
        System.out.println("Release diff : " + relDiff);
    }
}
