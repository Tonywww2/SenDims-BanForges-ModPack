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
    public static final String BLOCK = "com/riichimahjongforge/mahjongtable/MahjongTableBlock";
    public static final String WIN_EFFECTS = "com/riichimahjongforge/mahjongcore/MahjongWinEffects";
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
        byte[] block = readChecked(root.resolve("mods/riichi_mahjong_forge-0.2.0.jar"), BLOCK,
            "ae90974e6c12953abd2258d98e437bfe5395614d72132c411b02adc226d4a323");
        byte[] wins = readChecked(root.resolve("mods/riichi_mahjong_forge-0.2.0.jar"), WIN_EFFECTS,
            "e015e7cbc66139b4df7c2573341e65add8741201b5a5f0bb9f9788eb630afa82");
        write(output.resolve(ENERGY + ".class"), patchEnergy(energy));
        write(output.resolve(TABLE + ".class"), patchTable(table));
        write(output.resolve(BLOCK + ".class"), patchBlockInteraction(block));
        write(output.resolve(WIN_EFFECTS + ".class"), patchWinEffects(wins));
    }

    public static byte[] patchWinEffects(byte[] input) throws Exception {
        ClassNode type = read(input);
        if (!type.name.equals(WIN_EFFECTS)) throw new IllegalArgumentException(type.name);
        MethodNode effects = method(type, "playWinEffects", "(Lnet/minecraft/server/level/ServerLevel;Lnet/minecraft/server/level/ServerPlayer;Ljava/lang/String;IZLjava/util/List;Ljava/util/List;)V");
        int sites = 0;
        for (AbstractInsnNode instruction : effects.instructions.toArray()) {
            if (!(instruction instanceof MethodInsnNode call) || !call.name.equals("awardForWin")
                || !call.owner.equals("com/riichimahjongforge/mahjongcore/MahjongYakuAdvancements")) continue;
            // The existing call only sees ordinary yaku. Natural yakuman names
            // arrive in argument 6; award those through the same idempotent grant path.
            InsnList extra = new InsnList();
            extra.add(new VarInsnNode(ALOAD, 1)); extra.add(new VarInsnNode(ILOAD, 3));
            extra.add(new VarInsnNode(ILOAD, 4)); extra.add(new VarInsnNode(ALOAD, 6));
            extra.add(new MethodInsnNode(INVOKESTATIC, call.owner, call.name, call.desc, false));
            effects.instructions.insert(call, extra); sites++;
        }
        if (sites != 1) throw new IllegalStateException("Unexpected advancement award call count: " + sites);
        MethodNode canonical = method(type, "canonicalYakuKey", "(Ljava/lang/String;)Ljava/lang/String;");
        InsnList aliases = new InsnList();
        // Actual enum spellings in this exact mod version, matched to its existing
        // advancement IDs. No scoring, yaku detection, or completion rules change.
        for (String[] pair : new String[][] {{"chihou", "chiihou"}, {"iipeiko", "iipeikou"},
            {"seat_wind", "yakuhai_jikaze"}, {"round_wind", "yakuhai_bakaze"},
            {"ittsu", "ikkitsuukan"}, {"chiitoi", "chiitoitsu"}}) {
            LabelNode next = new LabelNode();
            aliases.add(new LdcInsnNode(pair[0])); aliases.add(new VarInsnNode(ALOAD, 0));
            aliases.add(new MethodInsnNode(INVOKEVIRTUAL, "java/lang/String", "equals", "(Ljava/lang/Object;)Z", false));
            aliases.add(new JumpInsnNode(IFEQ, next)); aliases.add(new LdcInsnNode(pair[1])); aliases.add(new InsnNode(ARETURN));
            aliases.add(next); aliases.add(new FrameNode(F_SAME, 0, null, 0, null));
        }
        canonical.instructions.insert(aliases);
        System.out.println("PASS Mahjong advancement patch: include natural yakuman names; normalize six missing enum aliases");
        return checked(type, Set.of("playWinEffects", "canonicalYakuKey"));
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
        return patchTable(input, true);
    }

    static byte[] patchTable(byte[] input, boolean includeSettings) throws Exception {
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
        if (includeSettings) patchSettingsInteraction(type);
        byte[] patched = checked(type, Set.of("m_183515_", "serverTick",
            "advanceRoundAfterResult", "onTableRightClick", "sdbf$finishEndedMatch",
            "sdbf$pendingMatchEnd", "sdbf$openWrenchMenu", "onCuteClick"));
        System.out.println("PASS Mahjong patch: " + total + " loops use active match player count");
        System.out.println("PASS Mahjong match completion: return to idle after final confirmation; recover terminal tables on right-click");
        return patched;
    }

    private static final String SERVER_PLAYER = "net/minecraft/server/level/ServerPlayer";
    private static final String PHASE = "com/themahjong/driver/MatchPhase";
    private static final String ROUND_ENDED = PHASE + "$RoundEnded";
    private static final String ANIM = TABLE + "$ResultAnimStage";
    private static final String TABLE_STATE = TABLE + "$State";

    private static void patchSettingsInteraction(ClassNode type) {
        // Preview immutable match advancement without changing the live driver or
        // consuming its RNG. Only terminal results may be acknowledged by a wrench.
        MethodNode pending = new MethodNode(ACC_PRIVATE | ACC_SYNTHETIC, "sdbf$pendingMatchEnd", "()Z", null, null);
        InsnList p = pending.instructions;
        LabelNode no = new LabelNode();
        p.add(new VarInsnNode(ALOAD, 0)); p.add(new FieldInsnNode(GETFIELD, TABLE, "driver", "L" + DRIVER + ";"));
        p.add(new JumpInsnNode(IFNULL, no));
        p.add(new VarInsnNode(ALOAD, 0)); p.add(new FieldInsnNode(GETFIELD, TABLE, "resultAnimStage", "L" + ANIM + ";"));
        p.add(new FieldInsnNode(GETSTATIC, ANIM, "AWAITING_ADVANCE", "L" + ANIM + ";"));
        p.add(new JumpInsnNode(IF_ACMPNE, no));
        p.add(new VarInsnNode(ALOAD, 0)); p.add(new FieldInsnNode(GETFIELD, TABLE, "driver", "L" + DRIVER + ";"));
        p.add(new MethodInsnNode(INVOKEVIRTUAL, DRIVER, "currentPhase", "()L" + PHASE + ";", false));
        p.add(new VarInsnNode(ASTORE, 1)); p.add(new VarInsnNode(ALOAD, 1));
        p.add(new TypeInsnNode(INSTANCEOF, ROUND_ENDED)); p.add(new JumpInsnNode(IFEQ, no));
        p.add(new VarInsnNode(ALOAD, 0)); p.add(new FieldInsnNode(GETFIELD, TABLE, "driver", "L" + DRIVER + ";"));
        p.add(new MethodInsnNode(INVOKEVIRTUAL, DRIVER, "match", "()L" + MATCH + ";", false));
        p.add(new TypeInsnNode(NEW, "java/util/Random")); p.add(new InsnNode(DUP)); p.add(new InsnNode(LCONST_0));
        p.add(new MethodInsnNode(INVOKESPECIAL, "java/util/Random", "<init>", "(J)V", false));
        p.add(new VarInsnNode(ALOAD, 0)); p.add(new VarInsnNode(ALOAD, 1)); p.add(new TypeInsnNode(CHECKCAST, ROUND_ENDED));
        p.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "computeRenchan", "(L" + ROUND_ENDED + ";)Z", false));
        p.add(new InsnNode(ICONST_0));
        p.add(new MethodInsnNode(INVOKEVIRTUAL, MATCH, "advanceRound", "(Ljava/util/Random;ZI)L" + MATCH + ";", false));
        p.add(new MethodInsnNode(INVOKEVIRTUAL, MATCH, "state", "()L" + MATCH + "$State;", false));
        p.add(new FieldInsnNode(GETSTATIC, MATCH + "$State", "ENDED", "L" + MATCH + "$State;"));
        p.add(new JumpInsnNode(IF_ACMPNE, no)); p.add(new InsnNode(ICONST_1)); p.add(new InsnNode(IRETURN));
        p.add(no); p.add(new FrameNode(F_SAME, 0, null, 0, null));
        p.add(new InsnNode(ICONST_0)); p.add(new InsnNode(IRETURN));
        pending.maxLocals = 2; pending.maxStack = 8; type.methods.add(pending);

        MethodNode wrench = new MethodNode(ACC_PUBLIC | ACC_SYNTHETIC, "sdbf$openWrenchMenu", "(L" + SERVER_PLAYER + ";)Z", null, null);
        InsnList w = wrench.instructions;
        LabelNode notWrench = new LabelNode(), afterPending = new LabelNode(), busy = new LabelNode();
        w.add(new VarInsnNode(ALOAD, 1));
        w.add(new MethodInsnNode(INVOKESTATIC, BLOCK, "holdsWrench", "(Lnet/minecraft/world/entity/player/Player;)Z", false));
        w.add(new JumpInsnNode(IFEQ, notWrench));
        w.add(new VarInsnNode(ALOAD, 0)); w.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "sdbf$pendingMatchEnd", "()Z", false));
        w.add(new JumpInsnNode(IFEQ, afterPending));
        w.add(new VarInsnNode(ALOAD, 0)); w.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "advanceRoundAfterResult", "()V", false));
        w.add(afterPending); w.add(new FrameNode(F_SAME, 0, null, 0, null));
        w.add(new VarInsnNode(ALOAD, 0)); w.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "sdbf$finishEndedMatch", "()Z", false)); w.add(new InsnNode(POP));
        w.add(new VarInsnNode(ALOAD, 0)); w.add(new FieldInsnNode(GETFIELD, TABLE, "state", "L" + TABLE_STATE + ";"));
        w.add(new FieldInsnNode(GETSTATIC, TABLE_STATE, "IDLE", "L" + TABLE_STATE + ";")); w.add(new JumpInsnNode(IF_ACMPNE, busy));
        w.add(new VarInsnNode(ALOAD, 1)); w.add(new VarInsnNode(ALOAD, 0)); w.add(new VarInsnNode(ALOAD, 0));
        w.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "m_58899_", "()Lnet/minecraft/core/BlockPos;", false));
        w.add(new MethodInsnNode(INVOKESTATIC, "net/minecraftforge/network/NetworkHooks", "openScreen",
            "(L" + SERVER_PLAYER + ";Lnet/minecraft/world/MenuProvider;Lnet/minecraft/core/BlockPos;)V", false));
        w.add(new InsnNode(ICONST_1)); w.add(new InsnNode(IRETURN));
        w.add(busy); w.add(new FrameNode(F_SAME, 0, null, 0, null));
        w.add(new VarInsnNode(ALOAD, 1)); w.add(new LdcInsnNode("对局或结算尚未结束，暂时无法打开设置。"));
        w.add(new MethodInsnNode(INVOKESTATIC, "net/minecraft/network/chat/Component", "m_237113_",
            "(Ljava/lang/String;)Lnet/minecraft/network/chat/MutableComponent;", true));
        w.add(new InsnNode(ICONST_1));
        w.add(new MethodInsnNode(INVOKEVIRTUAL, SERVER_PLAYER, "m_5661_", "(Lnet/minecraft/network/chat/Component;Z)V", false));
        w.add(new InsnNode(ICONST_1)); w.add(new InsnNode(IRETURN));
        w.add(notWrench); w.add(new FrameNode(F_SAME, 0, null, 0, null));
        w.add(new InsnNode(ICONST_0)); w.add(new InsnNode(IRETURN));
        wrench.maxLocals = 2; wrench.maxStack = 3; type.methods.add(wrench);

        // Client model hits cancel vanilla use and arrive here instead of Block.use.
        MethodNode cute = method(type, "onCuteClick", "(L" + SERVER_PLAYER + ";Lcom/riichimahjongforge/cuterenderer/InteractKey;)V");
        InsnList c = new InsnList(); LabelNode notMenu = new LabelNode(), notTerminal = new LabelNode(), playing = new LabelNode();
        c.add(new VarInsnNode(ALOAD, 0)); c.add(new VarInsnNode(ALOAD, 1));
        c.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "sdbf$openWrenchMenu", "(L" + SERVER_PLAYER + ";)Z", false));
        c.add(new JumpInsnNode(IFEQ, notMenu)); c.add(new InsnNode(RETURN));
        c.add(notMenu); c.add(new FrameNode(F_SAME, 0, null, 0, null));
        c.add(new VarInsnNode(ALOAD, 0)); c.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "sdbf$finishEndedMatch", "()Z", false));
        c.add(new JumpInsnNode(IFEQ, notTerminal)); c.add(new InsnNode(RETURN));
        c.add(notTerminal); c.add(new FrameNode(F_SAME, 0, null, 0, null));
        c.add(new VarInsnNode(ALOAD, 0)); c.add(new FieldInsnNode(GETFIELD, TABLE, "resultAnimStage", "L" + ANIM + ";"));
        c.add(new FieldInsnNode(GETSTATIC, ANIM, "AWAITING_ADVANCE", "L" + ANIM + ";")); c.add(new JumpInsnNode(IF_ACMPNE, playing));
        c.add(new VarInsnNode(ALOAD, 0)); c.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "advanceRoundAfterResult", "()V", false)); c.add(new InsnNode(RETURN));
        c.add(playing); c.add(new FrameNode(F_SAME, 0, null, 0, null)); cute.instructions.insert(c);
    }

    public static byte[] patchBlockInteraction(byte[] input) throws Exception {
        ClassNode type = new ClassNode(ASM9); new ClassReader(input).accept(type, ClassReader.EXPAND_FRAMES);
        if (!type.name.equals(BLOCK)) throw new IllegalArgumentException(type.name);
        MethodNode use = method(type, "m_6227_", "(Lnet/minecraft/world/level/block/state/BlockState;Lnet/minecraft/world/level/Level;Lnet/minecraft/core/BlockPos;Lnet/minecraft/world/entity/player/Player;Lnet/minecraft/world/InteractionHand;Lnet/minecraft/world/phys/BlockHitResult;)Lnet/minecraft/world/InteractionResult;");
        int sites = 0;
        for (AbstractInsnNode instruction : use.instructions.toArray()) {
            if (!(instruction instanceof TypeInsnNode cast) || cast.getOpcode() != CHECKCAST || !cast.desc.equals(TABLE)) continue;
            AbstractInsnNode store = nextCode(cast);
            if (!(store instanceof VarInsnNode local) || local.getOpcode() != ASTORE) continue;
            AbstractInsnNode jump = nextCode(store);
            if (!(jump instanceof JumpInsnNode branch) || branch.getOpcode() != GOTO) continue;
            AbstractInsnNode anchor = branch.label.getNext();
            while (anchor != null && !(anchor instanceof FrameNode)) anchor = anchor.getNext();
            if (!(anchor instanceof FrameNode frame) || frame.type != F_NEW) throw new IllegalStateException("Missing expanded use-entry frame");
            InsnList code = new InsnList(); LabelNode normal = new LabelNode();
            code.add(new VarInsnNode(ALOAD, 4)); code.add(new TypeInsnNode(INSTANCEOF, SERVER_PLAYER)); code.add(new JumpInsnNode(IFEQ, normal));
            code.add(new VarInsnNode(ALOAD, 1)); code.add(new MethodInsnNode(INVOKESTATIC, BLOCK, "isMaster", "(Lnet/minecraft/world/level/block/state/BlockState;)Z", false));
            code.add(new JumpInsnNode(IFEQ, normal));
            code.add(new VarInsnNode(ALOAD, local.var)); code.add(new VarInsnNode(ALOAD, 4)); code.add(new TypeInsnNode(CHECKCAST, SERVER_PLAYER));
            code.add(new MethodInsnNode(INVOKEVIRTUAL, TABLE, "sdbf$openWrenchMenu", "(L" + SERVER_PLAYER + ";)Z", false));
            code.add(new JumpInsnNode(IFEQ, normal));
            code.add(new FieldInsnNode(GETSTATIC, "net/minecraft/world/InteractionResult", "CONSUME", "Lnet/minecraft/world/InteractionResult;")); code.add(new InsnNode(ARETURN));
            code.add(normal); code.add(new FrameNode(F_NEW, frame.local.size(), frame.local.toArray(), 0, null));
            use.instructions.insert(anchor, code); sites++;
        }
        if (sites != 1) throw new IllegalStateException("Unexpected block interaction anchor count: " + sites);
        System.out.println("PASS Mahjong block route: wrench at centre is handled before GAME early returns");
        return checked(type, Set.of("m_6227_"));
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
