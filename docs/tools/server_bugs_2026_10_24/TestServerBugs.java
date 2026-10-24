import java.lang.reflect.*;
import java.nio.file.*;
import java.util.*;
import java.util.jar.JarFile;
import com.google.common.cache.*;
import com.themahjong.TheMahjongMatch;
import com.themahjong.TheMahjongRound;
import com.themahjong.TheMahjongPlayer;
import com.themahjong.driver.*;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.ClassRemapper;
import org.objectweb.asm.commons.SimpleRemapper;
import org.objectweb.asm.tree.*;
import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;
import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

/** Executes original/patched method bytecode, with Minecraft boundary fixtures.
 * Real Guava cache and the mod's real Mahjong match/driver remain in use.
 * This is a regression harness, not a substitute for a Forge integration test.
 */
public final class TestServerBugs implements Opcodes {
    static int checks;
    static final String ENERGY = PatchServerBugs.ENERGY, TABLE = PatchServerBugs.TABLE;
    static final String NBT = "net/minecraft/nbt/CompoundTag";
    static final String HUMAN = "com/riichimahjongforge/mahjongtable/MahjongTableHumanPlayer";
    static class Loader extends ClassLoader {
        Loader() { super(TestServerBugs.class.getClassLoader()); }
        Class<?> define(byte[] bytes) { return defineClass(null, bytes, 0, bytes.length); }
    }
    static String name(Class<?> type) { return org.objectweb.asm.Type.getInternalName(type); }
    static void check(boolean success, String label) {
        if (!success) throw new AssertionError(label);
        checks++;
    }
    static byte[] original(Path root, String jar, String type) throws Exception {
        try (JarFile file = new JarFile(root.resolve("mods/" + jar).toFile())) {
            return file.getInputStream(file.getJarEntry(type + ".class")).readAllBytes();
        }
    }
    static Throwable cause(Throwable failure) {
        while (failure.getCause() != null) failure = failure.getCause();
        return failure;
    }
    static Object call(Object target, String method, Object... args) throws Exception {
        Method chosen = Arrays.stream(target.getClass().getMethods())
            .filter(m -> m.getName().equals(method) && m.getParameterCount() == args.length
                && !m.isBridge()).findFirst().orElseThrow();
        return chosen.invoke(target, args);
    }
    static int value(Object target, String method, Object... args) throws Exception {
        return (Integer)call(target, method, args);
    }
    static Class<?> remap(ClassNode node, Map<String,String> map) {
        node.innerClasses.clear(); node.nestHostClass = null; node.nestMembers = null;
        ClassWriter writer = new ClassWriter(ClassWriter.COMPUTE_MAXS);
        node.accept(new ClassRemapper(writer, new SimpleRemapper(map)));
        return new Loader().define(writer.toByteArray());
    }
    static ClassNode node(byte[] bytes) {
        ClassNode node = new ClassNode(); new ClassReader(bytes).accept(node, 0); return node;
    }
    static Map<String,String> commonMap() {
        Map<String,String> m = new HashMap<>();
        m.put(NBT, name(Compound.class));
        m.put("net/minecraft/nbt/Tag", name(Tag.class));
        m.put("net/minecraft/nbt/ListTag", name(TagList.class));
        m.put("net/minecraft/world/item/ItemStack", name(Stack.class));
        m.put("net/minecraft/world/item/Item", name(Item.class));
        return m;
    }
    static Class<?> energyClass(byte[] bytes, String suffix) {
        ClassNode n = node(bytes);
        n.interfaces.clear(); n.signature = null;
        Map<String,String> m = commonMap();
        m.put(ENERGY, "Energy" + suffix);
        m.put("se/mickelus/tetra/items/modular/IModularItem", name(Modular.class));
        m.put("se/mickelus/tetra/effect/ItemEffect", name(Effect.class));
        m.put("net/yiran/fot/common/FEItemEffects", name(Effects.class));
        m.put("net/yiran/fot/Config", name(Config.class));
        m.put("net/minecraftforge/common/ForgeConfigSpec$ConfigValue", name(ConfigValue.class));
        return remap(n, m);
    }
    static Object newStore(Class<?> type, Stack stack) {
        try { return type.getConstructor(Stack.class).newInstance(stack); }
        catch (ReflectiveOperationException e) { throw new RuntimeException(e); }
    }
    static Stack stored(int energy, Item item) {
        Stack stack = new Stack(item, false);
        Compound saved = new Compound(); saved.m_128405_("energy", energy);
        stack.tag.m_128365_("FOT$energy", saved);
        return stack;
    }
    static void energyTests(byte[] before, byte[] after) throws Exception {
        Class<?> oldType = energyClass(before, "Original"), newType = energyClass(after, "Patched");
        for (Class<?> type : List.of(oldType, newType)) {
            ModularItem blade = new ModularItem();
            Stack stack = stored(700, blade);
            blade.attach = () -> stack.store = newStore(type, stack);
            try {
                check(blade.getEffectLevel(stack, Effects.FE_STORE) == 1000, "effect cache loaded");
                check(type == newType, "original must reproduce recursive load");
                check(value(stack.store, "getEnergyStored") == 700, "saved FE survives capability attachment");
                check(value(stack.store, "getMaxEnergyStored") == 1000, "capacity resolves after attachment");
            } catch (Throwable e) {
                check(type == oldType && cause(e) instanceof IllegalStateException
                    && cause(e).getMessage().contains("Recursive load"), "original Guava recursive load reproduced");
                System.out.println("PASS original FE failure reproduced: " + cause(e));
            }
        }
        ModularItem item = new ModularItem();
        Stack stack = stored(700, item);
        Object energy = newStore(newType, stack);
        check(item.lookups == 0, "deserialization must not query modular capabilities");
        check(value(energy, "receiveEnergy", 500, true) == 300, "simulated receive respects capacity");
        check(value(energy, "getEnergyStored") == 700, "simulated receive preserves energy");
        check(value(energy, "receiveEnergy", 500, false) == 300, "receive amount");
        check(value(energy, "getEnergyStored") == 1000, "receive total");
        check(value(energy, "extractEnergy", 250, true) == 250, "simulated extract amount");
        check(value(energy, "getEnergyStored") == 1000, "simulated extract preserves energy");
        check(value(energy, "extractEnergy", 250, false) == 250, "extract amount");
        check(value(energy, "getEnergyStored") == 750, "extract total");
        Compound saved = (Compound)call(energy, "serializeNBT");
        check(saved.m_128451_("energy") == 750, "NBT save preserves energy");
        Object reloaded = newStore(newType, stack);
        check(value(reloaded, "getEnergyStored") == 750, "NBT reload preserves energy");
        call(energy, "setEnergyStored", -9);
        check(value(energy, "getEnergyStored") == 0, "negative assignment clamped");
        call(energy, "setEnergyStored", 9000);
        check(value(energy, "getEnergyStored") == 1000, "overcapacity assignment clamped");
        Compound changed = new Compound(); changed.m_128405_("energy", 2000);
        item.capacity = 400; item.cache.invalidateAll();
        call(energy, "deserializeNBT", changed);
        check(value(energy, "getMaxEnergyStored") == 400, "deserialization invalidates cached capacity");
        check(value(energy, "getEnergyStored") == 400, "saved energy clamped to changed capacity");
        call(energy, "deserializeNBT", changed);
        check(value(energy, "extractEnergy", 9999, true) == 400, "simulation cannot extract stale overcapacity FE");
        check(value(energy, "extractEnergy", 9999, false) == 400, "extraction cannot create FE");
        changed.m_128405_("energy", -12); call(energy, "deserializeNBT", changed);
        check(value(energy, "getEnergyStored") == 0, "negative saved FE clamped");
        Object plain = newStore(newType, stored(123, new Item()));
        check(value(plain, "getMaxEnergyStored") == 0 && value(plain, "getEnergyStored") == 0,
            "nonmodular item has zero capacity");
        System.out.println("PASS patched FE: attachment, persistence, capacity refresh, receive/extract and bounds");
    }
    static Class<?> tableClass(byte[] bytes, String suffix) {
        ClassNode n = node(bytes);
        n.interfaces.clear(); n.signature = null;
        n.fields.forEach(f -> { f.access = (f.access & ~(ACC_PRIVATE | ACC_PROTECTED | ACC_FINAL)) | ACC_PUBLIC; });
        Set<String> keep = Set.of("m_183515_", "serverTick", "lambda$saveAdditional$4",
            "advanceRoundAfterResult", "computeRenchan", "clearResultAnimState", "endGame",
            "driverIsTerminal", "onTableRightClick", "seatOfOccupant", "sdbf$finishEndedMatch",
            "tryStartMatch", "effectivePreset", "seatsMatchCanonicalLayout", "buildPlayersFromSeats", "buildPlayer");
        n.methods.removeIf(m -> !keep.contains(m.name));
        for (MethodNode method : n.methods) {
            method.access = (method.access & ~(ACC_PRIVATE | ACC_PROTECTED)) | ACC_PUBLIC;
            for (AbstractInsnNode instruction : method.instructions) {
                // Fixture Human accepts the common table base; gameplay method instructions otherwise remain intact.
                if (instruction instanceof MethodInsnNode c && c.owner.equals(HUMAN) && c.name.equals("tickAfterAdvance"))
                    c.desc = c.desc.replace("L" + TABLE + ";", "L" + name(BlockEntity.class) + ";");
            }
        }
        MethodNode ctor = new MethodNode(ACC_PUBLIC, "<init>", "()V", null, null);
        ctor.instructions.add(new VarInsnNode(ALOAD, 0));
        ctor.instructions.add(new MethodInsnNode(INVOKESPECIAL, n.superName, "<init>", "()V", false));
        ctor.instructions.add(new InsnNode(RETURN)); ctor.maxLocals = 1; n.methods.add(ctor);
        // Rendering/world notification helpers are boundary fixtures; both complete
        // serverTick loops and actual driver.advance remain original method code.
        for (String[] stub : new String[][] {
            {"markChangedAndSynced", "()V"},
            {"tickResultAnimation", "(Lnet/minecraft/server/level/ServerLevel;)V"},
            {"startResultAnimation", "(Lnet/minecraft/server/level/ServerLevel;Lcom/themahjong/driver/MatchPhase$RoundEnded;)V"}}) {
            MethodNode method = new MethodNode(ACC_PUBLIC, stub[0], stub[1], null, null);
            method.instructions.add(new InsnNode(RETURN));
            method.maxLocals = 1 + org.objectweb.asm.Type.getArgumentTypes(stub[1]).length; n.methods.add(method);
        }
        Map<String,String> m = commonMap();
        m.put(TABLE, "Table" + suffix);
        m.put(TABLE + "$State", name(State.class));
        m.put(TABLE + "$ResultAnimStage", name(Anim.class));
        m.put(TABLE + "$SeatInfo", name(Seat.class));
        m.put(TABLE + "$StartMatchResult", name(StartMatchResult.class));
        m.put("net/minecraft/core/NonNullList", name(Inventory.class));
        m.put("net/minecraft/world/level/block/entity/BlockEntity", name(BlockEntity.class));
        m.put("net/minecraft/world/level/Level", name(Level.class));
        m.put("net/minecraft/server/level/ServerLevel", name(ServerLevel.class));
        m.put("net/minecraft/server/level/ServerPlayer", name(ServerPlayer.class));
        m.put("com/riichimahjongforge/mahjongtable/RuleSetPreset", name(Preset.class));
        m.put("com/riichimahjongforge/themahjongcompat/DriverNbt", name(DriverSave.class));
        m.put(HUMAN, name(Human.class));
        return remap(n, m);
    }
    static void set(Object o, String key, Object v) throws Exception { o.getClass().getField(key).set(o, v); }
    static Object table(Class<?> type, int count, boolean active) throws Exception {
        Object table = type.getConstructor().newInstance();
        Inventory inventory = new Inventory();
        for (int i = 0; i < 136; i++) inventory.add(new Stack(new Item(), i != 7));
        List<Seat> seats = new ArrayList<>();
        for (int i = 0; i < 4; i++) seats.add(new Seat(i < count, i < count ? Optional.of(new UUID(0, i + 1)) : Optional.empty()));
        set(table, "inventory", inventory); set(table, "seats", seats);
        set(table, "state", active ? State.GAME : State.IDLE); set(table, "preset", Preset.MAHJONG_SOUL_4P);
        set(table, "resultAnimStage", Anim.NONE); set(table, "randomSeed", 42L);
        ((BlockEntity)table).f_58857_ = new ServerLevel();
        if (active) {
            List<MahjongPlayerInterface> players = new ArrayList<>();
            for (int i = 0; i < count; i++) players.add(new Human(i));
            TheMahjongMatch match = count == 3 ? TheMahjongMatch.defaultMahjongSoulSanma() : TheMahjongMatch.defaultMahjongSoul();
            TheMahjongDriver driver = new TheMahjongDriver(match, players, new Random(42));
            driver.startMatch(); set(table, "driver", driver);
        }
        return table;
    }
    static void tableTests(byte[] before, byte[] after) throws Exception {
        Class<?> oldType = tableClass(before, "Original"), newType = tableClass(after, "Patched");
        for (String method : List.of("m_183515_", "serverTick")) {
            Object original = table(oldType, 3, true);
            try {
                if (method.equals("serverTick")) call(original, method); else call(original, method, new Compound());
                throw new AssertionError("original sanma " + method + " should throw");
            } catch (InvocationTargetException e) {
                check(cause(e) instanceof IndexOutOfBoundsException && cause(e).getMessage().contains("Index 3"),
                    "original sanma failure at " + method);
                System.out.println("PASS original Mahjong failure reproduced in " + method + ": " + cause(e));
            }
        }
        for (int count : List.of(3, 4)) {
            Object fixed = table(newType, count, true);
            Compound saved = new Compound(); call(fixed, "m_183515_", saved);
            check(((TagList)saved.data.get("Seats")).size() == 4, "all four physical seats saved");
            check(((TagList)saved.data.get("HumanPlayers")).size() == count, "active players saved");
            TagList inventory = (TagList)saved.data.get("MtItemsInt");
            check(inventory.size() == 1 && ((Compound)inventory.get(0)).m_128451_("Slot") == 7,
                "nonempty table inventory and slot preserved");
            check(saved.data.get("State").equals("GAME") && saved.data.get("RandomSeed").equals(42L), "game metadata preserved");
            TheMahjongDriver driver = (TheMahjongDriver)fixed.getClass().getField("driver").get(fixed);
            for (int tick = 0; tick < 100; tick++) call(fixed, "serverTick");
            for (int seat = 0; seat < count; seat++) {
                Human human = (Human)driver.playerAt(seat);
                check(human.before == 100 && human.after == 100, "both tick loops visit each active player exactly once");
                Compound entry = (Compound)((TagList)saved.data.get("HumanPlayers")).get(seat);
                check(entry.m_128451_("Seat") == seat && entry.m_128451_("FixtureHuman") == seat, "human data preserved");
            }
            call(fixed, "m_183515_", new Compound());
            System.out.println("PASS patched " + count + "-player Mahjong: save + 100 full serverTicks + save");
        }
        Object idle = table(newType, 4, false);
        call(idle, "m_183515_", new Compound()); call(idle, "serverTick");
        check(true, "idle table null driver handled");
        matchEndTests(oldType, newType);
    }
    static Object get(Object target, String field) throws Exception { return target.getClass().getField(field).get(target); }
    static void endedRound(Object table, boolean bust) throws Exception {
        TheMahjongDriver previous = (TheMahjongDriver)get(table, "driver");
        TheMahjongMatch match = previous.match();
        TheMahjongRound round = match.currentRound().orElseThrow();
        List<TheMahjongPlayer> players = new ArrayList<>(round.players());
        if (bust) {
            TheMahjongPlayer old = players.get(1);
            players.set(1, new TheMahjongPlayer(-1000, old.riichiState(), old.ippatsuEligible(),
                old.currentHand(), old.melds(), old.discards(), old.temporaryFuritenTiles(), old.riichiPermanentFuriten(), old.kitaCount()));
        }
        TheMahjongRound ended = new TheMahjongRound(round.roundWind(), round.handNumber(), round.honba(),
            round.riichiSticks(), round.dealerSeat(), TheMahjongRound.State.ENDED, round.currentTurnSeat(),
            round.claimSourceSeat().orElse(-1), round.activeTile(), round.liveWall(), round.rinshanTiles(),
            round.doraIndicators(), round.uraDoraIndicators(), round.revealedDoraCount(), round.pendingKanDoraReveals(),
            players, round.pendingDeltas());
        TheMahjongMatch next = new TheMahjongMatch(match.playerCount(), match.startingPoints(), match.targetPoints(),
            match.roundCount(), TheMahjongMatch.State.IN_ROUND, match.tileSet(), match.ruleSet(), match.completedRounds(), ended);
        List<MahjongPlayerInterface> humans = new ArrayList<>();
        for (int i = 0; i < match.playerCount(); i++) humans.add(previous.playerAt(i));
        TheMahjongDriver driver = new TheMahjongDriver(next, humans, new Random(42),
            new TheMahjongDriver.Snapshot(new MatchPhase.RoundEnded(List.of()), false, OptionalInt.empty()));
        set(table, "driver", driver); set(table, "resultAnimStage", Anim.AWAITING_ADVANCE);
    }
    static void matchEndTests(Class<?> oldType, Class<?> newType) throws Exception {
        Object original = table(oldType, 3, true); endedRound(original, true);
        call(original, "advanceRoundAfterResult");
        TheMahjongDriver stuckDriver = (TheMahjongDriver)get(original, "driver");
        check(stuckDriver.currentPhase() instanceof MatchPhase.MatchEnded && get(original, "state") == State.GAME,
            "original bust leaves table GAME with a terminal driver");
        call(original, "onTableRightClick", new ServerPlayer());
        check(get(original, "state") == State.GAME && get(original, "driver") == stuckDriver,
            "original right-click cannot reset terminal table");
        System.out.println("PASS original bust dead-end reproduced: GAME + MatchEnded survives right-click");
        for (int count : List.of(3, 4)) {
            Object fixed = table(newType, count, true); endedRound(fixed, true);
            Object seats = get(fixed, "seats"), inventory = get(fixed, "inventory");
            TheMahjongDriver finishing = (TheMahjongDriver)get(fixed, "driver");
            call(fixed, "advanceRoundAfterResult");
            check(finishing.currentPhase() instanceof MatchPhase.MatchEnded, "real core processes negative-points match end");
            check(get(fixed, "state") == State.IDLE && get(fixed, "driver") == null, "terminal match returns to idle");
            check(get(fixed, "resultAnimStage") == Anim.NONE && (Long)get(fixed, "randomSeed") == 0L, "terminal state cleared");
            check(get(fixed, "seats") == seats && get(fixed, "inventory") == inventory, "seats and inventory preserved");
            call(fixed, "m_183515_", new Compound());
            check(call(fixed, "tryStartMatch", 123L) == StartMatchResult.STARTED, "real tryStartMatch starts a new game");
            check(((TheMahjongDriver)get(fixed, "driver")).match().playerCount() == count, "restart preserves player count");
            call(fixed, "serverTick");

            Object ongoing = table(newType, count, true); endedRound(ongoing, false);
            TheMahjongDriver continuing = (TheMahjongDriver)get(ongoing, "driver");
            call(ongoing, "advanceRoundAfterResult");
            check(get(ongoing, "state") == State.GAME && get(ongoing, "driver") == continuing,
                "ordinary round advance does not reset the match");
            check(continuing.match().completedRounds().size() == 1 && !(continuing.currentPhase() instanceof MatchPhase.MatchEnded),
                "ordinary round really advances in core");
            call(ongoing, "onTableRightClick", new ServerPlayer());
            check(get(ongoing, "driver") == continuing && get(ongoing, "state") == State.GAME,
                "ordinary right-click cannot terminate an ongoing game");

            Object waiting = table(newType, count, true); endedRound(waiting, true);
            Object pendingDriver = get(waiting, "driver"); set(waiting, "resultAnimStage", Anim.SHOW_HEADER);
            call(waiting, "advanceRoundAfterResult");
            check(get(waiting, "driver") == pendingDriver && get(waiting, "state") == State.GAME,
                "result animation must complete before confirmation");
            System.out.println("PASS " + count + "-player end/confirm/restart, ordinary next round and premature-click guards");
        }
        Object recovery = table(newType, 3, true);
        set(recovery, "driver", stuckDriver);
        call(recovery, "onTableRightClick", new ServerPlayer());
        check(get(recovery, "state") == State.IDLE && get(recovery, "driver") == null, "already-stuck table recovers on right-click");
        check(call(recovery, "tryStartMatch", 456L) == StartMatchResult.STARTED, "recovered table can start again");
        Object idle = table(newType, 3, false);
        call(idle, "onTableRightClick", new ServerPlayer());
        check(get(idle, "state") == State.IDLE, "empty driver right-click safe");
    }
    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]), patches = Path.of(args[1]);
        Path hotaiScratch = Path.of(args[2]);
        byte[] energy = original(root, "FluxOfTetra-6.9.0-1.0.5.jar", ENERGY);
        byte[] table = original(root, "riichi_mahjong_forge-0.2.0.jar", TABLE);
        energyTests(energy, hotaiRoundTrip(energy, Files.readAllBytes(patches.resolve(ENERGY + ".class")), ENERGY, hotaiScratch));
        tableTests(table, hotaiRoundTrip(table, Files.readAllBytes(patches.resolve(TABLE + ".class")), TABLE, hotaiScratch));
        System.out.println("PASS all " + checks + " regression assertions; Minecraft/Forge boundaries are fixtures");
    }
    static byte[] bytes(ClassNode node) {
        ClassWriter writer = new ClassWriter(0); node.accept(writer); return writer.toByteArray();
    }
    static byte[] hotaiRoundTrip(byte[] before, byte[] after, String owner, Path scratch) throws Exception {
        Path classFile = scratch.resolve(owner + ".class");
        Files.createDirectories(classFile.getParent()); Files.write(classFile, after);
        BytecodeTransformer first = new BytecodeTransformer(scratch, Map.of(owner, after));
        byte[] firstResult = bytes(first.transform(node(before), null));
        Path diffFile = scratch.resolve(owner + ".badiff");
        check(!Files.exists(classFile) && Files.exists(diffFile), "HotAI converts class to badiff");
        MemoryDiff diff = new MemoryDiff();
        try (var in = Files.newInputStream(diffFile)) { diff.deserialize(DefaultSerialization.newInstance(), in); }
        DiffTransformer restart = new DiffTransformer(Map.of(owner, diff));
        byte[] secondResult = bytes(restart.transform(node(before), null));
        check(Arrays.equals(firstResult, secondResult), "HotAI restart reconstructs identical patched class");
        check(Arrays.equals(firstResult, bytes(node(after))), "HotAI applies intended class");
        System.out.println("PASS actual HotAI class -> badiff -> restart round trip: " + owner);
        return secondResult;
    }

    public interface Tag {}
    public static class Compound implements Tag {
        public final Map<String,Object> data = new LinkedHashMap<>();
        public int m_128451_(String key) { return (Integer)data.getOrDefault(key, 0); }
        public void m_128405_(String key, int v) { data.put(key, v); }
        public boolean m_128441_(String key) { return data.containsKey(key); }
        public Compound m_128469_(String key) { return (Compound)data.getOrDefault(key, new Compound()); }
        public Tag m_128365_(String key, Tag v) { return (Tag)data.put(key, v); }
        public void m_128359_(String key, String v) { data.put(key, v); }
        public void m_128379_(String key, boolean v) { data.put(key, v); }
        public void m_128362_(String key, UUID v) { data.put(key, v); }
        public void m_128356_(String key, long v) { data.put(key, v); }
    }
    public static class TagList extends ArrayList<Object> implements Tag {}
    public static class Item {}
    public static class Stack {
        public final Compound tag = new Compound(); public final Item item; public final boolean empty; public Object store;
        Stack(Item item, boolean empty) { this.item = item; this.empty = empty; }
        public boolean m_41619_() { return empty; }
        public Compound m_41784_() { return tag; }
        public Item m_41720_() { return item; }
        public Compound m_41739_(Compound tag) { tag.m_128359_("id", "fixture:item"); return tag; }
    }
    public static class Effect {}
    public interface Modular { int getEffectLevel(Stack stack, Effect effect); }
    public static class Effects { public static Effect FE_STORE = new Effect(); }
    public static class ConfigValue { public Object get() { return 20000; } }
    public static class Config { public static ConfigValue maxReceive = new ConfigValue(); }
    public static class ModularItem extends Item implements Modular {
        public final Cache<String,Integer> cache = CacheBuilder.newBuilder().build();
        public Runnable attach; public int capacity = 1000, lookups;
        public int getEffectLevel(Stack stack, Effect effect) {
            lookups++;
            try { return cache.get("blade-uuid", () -> { if (attach != null) attach.run(); return capacity; }); }
            catch (java.util.concurrent.ExecutionException e) { throw new RuntimeException(e); }
        }
    }
    public static class Inventory extends ArrayList<Stack> {}
    public static class Level {
        public boolean m_5776_() { return false; }
        public long m_46467_() { return 100L; }
    }
    public static class ServerLevel extends Level {}
    public static class ServerPlayer { public UUID m_20148_() { return new UUID(0, 1); } }
    public static class BlockEntity { public Level f_58857_; public void m_183515_(Compound tag) {} }
    public enum State { IDLE, GAME }
    public enum Anim { NONE, SHOW_HEADER, AWAITING_ADVANCE }
    public enum StartMatchResult { STARTED, NOT_IDLE, SEATS_MISMATCH_PRESET }
    public enum Preset {
        MAHJONG_SOUL_4P, MAHJONG_SOUL_SANMA_3P;
        public int playerCount() { return this == MAHJONG_SOUL_4P ? 4 : 3; }
        public TheMahjongMatch newMatch() {
            return this == MAHJONG_SOUL_4P ? TheMahjongMatch.defaultMahjongSoul() : TheMahjongMatch.defaultMahjongSoulSanma();
        }
    }
    public record Seat(boolean enabled, Optional<UUID> occupant) {}
    public static class DriverSave {
        public static Compound writeDriver(TheMahjongDriver driver) {
            Compound tag = new Compound(); tag.m_128405_("playerCount", driver.match().playerCount()); return tag;
        }
    }
    public static class Human implements MahjongPlayerInterface {
        public int before, after; public final int seat;
        public Human() { this.seat = -1; }
        public Human(int seat) { this.seat = seat; }
        public void setOccupant(UUID uuid) {}
        public void setAutoDrawAfterSeconds(double seconds) {}
        public void onTableRightClick(TheMahjongDriver driver, MatchPhase phase, int seat, ServerPlayer player) {}
        public Optional<PlayerAction> chooseAction(DecisionRequest request, double delta) { return Optional.empty(); }
        public void validateBeforeAdvance(ServerLevel level) { before++; }
        public boolean tickAfterAdvance(ServerLevel level, BlockEntity table, int seat, MatchPhase phase) { after++; return false; }
        public void writeNbt(Compound tag) { tag.m_128405_("FixtureHuman", seat); }
    }
}
