import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.jar.JarFile;
import java.util.jar.JarOutputStream;
import java.util.jar.JarEntry;
import com.google.gson.*;
import org.objectweb.asm.*;
import org.objectweb.asm.tree.*;
import org.objectweb.asm.tree.analysis.*;
import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;
import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

/** Pack-specific, fingerprint-bound changes. Original mod JARs are never modified. */
public final class PatchServerFixes implements Opcodes {
    static final String LEVEL = "net/minecraft/world/level/Level";
    static final String REG = "net/minecraft/core/Registry";
    static final String CLIENT = "net/tracen/umapyoi/utils/ClientUtils";
    static final String API = "net/tracen/umapyoi/api/UmapyoiAPI";
    static final String NPC = "org/confluence/terraentity/entity/npc/AbstractTerraNPC";
    static final String TETRA = "com/tonywww/slashblade_sendims/utils/TetraUtils";
    static final String TICKET = "net/tracen/umapyoi/item/UmaRaceTicketItem";
    static final String SUPPORT = "net/tracen/umapyoi/item/SupportCardItem";
    static final String SCHEMATIC = "se/mickelus/tetra/blocks/multischematic/MultiblockSchematicBlock";
    static final String BONSAI = "com/davenonymous/bonsaitrees3/blocks/BonsaiPotBlock";
    static final String ASYNC = "cn/star/star_optimized/AsyncEventSystem";
    static final String BAGUS = "baguchan/bagusmob/registry/ModEntityRegistry";
    record Target(String jar, String owner, String sha) {}
    static final List<Target> TARGETS = List.of(
        new Target("slashblade_sendims-1.1.1.jar", TETRA, "516558217ce9472d5b192615c13b45d598c8b1dad46f974690a78e106550f094"),
        new Target("umapyoi-1.12.73-1.20.1.jar", TICKET, "4c237b5ff32f1179f04facedbbf58bef1252fa61e98a5e4302f9af87ee13eb17"),
        new Target("umapyoi-1.12.73-1.20.1.jar", SUPPORT, "66ee79354797080fa251baa5514373cf63f4245fd3d2f988815f7d2829fb576b"),
        new Target("terra_entity-1.2.3-all.jar", NPC, "d1b3d55e4c50d28020ae632cce882e76405d7dde15c14d26079bb675bd106d14"),
        new Target("tetra-1.20.1-6.9.0.jar", SCHEMATIC, "d5f836ea6acb14ead875b48436ec37599fe4557ac674cb795f6e350b02976d2b"),
        new Target("BonsaiTrees3-1.20.1-3.3.2.jar", BONSAI, "64fd2320020f47d1cf5b411af9c05b79e10ee4594891103e6cf1930a380e0a67"),
        new Target("star_optimized-1.2.jar", ASYNC, "80873082414ee8755b4b372a64150818412655e541f2a41d1e6616d929eaee76"),
        new Target("BagusMob-1.20.1-4.0.2.jar", BAGUS, "562855b07a5ff47f3863c455ec5526642c49c4ff15e95b551606f5786df7dce8")
    );
    static int checks;
    static void check(boolean ok, String reason) {
        if (!ok) throw new AssertionError(reason);
        checks++;
    }
    static String sha(byte[] b) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(b));
    }
    static ClassNode node(byte[] b) {
        ClassNode n = new ClassNode(); new ClassReader(b).accept(n, 0); return n;
    }
    static byte[] bytes(ClassNode n) {
        // Explicit frames in added helpers; preserve existing frames and all original methods.
        ClassWriter w = new ClassWriter(ClassWriter.COMPUTE_MAXS); n.accept(w); return w.toByteArray();
    }
    static MethodNode method(ClassNode n, String name, String desc) {
        return n.methods.stream().filter(m -> m.name.equals(name) && (desc == null || m.desc.equals(desc))).findFirst().orElseThrow();
    }
    static List<MethodInsnNode> calls(MethodNode m, String owner, String name) {
        List<MethodInsnNode> found = new ArrayList<>();
        for (AbstractInsnNode i : m.instructions) if (i instanceof MethodInsnNode c && c.owner.equals(owner) && c.name.equals(name)) found.add(c);
        return found;
    }
    static void onlyClient(List<AnnotationNode> annotations) {
        check(annotations.stream().noneMatch(a -> a.desc.equals("Lnet/minecraftforge/api/distmarker/OnlyIn;")), "no conflicting OnlyIn annotation");
        AnnotationNode a = new AnnotationNode("Lnet/minecraftforge/api/distmarker/OnlyIn;");
        a.values = new ArrayList<>(List.of("value", new String[]{"Lnet/minecraftforge/api/distmarker/Dist;", "CLIENT"}));
        annotations.add(a);
    }

    static void tetra(ClassNode n) {
        MethodNode m = method(n, "getEffectLvl", null);
        List<MethodInsnNode> c = calls(m, "se/mickelus/tetra/items/modular/IModularItem", "getEffectData");
        check(c.size() == 1 && c.get(0).getOpcode() == INVOKEINTERFACE, "one uncached Tetra interface call");
        c.get(0).name = "getEffectDataCached";
    }

    static void registryHelper(ClassNode n, String helper, String api, String client, String keyOwner) {
        String desc = "(L" + LEVEL + ";)L" + REG + ";";
        check(n.methods.stream().noneMatch(m -> m.name.equals(helper)), "helper does not already exist");
        MethodNode m = new MethodNode(ACC_PRIVATE | ACC_STATIC | ACC_SYNTHETIC, helper, desc, null, null);
        InsnList b = m.instructions;
        LabelNode noWorld = new LabelNode(), clientSide = new LabelNode();
        b.add(new VarInsnNode(ALOAD, 0)); b.add(new JumpInsnNode(IFNULL, noWorld));
        b.add(new VarInsnNode(ALOAD, 0)); b.add(new MethodInsnNode(INVOKESTATIC, API, api, desc, false));
        b.add(new InsnNode(ARETURN));
        b.add(noWorld); b.add(new FrameNode(F_SAME, 0, null, 0, null));
        b.add(new FieldInsnNode(GETSTATIC, "net/minecraftforge/fml/loading/FMLEnvironment", "dist", "Lnet/minecraftforge/api/distmarker/Dist;"));
        b.add(new FieldInsnNode(GETSTATIC, "net/minecraftforge/api/distmarker/Dist", "DEDICATED_SERVER", "Lnet/minecraftforge/api/distmarker/Dist;"));
        b.add(new JumpInsnNode(IF_ACMPNE, clientSide));
        b.add(new MethodInsnNode(INVOKESTATIC, "net/minecraftforge/server/ServerLifecycleHooks", "getCurrentServer", "()Lnet/minecraft/server/MinecraftServer;", false));
        b.add(new MethodInsnNode(INVOKEVIRTUAL, "net/minecraft/server/MinecraftServer", "m_206579_", "()Lnet/minecraft/core/RegistryAccess$Frozen;", false));
        b.add(new FieldInsnNode(GETSTATIC, keyOwner, "REGISTRY_KEY", "Lnet/minecraft/resources/ResourceKey;"));
        b.add(new MethodInsnNode(INVOKEINTERFACE, "net/minecraft/core/RegistryAccess", "m_175515_", "(Lnet/minecraft/resources/ResourceKey;)L" + REG + ";", true));
        b.add(new InsnNode(ARETURN));
        b.add(clientSide); b.add(new FrameNode(F_SAME, 0, null, 0, null));
        b.add(new MethodInsnNode(INVOKESTATIC, CLIENT, client, "()L" + REG + ";", false));
        b.add(new InsnNode(ARETURN));
        m.maxLocals = 1; m.maxStack = 2; n.methods.add(m);
    }
    static void tooltipRegistry(ClassNode n, String clientMethod, String helper) {
        MethodNode m = method(n, "m_7373_", null);
        List<MethodInsnNode> found = calls(m, CLIENT, clientMethod);
        check(found.size() == 1, "one eager tooltip registry call: " + clientMethod);
        MethodInsnNode c = found.get(0);
        m.instructions.insertBefore(c, new VarInsnNode(ALOAD, 2));
        c.owner = n.name; c.name = helper; c.desc = "(L" + LEVEL + ";)L" + REG + ";";
    }
    static void ticket(ClassNode n) {
        MethodNode m = method(n, "getRace", "(Lnet/minecraft/world/item/ItemStack;L" + LEVEL + ";)Lnet/tracen/umapyoi/registry/races/Race;");
        check(calls(m, CLIENT, "getRaceRegistry").size() == 1, "one eager Optional fallback");
        MethodInsnNode call = calls(m, "java/util/Optional", "ofNullable").get(0);
        AbstractInsnNode start = call.getPrevious(), end = calls(m, "java/util/Optional", "orElse").get(0).getNext();
        check(start instanceof VarInsnNode v && v.var == 1 && end.getOpcode() == CHECKCAST, "expected Optional expression boundaries");
        InsnList replacement = new InsnList();
        replacement.add(new VarInsnNode(ALOAD, 1));
        replacement.add(new MethodInsnNode(INVOKESTATIC, n.name, "sdbf$raceRegistry", "(L" + LEVEL + ";)L" + REG + ";", false));
        m.instructions.insertBefore(start, replacement);
        for (AbstractInsnNode i = start; ;) {
            AbstractInsnNode next = i.getNext(); m.instructions.remove(i); if (i == end) break; i = next;
        }
        registryHelper(n, "sdbf$raceRegistry", "getRaceRegistry", "getRaceRegistry", "net/tracen/umapyoi/registry/races/Race");
        tooltipRegistry(n, "getRaceTagRegistry", "sdbf$raceTagRegistry");
        registryHelper(n, "sdbf$raceTagRegistry", "getRaceTagRegistry", "getRaceTagRegistry", "net/tracen/umapyoi/registry/races/tags/RaceTag");
    }
    static void support(ClassNode n) {
        tooltipRegistry(n, "getClientSupportCardRegistry", "sdbf$supportRegistry");
        registryHelper(n, "sdbf$supportRegistry", "getSupportCardRegistry", "getClientSupportCardRegistry", "net/tracen/umapyoi/registry/training/card/SupportCard");
    }
    static void npc(ClassNode n) {
        FieldNode f = n.fields.stream().filter(v -> v.name.equals("textureTarget")).findFirst().orElseThrow();
        check(f.desc.equals("Lcom/mojang/blaze3d/pipeline/TextureTarget;"), "expected client render target field");
        check(n.methods.stream().noneMatch(m -> Arrays.stream(m.instructions.toArray()).anyMatch(i -> i instanceof FieldInsnNode x && x.owner.equals(n.name) && x.name.equals(f.name))), "common NPC methods never access render target");
        if (f.visibleAnnotations == null) f.visibleAnnotations = new ArrayList<>();
        onlyClient(f.visibleAnnotations);
    }
    static void schematic(ClassNode n) {
        int changed = 0;
        for (MethodNode m : n.methods) if (m.desc.contains("Lnet/minecraft/client/multiplayer/ClientLevel;")) {
            check(m.name.startsWith("spawnParticle") || m.name.startsWith("lambda$spawnParticles$"), "client signature belongs only to particle helpers");
            if (m.visibleAnnotations == null) m.visibleAnnotations = new ArrayList<>();
            onlyClient(m.visibleAnnotations); changed++;
        }
        check(changed == 5, "all five client particle helper signatures marked");
    }
    static void bonsai(ClassNode n) {
        // TOP is absent in this pack. Remove its orphan optional adapter; Jade integration is separate.
        MethodNode m = method(n, "addProbeInfo", null);
        check(m.desc.contains("mcjty/theoneprobe/api/ProbeMode"), "only orphan TOP adapter removed");
        check(n.interfaces.stream().noneMatch(s -> s.startsWith("mcjty/theoneprobe/")), "class does not implement TOP interface");
        check(n.methods.stream().filter(x -> x != m).allMatch(x -> calls(x, n.name, "addProbeInfo").isEmpty()), "no internal call sites");
        n.methods.remove(m);
    }
    static void bagus(ClassNode n) {
        MethodNode m = method(n, "lambda$static$6", null);
        check(Arrays.stream(m.instructions.toArray()).anyMatch(i -> i instanceof LdcInsnNode l && l.cst.equals("slash_air")), "factory is specifically slash_air");
        List<FieldInsnNode> categories = new ArrayList<>();
        for (AbstractInsnNode i : m.instructions) if (i instanceof FieldInsnNode f && f.owner.equals("net/minecraft/world/entity/MobCategory")) categories.add(f);
        check(categories.size() == 1 && categories.get(0).name.equals("MONSTER"), "projectile was incorrectly registered as MONSTER");
        categories.get(0).name = "MISC";
    }
    static void async(ClassNode n) {
        MethodNode m = method(n, "registerCommonAsyncEvents", "()V");
        List<LdcInsnNode> strings = new ArrayList<>();
        for (AbstractInsnNode i : m.instructions) if (i instanceof LdcInsnNode l && l.cst instanceof String s && s.startsWith("net.minecraftforge.event.")) strings.add(l);
        check(strings.size() == 37, "expected 24 async and 13 sync registrations");
        List<String> async = new ArrayList<>(strings.subList(0, 24).stream().map(l -> (String)l.cst).toList());
        List<String> sync = new ArrayList<>(strings.subList(24, 37).stream().map(l -> (String)l.cst).toList());
        check(async.remove("net.minecraftforge.event.network.CustomPayloadEvent"), "unsupported payload event removed");
        check(sync.set(1, "net.minecraftforge.event.TickEvent$LevelTickEvent").equals("net.minecraftforge.event.level.LevelTickEvent"), "tick event corrected for Forge 1.20.1");
        // Replace only straight-line array initialization. Keep registration calls and original logging.
        AbstractInsnNode end = m.instructions.getFirst();
        while (!(end instanceof VarInsnNode v && v.getOpcode() == ASTORE && v.var == 1)) end = end.getNext();
        AbstractInsnNode next = end.getNext();
        for (AbstractInsnNode i = m.instructions.getFirst(); i != next;) {
            AbstractInsnNode following = i.getNext(); m.instructions.remove(i); i = following;
        }
        InsnList arrays = new InsnList(); stringArray(arrays, async, 0); stringArray(arrays, sync, 1);
        m.instructions.insertBefore(next, arrays);
        // Removed labels occur only in local-variable/debug metadata, not control flow.
        if (m.localVariables != null) m.localVariables.clear();
        check(m.tryCatchBlocks.isEmpty(), "no exception labels removed");
    }
    static void stringArray(InsnList b, List<String> values, int slot) {
        b.add(new IntInsnNode(BIPUSH, values.size())); b.add(new TypeInsnNode(ANEWARRAY, "java/lang/String"));
        for (int i = 0; i < values.size(); i++) {
            b.add(new InsnNode(DUP)); b.add(new IntInsnNode(BIPUSH, i)); b.add(new LdcInsnNode(values.get(i))); b.add(new InsnNode(AASTORE));
        }
        b.add(new VarInsnNode(ASTORE, slot));
    }
    static byte[] patch(Target t, byte[] original) throws Exception {
        check(sha(original).equals(t.sha), "original SHA-256 for " + t.owner);
        ClassNode n = node(original); check(n.name.equals(t.owner), "expected owner");
        switch (n.name) {
            case TETRA -> tetra(n); case TICKET -> ticket(n); case SUPPORT -> support(n);
            case NPC -> npc(n); case SCHEMATIC -> schematic(n); case BONSAI -> bonsai(n); case ASYNC -> async(n); case BAGUS -> bagus(n);
            default -> throw new IllegalArgumentException(n.name);
        }
        byte[] patched = bytes(n);
        for (MethodNode m : node(patched).methods) if ((m.access & (ACC_ABSTRACT | ACC_NATIVE)) == 0) new Analyzer<>(new BasicVerifier()).analyze(n.name, m);
        check(true, "ASM verification for every concrete method: " + t.owner);
        return patched;
    }
    static byte[] roundTrip(Target t, byte[] original, byte[] patched, Path scratch) throws Exception {
        Path cf = scratch.resolve(t.owner + ".class"), df = scratch.resolve(t.owner + ".badiff");
        Files.createDirectories(cf.getParent()); Files.write(cf, patched);
        byte[] first = bytes(new BytecodeTransformer(scratch, Map.of(t.owner, patched)).transform(node(original), null));
        check(!Files.exists(cf) && Files.isRegularFile(df), "real HotAI generates badiff: " + t.owner);
        MemoryDiff diff = new MemoryDiff();
        try (var stream = Files.newInputStream(df)) { diff.deserialize(DefaultSerialization.newInstance(), stream); }
        byte[] restart = bytes(new DiffTransformer(Map.of(t.owner, diff)).transform(node(original), null));
        check(Arrays.equals(first, restart) && Arrays.equals(restart, patched), "real HotAI restart round trip: " + t.owner);
        return restart;
    }
    static final String PLUGIN = "com/tonywww/slashblade_sendims/mixin/SenDimsMixinConfigPlugin";
    static final String BOUNDS = "com/tonywww/slashblade_sendims/compat/InteractionStackBounds";
    static final String EARLY_MIXIN = "com/tonywww/slashblade_sendims/mixin/startup/ServerInteractionStackBoundsMixin";
    static byte[] resource(String owner) throws Exception {
        try (var stream = PatchServerFixes.class.getResourceAsStream("/" + owner + ".class")) { return stream.readAllBytes(); }
    }
    static void ownMod(Path root, Path build) throws Exception {
        Path jar = root.resolve("mods/slashblade_sendims-1.1.1.jar");
        check(sha(Files.readAllBytes(jar)).equals("67c1b285199caa1b9a353e0553063a4a67504d7fb6a460ae16aecbebf593a47d"), "exact own-mod baseline before surgical update");
        Map<String,byte[]> changes = new HashMap<>();
        byte[] originalPlugin;
        try (JarFile z = new JarFile(jar.toFile())) {
            originalPlugin = z.getInputStream(z.getJarEntry(PLUGIN + ".class")).readAllBytes();
            check(sha(originalPlugin).equals("c5488e3a463b5ee0cc0d82d6484c979216290217a85a4f7798150651aab8eb55"), "expected original plugin");
            ClassNode n = node(originalPlugin);
            MethodNode m = method(n,"preApply",null);
            check(Arrays.stream(m.instructions.toArray()).filter(i -> i.getOpcode() >= 0).count() == 1, "preApply originally empty");
            m.instructions.clear(); m.instructions.add(new VarInsnNode(ALOAD,1)); m.instructions.add(new VarInsnNode(ALOAD,2)); m.instructions.add(new VarInsnNode(ALOAD,3));
            m.instructions.add(new MethodInsnNode(INVOKESTATIC,BOUNDS,"prepare","(Ljava/lang/String;Lorg/objectweb/asm/tree/ClassNode;Ljava/lang/String;)V",false));
            m.instructions.add(new InsnNode(RETURN));
            if (m.localVariables != null) m.localVariables.clear();
            byte[] plugin = bytes(n); changes.put(PLUGIN + ".class",plugin);
            changes.put(BOUNDS + ".class",resource(BOUNDS)); changes.put(EARLY_MIXIN + ".class",resource(EARLY_MIXIN));
            for (String owner : List.of(BOUNDS,EARLY_MIXIN)) check(z.getJarEntry(owner + ".class") == null, "new class not already present");
            String configPath = "slashblade_sendims.mixins.json";
            JsonObject config = JsonParser.parseString(new String(z.getInputStream(z.getJarEntry(configPath)).readAllBytes(),java.nio.charset.StandardCharsets.UTF_8)).getAsJsonObject();
            config.getAsJsonArray("mixins").add("startup.ServerInteractionStackBoundsMixin");
            changes.put(configPath,(new GsonBuilder().setPrettyPrinting().create().toJson(config) + "\n").getBytes(java.nio.charset.StandardCharsets.UTF_8));
            TestServerFixes.stackBounds(root,originalPlugin,plugin,changes.get(EARLY_MIXIN + ".class"));
            Path output = build.resolve("release/mods/slashblade_sendims-1.1.1.jar");
            Files.createDirectories(output.getParent());
            try (JarOutputStream out = new JarOutputStream(Files.newOutputStream(output))) {
                for (JarEntry entry : Collections.list(z.entries())) {
                    JarEntry replacement = new JarEntry(entry.getName()); replacement.setTime(entry.getTime());
                    out.putNextEntry(replacement);
                    out.write(changes.containsKey(entry.getName()) ? changes.get(entry.getName()) : z.getInputStream(entry).readAllBytes());
                    out.closeEntry();
                }
                for (String owner : List.of(BOUNDS,EARLY_MIXIN)) {
                    out.putNextEntry(new JarEntry(owner + ".class")); out.write(changes.get(owner + ".class")); out.closeEntry();
                }
            }
            try (JarFile result = new JarFile(output.toFile())) {
                check(result.size() == z.size() + 2, "only two helper/mixin classes added");
                for (JarEntry entry : Collections.list(z.entries())) if (!changes.containsKey(entry.getName())) check(Arrays.equals(z.getInputStream(entry).readAllBytes(),result.getInputStream(result.getJarEntry(entry.getName())).readAllBytes()), "unchanged own-mod entry: " + entry.getName());
            }
            Files.writeString(build.resolve("release/OWN-MOD-FINGERPRINTS.txt"),"original_sha256=" + sha(Files.readAllBytes(jar)) + "\npatched_sha256=" + sha(Files.readAllBytes(output)) + "\n");
        }
    }
    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]), build = Path.of(args[1]);
        Map<String, byte[]> before = new HashMap<>(), after = new HashMap<>();
        List<String> manifest = new ArrayList<>(List.of("jar\tclass\toriginal_sha256\tpatched_sha256"));
        // An orphan adapter may only be removed while the optional API is absent.
        try (var jars = Files.list(root.resolve("mods"))) {
            for (Path p : jars.filter(p -> p.toString().endsWith(".jar")).toList()) try (JarFile z = new JarFile(p.toFile())) {
                check(z.getJarEntry("mcjty/theoneprobe/api/ProbeMode.class") == null, "TOP absent: " + p.getFileName());
            }
        }
        for (Target t : TARGETS) {
            byte[] original;
            try (JarFile z = new JarFile(root.resolve("mods").resolve(t.jar).toFile())) { original = z.getInputStream(z.getJarEntry(t.owner + ".class")).readAllBytes(); }
            byte[] patched = patch(t, original);
            after.put(t.owner, roundTrip(t, original, patched, build.resolve("hotai-roundtrip")));
            before.put(t.owner, original);
            Path output = build.resolve("release/hotai/" + t.owner + ".class");
            Files.createDirectories(output.getParent()); Files.write(output, patched);
            manifest.add(t.jar + "\t" + t.owner + "\t" + sha(original) + "\t" + sha(patched));
        }
        TestServerFixes.run(root, before, after);
        ownMod(root,build);
        Files.write(build.resolve("release/CLASS-FINGERPRINTS.tsv"), manifest);
        System.out.println("PASS " + checks + " checks; " + TARGETS.size() + " real HotAI round trips; all methods ASM-verified.");
        System.out.println("Behavior tests use actual patched methods with Minecraft boundary fixtures; no live server was launched.");
    }
}
