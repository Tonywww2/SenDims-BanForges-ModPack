import java.nio.file.*;
import java.lang.reflect.Method;
import java.lang.reflect.Field;
import java.lang.reflect.Proxy;
import java.lang.reflect.InvocationHandler;
import java.util.*;
import java.util.jar.JarFile;
import com.google.common.cache.*;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;
import org.objectweb.asm.tree.analysis.*;
import com.tonywww.slashblade_sendims.compat.InteractionStackBounds;
import net.minecraftforge.fml.loading.RuntimeDistCleaner;
import cpw.mods.modlauncher.serviceapi.ILaunchPluginService.Phase;

/** Execute the original and patched instructions. Only absent Minecraft boundary objects are fixtures. */
public final class TestServerFixes implements Opcodes {
    static void check(boolean ok, String why) { PatchServerFixes.check(ok, why); }
    static String name(Class<?> c) { return Type.getInternalName(c); }
    static class Loader extends ClassLoader {
        Class<?> define(byte[] b) { return defineClass(null, b, 0, b.length); }
    }
    static ClassNode slim(byte[] data, String owner, Set<String> methods) {
        ClassNode n = PatchServerFixes.node(data);
        n.methods.removeIf(m -> !methods.contains(m.name));
        n.fields.clear(); n.interfaces.clear(); n.superName = "java/lang/Object";
        n.access = ACC_PUBLIC; n.visibleAnnotations = null; n.invisibleAnnotations = null;
        n.innerClasses.clear(); n.outerClass = null; n.outerMethod = null; n.outerMethodDesc = null;
        n.nestHostClass = null; n.nestMembers = null;
        for (MethodNode m : n.methods) {
            m.access = (m.access & ~(ACC_PRIVATE | ACC_PROTECTED)) | ACC_PUBLIC;
            m.visibleAnnotations = null; m.invisibleAnnotations = null;
        }
        return n;
    }
    static Class<?> define(ClassNode n, Map<String,String> mapping, Loader loader) {
        ClassWriter w = new ClassWriter(0); n.accept(new ClassRemapper(w, new SimpleRemapper(mapping)));
        return loader.define(w.toByteArray());
    }

    public static class Stack { public String key; public Location id; Stack(String k) { key = k; } }
    public static class Effect {}
    public static class EffectData {
        public int level;
        public EffectData() {}
        EffectData(int level) { this.level = level; }
        public int getLevel(Object e) { return level; }
    }
    static void tetra(Path root, byte[] original, byte[] patched) throws Exception {
        String iface = "se/mickelus/tetra/items/modular/IModularItem";
        byte[] api;
        try (JarFile z = new JarFile(root.resolve("mods/tetra-1.20.1-6.9.0.jar").toFile())) { api = z.getInputStream(z.getJarEntry(iface + ".class")).readAllBytes(); }
        ClassNode n = PatchServerFixes.node(api);
        n.methods.removeIf(m -> !Set.of("getEffectDataCached", "lambda$getEffectDataCached$51", "getEffectData", "getEffectDataCache", "getDataCacheKey").contains(m.name));
        n.fields.clear(); n.innerClasses.clear(); n.nestHostClass = null; n.nestMembers = null;
        n.visibleAnnotations = null; n.invisibleAnnotations = null;
        // These are provider boundaries, not methods under test.
        for (MethodNode m : n.methods) if (!m.name.equals("getEffectDataCached") && !m.name.startsWith("lambda$")) {
            m.access = ACC_PUBLIC | ACC_ABSTRACT; m.instructions.clear(); m.tryCatchBlocks.clear();
            if (m.localVariables != null) m.localVariables.clear();
        }
        Loader loader = new Loader();
        Map<String,String> map = new HashMap<>(Map.of(
            iface, "TetraCacheApiFixture",
            "net/minecraft/world/item/ItemStack", name(Stack.class),
            "se/mickelus/tetra/effect/ItemEffect", name(Effect.class),
            "se/mickelus/tetra/module/data/EffectData", name(EffectData.class)));
        Class<?> actualApi = define(n, map, loader);
        Cache<String,EffectData> cache = CacheBuilder.newBuilder().build();
        int[] computes = {0}, level = {7};
        Object item = Proxy.newProxyInstance(loader, new Class<?>[]{actualApi}, (proxy,m,args) -> switch (m.getName()) {
            case "getEffectDataCache" -> cache;
            case "getDataCacheKey" -> ((Stack)args[0]).key;
            case "getEffectData" -> { computes[0]++; yield new EffectData(level[0]); }
            default -> InvocationHandler.invokeDefault(proxy,m,args);
        });
        Method[] methods = new Method[2];
        for (int i = 0; i < 2; i++) {
            byte[] data = i == 0 ? original : patched;
            ClassNode util = slim(data, PatchServerFixes.TETRA, Set.of("getEffectLvl"));
            map.put(PatchServerFixes.TETRA, "TetraUtilFixture" + i);
            methods[i] = define(util, map, loader).getMethod("getEffectLvl", Stack.class, actualApi, Effect.class);
        }
        Stack a = new Stack("a"), b = new Stack("b"); Effect effect = new Effect();
        for (int i = 0; i < 1000; i++) check((int)methods[0].invoke(null,a,item,effect) == 7, "original value");
        check(computes[0] == 1000, "original reproduces 1000 uncached computations");
        computes[0] = 0;
        for (int i = 0; i < 1000; i++) check((int)methods[1].invoke(null,a,item,effect) == 7, "cached value unchanged");
        check(computes[0] == 1, "1000 queries compute once through actual Tetra cache method");
        level[0] = 11; cache.invalidate("a");
        check((int)methods[1].invoke(null,a,item,effect) == 11 && computes[0] == 2, "existing cache invalidation updates effect");
        check((int)methods[1].invoke(null,b,item,effect) == 11 && computes[0] == 3, "separate item key computed separately");
        a.key = "a-rebuilt"; level[0] = 19;
        check((int)methods[1].invoke(null,a,item,effect) == 19 && computes[0] == 4, "rebuilt item key updates effect");
        System.out.println("PASS actual Tetra cached method: 1000 -> 1 computations; invalidation and distinct items");
    }

