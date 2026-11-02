import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.jar.JarFile;
import org.objectweb.asm.*;
import org.objectweb.asm.tree.*;
import org.objectweb.asm.tree.analysis.*;
import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;
import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

/** Version-bound percentage threshold; all upstream chance and motivation handling is retained. */
public final class PatchUmaMotivation implements Opcodes {
    static final String EVENTS = "net/tracen/umapyoi/events/handler/CommonEvents";
    static final String CONFIG = "net/tracen/umapyoi/UmapyoiConfig";
    static final String DOUBLE_VALUE = "net/minecraftforge/common/ForgeConfigSpec$DoubleValue";
    static final String BUILDER = "net/minecraftforge/common/ForgeConfigSpec$Builder";
    static final String LIVING = "net/minecraft/world/entity/LivingEntity";
    static final String DAMAGE_EVENT = "net/minecraftforge/event/entity/living/LivingDamageEvent";
    static final String FIELD = "DAMAGE_MOTIVATION_EFFECT";
    static final String KEY = "damage_motivation_health_percent";
    static final String COMMENT = "Minimum damage as a percentage of current maximum health (30 = 30%).";
    static final Set<String> HANDLERS = Set.of("onDamageDownMotivation", "onDamagePanicking");
    static int checks;

    static void check(boolean ok, String why) {
        if (!ok) throw new AssertionError(why);
        checks++;
    }
    static String sha(byte[] bytes) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
    }
    static ClassNode node(byte[] bytes) {
        ClassNode n = new ClassNode(); new ClassReader(bytes).accept(n, 0); return n;
    }
    static byte[] bytes(ClassNode n) {
        ClassWriter w = new ClassWriter(0); n.accept(w); return w.toByteArray();
    }
    static AbstractInsnNode nextCode(AbstractInsnNode i) {
        do { i = i.getNext(); } while (i != null && i.getOpcode() < 0);
        return i;
    }
    static InsnList readPercent() {
        InsnList b = new InsnList();
        b.add(new FieldInsnNode(GETSTATIC, CONFIG, FIELD, "L" + DOUBLE_VALUE + ";"));
        b.add(new MethodInsnNode(INVOKEVIRTUAL, DOUBLE_VALUE, "get", "()Ljava/lang/Object;", false));
        b.add(new TypeInsnNode(CHECKCAST, "java/lang/Double"));
        b.add(new MethodInsnNode(INVOKEVIRTUAL, "java/lang/Double", "doubleValue", "()D", false));
        return b;
    }
    static byte[] patchEvents(byte[] original) throws Exception {
        check(sha(original).equals("d33af804551dd4380a3299b82caff5cf5e80aa0cdedf6ab3d94bbe0eabab5210"), "exact CommonEvents version");
        ClassNode n = node(original);
        Map<MethodNode, List<AbstractInsnNode>> inserted = new HashMap<>();
        Map<MethodNode, Integer> maxStacks = new HashMap<>();
        for (MethodNode m : n.methods) {
            if (!HANDLERS.contains(m.name)) continue;
            check(m.desc.equals("(L" + DAMAGE_EVENT + ";)V"), "correct damage handler signature");
            List<FieldInsnNode> reads = Arrays.stream(m.instructions.toArray())
                    .filter(i -> i instanceof FieldInsnNode f && f.owner.equals(CONFIG) && f.name.equals(FIELD))
                    .map(i -> (FieldInsnNode)i).toList();
            check(reads.size() == 1, "one threshold read in " + m.name);
            AbstractInsnNode comparison = reads.get(0);
            for (int i = 0; i < 4; i++) comparison = comparison.getNext();
            check(comparison.getOpcode() == DCMPG, "original damage comparison");
            InsnList scale = new InsnList();
            // Stack: final damage, configured percentage -> final damage, maxHealth * percentage / 100.
            scale.add(new VarInsnNode(ALOAD, 1));
            scale.add(new MethodInsnNode(INVOKEVIRTUAL, LIVING, "m_21233_", "()F", false));
            scale.add(new InsnNode(F2D));
            scale.add(new InsnNode(DMUL));
            scale.add(new LdcInsnNode(100.0d));
            scale.add(new InsnNode(DDIV));
            List<AbstractInsnNode> additions = new ArrayList<>(Arrays.asList(scale.toArray()));
            m.instructions.insertBefore(comparison, scale);

            // Honor the config's zero-means-disabled option for both linked damage penalties.
            InsnList guard = readPercent();
            LabelNode enabled = new LabelNode();
            guard.add(new InsnNode(DCONST_0));
            guard.add(new InsnNode(DCMPG));
            guard.add(new JumpInsnNode(IFGT, enabled));
            guard.add(new InsnNode(RETURN));
            guard.add(enabled);
            guard.add(new FrameNode(F_SAME, 0, null, 0, null));
            additions.addAll(Arrays.asList(guard.toArray()));
            m.instructions.insert(guard);
            inserted.put(m, additions);
            maxStacks.put(m, m.maxStack);
            m.maxStack = Math.max(m.maxStack, 6);
            new Analyzer<>(new BasicVerifier()).analyze(n.name, m);
        }
        check(inserted.size() == 2, "both motivation and panic thresholds patched");
        byte[] patched = bytes(n);
        for (var entry : inserted.entrySet()) {
            MethodNode m = entry.getKey();
            for (AbstractInsnNode i : entry.getValue()) m.instructions.remove(i);
            m.maxStack = maxStacks.get(m);
        }
        check(Arrays.equals(bytes(n), bytes(node(original))), "entire upstream class unchanged outside inserted threshold logic");
        return patched;
    }
    static byte[] patchConfig(byte[] original) throws Exception {
        check(sha(original).equals("424cc1bda63d32b3dd610b9d619c825c9ab921fc49b47afc5ad818ea38923fd2"), "exact config version");
        ClassNode n = node(original);
        MethodNode init = n.methods.stream().filter(m -> m.name.equals("<clinit>")).findFirst().orElseThrow();
        Map<LdcInsnNode, Object> old = new HashMap<>();
        for (AbstractInsnNode i : init.instructions.toArray()) {
            if (!(i instanceof LdcInsnNode ldc)) continue;
            if (ldc.cst.equals("Determining the damage that will effect motivation.")) {
                old.put(ldc, ldc.cst); ldc.cst = COMMENT;
            } else if (ldc.cst.equals("damage_motivation_effect")) {
                LdcInsnNode defaultValue = (LdcInsnNode)nextCode(i);
                AbstractInsnNode minimum = nextCode(defaultValue);
                LdcInsnNode maximum = (LdcInsnNode)nextCode(minimum);
                MethodInsnNode define = (MethodInsnNode)nextCode(maximum);
                FieldInsnNode assign = (FieldInsnNode)nextCode(define);
                check(defaultValue.cst.equals(4.0d) && minimum.getOpcode() == DCONST_0
                        && maximum.cst.equals(Double.MAX_VALUE) && define.name.equals("defineInRange")
                        && assign.name.equals(FIELD), "exact original threshold config definition");
                old.put(ldc, ldc.cst); ldc.cst = KEY;
                old.put(defaultValue, defaultValue.cst); defaultValue.cst = 30.0d;
                old.put(maximum, maximum.cst); maximum.cst = 100.0d;
            }
        }
        check(old.size() == 4, "only threshold key, default, maximum and description changed");
        byte[] patched = bytes(n);
        for (var entry : old.entrySet()) entry.getKey().cst = entry.getValue();
        check(Arrays.equals(bytes(n), bytes(node(original))), "all other config definitions and class metadata unchanged");
        return patched;
    }
    static byte[] hotai(byte[] original, byte[] patched, String owner, Path build) throws Exception {
        Path scratch = Files.createTempDirectory(build, "hotai-roundtrip-");
        Path file = scratch.resolve(owner + ".class");
        Files.createDirectories(file.getParent()); Files.write(file, patched);
        byte[] first = bytes(new BytecodeTransformer(scratch, Map.of(owner, patched)).transform(node(original), null));
        Path diffPath = scratch.resolve(owner + ".badiff");
        check(!Files.exists(file) && Files.isRegularFile(diffPath), "HotAI class-to-diff conversion");
        MemoryDiff diff = new MemoryDiff();
        try (var input = Files.newInputStream(diffPath)) { diff.deserialize(DefaultSerialization.newInstance(), input); }
        byte[] restart = bytes(new DiffTransformer(Map.of(owner, diff)).transform(node(original), null));
        check(Arrays.equals(first, patched) && Arrays.equals(restart, patched), "HotAI first load and restart parity");
        return restart;
    }
    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]), build = Path.of(args[1]);
        byte[] events, config;
        try (JarFile jar = new JarFile(root.resolve("mods/umapyoi-1.12.73-1.20.1.jar").toFile())) {
            events = jar.getInputStream(jar.getJarEntry(EVENTS + ".class")).readAllBytes();
            config = jar.getInputStream(jar.getJarEntry(CONFIG + ".class")).readAllBytes();
        }
        byte[] newEvents = hotai(events, patchEvents(events), EVENTS, build);
        byte[] newConfig = hotai(config, patchConfig(config), CONFIG, build);
        TestUmaMotivation.run(events, newEvents, newConfig);
        for (var entry : Map.of(EVENTS, newEvents, CONFIG, newConfig).entrySet()) {
            Path output = build.resolve("release/hotai/" + entry.getKey() + ".class");
            Files.createDirectories(output.getParent()); Files.write(output, entry.getValue());
        }
        String result = "PASS " + checks + " structural/HotAI checks; " + TestUmaMotivation.checks + " executed behavior checks.\n"
                + "CommonEvents SHA256: " + sha(newEvents) + "\nUmapyoiConfig SHA256: " + sha(newConfig) + "\n"
                + "Actual upstream event handlers/config definition executed against Minecraft/Forge boundary fixtures.\n"
                + "Full Minecraft runtime not launched.\n";
        Files.writeString(build.resolve("verification-results.txt"), result);
        System.out.print(result);
    }
}
