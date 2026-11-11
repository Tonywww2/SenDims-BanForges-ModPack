import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipFile;
import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.Opcodes;
import org.objectweb.asm.commons.ClassRemapper;
import org.objectweb.asm.commons.SimpleRemapper;
import org.objectweb.asm.tree.ClassNode;
import org.objectweb.asm.tree.FrameNode;
import org.objectweb.asm.tree.InsnList;
import org.objectweb.asm.tree.InsnNode;
import org.objectweb.asm.tree.JumpInsnNode;
import org.objectweb.asm.tree.LabelNode;
import org.objectweb.asm.tree.MethodInsnNode;
import org.objectweb.asm.tree.MethodNode;
import org.objectweb.asm.tree.VarInsnNode;

public final class PatchProfiler {
    static final String OWNER = "net/minecraft/util/profiling/ActiveProfiler";
    static final String CHECK = "sdbf$isProfilerOwner";
    static final Set<String> MUTATORS = Set.of(
        "m_7242_()V", "m_7241_()V", "m_6180_(Ljava/lang/String;)V",
        "m_6521_(Ljava/util/function/Supplier;)V",
        "m_142259_(Lnet/minecraft/util/profiling/metrics/MetricCategory;)V",
        "m_7238_()V", "m_6182_(Ljava/lang/String;)V",
        "m_6523_(Ljava/util/function/Supplier;)V",
        "m_183275_(Ljava/lang/String;I)V", "m_183536_(Ljava/util/function/Supplier;I)V"
    );

    public static void main(String[] args) throws Exception {
        Path minecraftJar = Path.of(args[0]);
        Path builder = Path.of(args[1]);
        Path output = Path.of(args[2]);
        byte[] original;
        try (ZipFile zip = new ZipFile(minecraftJar.toFile())) {
            original = zip.getInputStream(zip.getEntry(OWNER + ".class")).readAllBytes();
        }
        ClassNode target = new ClassNode();
        new ClassReader(original).accept(target, 0);
        if (!target.name.equals(OWNER) || target.methods.stream().anyMatch(m -> m.name.equals(CHECK))) {
            throw new IllegalStateException("Unexpected or already patched ActiveProfiler");
        }
        Set<String> actual = target.methods.stream()
            .filter(m -> (m.access & Opcodes.ACC_PUBLIC) != 0 && m.desc.endsWith(")V") && !m.name.equals("<init>"))
            .map(m -> m.name + m.desc).collect(java.util.stream.Collectors.toSet());
        if (!actual.equals(MUTATORS)) {
            throw new IllegalStateException("ActiveProfiler mutation API changed: " + actual);
        }

        ClassNode template = new ClassNode();
        ClassRemapper remapper = new ClassRemapper(template,
            new SimpleRemapper(Map.of("ProfilerGuardTemplate", OWNER)));
        new ClassReader(Files.readAllBytes(builder.resolve("ProfilerGuardTemplate.class"))).accept(remapper, 0);
        target.fields.addAll(template.fields.stream().filter(f -> f.name.startsWith("sdbf$")).toList());
        MethodNode helper = template.methods.stream().filter(m -> m.name.equals(CHECK)).findFirst().orElseThrow();
        target.methods.add(helper);
        MethodNode templateInitializer = template.methods.stream()
            .filter(m -> m.name.equals("<clinit>")).findFirst().orElseThrow();
        // Skip the template's null logger assignment. The native class already initializes its logger.
        var nullLogger = templateInitializer.instructions.getFirst();
        while (nullLogger != null && nullLogger.getOpcode() != Opcodes.ACONST_NULL) {
            nullLogger = nullLogger.getNext();
        }
        var loggerAssignment = nullLogger.getNext();
        templateInitializer.instructions.remove(nullLogger);
        templateInitializer.instructions.remove(loggerAssignment);
        var templateReturn = templateInitializer.instructions.getLast();
        while (templateReturn != null && templateReturn.getOpcode() != Opcodes.RETURN) {
            templateReturn = templateReturn.getPrevious();
        }
        templateInitializer.instructions.remove(templateReturn);
        MethodNode initializer = target.methods.stream().filter(m -> m.name.equals("<clinit>"))
            .findFirst().orElseThrow();
        initializer.instructions.insert(templateInitializer.instructions);

        for (MethodNode method : target.methods) {
            if (!MUTATORS.contains(method.name + method.desc)) {
                continue;
            }
            LabelNode nativeBody = new LabelNode();
            InsnList guard = new InsnList();
            guard.add(new VarInsnNode(Opcodes.ALOAD, 0));
            guard.add(new MethodInsnNode(Opcodes.INVOKESPECIAL, OWNER, CHECK, "()Z", false));
            guard.add(new JumpInsnNode(Opcodes.IFNE, nativeBody));
            guard.add(new InsnNode(Opcodes.RETURN));
            guard.add(nativeBody);
            guard.add(new FrameNode(Opcodes.F_SAME, 0, null, 0, null));
            method.instructions.insert(guard);
        }
        ClassWriter writer = new ClassWriter(ClassWriter.COMPUTE_MAXS);
        target.accept(writer);
        Files.createDirectories(output);
        Files.write(output.resolve("ActiveProfiler.original.class"), original);
        Files.write(output.resolve("ActiveProfiler.class"), writer.toByteArray());
        System.out.println("Patched all " + MUTATORS.size() + " ActiveProfiler mutation entry points.");
    }
}
