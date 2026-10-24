import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;
import java.util.jar.JarFile;
import jdk.internal.org.objectweb.asm.ClassReader;
import jdk.internal.org.objectweb.asm.ClassWriter;
import jdk.internal.org.objectweb.asm.Opcodes;
import jdk.internal.org.objectweb.asm.commons.ClassRemapper;
import jdk.internal.org.objectweb.asm.commons.Remapper;
import jdk.internal.org.objectweb.asm.tree.*;
import jdk.internal.org.objectweb.asm.tree.analysis.Analyzer;
import jdk.internal.org.objectweb.asm.tree.analysis.BasicVerifier;

/** Server-only HotAI replacement; reproduces the local Quest Enhance mixin's common behavior. */
public final class PatchQuestEnhanceKillTask implements Opcodes {
    private static final String TARGET = "dev/ftb/mods/ftbquests/quest/task/KillTask";
    private static final String MIXIN = "com/quest_enhance/mixin/KillTaskMixin";
    private static final String CALLBACK = "org/spongepowered/asm/mixin/injection/callback/CallbackInfo";
    private static final Set<String> HELPERS = Set.of(
        "quest_enhance$get_entity", "quest_enhance$get_entity_type_tag",
        "quest_enhance$write_entity_type_tag", "quest_enhance$read_entity_type_tag",
        "quest_enhance$write_entity_type_tag_net", "quest_enhance$read_entity_type_tag_net",
        "quest_enhance$match_entity_type_tag", "quest_enhance$parse_entity_type_tag"
    );

