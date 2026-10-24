import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.jar.JarFile;
import org.objectweb.asm.*;
import org.objectweb.asm.tree.*;
import org.objectweb.asm.tree.analysis.*;

/** Version-bound HotAI repairs for lazy FE initialization, sanma loops and match completion. */
public final class PatchServerBugs implements Opcodes {
    public static final String ENERGY = "net/yiran/fot/common/TetraFEStore";
    public static final String TABLE = "com/riichimahjongforge/mahjongtable/MahjongTableBlockEntity";
    public static final String DRIVER = "com/themahjong/driver/TheMahjongDriver";
    public static final String MATCH = "com/themahjong/TheMahjongMatch";

    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("Usage: PatchServerBugs <minecraft directory> <output hotai directory>");
        Path root = Path.of(args[0]);
        Path output = Path.of(args[1]);
        byte[] energy = readChecked(root.resolve("mods/FluxOfTetra-6.9.0-1.0.5.jar"), ENERGY,
            "d8d573e4b67f6f0606b6efd6c32cbd00a9af51e32f4ca06de7f1a9348e627a4a");
        byte[] table = readChecked(root.resolve("mods/riichi_mahjong_forge-0.2.0.jar"), TABLE,
            "b1d8850bbde9e05b2d52f5d406bdca2c09a12f485ce473f32d2be2305b594118");
        write(output.resolve(ENERGY + ".class"), patchEnergy(energy));
        write(output.resolve(TABLE + ".class"), patchTable(table));
    }

    public static byte[] patchEnergy(byte[] input) throws Exception {
        ClassNode type = read(input);
        if (!type.name.equals(ENERGY)) throw new IllegalArgumentException(type.name);
        MethodNode load = method(type, "deserializeNBT", "(Lnet/minecraft/nbt/CompoundTag;)V");
        long oldCalls = Arrays.stream(load.instructions.toArray()).filter(n -> n instanceof MethodInsnNode c
            && c.owner.equals(ENERGY) && c.name.equals("setEnergyStored")).count();
        if (oldCalls != 1) throw new IllegalStateException("Unexpected FE deserializer");
        load.instructions.clear(); load.tryCatchBlocks.clear();
        if (load.localVariables != null) load.localVariables.clear();
        load.visibleLocalVariableAnnotations = null; load.invisibleLocalVariableAnnotations = null;
        // Capability attachment must not request the capability being attached. Keep the
        // stored value until the first real capacity query, after attachment can complete.
        load.instructions.add(new VarInsnNode(ALOAD, 0));
        load.instructions.add(new InsnNode(ICONST_0));
        load.instructions.add(new VarInsnNode(ALOAD, 1));
        load.instructions.add(new LdcInsnNode("energy"));
        load.instructions.add(new MethodInsnNode(INVOKEVIRTUAL, "net/minecraft/nbt/CompoundTag", "m_128451_", "(Ljava/lang/String;)I", false));
        load.instructions.add(new MethodInsnNode(INVOKESTATIC, "java/lang/Math", "max", "(II)I", false));
        load.instructions.add(new FieldInsnNode(PUTFIELD, ENERGY, "energy", "I"));
        load.instructions.add(new VarInsnNode(ALOAD, 0));
        load.instructions.add(new InsnNode(ICONST_0));
        load.instructions.add(new FieldInsnNode(PUTFIELD, ENERGY, "capacityCached", "Z"));
        load.instructions.add(new InsnNode(RETURN));
        load.maxLocals = 2; load.maxStack = 4;
        MethodNode capacity = method(type, "getMaxEnergyStored", "()I");
        int returns = 0;
        for (AbstractInsnNode instruction : capacity.instructions.toArray()) {
            if (instruction.getOpcode() != IRETURN) continue;
            InsnList clamp = new InsnList();
            // The original capacity return value remains on the operand stack.
            clamp.add(new VarInsnNode(ALOAD, 0));
            clamp.add(new InsnNode(ICONST_0));
            clamp.add(new VarInsnNode(ALOAD, 0));
            clamp.add(new FieldInsnNode(GETFIELD, ENERGY, "energy", "I"));
            clamp.add(new VarInsnNode(ALOAD, 0));
            clamp.add(new FieldInsnNode(GETFIELD, ENERGY, "capacity", "I"));
            clamp.add(new MethodInsnNode(INVOKESTATIC, "java/lang/Math", "min", "(II)I", false));
            clamp.add(new MethodInsnNode(INVOKESTATIC, "java/lang/Math", "max", "(II)I", false));
            clamp.add(new FieldInsnNode(PUTFIELD, ENERGY, "energy", "I"));
            capacity.instructions.insertBefore(instruction, clamp);
            returns++;
        }
        if (returns != 1) throw new IllegalStateException("Unexpected capacity return count");
        // Extraction reads energy before setEnergyStored; normalize first so a stale
        // saved value cannot be extracted above the item's current capacity.
        MethodNode extract = method(type, "extractEnergy", "(IZ)I");
        InsnList normalize = new InsnList();
        normalize.add(new VarInsnNode(ALOAD, 0));
        normalize.add(new MethodInsnNode(INVOKEVIRTUAL, ENERGY, "getMaxEnergyStored", "()I", false));
        normalize.add(new InsnNode(POP));
        extract.instructions.insert(normalize);
        byte[] patched = checked(type, Set.of(load.name, capacity.name, extract.name));
        System.out.println("PASS FE patch: deserialize without capacity/capability queries; clamp on capacity query");
        return patched;
    }

    public static byte[] patchTable(byte[] input) throws Exception {
        ClassNode type = read(input);
        if (!type.name.equals(TABLE)) throw new IllegalArgumentException(type.name);
        int total = 0;
        for (String name : List.of("m_183515_", "serverTick")) {
            MethodNode target = method(type, name, name.equals("serverTick") ? "()V" : "(Lnet/minecraft/nbt/CompoundTag;)V");
            int count = 0;
            for (AbstractInsnNode instruction : target.instructions.toArray()) {
                if (!(instruction instanceof FieldInsnNode field) || field.getOpcode() != GETFIELD
                    || !field.owner.equals(TABLE) || !field.name.equals("seats")) continue;
                AbstractInsnNode next = nextCode(field);
                if (!(next instanceof MethodInsnNode size) || !size.owner.equals("java/util/List")
                    || !size.name.equals("size") || !size.desc.equals("()I")) continue;
                AbstractInsnNode branch = nextCode(size);
                if (!(branch instanceof JumpInsnNode) || branch.getOpcode() != IF_ICMPGE) continue;
                field.name = "driver"; field.desc = "L" + DRIVER + ";";
                MethodInsnNode match = new MethodInsnNode(INVOKEVIRTUAL, DRIVER, "match", "()L" + MATCH + ";", false);
                target.instructions.set(size, match);
                target.instructions.insert(match, new MethodInsnNode(INVOKEVIRTUAL, MATCH, "playerCount", "()I", false));
                count++;
            }
            int expected = name.equals("serverTick") ? 2 : 1;
            if (count != expected) throw new IllegalStateException("Unexpected loop count in " + name + ": " + count);
            total += count;
        }
        patchMatchCompletion(type);
        byte[] patched = checked(type, Set.of("m_183515_", "serverTick",
            "advanceRoundAfterResult", "onTableRightClick", "sdbf$finishEndedMatch"));
        System.out.println("PASS Mahjong patch: " + total + " loops use active match player count");
        System.out.println("PASS Mahjong match completion: return to idle after final confirmation; recover terminal tables on right-click");
        return patched;
    }

    private static void patchMatchCompletion(ClassNode type) {
        String helper = "sdbf$finishEndedMatch";
        if (type.methods.stream().anyMatch(m -> m.name.equals(helper)))
            throw new IllegalStateException("Completion patch is already present");
        // Only a confirmed terminal driver may reset the table. Keep the final
        // RoundEnded display until the player acknowledges it through the existing path.
        MethodNode finish = new MethodNode(ACC_PRIVATE | ACC_SYNTHETIC, helper, "()Z", null, null);
        LabelNode notEnded = new LabelNode();
        finish.instructions.add(new VarInsnNode(ALOAD, 0));
        finish.instructions.add(new FieldInsnNode(GETFIELD, TABLE, "driver", "L" + DRIVER + ";"));
        finish.instructions.add(new JumpInsnNode(IFNULL, notEnded));
        finish.instructions.add(new VarInsnNode(ALOAD, 0));
        finish.instructions.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "driverIsTerminal", "()Z", false));
        finish.instructions.add(new JumpInsnNode(IFEQ, notEnded));
        finish.instructions.add(new VarInsnNode(ALOAD, 0));
        finish.instructions.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "clearResultAnimState", "()V", false));
        finish.instructions.add(new VarInsnNode(ALOAD, 0));
        finish.instructions.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "endGame", "()V", false));
        finish.instructions.add(new InsnNode(ICONST_1));
        finish.instructions.add(new InsnNode(IRETURN));
        finish.instructions.add(notEnded);
        finish.instructions.add(new FrameNode(F_SAME, 0, null, 0, null));
        finish.instructions.add(new InsnNode(ICONST_0));
        finish.instructions.add(new InsnNode(IRETURN));
        finish.maxLocals = 1; finish.maxStack = 1;
        type.methods.add(finish);

        MethodNode advance = method(type, "advanceRoundAfterResult", "()V");
        int advances = 0;
        for (AbstractInsnNode instruction : advance.instructions.toArray()) {
            if (!(instruction instanceof MethodInsnNode call) || !call.owner.equals(DRIVER)
                || !call.name.equals("advanceRound") || !call.desc.equals("(ZI)V")) continue;
            InsnList reset = new InsnList();
            reset.add(new VarInsnNode(ALOAD, 0));
            reset.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, helper, "()Z", false));
            reset.add(new InsnNode(POP));
            advance.instructions.insert(call, reset);
            advances++;
        }
        if (advances != 1) throw new IllegalStateException("Unexpected advanceRound call count: " + advances);

        // Tables already saved in GAME + MatchEnded never enter the result-click
        // branch again. Their ordinary right-click must provide a recovery route.
        MethodNode click = method(type, "onTableRightClick", "(Lnet/minecraft/server/level/ServerPlayer;)V");
        InsnList recover = new InsnList();
        LabelNode ongoing = new LabelNode();
        recover.add(new VarInsnNode(ALOAD, 0));
        recover.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, helper, "()Z", false));
        recover.add(new JumpInsnNode(IFEQ, ongoing));
        recover.add(new InsnNode(RETURN));
        recover.add(ongoing);
        recover.add(new FrameNode(F_SAME, 0, null, 0, null));
        click.instructions.insert(recover);
    }

    private static AbstractInsnNode nextCode(AbstractInsnNode instruction) {
        do { instruction = instruction.getNext(); } while (instruction != null && instruction.getOpcode() < 0);
        return instruction;
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
    private static byte[] readChecked(Path jarPath, String owner, String hash) throws Exception {
        try (JarFile jar = new JarFile(jarPath.toFile())) {
            byte[] bytes = jar.getInputStream(jar.getJarEntry(owner + ".class")).readAllBytes();
            String actual = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
            if (!actual.equals(hash)) throw new IllegalStateException("Unsupported class in " + jarPath + ": " + actual);
            return bytes;
        }
    }
    private static void write(Path path, byte[] bytes) throws Exception {
        Files.createDirectories(path.toAbsolutePath().getParent()); Files.write(path, bytes);
        System.out.println(path + " SHA-256 " + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)));
    }
}
