import java.io.InputStream;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.jar.JarFile;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.ClassRemapper;
import org.objectweb.asm.commons.SimpleRemapper;
import org.objectweb.asm.tree.*;
import org.objectweb.asm.tree.analysis.*;

/**
 * 2026-11-18 HotAI patches for Riichi Mahjong Forge 0.2.0:
 * dora / uradora / akadora / nagashi mangan / three double-yakuman advancements,
 * and a forced match end (wrench + sneak at the centre while the table is powered).
 * The table class is rebuilt from the original on top of the 2026-10-24 v3 transforms.
 */
public final class PatchMahjong implements Opcodes {
    static final String TABLE = PatchServerBugs.TABLE;
    static final String CALC = "com/themahjong/yaku/WinCalculator";
    static final String CALC_TEMPLATE = "com/themahjong/yaku/MahjongAchievementHelpers";
    static final String TABLE_TEMPLATE = "com/themahjong/yaku/MahjongTableHelpers";
    static final String RESULT = "com/themahjong/yaku/WinResult";
    static final String SERVER_PLAYER = "net/minecraft/server/level/ServerPlayer";
    static final String SERVER_LEVEL = "net/minecraft/server/level/ServerLevel";
    static final String ROUND_ENDED = "com/themahjong/driver/MatchPhase$RoundEnded";
    static final String TABLE_ORIGINAL = "b1d8850bbde9e05b2d52f5d406bdca2c09a12f485ce473f32d2be2305b594118";
    static final String TABLE_V3 = "1c7b7201ccbe752efb80cda47e356d7fb1db229693a5864e7750b7a0293e8a58";
    static final String CALC_ORIGINAL = "b41d98b9b95190462b1bebee0e2bbf38298867cff8869796f08f1957802770e3";
    static final String OLD_BUSY = "对局或结算尚未结束，暂时无法打开设置。";
    static final String NEW_BUSY = "对局或结算尚未结束，暂时无法打开设置。牌桌接收红石信号时，手持扳手潜行右键中央可强制终止。";

    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("Usage: PatchMahjong <minecraft directory> <output hotai directory>");
        Path jar = Path.of(args[0]).resolve("mods/riichi_mahjong_forge-0.2.0.jar");
        Path output = Path.of(args[1]);
        byte[] table = readChecked(jar, TABLE, TABLE_ORIGINAL);
        byte[] calc = readChecked(jar, CALC, CALC_ORIGINAL);
        byte[] v3 = PatchServerBugs.patchTable(table);
        if (!sha(v3).equals(TABLE_V3)) throw new IllegalStateException("v3 table rebuild differs: " + sha(v3));
        write(output.resolve(CALC + ".class"), patchCalculator(calc));
        write(output.resolve(TABLE + ".class"), patchTable(v3));
    }

    static byte[] patchCalculator(byte[] input) throws Exception {
        ClassNode type = read(input);
        if (!type.name.equals(CALC)) throw new IllegalArgumentException(type.name);
        Set<String> copied = copyTemplate(type, CALC_TEMPLATE, Map.of(CALC_TEMPLATE, CALC));
        MethodNode best = method(type, "calculateBest", "(Ljava/util/List;Lcom/themahjong/yaku/WinContext;Ljava/util/List;Ljava/util/List;Ljava/util/List;IIIIIILcom/themahjong/TheMahjongRuleSet;I)L" + RESULT + ";");
        int returns = 0;
        for (AbstractInsnNode instruction : best.instructions.toArray()) {
            if (instruction.getOpcode() != ARETURN) continue;
            // The result stays on the stack; sdbf$record returns the same instance.
            InsnList record = new InsnList();
            record.add(new VarInsnNode(ALOAD, 1)); record.add(new VarInsnNode(ALOAD, 2));
            record.add(new VarInsnNode(ALOAD, 3)); record.add(new VarInsnNode(ALOAD, 4));
            record.add(new VarInsnNode(ILOAD, 5)); record.add(new VarInsnNode(ALOAD, 11));
            record.add(new VarInsnNode(ILOAD, 12));
            record.add(new MethodInsnNode(INVOKESTATIC, CALC, "sdbf$record",
                "(L" + RESULT + ";Lcom/themahjong/yaku/WinContext;Ljava/util/List;Ljava/util/List;Ljava/util/List;ILcom/themahjong/TheMahjongRuleSet;I)L" + RESULT + ";", false));
            best.instructions.insertBefore(instruction, record);
            returns++;
        }
        if (returns != 2) throw new IllegalStateException("Unexpected calculateBest return count: " + returns);
        Set<String> changed = new HashSet<>(copied); changed.add("calculateBest");
        byte[] patched = checked(type, changed);
        System.out.println("PASS WinCalculator: record dora/akadora/uradora and double-yakuman waits per result");
        return patched;
    }

    static byte[] patchTable(byte[] v3) throws Exception {
        ClassNode type = read(v3);
        if (!type.name.equals(TABLE)) throw new IllegalArgumentException(type.name);
        Set<String> copied = copyTemplate(type, TABLE_TEMPLATE, Map.of(TABLE_TEMPLATE, TABLE, CALC_TEMPLATE, CALC));

        MethodNode effects = method(type, "playFinalWinEffects", "(L" + SERVER_LEVEL + ";L" + ROUND_ENDED + ";)V");
        InsnList nagashi = new InsnList();
        nagashi.add(new VarInsnNode(ALOAD, 0)); nagashi.add(new VarInsnNode(ALOAD, 1)); nagashi.add(new VarInsnNode(ALOAD, 2));
        nagashi.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "sdbf$awardNagashi", "(L" + SERVER_LEVEL + ";L" + ROUND_ENDED + ";)V", false));
        effects.instructions.insert(nagashi);
        int sites = 0;
        for (AbstractInsnNode instruction : effects.instructions.toArray()) {
            if (!(instruction instanceof MethodInsnNode call) || call.getOpcode() != INVOKESTATIC
                || !call.owner.equals("com/riichimahjongforge/mahjongcore/MahjongWinEffects") || !call.name.equals("playWinEffects")) continue;
            AbstractInsnNode han = call.getPrevious();
            while (han != null && !(han instanceof MethodInsnNode m && m.owner.equals(RESULT) && m.name.equals("han"))) han = han.getPrevious();
            VarInsnNode win = previousLoad(han), name = previousLoad(win), player = previousLoad(name), level = previousLoad(player);
            if (level.var != 1) throw new IllegalStateException("Unexpected playWinEffects arguments");
            InsnList award = new InsnList();
            award.add(new VarInsnNode(ALOAD, player.var)); award.add(new VarInsnNode(ALOAD, win.var));
            award.add(new MethodInsnNode(INVOKESTATIC, TABLE, "sdbf$awardExtraYaku", "(L" + SERVER_PLAYER + ";L" + RESULT + ";)V", false));
            effects.instructions.insert(call, award);
            sites++;
        }
        if (sites != 1) throw new IllegalStateException("Unexpected playWinEffects call count: " + sites);

        MethodNode wrench = method(type, "sdbf$openWrenchMenu", "(L" + SERVER_PLAYER + ";)Z");
        JumpInsnNode notWrench = null;
        for (AbstractInsnNode instruction : wrench.instructions.toArray()) {
            if (instruction instanceof JumpInsnNode jump && jump.getOpcode() == IFEQ) { notWrench = jump; break; }
        }
        if (notWrench == null || !(notWrench.getPrevious() instanceof MethodInsnNode held) || !held.name.equals("holdsWrench"))
            throw new IllegalStateException("Unexpected v3 wrench entry");
        InsnList force = new InsnList(); LabelNode normal = new LabelNode();
        force.add(new VarInsnNode(ALOAD, 0)); force.add(new VarInsnNode(ALOAD, 1));
        force.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "sdbf$tryForceEnd", "(L" + SERVER_PLAYER + ";)Z", false));
        force.add(new JumpInsnNode(IFEQ, normal)); force.add(new InsnNode(ICONST_1)); force.add(new InsnNode(IRETURN));
        force.add(normal); force.add(new FrameNode(F_SAME, 0, null, 0, null));
        wrench.instructions.insert(notWrench, force);
        int hints = 0;
        for (AbstractInsnNode instruction : wrench.instructions.toArray()) {
            if (instruction instanceof LdcInsnNode ldc && OLD_BUSY.equals(ldc.cst)) { ldc.cst = NEW_BUSY; hints++; }
        }
        if (hints != 1) throw new IllegalStateException("Unexpected v3 busy hint count: " + hints);

        Set<String> changed = new HashSet<>(copied);
        changed.addAll(Set.of("playFinalWinEffects", "sdbf$openWrenchMenu"));
        byte[] patched = checked(type, changed);
        System.out.println("PASS Mahjong table: v3 + nagashi/extra yaku advancements + powered sneak-wrench forced end");
        return patched;
    }

    /** Copies sdbf$ members of a compiled template into target after renaming template owners. */
    private static Set<String> copyTemplate(ClassNode target, String template, Map<String, String> owners) throws Exception {
        byte[] bytes;
        try (InputStream in = PatchMahjong.class.getClassLoader().getResourceAsStream(template + ".class")) {
            if (in == null) throw new IllegalStateException("Missing template " + template);
            bytes = in.readAllBytes();
        }
        ClassNode source = new ClassNode(ASM9);
        new ClassReader(bytes).accept(new ClassRemapper(source, new SimpleRemapper(ASM9, owners)), 0);
        Set<String> names = new HashSet<>();
        for (FieldNode field : source.fields) {
            if (!field.name.startsWith("sdbf$")) continue;
            if (target.fields.stream().anyMatch(f -> f.name.equals(field.name))) throw new IllegalStateException("Field exists: " + field.name);
            field.access |= ACC_SYNTHETIC; target.fields.add(field);
        }
        for (MethodNode method : source.methods) {
            if (!method.name.startsWith("sdbf$")) continue;
            if (target.methods.stream().anyMatch(m -> m.name.equals(method.name))) throw new IllegalStateException("Method exists: " + method.name);
            method.access |= ACC_SYNTHETIC; target.methods.add(method); names.add(method.name);
        }
        if (names.isEmpty()) throw new IllegalStateException("Template has no sdbf$ methods: " + template);
        return names;
    }

    private static VarInsnNode previousLoad(AbstractInsnNode instruction) {
        AbstractInsnNode previous = instruction == null ? null : instruction.getPrevious();
        while (previous != null && previous.getOpcode() < 0) previous = previous.getPrevious();
        if (!(previous instanceof VarInsnNode load) || load.getOpcode() != ALOAD) throw new IllegalStateException("Expected ALOAD before " + instruction);
        return load;
    }
    private static byte[] checked(ClassNode type, Set<String> changed) throws Exception {
        ClassWriter writer = new ClassWriter(ClassWriter.COMPUTE_MAXS);
        type.accept(writer);
        byte[] bytes = writer.toByteArray();
        ClassNode check = read(bytes);
        for (MethodNode method : check.methods) if (changed.contains(method.name))
            new Analyzer<>(new BasicVerifier()).analyze(check.name, method);
        return bytes;
    }
    private static ClassNode read(byte[] bytes) {
        ClassNode type = new ClassNode(ASM9); new ClassReader(bytes).accept(type, 0); return type;
    }
    private static MethodNode method(ClassNode type, String name, String descriptor) {
        return type.methods.stream().filter(m -> m.name.equals(name) && m.desc.equals(descriptor)).findFirst().orElseThrow();
    }
    private static String sha(byte[] bytes) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
    }
    private static byte[] readChecked(Path jarPath, String owner, String hash) throws Exception {
        try (JarFile jar = new JarFile(jarPath.toFile())) {
            byte[] bytes = jar.getInputStream(jar.getJarEntry(owner + ".class")).readAllBytes();
            if (!sha(bytes).equals(hash)) throw new IllegalStateException("Unsupported class in " + jarPath + ": " + sha(bytes));
            return bytes;
        }
    }
    private static void write(Path path, byte[] bytes) throws Exception {
        Files.createDirectories(path.toAbsolutePath().getParent()); Files.write(path, bytes);
        System.out.println(path + " SHA-256 " + sha(bytes));
    }
}