    public record Location(String id) {}
    public record Key(Location location) { public Location m_135782_() { return location; } }
    public interface Registry { Object m_7745_(Location id); }
    public interface Access { Registry m_175515_(Key key); }
    public interface Frozen extends Access {}
    public static class Level {
        final Map<Key,Registry> registries; final boolean client;
        Level(Map<Key,Registry> r, boolean c) { registries = r; client = c; }
    }
    public static class Race { public static final Key REGISTRY_KEY = new Key(new Location("race")); }
    public static class Tag { public static final Key REGISTRY_KEY = new Key(new Location("tag")); }
    public static class Support { public static final Key REGISTRY_KEY = new Key(new Location("support")); }
    public static class RaceRegistry { public static final Key DEFAULT = new Key(new Location("default")); }
    public enum Dist { CLIENT, DEDICATED_SERVER }
    public static class Environment { public static Dist dist = Dist.DEDICATED_SERVER; }
    public static class Server { public Frozen m_206579_() { return k -> serverRegistries.get(k); } }
    public static class Lifecycle { public static Server getCurrentServer() { return server; } }
    static Server server = new Server();
    static Map<Key,Registry> serverRegistries = new HashMap<>(), clientRegistries = new HashMap<>();
    public static class ClientUtils {
        static int calls;
        static Registry read(Key key) {
            calls++;
            if (Environment.dist == Dist.DEDICATED_SERVER) throw new IllegalStateException("client class on server");
            return clientRegistries.get(key);
        }
        public static Registry getRaceRegistry() { return read(Race.REGISTRY_KEY); }
        public static Registry getRaceTagRegistry() { return read(Tag.REGISTRY_KEY); }
        public static Registry getClientSupportCardRegistry() { return read(Support.REGISTRY_KEY); }
    }
    public static class Api {
        public static Registry getRaceRegistry(Level l) { return l.client ? ClientUtils.getRaceRegistry() : l.registries.get(Race.REGISTRY_KEY); }
        public static Registry getRaceTagRegistry(Level l) { return l.client ? ClientUtils.getRaceTagRegistry() : l.registries.get(Tag.REGISTRY_KEY); }
        public static Registry getSupportCardRegistry(Level l) { return l.client ? ClientUtils.getClientSupportCardRegistry() : l.registries.get(Support.REGISTRY_KEY); }
    }
    public static Location getRaceID(Stack stack) { return stack.id; }
    static Map<String,String> umaMap(String owner, String target) {
        Map<String,String> m = new HashMap<>();
        m.put(owner,target);
        m.put("net/minecraft/world/item/ItemStack",name(Stack.class));
        m.put(PatchServerFixes.LEVEL,name(Level.class)); m.put(PatchServerFixes.REG,name(Registry.class));
        m.put("net/minecraft/resources/ResourceLocation",name(Location.class)); m.put("net/minecraft/resources/ResourceKey",name(Key.class));
        m.put("net/minecraft/core/RegistryAccess",name(Access.class)); m.put("net/minecraft/core/RegistryAccess$Frozen",name(Frozen.class));
        m.put("net/minecraft/server/MinecraftServer",name(Server.class));
        m.put("net/minecraftforge/fml/loading/FMLEnvironment",name(Environment.class));
        m.put("net/minecraftforge/api/distmarker/Dist",name(Dist.class));
        m.put("net/minecraftforge/server/ServerLifecycleHooks",name(Lifecycle.class));
        m.put("net/tracen/umapyoi/registry/races/Race",name(Race.class));
        m.put("net/tracen/umapyoi/registry/races/RaceRegistry",name(RaceRegistry.class));
        m.put("net/tracen/umapyoi/registry/races/tags/RaceTag",name(Tag.class));
        m.put("net/tracen/umapyoi/registry/training/card/SupportCard",name(Support.class));
        m.put(PatchServerFixes.CLIENT,name(ClientUtils.class)); m.put(PatchServerFixes.API,name(Api.class));
        return m;
    }
    static Class<?> ticketClass(byte[] data, String target, String owner, Loader loader) {
        ClassNode n = slim(data, owner, Set.of("getRace", "sdbf$raceRegistry", "sdbf$raceTagRegistry", "sdbf$supportRegistry"));
        n.methods.removeIf(m -> m.name.equals("getRace") && Type.getArgumentTypes(m.desc).length != 2);
        for (MethodNode method : n.methods) for (AbstractInsnNode i : method.instructions) {
            if (i instanceof MethodInsnNode c && c.owner.equals(owner) && c.name.equals("getRaceID")) {
                c.owner = name(TestServerFixes.class); c.desc = Type.getMethodDescriptor(Type.getType(Location.class), Type.getType(Stack.class));
            }
        }
        return define(n,umaMap(owner,target),loader);
    }
    static void umapyoi(Map<String,byte[]> before, Map<String,byte[]> after) throws Exception {
        Loader loader = new Loader();
        Class<?> old = ticketClass(before.get(PatchServerFixes.TICKET),"UmaTicketOriginal",PatchServerFixes.TICKET,loader);
        Class<?> fixed = ticketClass(after.get(PatchServerFixes.TICKET),"UmaTicketPatched",PatchServerFixes.TICKET,loader);
        Class<?> support = ticketClass(after.get(PatchServerFixes.SUPPORT),"UmaSupportPatched",PatchServerFixes.SUPPORT,loader);
        Location raceId = new Location("test_race"); Race sr = new Race(), cr = new Race();
        Registry raceServer = id -> id.equals(raceId) ? sr : null, raceClient = id -> id.equals(raceId) ? cr : null;
        serverRegistries.put(Race.REGISTRY_KEY,raceServer); clientRegistries.put(Race.REGISTRY_KEY,raceClient);
        serverRegistries.put(Tag.REGISTRY_KEY,id -> "server-tag"); clientRegistries.put(Tag.REGISTRY_KEY,id -> "client-tag");
        serverRegistries.put(Support.REGISTRY_KEY,id -> "server-support"); clientRegistries.put(Support.REGISTRY_KEY,id -> "client-support");
        Stack stack = new Stack("ticket"); stack.id = raceId;
        Level sl = new Level(serverRegistries,false), cl = new Level(clientRegistries,true);
        Method om = old.getMethod("getRace",Stack.class,Level.class), fm = fixed.getMethod("getRace",Stack.class,Level.class);
        Environment.dist = Dist.DEDICATED_SERVER; ClientUtils.calls = 0;
        check(om.invoke(null,stack,sl) == null && ClientUtils.calls == 1, "original reproduces eager client call on server");
        ClientUtils.calls = 0;
        check(fm.invoke(null,stack,sl) == sr && ClientUtils.calls == 0, "server world never evaluates client fallback");
        check(fm.invoke(null,stack,null) == sr && ClientUtils.calls == 0, "null-world server lookup uses server registries");
        server = null;
        check(fm.invoke(null,stack,null) == null && ClientUtils.calls == 0, "before server startup preserves null-on-exception and avoids client load");
        server = new Server();
        stack.id = RaceRegistry.DEFAULT.location();
        check(fm.invoke(null,stack,sl) == null && ClientUtils.calls == 0, "default ticket still returns null");
        stack.id = new Location("unknown"); check(fm.invoke(null,stack,sl) == null, "unknown race still returns null");
        stack.id = raceId;
        for (Dist dist : Dist.values()) {
            Environment.dist = dist;
            for (Level world : new Level[]{null,sl,cl}) {
                // A client Level is only a meaningful case in the physical client.
                if (dist == Dist.DEDICATED_SERVER && world == cl) continue;
                ClientUtils.calls = 0;
                boolean client = world == cl || world == null && dist == Dist.CLIENT;
                check(fm.invoke(null,stack,world) == (client ? cr : sr), "race lookup by physical/logical side");
                check(ClientUtils.calls == (client ? 1 : 0), "client fallback evaluated only on client");
                for (Object[] row : new Object[][]{{fixed,"sdbf$raceTagRegistry",Tag.REGISTRY_KEY},{support,"sdbf$supportRegistry",Support.REGISTRY_KEY}}) {
                    Registry actual = (Registry)((Class<?>)row[0]).getMethod((String)row[1],Level.class).invoke(null,world);
                    check(actual == (client ? clientRegistries : serverRegistries).get(row[2]), "tooltip registry uses correct world and side");
                }
            }
        }
        System.out.println("PASS actual Uma ticket original failure; dedicated server/client/integrated server/null world/default/unknown");
    }

