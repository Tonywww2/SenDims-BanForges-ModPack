import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.jar.JarFile;
import java.lang.reflect.Method;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;
import org.objectweb.asm.tree.analysis.*;
import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;
import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

/** Disable only the mod's initial carried-block assignment; execute original/patched bytecode in tests. */
public final class PatchEndermanCarry implements Opcodes {
    static final String OWNER = "com/riichimahjongforge/gimmicks/EndermanCarriesMahjongTile";
    static final String METHOD = "onEndermanFinalizeSpawn";
    static final String EVENT = "net/minecraftforge/event/entity/living/MobSpawnEvent$FinalizeSpawn";
    static final String DESC = "(L" + EVENT + ";)V";
    static final String ORIGINAL_SHA = "fffd26462fc15e7fcf061c5c63b7bf445ffd8ceb12b89121ca24697d3a28e49b";
    static int checks;

    static void check(boolean valid, String message) {
        if (!valid) throw new AssertionError(message);
        checks++;
    }
    static String sha(byte[] bytes) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
    }
    static ClassNode node(byte[] bytes) {
        ClassNode n = new ClassNode(); new ClassReader(bytes).accept(n, 0); return n;
    }
    static byte[] bytes(ClassNode n) {
        ClassWriter writer = new ClassWriter(0); n.accept(writer); return writer.toByteArray();
    }
    static MethodNode callback(ClassNode n) {
        return n.methods.stream().filter(m -> m.name.equals(METHOD) && m.desc.equals(DESC)).findFirst().orElseThrow();
    }
    static byte[] patch(byte[] original) throws Exception {
        if (!sha(original).equals(ORIGINAL_SHA)) throw new IllegalArgumentException("Unexpected original class SHA-256: " + sha(original));
        ClassNode n = node(original);
        check(n.name.equals(OWNER) && n.version == V17, "expected owner and Java 17 bytecode");
        MethodNode m = callback(n);
        check(m.access == (ACC_PUBLIC | ACC_STATIC), "expected static event handler");
        check(m.visibleAnnotations.stream().anyMatch(a -> a.desc.equals("Lnet/minecraftforge/eventbus/api/SubscribeEvent;")), "Forge subscription retained");
        check(n.visibleAnnotations.stream().anyMatch(a -> a.desc.equals("Lnet/minecraftforge/fml/common/Mod$EventBusSubscriber;")), "Forge subscriber retained");
        m.instructions.clear();
        m.instructions.add(new InsnNode(RETURN));
        m.tryCatchBlocks.clear();
        if (m.localVariables != null) m.localVariables.clear();
        m.visibleLocalVariableAnnotations = null;
        m.invisibleLocalVariableAnnotations = null;
        m.maxStack = 0;
        m.maxLocals = 1;
        new Analyzer<>(new BasicVerifier()).analyze(OWNER, m);
        check(n.methods.size() == 2 && n.fields.isEmpty(), "only original constructor and callback remain");
        return bytes(n);
    }

    static byte[] roundTrip(byte[] original, byte[] patched, Path scratch) throws Exception {
        Path classFile = scratch.resolve(OWNER + ".class");
        Files.createDirectories(classFile.getParent()); Files.write(classFile, patched);
        byte[] first = bytes(new BytecodeTransformer(scratch, Map.of(OWNER, patched)).transform(node(original), null));
        Path diffFile = scratch.resolve(OWNER + ".badiff");
        check(!Files.exists(classFile) && Files.isRegularFile(diffFile), "actual HotAI converts class to badiff");
        MemoryDiff diff = new MemoryDiff();
        try (var stream = Files.newInputStream(diffFile)) { diff.deserialize(DefaultSerialization.newInstance(), stream); }
        byte[] restart = bytes(new DiffTransformer(Map.of(OWNER, diff)).transform(node(original), null));
        check(Arrays.equals(first, restart), "HotAI restart reconstructs the same class");
        check(Arrays.equals(restart, patched), "HotAI output equals intended patch");
        System.out.println("PASS real HotAI class -> badiff -> restart round trip");
        return restart;
    }

    // Only Minecraft/Forge boundary types are fixtures. Both event handlers are actual mod bytecode.
    public static class Mob {}
    public static class State {
        final String name;
        State(String name) { this.name = name; }
    }
    public static class Block {
        final State state;
        Block(String name) { state = new State(name); }
        public State m_49966_() { return state; }
    }
    public static class Blocks { public static final Block f_50440_ = new Block("grass_block"); }
    public interface RandomSource { boolean m_188499_(); }
    public static class Enderman extends Mob {
        State carried;
        final boolean choice;
        int writes, randomReads;
        Enderman(boolean choice, State carried) { this.choice = choice; this.carried = carried; }
        public void m_32521_(State value) { writes++; carried = value; }
        public RandomSource m_217043_() { return () -> { randomReads++; return choice; }; }
    }
    public static class Tiles {
        public static int CODE_MAN_4 = 4;
        static Block tile;
        static int lookups;
        public static Block blockForCode(int code) {
            if (code != CODE_MAN_4) throw new AssertionError("wrong tile code");
            lookups++; return tile;
        }
    }
    public static class Event {
        final Mob mob;
        int reads;
        Event(Mob mob) { this.mob = mob; }
        public Mob getEntity() { reads++; return mob; }
    }
    static String name(Class<?> cls) { return org.objectweb.asm.Type.getInternalName(cls); }
    static Method executable(byte[] data) throws Exception {
        ClassNode n = node(data);
        n.innerClasses.clear(); n.nestHostClass = null; n.nestMembers = null;
        Map<String, String> map = Map.of(
            EVENT, name(Event.class),
            "net/minecraft/world/entity/Mob", name(Mob.class),
            "net/minecraft/world/entity/monster/EnderMan", name(Enderman.class),
            "net/minecraft/util/RandomSource", name(RandomSource.class),
            "net/minecraft/world/level/block/state/BlockState", name(State.class),
            "net/minecraft/world/level/block/Block", name(Block.class),
            "net/minecraft/world/level/block/Blocks", name(Blocks.class),
            "com/riichimahjongforge/mahjongcore/MahjongTileItems", name(Tiles.class));
        ClassWriter writer = new ClassWriter(0);
        n.accept(new ClassRemapper(writer, new SimpleRemapper(map)));
        class Loader extends ClassLoader {
            Class<?> define(byte[] b) { return defineClass(null, b, 0, b.length); }
        }
        return new Loader().define(writer.toByteArray()).getMethod(METHOD, Event.class);
    }
    static void behavior(byte[] original, byte[] patched) throws Exception {
        Method before = executable(original), after = executable(patched);
        Block tile = new Block("tile_man_4");
        for (boolean available : new boolean[]{false, true}) {
            for (boolean choice : new boolean[]{false, true}) {
                Tiles.tile = available ? tile : null;
                Enderman old = new Enderman(choice, null);
                before.invoke(null, new Event(old));
                State expected = available && !choice ? tile.state : Blocks.f_50440_.state;
                check(old.writes == 1 && old.carried == expected, "original reproduces forced carried block");
                for (State initial : new State[]{null, tile.state, Blocks.f_50440_.state, new State("custom_block")}) {
                    Tiles.lookups = 0;
                    Enderman entity = new Enderman(choice, initial);
                    Event event = new Event(entity);
                    after.invoke(null, event);
                    check(entity.carried == initial && entity.writes == 0, "patched callback does not assign or clear carried blocks");
                    check(entity.randomReads == 0 && Tiles.lookups == 0 && event.reads == 0, "patched callback has no remaining event, RNG or registry access");
                }
            }
        }
        Event other = new Event(new Mob());
        Tiles.lookups = 0;
        after.invoke(null, other);
        check(other.reads == 0 && Tiles.lookups == 0, "other mobs unaffected");
        after.invoke(null, new Object[]{null});
        check(true, "callback is inert even with no event object");
        System.out.println("PASS original grass/tile/fallback branches reproduced; patched callback has no side effects");
    }
    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("Usage: PatchEndermanCarry <minecraft root> <build root>");
        Path root = Path.of(args[0]), build = Path.of(args[1]);
        byte[] original;
        try (JarFile jar = new JarFile(root.resolve("mods/riichi_mahjong_forge-0.2.0.jar").toFile())) {
            original = jar.getInputStream(jar.getJarEntry(OWNER + ".class")).readAllBytes();
        }
        byte[] patched = patch(original);
        byte[] transformed = roundTrip(original, patched, build.resolve("hotai-roundtrip"));
        behavior(original, transformed);
        Path output = build.resolve("release/hotai/" + OWNER + ".class");
        Files.createDirectories(output.getParent()); Files.write(output, patched);
        System.out.println("Original SHA256: " + sha(original));
        System.out.println("Patched SHA256: " + sha(patched));
        System.out.println("PASS " + checks + " checks; Minecraft/Forge boundaries use fixtures; no live server launched");
        System.out.println("Output: " + output);
    }
}