    public static void main(String[] args) throws Exception {
        if (args.length != 3) throw new IllegalArgumentException(
            "Usage: PatchQuestEnhanceKillTask <ftb-quests.jar> <quest-enhance.jar> <output.class>");
        checkHash(Path.of(args[0]), "9ea9d159a78a2724cfe0457b024680fdb52a2126eff9cfa5280a30578f647a68");
        checkHash(Path.of(args[1]), "60d4e20fad2478309e26b1c5b9d8518d7853e5f1710a47e00ab54a7808e1e7b2");
        ClassNode target = new ClassNode(ASM8);
        new ClassReader(readJar(args[0], TARGET + ".class")).accept(target, 0);
        ClassNode mixin = new ClassNode(ASM8);
        new ClassReader(readJar(args[1], MIXIN + ".class")).accept(new ClassRemapper(mixin, new Remapper() {
            @Override public String map(String name) { return name.equals(MIXIN) ? TARGET : name; }
        }), 0);

        // Reproduce Forge's server-side stripping regardless of HotAI transformer order.
        int originalMethods = target.methods.size();
        target.methods.removeIf(m -> clientOnly(m.visibleAnnotations) || clientOnly(m.invisibleAnnotations)
            || m.name.startsWith("lambda$fillConfigGroup$"));
        Set<String> expectedServerMethods = Set.of("<init>", "<clinit>", "getType", "writeData",
            "readData", "writeNetData", "readNetData", "getMaxProgress", "kill");
        Set<String> actualServerMethods = new java.util.HashSet<>();
        target.methods.forEach(m -> actualServerMethods.add(m.name));
        if (!actualServerMethods.equals(expectedServerMethods))
            throw new IllegalStateException("Unexpected original server methods: " + actualServerMethods);
        System.out.println("Removed client methods: " + (originalMethods - target.methods.size()));

        if (target.interfaces.contains("com/quest_enhance/access/KillTaskAccessor"))
            throw new IllegalStateException("Already patched");
        target.interfaces.add("com/quest_enhance/access/KillTaskAccessor");
        FieldNode tag = mixin.fields.stream().filter(f -> f.name.equals("quest_enhance$entity_type_tag"))
            .findFirst().orElseThrow();
        tag.visibleAnnotations = null;
        tag.invisibleAnnotations = null;
        target.fields.add(tag);

        int helpers = 0;
        for (MethodNode method : mixin.methods) {
            if (!HELPERS.contains(method.name)) continue;
            method.visibleAnnotations = null;
            method.invisibleAnnotations = null;
            target.methods.add(method);
            helpers++;
        }
        if (helpers != HELPERS.size()) throw new IllegalStateException("Unexpected helper count: " + helpers);
        append(target, "writeData", "quest_enhance$write_entity_type_tag");
        append(target, "readData", "quest_enhance$read_entity_type_tag");
        append(target, "writeNetData", "quest_enhance$write_entity_type_tag_net");
        append(target, "readNetData", "quest_enhance$read_entity_type_tag_net");

        // Match the mixin's cancellable HEAD injection on kill. The callback is dead
        // before entering the original code; the SAME frame drops local slot 3.
        MethodNode kill = method(target, "kill");
        InsnList head = new InsnList();
        head.add(new TypeInsnNode(NEW, CALLBACK));
        head.add(new InsnNode(DUP));
        head.add(new LdcInsnNode("sdbf_quest_enhance_kill"));
        head.add(new InsnNode(ICONST_1));
        head.add(new MethodInsnNode(INVOKESPECIAL, CALLBACK, "<init>", "(Ljava/lang/String;Z)V", false));
        head.add(new VarInsnNode(ASTORE, 3));
        head.add(new VarInsnNode(ALOAD, 0));
        head.add(new VarInsnNode(ALOAD, 1));
        head.add(new VarInsnNode(ALOAD, 2));
        head.add(new VarInsnNode(ALOAD, 3));
        head.add(new MethodInsnNode(INVOKESPECIAL, TARGET, "quest_enhance$match_entity_type_tag",
            method(target, "quest_enhance$match_entity_type_tag").desc, false));
        head.add(new VarInsnNode(ALOAD, 3));
        head.add(new MethodInsnNode(INVOKEVIRTUAL, CALLBACK, "isCancelled", "()Z", false));
        LabelNode original = new LabelNode();
        head.add(new JumpInsnNode(IFEQ, original));
        head.add(new InsnNode(RETURN));
        head.add(original);
        head.add(new FrameNode(F_SAME, 0, null, 0, null));
        kill.instructions.insert(head);
        kill.maxLocals = Math.max(kill.maxLocals, 4);
        kill.maxStack = Math.max(kill.maxStack, 4);

        ClassWriter writer = new ClassWriter(ClassWriter.COMPUTE_MAXS);
        target.accept(writer);
        byte[] result = writer.toByteArray();
        ClassNode checked = new ClassNode(ASM8);
        new ClassReader(result).accept(checked, ClassReader.EXPAND_FRAMES);
        for (MethodNode method : checked.methods) {
            new Analyzer<>(new BasicVerifier()).analyze(TARGET, method);
            for (AbstractInsnNode instruction : method.instructions) {
                if (instruction instanceof MethodInsnNode call && call.owner.startsWith("net/minecraft/client/"))
                    throw new IllegalStateException("Client reference in " + method.name);
            }
        }
        Path output = Path.of(args[2]);
        Files.createDirectories(output.toAbsolutePath().getParent());
        Files.write(output, result);
        System.out.println("PASS bytecode verification: " + checked.methods.size() + " server methods");
        System.out.println("SHA-256 " + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(result)));
        System.out.println("Created " + output.toAbsolutePath());
    }

    private static void append(ClassNode target, String name, String helper) {
        MethodNode body = method(target, name);
        MethodNode handler = method(target, helper);
        // These four original handlers never inspect their CallbackInfo parameter.
        for (AbstractInsnNode node : handler.instructions)
            if (node instanceof VarInsnNode var && var.var == 2)
                throw new IllegalStateException("Handler unexpectedly uses callback: " + helper);
        int returns = 0;
        for (AbstractInsnNode node : body.instructions.toArray()) {
            if (node.getOpcode() != RETURN) continue;
            InsnList tail = new InsnList();
            tail.add(new VarInsnNode(ALOAD, 0));
            tail.add(new VarInsnNode(ALOAD, 1));
            tail.add(new InsnNode(ACONST_NULL));
            tail.add(new MethodInsnNode(INVOKESPECIAL, TARGET, helper, handler.desc, false));
            body.instructions.insertBefore(node, tail);
            returns++;
        }
        if (returns != 1) throw new IllegalStateException("Unexpected return count in " + name);
    }

    private static MethodNode method(ClassNode type, String name) {
        List<MethodNode> matches = type.methods.stream().filter(m -> m.name.equals(name)).toList();
        if (matches.size() != 1) throw new IllegalStateException("Unexpected method count for " + name);
        return matches.get(0);
    }

    private static boolean clientOnly(List<AnnotationNode> annotations) {
        if (annotations == null) return false;
        for (AnnotationNode annotation : annotations) {
            if (!annotation.desc.equals("Lnet/minecraftforge/api/distmarker/OnlyIn;")) continue;
            for (Object value : annotation.values)
                if (value instanceof String[] pair && pair.length == 2 && pair[1].equals("CLIENT")) return true;
        }
        return false;
    }

    private static byte[] readJar(String path, String entry) throws Exception {
        try (JarFile jar = new JarFile(path)) {
            return jar.getInputStream(jar.getJarEntry(entry)).readAllBytes();
        }
    }

    private static void checkHash(Path path, String expected) throws Exception {
        String actual = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(path)));
        if (!actual.equals(expected)) throw new IllegalArgumentException("Unsupported JAR: " + path + " SHA-256 " + actual);
    }
}
