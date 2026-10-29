import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;
import org.objectweb.asm.tree.analysis.*;

/** Execute actual mod methods with explicit Minecraft/Forge boundary fixtures. */
public final class TestStargateHardness implements Opcodes {
    static int checks;
    static void check(boolean valid, String label) {
        if (!valid) throw new AssertionError(label);
        checks++;
    }
    static String name(Class<?> type) { return org.objectweb.asm.Type.getInternalName(type); }
    public record Pos(int x, int y, int z) {}
    public enum Direction { NORTH, SOUTH, WEST, EAST }
    public enum Orientation { REGULAR, UP, DOWN }
    public enum Part {
        BASE(0, 0), LEFT(1, 0), ABOVE6(0, -6), RIGHT2_ABOVE_SHIELDED(-2, -1);
        final int dx, dy;
        Part(int dx, int dy) { this.dx = dx; this.dy = dy; }
        public Pos getBaseBlockPos(Pos pos, Direction facing, Orientation orientation) {
            int x = (facing == Direction.EAST || facing == Direction.WEST) ? 0 : dx;
            int z = (facing == Direction.EAST || facing == Direction.WEST) ? dx : 0;
            return new Pos(pos.x + x, pos.y + dy + orientation.ordinal(), pos.z + z);
        }
    }
    public static class Property { final String label; Property(String label) { this.label = label; } }
    public static class Block {
        final String label;
        final float hardness;
        Block(String label, float hardness) { this.label = label; this.hardness = hardness; }
    }
    public static class State {
        final Block block;
        final Map<Property, Comparable<?>> properties = new HashMap<>();
        public State(Block block) { this.block = block; }
        public Block m_60734_() { return block; }
        public Comparable<?> m_61143_(Property property) {
            if (!properties.containsKey(property)) {
                throw new IllegalArgumentException("Cannot get property " + property.label + " from Block{" + block.label + "}");
            }
            return properties.get(property);
        }
        public float m_60800_(World world, Pos pos) { return block.hardness; }
        State part(Part part, Direction direction, Orientation orientation) {
            properties.put(GateBlock.PART, part);
            properties.put(GateBlock.FACING, direction);
            properties.put(GateBlock.ORIENTATION, orientation);
            return this;
        }
    }
    public static class Entity {}
    public enum Connection { IDLE, CONNECTED; public boolean isConnected() { return this == CONNECTED; } }
    public static class GateEntity extends Entity {
        final Connection connection;
        GateEntity(Connection connection) { this.connection = connection; }
        public Connection getConnectionState() { return connection; }
    }
    public interface World {
        State m_8055_(Pos pos);
        Entity m_7702_(Pos pos);
    }
    public static class TestWorld implements World {
        State current;
        Pos expectedBase;
        Entity entity;
        int stateReads, entityReads;
        TestWorld(State current) { this.current = current; }
        public State m_8055_(Pos pos) { stateReads++; return current; }
        public Entity m_7702_(Pos pos) {
            entityReads++;
            check(pos.equals(expectedBase), "actual ring lookup resolves the correct base position");
            return entity;
        }
    }
    public static class BoolValue { boolean value; public Object get() { return value; } }
    public static class Config { public static final BoolValue can_break_connected_stargate = new BoolValue(); }
    public static class Cover {
        final Map<Part, State> blocks = new EnumMap<>(Part.class);
        public Optional<State> getBlockAt(Part part) { return Optional.ofNullable(blocks.get(part)); }
    }
    public static class GateBlock extends Block {
        public static final Property PART = new Property("stargate_part");
        public static final Property FACING = new Property("facing");
        public static final Property ORIENTATION = new Property("orientation");
        Cover cover;
        int coverReads;
        public GateBlock() { super("sgjourney:test_ring", 50f); }
        public GateEntity getStargate(World world, Pos pos, State state) { throw new AssertionError("actual ring override was not called"); }
        public Optional<Cover> getBlockCover(World world, State state, Pos pos) {
            coverReads++; return Optional.ofNullable(cover);
        }
    }
    record Subject(Class<?> type, GateBlock ring, Method hardness) {
        State state(Part part, Direction facing, Orientation orientation) throws Exception {
            return ((State)type.getConstructor(Block.class).newInstance(ring)).part(part, facing, orientation);
        }
        float hardness(State state, World world, Pos pos) throws Exception {
            try { return (Float)hardness.invoke(state, world, pos); }
            catch (InvocationTargetException e) {
                if (e.getCause() instanceof RuntimeException cause) throw cause;
                throw e;
            }
        }
    }