    static void distCleaner(Map<String,byte[]> before, Map<String,byte[]> after) throws Exception {
        Field dist = RuntimeDistCleaner.class.getDeclaredField("DIST"); dist.setAccessible(true);
        Object previous = dist.get(null);
        RuntimeDistCleaner cleaner = new RuntimeDistCleaner();
        try {
            for (String side : List.of("CLIENT","DEDICATED_SERVER")) {
                dist.set(null,side);
                for (String owner : List.of(PatchServerFixes.NPC,PatchServerFixes.SCHEMATIC)) {
                    ClassNode n = PatchServerFixes.node(after.get(owner));
                    cleaner.processClassWithFlags(Phase.AFTER,n,Type.getObjectType(owner),"test");
                    boolean client = side.equals("CLIENT");
                    if (owner.equals(PatchServerFixes.NPC)) check(n.fields.stream().anyMatch(f -> f.name.equals("textureTarget")) == client, "render target retained only on client");
                    else check(n.methods.stream().filter(m -> m.desc.contains("Lnet/minecraft/client/multiplayer/ClientLevel;")).count() == (client ? 5 : 0), "all client particle signatures stripped on server");
                }
            }
        } finally { dist.set(null,previous); }
        ClassNode bonsai = PatchServerFixes.node(after.get(PatchServerFixes.BONSAI));
        check(bonsai.methods.stream().noneMatch(m -> m.desc.contains("mcjty/theoneprobe/")), "no missing TOP descriptor remains for reflection");
        check(PatchServerFixes.node(before.get(PatchServerFixes.BONSAI)).methods.size() == bonsai.methods.size() + 1, "only one optional adapter removed");
        System.out.println("PASS actual Forge RuntimeDistCleaner strips server render members and preserves client members");
    }

