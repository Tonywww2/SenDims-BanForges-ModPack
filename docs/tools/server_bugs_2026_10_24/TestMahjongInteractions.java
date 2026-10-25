import java.nio.file.*;
import java.util.*;
import java.security.MessageDigest;
import com.themahjong.driver.*;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;

/** Tests the actual Block.use and model-click method bytecode at Minecraft boundaries. */
public final class TestMahjongInteractions extends TestServerBugs {
    static final String TABLE = PatchServerBugs.TABLE, BLOCK = PatchServerBugs.BLOCK;
    static Map<String,String> mapping() {
        Map<String,String> m = new HashMap<>();
        m.put("net/minecraft/core/BlockPos", name(Pos.class));
        m.put("net/minecraft/world/MenuProvider", name(MenuProvider.class));
        m.put("net/minecraft/network/chat/Component", name(Component.class));
        m.put("net/minecraft/network/chat/MutableComponent", name(MutableComponent.class));
        m.put("net/minecraft/world/entity/player/Player", name(Player.class));
        m.put("net/minecraft/server/level/ServerPlayer", name(ServerPlayer.class));
        m.put("net/minecraft/world/level/Level", name(Level.class));
        m.put("net/minecraft/world/level/block/entity/BlockEntity", name(BlockEntity.class));
        m.put("net/minecraft/world/level/block/state/BlockState", name(BlockState.class));
        m.put("net/minecraft/world/level/block/state/properties/Property", name(Property.class));
        m.put("net/minecraft/world/level/block/state/properties/IntegerProperty", name(Property.class));
        m.put("net/minecraft/world/level/block/state/properties/DirectionProperty", name(Property.class));
        m.put("net/minecraft/core/Direction", name(Direction.class));
        m.put("net/minecraft/world/phys/BlockHitResult", name(Hit.class));
        m.put("net/minecraft/world/InteractionHand", name(Hand.class));
        m.put("net/minecraft/world/InteractionResult", name(InteractionResult.class));
        m.put("net/minecraftforge/network/NetworkHooks", name(NetworkHooks.class));
        m.put("com/riichimahjongforge/cuterenderer/InteractKey", name(InteractKey.class));
        m.put("com/riichimahjongforge/common/BaseMultipartBlock", name(BlockBoundary.class));
        m.put("com/riichimahjongforge/mahjongtable/record/MahjongTableRecordItem", name(RecordItem.class));
        m.put(BLOCK, name(BlockBoundary.class));
        return m;
    }
    static Class<?> blockClass(byte[] bytes, String suffix, Class<?> tableClass) {
        ClassNode n = node(bytes);
        n.methods.removeIf(m -> !m.name.equals("m_6227_"));
        n.fields.clear(); n.interfaces.clear(); n.innerClasses.clear(); n.nestHostClass = null; n.nestMembers = null;
        for (MethodNode method : n.methods) for (AbstractInsnNode instruction : method.instructions) {
            if (!(instruction instanceof MethodInsnNode call)) continue;
            if (call.owner.endsWith("/MahjongTableRecordItem") || call.owner.equals(BLOCK) && call.name.equals("warningFor")) {
                call.desc = call.desc.replace("L" + TABLE + ";", "L" + name(BlockEntity.class) + ";");
                if (call.name.equals("warningFor")) call.owner = name(BlockBoundary.class);
            }
        }
        MethodNode ctor = new MethodNode(ACC_PUBLIC, "<init>", "()V", null, null);
        ctor.instructions.add(new VarInsnNode(ALOAD, 0));
        ctor.instructions.add(new MethodInsnNode(INVOKESPECIAL, n.superName, "<init>", "()V", false));
        ctor.instructions.add(new InsnNode(RETURN)); ctor.maxLocals = 1; n.methods.add(ctor);
        Map<String,String> m = commonMap(); m.putAll(mapping());
        m.put(BLOCK, "InteractionBlock" + suffix); m.put(TABLE, name(tableClass));
        m.put(TABLE + "$State", name(State.class)); m.put(TABLE + "$StartMatchResult", name(StartMatchResult.class));
        ClassWriter writer = new ClassWriter(ClassWriter.COMPUTE_MAXS);
        n.accept(new ClassRemapper(writer, new SimpleRemapper(m)));
        return new ClassLoader(tableClass.getClassLoader()) {
            Class<?> define() { byte[] b = writer.toByteArray(); return defineClass(null, b, 0, b.length); }
        }.define();
    }
    static Object fixture(Class<?> type, int count, String phase) throws Exception {
        Object t = table(type, count, !phase.equals("idle"));
        if (phase.equals("terminal") || phase.equals("pending-bust") || phase.equals("pending-normal") || phase.equals("animation")) {
            endedRound(t, !phase.equals("pending-normal"));
            if (phase.equals("terminal")) {
                ((TheMahjongDriver)get(t, "driver")).advanceRound(false, 0);
                set(t, "resultAnimStage", Anim.NONE);
            }
            if (phase.equals("animation")) set(t, "resultAnimStage", Anim.SHOW_HEADER);
        }
        ((BlockEntity)t).f_58857_.table = (BlockEntity)t;
        return t;
    }
    static ServerPlayer player(Object table, boolean wrench) {
        ServerPlayer p = new ServerPlayer(); p.wrench = wrench; p.level = ((BlockEntity)table).f_58857_; return p;
    }
    static void blockClick(Class<?> block, Object table, ServerPlayer player, boolean centre) throws Exception {
        BlockState state = new BlockState(); state.centre = centre;
        call(block.getConstructor().newInstance(), "m_6227_", state, player.level, new Pos(), player, Hand.MAIN_HAND, new Hit());
    }
    static void modelClick(Object table, ServerPlayer player) throws Exception {
        call(table, "onCuteClick", player, new InteractKey() {});
    }
    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]), patches = Path.of(args[1]), scratch = Path.of(args[2]);
        TestServerBugs.extraTableMap = mapping();
        TestServerBugs.extraTableMethods = Set.of("state", "isInResultPhase", "onCuteClick", "sdbf$pendingMatchEnd",
            "sdbf$openWrenchMenu", "selectPreset", "padSeatsAtLeast", "toggleSeatEnabled");
        byte[] v2 = PatchServerBugs.patchTable(original(root, "riichi_mahjong_forge-0.2.0.jar", TABLE), false);
        check(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(v2))
            .equals("b27ba698a6f2c1dec0fe6921597bb188624960254bc20f8dcce4895cabe78ad6"), "reconstructed v2 matches the historical release");
        byte[] oldBlock = original(root, "riichi_mahjong_forge-0.2.0.jar", BLOCK);
        byte[] fixedBlock = hotaiRoundTrip(oldBlock, Files.readAllBytes(patches.resolve(BLOCK + ".class")), BLOCK, scratch);
        Class<?> before = tableClass(v2, "InteractionsV2"), after = tableClass(Files.readAllBytes(patches.resolve(TABLE + ".class")), "InteractionsV3");
        Class<?> oldRoute = blockClass(oldBlock, "V2", before), newRoute = blockClass(fixedBlock, "V3", after);
        Object blocked = fixture(before, 3, "terminal"); ServerPlayer blockedPlayer = player(blocked, true);
        blockClick(oldRoute, blocked, blockedPlayer, true);
        check(blockedPlayer.menus == 0 && get(blocked, "state") == State.GAME, "v2 actual Block.use swallows wrench at terminal table");
        modelClick(blocked, blockedPlayer);
        check(blockedPlayer.menus == 0 && get(blocked, "state") == State.GAME, "v2 model-click path bypasses terminal recovery");
        System.out.println("PASS v2 real entry-point failures reproduced: block wrench and model packet");
        for (int count : List.of(3, 4)) for (boolean model : List.of(false, true)) {
            for (String phase : List.of("terminal", "pending-bust", "idle")) {
                Object t = fixture(after, count, phase); ServerPlayer p = player(t, true);
                Object inventory = get(t, "inventory"), seats = get(t, "seats");
                if (model) modelClick(t, p); else blockClick(newRoute, t, p, true);
                check(p.menus == 1 && p.opened == t, "wrench requests actual table menu: " + phase);
                check(get(t, "state") == State.IDLE && get(t, "driver") == null, "finished/idle table ready for settings");
                check(get(t, "inventory") == inventory && get(t, "seats") == seats, "interaction preserves inventory and seats");
                Preset target = count == 3 ? Preset.MAHJONG_SOUL_4P : Preset.MAHJONG_SOUL_SANMA_3P;
                call(t, "selectPreset", target);
                check(get(t, "preset") == target, "mode selection accepted after menu opened");
                check(call(t, "tryStartMatch", 999L) == StartMatchResult.STARTED, "new mode starts successfully");
                check(((TheMahjongDriver)get(t, "driver")).match().playerCount() == target.playerCount(), "new mode has requested player count");
            }
            for (String phase : List.of("playing", "pending-normal", "animation")) {
                Object t = fixture(after, count, phase); ServerPlayer p = player(t, true);
                TheMahjongDriver driver = (TheMahjongDriver)get(t, "driver");
                Object previousMatch = driver.match(), previousPhase = driver.currentPhase();
                if (model) modelClick(t, p); else blockClick(newRoute, t, p, true);
                check(p.menus == 0 && p.messages == 1, "busy wrench gives feedback without opening menu");
                check(get(t, "driver") == driver && get(t, "state") == State.GAME,
                    "busy wrench does not terminate game");
                check(driver.match() == previousMatch && driver.currentPhase() == previousPhase,
                    "termination preview does not advance ordinary hands or animations");
            }
        }
        Object regularModel = fixture(after, 3, "pending-normal");
        modelClick(regularModel, player(regularModel, false));
        check(((TheMahjongDriver)get(regularModel, "driver")).match().completedRounds().size() == 1,
            "nonwrench model click confirms an ordinary round");
        Object edge = fixture(after, 3, "idle"); ServerPlayer edgePlayer = player(edge, true);
        blockClick(newRoute, edge, edgePlayer, false);
        check(edgePlayer.menus == 0, "noncentral block does not open table menu");
        Object client = fixture(after, 3, "terminal"); ServerPlayer clientPlayer = player(client, true);
        clientPlayer.level.client = true;
        blockClick(newRoute, client, clientPlayer, true);
        check(clientPlayer.menus == 0 && get(client, "state") == State.GAME, "client Block.use does not change authoritative state");
        System.out.println("PASS all " + TestServerBugs.checks + " interaction assertions; Minecraft network/UI are boundary fixtures");
    }
}