    static byte[] executable(byte[] original, boolean ring) throws Exception {
        ClassNode n = PatchStargateHardness.node(original);
        n.methods.removeIf(m -> ring ? !Set.of("getBaseBlockPos", "getStargate").contains(m.name)
                : !(m.name.equals(PatchStargateHardness.METHOD) && m.desc.equals(PatchStargateHardness.DESC)));
        n.fields.clear(); n.innerClasses.clear(); n.nestHostClass = null; n.nestMembers = null;
        n.visibleAnnotations = null; n.invisibleAnnotations = null;
        n.access = ACC_PUBLIC | ACC_SUPER;
        MethodNode ctor = new MethodNode(ACC_PUBLIC, "<init>", ring ? "()V" : "(L" + PatchStargateHardness.BLOCK + ";)V", null, null);
        ctor.instructions.add(new VarInsnNode(ALOAD, 0));
        if (!ring) ctor.instructions.add(new VarInsnNode(ALOAD, 1));
        ctor.instructions.add(new MethodInsnNode(INVOKESPECIAL, n.superName, "<init>", ctor.desc, false));
        ctor.instructions.add(new InsnNode(RETURN));
        ctor.maxStack = ring ? 1 : 2; ctor.maxLocals = ring ? 1 : 2;
        n.methods.add(ctor);
        Map<String, String> map = new HashMap<>();
        map.put(PatchStargateHardness.OWNER, "stargate_hardness_test/SubjectState");
        map.put(PatchStargateHardness.RING, "stargate_hardness_test/SubjectRing");
        map.put(PatchStargateHardness.STATE, name(State.class));
        map.put(PatchStargateHardness.BLOCK, name(Block.class));
        map.put(PatchStargateHardness.GETTER, name(World.class));
        map.put(PatchStargateHardness.POS, name(Pos.class));
        map.put("net/minecraft/world/level/block/entity/BlockEntity", name(Entity.class));
        map.put("net/minecraft/core/Direction", name(Direction.class));
        for (String property : List.of("Property", "EnumProperty", "DirectionProperty"))
            map.put("net/minecraft/world/level/block/state/properties/" + property, name(Property.class));
        map.put("net/povstalec/sgjourney/common/blocks/stargate/AbstractStargateBlock", name(GateBlock.class));
        map.put("net/povstalec/sgjourney/common/blockstates/StargatePart", name(Part.class));
        map.put("net/povstalec/sgjourney/common/blockstates/Orientation", name(Orientation.class));
        map.put("net/povstalec/sgjourney/common/block_entities/stargate/AbstractStargateEntity", name(GateEntity.class));
        map.put("net/povstalec/sgjourney/common/sgjourney/StargateConnection$State", name(Connection.class));
        map.put("net/povstalec/sgjourney/common/config/CommonStargateConfig", name(Config.class));
        map.put("net/minecraftforge/common/ForgeConfigSpec$BooleanValue", name(BoolValue.class));
        map.put("net/povstalec/sgjourney/common/sgjourney/StargateBlockCover", name(Cover.class));
        ClassWriter out = new ClassWriter(0);
        n.accept(new ClassRemapper(out, new SimpleRemapper(map)));
        byte[] bytes = out.toByteArray();
        ClassNode mapped = PatchStargateHardness.node(bytes);
        for (MethodNode m : mapped.methods) new Analyzer<>(new BasicVerifier()).analyze(mapped.name, m);
        return bytes;
    }
    static Subject subject(byte[] state, byte[] ring) throws Exception {
        class Loader extends ClassLoader { Class<?> define(byte[] bytes) { return defineClass(null, bytes, 0, bytes.length); } }
        Loader loader = new Loader();
        Class<?> ringType = loader.define(executable(ring, true));
        Class<?> stateType = loader.define(executable(state, false));
        return new Subject(stateType, (GateBlock)ringType.getConstructor().newInstance(),
                stateType.getMethod(PatchStargateHardness.METHOD, World.class, Pos.class));
    }
    static TestWorld world(State state, Part part, Direction facing, Orientation orientation, Pos pos, Entity entity) {
        TestWorld world = new TestWorld(state);
        world.expectedBase = part.getBaseBlockPos(pos, facing, orientation); world.entity = entity;
        return world;
    }
    static void stale(Subject before, Subject after) throws Exception {
        Pos pos = new Pos(54, 303, 2138);
        int failures = 0;
        for (String replacement : List.of("minecraft:air", "minecraft:cave_air", "minecraft:stone", "minecraft:water")) {
            State oldState = before.state(Part.LEFT, Direction.NORTH, Orientation.REGULAR);
            TestWorld removed = new TestWorld(new State(new Block(replacement, 0f)));
            try {
                before.hardness(oldState, removed, pos);
                throw new AssertionError("original did not reproduce stale-state crash");
            } catch (IllegalArgumentException expected) {
                check(expected.getMessage().contains("stargate_part") && expected.getMessage().contains(replacement), "original exact missing-part failure: " + replacement);
                failures++;
            }
            for (boolean connected : new boolean[]{false, true}) {
                Config.can_break_connected_stargate.value = connected;
                after.ring.cover = new Cover(); after.ring.coverReads = 0;
                State detached = after.state(Part.LEFT, Direction.NORTH, Orientation.REGULAR);
                TestWorld replaced = new TestWorld(new State(new Block(replacement, 0f)));
                check(after.hardness(detached, replaced, pos) == 50f, "removed/replaced ring returns its original positive hardness");
                check(replaced.entityReads == 0 && after.ring.coverReads == 0, "stale query does not inspect ring parts, connection or cover");
                check(replaced.stateReads == 1 && replaced.current.block.label.equals(replacement), "stale query reads once and leaves world intact");
            }
        }
        // A different Stargate block can still have all properties; do not use its entity/cover.
        State detached = after.state(Part.ABOVE6, Direction.EAST, Orientation.DOWN);
        TestWorld swappedGate = new TestWorld(new State(new GateBlock()).part(Part.BASE, Direction.SOUTH, Orientation.UP));
        after.ring.coverReads = 0;
        check(after.hardness(detached, swappedGate, pos) == 50f && swappedGate.entityReads == 0 && after.ring.coverReads == 0,
                "different Stargate replacement also returns the old block's hardness without querying the new gate");
        check(failures == 4, "original failure reproduced for air and three other replacement types");
        System.out.println("PASS original Stargate hardness + actual ring lookup reproduce missing stargate_part on air; all replacements now safe");
    }
    static void normal(Subject before, Subject after) throws Exception {
        Pos pos = new Pos(54, 303, 2138);
        for (Part part : Part.values()) for (Direction direction : Direction.values()) for (Orientation orientation : Orientation.values()) {
            for (Connection connection : Connection.values()) for (boolean allowBreak : new boolean[]{false, true}) {
                Config.can_break_connected_stargate.value = allowBreak;
                for (int coverMode = 0; coverMode < 4; coverMode++) {
                    float expected = connection.isConnected() && !allowBreak ? -1f : coverMode == 2 ? 3.5f : coverMode == 3 ? -1f : 50f;
                    float[] values = new float[2];
                    int i = 0;
                    for (Subject subject : List.of(before, after)) {
                        State state = subject.state(part, direction, orientation);
                        subject.ring.cover = coverMode == 0 ? null : new Cover();
                        if (coverMode >= 2) subject.ring.cover.blocks.put(part, new State(new Block("test:cover", coverMode == 2 ? 3.5f : -1f)));
                        TestWorld level = world(state, part, direction, orientation, pos, new GateEntity(connection));
                        values[i++] = subject.hardness(state, level, pos);
                        check(level.current == state && level.entityReads == 1, "normal query preserves state and resolves one actual ring entity");
                    }
                    check(values[0] == expected && values[1] == expected, "normal hardness parity: part/facing/orientation, connection protection and cover");
                }
            }
        }
        // A matching block can have a newer immutable state or a missing/unrelated base entity.
        for (Subject subject : List.of(before, after)) {
            for (Entity missing : Arrays.asList(null, new Entity())) {
                Config.can_break_connected_stargate.value = false;
                State oldState = subject.state(Part.LEFT, Direction.NORTH, Orientation.REGULAR);
                State current = subject.state(Part.RIGHT2_ABOVE_SHIELDED, Direction.WEST, Orientation.DOWN);
                TestWorld level = world(current, Part.RIGHT2_ABOVE_SHIELDED, Direction.WEST, Orientation.DOWN, pos, missing);
                subject.ring.cover = null;
                check(subject.hardness(oldState, level, pos) == 50f, "same block with newer state or absent/non-Stargate entity remains safe");
            }
            State state = subject.state(Part.BASE, Direction.NORTH, Orientation.REGULAR);
            check(subject.hardness(state, null, pos) == 50f, "null world retains upstream fallback");
            check(subject.hardness(state, new TestWorld(state), null) == 50f, "null position retains upstream fallback");
        }
        System.out.println("PASS normal ring protection, allowed breaking, cover/no-cover and immutable-state cases match original behavior");
    }
    public static void run(byte[] original, byte[] patched, byte[] ring) throws Exception {
        Subject before = subject(original, ring), after = subject(patched, ring);
        stale(before, after);
        normal(before, after);
    }
}