    public static class EventRecorder {
        static final List<String> async = new ArrayList<>(), sync = new ArrayList<>();
        public static void registerEvents(String[] names, boolean asynchronous) { (asynchronous ? async : sync).addAll(List.of(names)); }
    }
    static List<List<String>> events(byte[] data, String host) throws Exception {
        ClassNode n = slim(data,PatchServerFixes.ASYNC,Set.of("registerCommonAsyncEvents"));
        MethodNode m = n.methods.get(0);
        // Execute the actual two array constructions and actual registration call instructions.
        MethodInsnNode last = PatchServerFixes.calls(m,PatchServerFixes.ASYNC,"registerEvents").get(1);
        for (AbstractInsnNode i = last.getNext(); i != null;) { AbstractInsnNode next = i.getNext(); m.instructions.remove(i); i = next; }
        m.instructions.add(new InsnNode(RETURN)); if (m.localVariables != null) m.localVariables.clear();
        for (MethodInsnNode c : PatchServerFixes.calls(m,PatchServerFixes.ASYNC,"registerEvents")) c.owner = name(EventRecorder.class);
        EventRecorder.async.clear(); EventRecorder.sync.clear();
        define(n,Map.of(PatchServerFixes.ASYNC,host),new Loader()).getMethod(m.name).invoke(null);
        return List.of(List.copyOf(EventRecorder.async),List.copyOf(EventRecorder.sync));
    }
    static void events(Path root, byte[] before, byte[] after) throws Exception {
        List<List<String>> original = events(before,"AsyncOriginal"), fixed = events(after,"AsyncPatched");
        List<String> expected = new ArrayList<>(original.get(0)); expected.remove("net.minecraftforge.event.network.CustomPayloadEvent");
        check(expected.equals(fixed.get(0)), "all other asynchronous registrations unchanged");
        expected = new ArrayList<>(original.get(1)); expected.set(1,"net.minecraftforge.event.TickEvent$LevelTickEvent");
        check(expected.equals(fixed.get(1)), "all other synchronous registrations unchanged");
        Path forge = Path.of(System.getenv("APPDATA"),"PrismLauncher/libraries/net/minecraftforge/forge/1.20.1-47.4.20/forge-1.20.1-47.4.20-universal.jar");
        try (JarFile z = new JarFile(forge.toFile())) {
            for (List<String> list : fixed) for (String c : list) check(z.getJarEntry(c.replace('.','/') + ".class") != null, "registered event exists in actual Forge: " + c);
        }
        System.out.println("PASS actual registration bytecode: only unsupported payload removed and synchronous tick name corrected");
    }
    public enum Category { MONSTER, MISC }
    public static class Entity {}
    public interface EntityFactory { Entity m_20721_(EntityType t, Level l); }
    public static class SlashAir extends Entity { public SlashAir(EntityType t, Level l) {} }
    public static class EntityType {
        public Category category; public float width,height; public int range; public String id; public EntityFactory factory;
    }
    public static class Builder {
        final EntityType type = new EntityType();
        public static Builder m_20704_(EntityFactory f, Category c) { Builder b = new Builder(); b.type.factory = f; b.type.category = c; return b; }
        public Builder m_20699_(float w,float h) { type.width = w; type.height = h; return this; }
        public Builder m_20702_(int r) { type.range = r; return this; }
        public EntityType m_20712_(String id) { type.id = id; return type; }
    }
    static void bagus(byte[] before, byte[] after) throws Exception {
        EntityType[] types = new EntityType[2];
        for (int i = 0; i < 2; i++) {
            ClassNode n = slim(i == 0 ? before : after,PatchServerFixes.BAGUS,Set.of("lambda$static$6","prefix"));
            Map<String,String> m = Map.of(
                PatchServerFixes.BAGUS,"BagusRegistryFixture" + i,
                "net/minecraft/world/entity/MobCategory",name(Category.class),
                "net/minecraft/world/entity/Entity",name(Entity.class),
                "net/minecraft/world/entity/EntityType",name(EntityType.class),
                "net/minecraft/world/entity/EntityType$Builder",name(Builder.class),
                "net/minecraft/world/entity/EntityType$EntityFactory",name(EntityFactory.class),
                "net/minecraft/world/level/Level",name(Level.class),
                "baguchan/bagusmob/entity/SlashAir",name(SlashAir.class));
            types[i] = (EntityType)define(n,m,new Loader()).getMethod("lambda$static$6").invoke(null);
        }
        check(types[0].category == Category.MONSTER && types[1].category == Category.MISC, "actual registration changes projectile category only");
        check(types[0].id.endsWith("slash_air") && types[0].id.equals(types[1].id), "projectile builder identifier preserved");
        check(types[0].width == types[1].width && types[0].height == types[1].height && types[0].range == types[1].range, "projectile size and tracking range preserved");
        for (EntityType t : types) check(t.factory.m_20721_(t,null) instanceof SlashAir, "original projectile constructor preserved");
        System.out.println("PASS actual slash_air registration changes MONSTER to MISC; factory/id/size/range unchanged");
    }
    static byte[] body(MethodNode m) {
        ClassNode n = new ClassNode(); n.version = V17; n.access = ACC_PUBLIC; n.name = "BodyFixture"; n.superName = "java/lang/Object";
        MethodNode copy = new MethodNode(m.access,m.name,m.desc,m.signature,null); m.accept(copy); copy.maxStack = 0; copy.maxLocals = 0; n.methods.add(copy);
        ClassWriter w = new ClassWriter(0); n.accept(w); return w.toByteArray();
    }
    static void stackBounds(Path root, byte[] beforePlugin, byte[] afterPlugin, byte[] mixin) throws Exception {
        Path mc = Path.of(System.getProperty("user.home"),".gradle/caches/forge_gradle/minecraft_user_repo/net/minecraftforge/forge/1.20.1-47.4.10_mapped_official_1.20.1/forge-1.20.1-47.4.10_mapped_official_1.20.1.jar");
        ClassNode n;
        try (JarFile z = new JarFile(mc.toFile())) { n = PatchServerFixes.node(z.getInputStream(z.getJarEntry("net/minecraft/server/level/ServerPlayerGameMode.class")).readAllBytes()); }
        MethodNode method = PatchServerFixes.method(n,"useItemOn",null);
        byte[] instructions = body(method);
        new Analyzer<>(new BasicVerifier()).analyze(n.name,method);
        int goodMax = method.maxStack;
        method.maxStack = 1;
        boolean fails = false;
        try { new Analyzer<>(new BasicVerifier()).analyze(n.name,method); } catch (AnalyzerException e) { fails = e.getMessage().contains("Insufficient maximum stack"); }
        check(fails, "actual Forge useItemOn reproduces analyzer failure with insufficient stack metadata");
        String mixinName = "com.tonywww.slashblade_sendims.mixin.startup.ServerInteractionStackBoundsMixin";
        InteractionStackBounds.prepare("net.minecraft.server.level.ServerPlayerGameMode",n,"unrelated.Mixin");
        check(method.maxStack == 1, "unrelated mixin untouched");
        ClassNode hook = slim(afterPlugin,PatchServerFixes.PLUGIN,Set.of("preApply"));
        Class<?> plugin = define(hook,Map.of(PatchServerFixes.PLUGIN,"StackPluginFixture"),new Loader());
        // preApply is an instance callback. Allocate fixture without running any plugin startup logic.
        MethodNode ctor = new MethodNode(ACC_PUBLIC,"<init>","()V",null,null);
        ctor.instructions.add(new VarInsnNode(ALOAD,0));ctor.instructions.add(new MethodInsnNode(INVOKESPECIAL,"java/lang/Object","<init>","()V",false));ctor.instructions.add(new InsnNode(RETURN));ctor.maxLocals=1;ctor.maxStack=1;
        hook.methods.add(ctor);
        plugin = define(hook,Map.of(PatchServerFixes.PLUGIN,"StackPluginWithConstructor"),new Loader());
        plugin.getMethod("preApply",String.class,ClassNode.class,String.class,org.spongepowered.asm.mixin.extensibility.IMixinInfo.class)
            .invoke(plugin.getConstructor().newInstance(),"net.minecraft.server.level.ServerPlayerGameMode",n,mixinName,null);
        check(method.maxStack >= goodMax, "actual patched plugin invokes stack repair");
        new Analyzer<>(new BasicVerifier()).analyze(n.name,method);
        check(Arrays.equals(instructions,body(method)), "all interaction instructions, frames, exceptions, locals and annotations preserved");
        for (String runtimeName : List.of("useItemOn","m_7179_")) {
            method.name = runtimeName; method.maxStack = 1;
            InteractionStackBounds.prepare("net.minecraft.server.level.ServerPlayerGameMode",n,mixinName);
            new Analyzer<>(new BasicVerifier()).analyze(n.name,method);
            check(method.maxStack >= goodMax, "development and runtime method names supported");
        }
        ClassNode early = PatchServerFixes.node(mixin);
        check(early.version == V17 && early.methods.size() == 1, "Java 17 empty mixin has only constructor");
        AnnotationNode annotation = early.invisibleAnnotations.stream().filter(a -> a.desc.equals("Lorg/spongepowered/asm/mixin/Mixin;")).findFirst().orElseThrow();
        check(annotation.values.contains(10000), "early mixin priority precedes quest local capture");
        System.out.println("PASS actual Forge useItemOn stack repair and actual plugin callback; gameplay instructions unchanged");
    }
    static void run(Path root, Map<String,byte[]> before, Map<String,byte[]> after) throws Exception {
        tetra(root,before.get(PatchServerFixes.TETRA),after.get(PatchServerFixes.TETRA));
        umapyoi(before,after);
        distCleaner(before,after);
        events(root,before.get(PatchServerFixes.ASYNC),after.get(PatchServerFixes.ASYNC));
        bagus(before.get(PatchServerFixes.BAGUS),after.get(PatchServerFixes.BAGUS));
    }
}
