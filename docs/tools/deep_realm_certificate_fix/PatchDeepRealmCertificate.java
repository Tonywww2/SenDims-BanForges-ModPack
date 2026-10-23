import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.Opcodes;
import org.objectweb.asm.tree.*;
import org.objectweb.asm.tree.analysis.Analyzer;
import org.objectweb.asm.tree.analysis.BasicVerifier;

/** Bound only tooltip palette indices; keep all certificate progression data. */
public final class PatchDeepRealmCertificate implements Opcodes {
    private static final String OWNER = "com/tonywww/slashblade_sendims/items/DeepRealmCertificate";

    private static AbstractInsnNode previousCode(AbstractInsnNode node) {
        do { node = node.getPrevious(); } while (node != null && node.getOpcode() < 0);
        return node;
    }

    private static InsnList bounds() {
        InsnList code = new InsnList();
        code.add(new InsnNode(ICONST_0));
        code.add(new MethodInsnNode(INVOKESTATIC, "java/lang/Math", "max", "(II)I", false));
        code.add(new FieldInsnNode(GETSTATIC, OWNER, "COLOR_LIST", "[Lnet/minecraft/ChatFormatting;"));
        code.add(new InsnNode(ARRAYLENGTH));
        code.add(new InsnNode(ICONST_1));
        code.add(new InsnNode(ISUB));
        code.add(new MethodInsnNode(INVOKESTATIC, "java/lang/Math", "min", "(II)I", false));
        return code;
    }

    private static boolean isBounded(AbstractInsnNode read) {
        AbstractInsnNode previous = previousCode(read);
        return previous instanceof MethodInsnNode call && call.owner.equals("java/lang/Math")
            && call.name.equals("min") && call.desc.equals("(II)I");
    }

    private static void checkLookups(MethodNode tooltip) throws Exception {
        // Execute each actual injected bytecode sequence in a dependency-free
        // fixture. AALOAD is unchanged; only the palette field becomes argument 0.
        List<AbstractInsnNode> reads = new ArrayList<>();
        for (AbstractInsnNode node : tooltip.instructions) if (node.getOpcode() == AALOAD) reads.add(node);
        if (reads.size() != 3) throw new IllegalStateException("Unexpected number of palette lookups");
        ClassWriter writer = new ClassWriter(ClassWriter.COMPUTE_MAXS | ClassWriter.COMPUTE_FRAMES);
        writer.visit(V17, ACC_PUBLIC, "CertificateColorProbe", null, "java/lang/Object", null);
        int sequence = 0;
        for (AbstractInsnNode read : reads) {
            if (!isBounded(read)) throw new IllegalStateException("Unprotected palette lookup");
            AbstractInsnNode start = read;
            for (int n = 0; n < 7; n++) start = previousCode(start);
            if (start.getOpcode() != ICONST_0) throw new IllegalStateException("Unexpected bounds sequence");
            var method = writer.visitMethod(ACC_PUBLIC | ACC_STATIC, "color" + sequence++,
                "([Ljava/lang/Object;I)Ljava/lang/Object;", null, null);
            method.visitCode();
            method.visitVarInsn(ALOAD, 0);
            method.visitVarInsn(ILOAD, 1);
            for (AbstractInsnNode node = start; node != read; node = node.getNext()) {
                if (node instanceof FieldInsnNode field && field.owner.equals(OWNER)
                    && field.name.equals("COLOR_LIST")) method.visitVarInsn(ALOAD, 0);
                else if (node.getOpcode() >= 0) node.accept(method);
            }
            method.visitInsn(AALOAD);
            method.visitInsn(ARETURN);
            method.visitMaxs(0, 0);
            method.visitEnd();
        }
        writer.visitEnd();
        class ProbeLoader extends ClassLoader {
            Class<?> load(byte[] data) { return defineClass(null, data, 0, data.length); }
        }
        Class<?> probe = new ProbeLoader().load(writer.toByteArray());
        Object[] palette = {"gray", "gold", "white", "yellow", "aqua", "light_purple"};
        int[] indices = {Integer.MIN_VALUE, -1, 0, 1, 4, 5, 384 / 64, Integer.MAX_VALUE};
        for (int n = 0; n < 3; n++) {
            var method = probe.getMethod("color" + n, Object[].class, int.class);
            for (int index : indices) {
                Object expected = palette[index < 0 ? 0 : index > 5 ? 5 : index];
                Object actual = method.invoke(null, palette, index);
                if (!expected.equals(actual)) throw new AssertionError("Bad palette index " + index);
            }
        }
        System.out.println("PASS: all three tooltip palette lookups; 24 boundary cases including full progress 384 / 64 = 6");
    }

    public static void main(String[] args) throws Exception {
        byte[] original = Files.readAllBytes(Path.of(args[0]));
        ClassNode type = new ClassNode(ASM9);
        new ClassReader(original).accept(type, 0);
        if (!type.name.equals(OWNER)) throw new IllegalArgumentException("Unexpected class " + type.name);
        MethodNode tooltip = type.methods.stream()
            .filter(m -> m.name.equals("m_7373_") || m.name.equals("appendHoverText"))
            .filter(m -> m.desc.contains("ItemStack;") && m.desc.contains("TooltipFlag;"))
            .findFirst().orElseThrow();
        int patched = 0, bounded = 0;
        for (AbstractInsnNode node : tooltip.instructions.toArray()) {
            if (node.getOpcode() != AALOAD) continue;
            if (isBounded(node)) { bounded++; continue; }
            AbstractInsnNode index = previousCode(node);
            AbstractInsnNode array = previousCode(index);
            if (!(index instanceof VarInsnNode) || !(array instanceof FieldInsnNode field)
                || !field.owner.equals(OWNER) || !field.name.equals("COLOR_LIST"))
                throw new IllegalStateException("Refusing to patch an unexpected array read");
            tooltip.instructions.insertBefore(node, bounds());
            patched++;
        }
        if (patched + bounded != 3) throw new IllegalStateException("Expected exactly three color reads");
        ClassWriter writer = new ClassWriter(ClassWriter.COMPUTE_MAXS);
        type.accept(writer);
        byte[] result = writer.toByteArray();
        ClassNode verified = new ClassNode(ASM9);
        new ClassReader(result).accept(verified, 0);
        MethodNode updated = verified.methods.stream().filter(m -> m.name.equals(tooltip.name)
            && m.desc.equals(tooltip.desc)).findFirst().orElseThrow();
        new Analyzer<>(new BasicVerifier()).analyze(OWNER, updated);
        checkLookups(updated);
        Files.write(Path.of(args[1]), patched == 0 ? original : result);
        System.out.println("PASS: tooltip operand-stack verification; patched " + patched + " palette reads");
    }
}
