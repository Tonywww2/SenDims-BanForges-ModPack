import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;
import java.lang.reflect.Method;
import java.util.*;

/** Runs the compiled SRG mixin handlers with small fixtures; no Minecraft client is launched. */
public final class TestBleeding {
    static int checks;
    static void check(boolean ok, String reason) { if (!ok) throw new AssertionError(reason); checks++; }
    static final Map<String,String> TYPES = new HashMap<>();
    static void type(String original, Class<?> fixture) { TYPES.put(original, Type.getInternalName(fixture)); }
    static {
        type("net/minecraft/world/level/Level", Level.class);
        type("net/minecraft/server/level/ServerLevel", ServerLevel.class);
        type("net/minecraft/world/entity/Entity", Entity.class);
        type("net/minecraft/world/entity/LivingEntity", LivingEntity.class);
        type("net/minecraft/world/entity/player/Player", Player.class);
        type("net/minecraft/world/entity/ai/attributes/Attribute", Attribute.class);
        type("net/minecraft/world/entity/ai/attributes/Attributes", Attributes.class);
        type("net/minecraft/world/item/Item", Item.class);
        type("net/minecraft/world/item/ItemStack", ItemStack.class);
        type("net/minecraft/resources/ResourceLocation", ResourceLocation.class);
        type("net/minecraft/world/damagesource/DamageSource", DamageSource.class);
        type("net/minecraft/world/damagesource/DamageSources", DamageSources.class);
        type("net/minecraft/core/particles/ParticleOptions", ParticleOptions.class);
        type("net/minecraft/core/particles/DustParticleOptions", DustParticleOptions.class);
        type("org/joml/Vector3f", Vector3f.class);
        type("net/minecraftforge/common/capabilities/Capability", Capability.class);
        type("net/minecraftforge/common/util/LazyOptional", LazyOptional.class);
        type("net/minecraftforge/common/util/NonNullConsumer", NonNullConsumer.class);
        type("net/minecraftforge/registries/RegistryObject", RegistryObject.class);
        type("net/royling/lsp/ModCap/IBloodAccumulation", IBloodAccumulation.class);
        type("net/royling/lsp/ModCap/ModCapabilities", ModCapabilities.class);
        type("net/royling/lsp/SpecialEffects/SERegistry", SERegistry.class);
        type("mods/flammpfeil/slashblade/event/SlashBladeEvent$HitEvent", HitEvent.class);
        type("mods/flammpfeil/slashblade/capability/slashblade/ISlashBladeState", ISlashBladeState.class);
        type("mods/flammpfeil/slashblade/registry/specialeffects/SpecialEffect", SpecialEffect.class);
        type("mods/flammpfeil/slashblade/item/ItemSlashBlade", ItemSlashBlade.class);
        type("net/minecraftforge/event/entity/living/LivingEvent$LivingTickEvent", LivingTickEvent.class);
        type("org/spongepowered/asm/mixin/injection/callback/CallbackInfo", CallbackInfo.class);
    }
    static void run(String name, byte[] runtime, BuildBleeding.Srg srg) throws Exception {
        Map<String,String> methods = new HashMap<>(), fields = new HashMap<>();
        srg.methods.forEach((key,value) -> methods.put(value + key.substring(key.indexOf('(')), key.substring(key.lastIndexOf('.') + 1, key.indexOf('('))));
        srg.fields.forEach((key,value) -> fields.put(value, key.substring(key.lastIndexOf('.') + 1)));
        ClassNode n = BuildBleeding.node(runtime);
        for (var m : n.methods) for (var instruction : m.instructions) {
            if (instruction instanceof MethodInsnNode c && c.owner.startsWith("net/minecraft/") && !c.name.startsWith("<") && !c.name.equals("getCapability"))
                check(c.name.startsWith("m_"), "runtime method reobfuscated: " + c.owner + "." + c.name);
            if (instruction instanceof FieldInsnNode f && f.owner.startsWith("net/minecraft/"))
                check(f.name.startsWith("f_"), "runtime field reobfuscated: " + f.owner + "." + f.name);
        }
        n.visibleAnnotations = n.invisibleAnnotations = null;
        for (var m : n.methods) { m.visibleAnnotations = m.invisibleAnnotations = null; }
        for (var f : n.fields) { f.visibleAnnotations = f.invisibleAnnotations = null; }
        ClassWriter writer = new ClassWriter(0);
        n.accept(new ClassRemapper(writer, new Remapper() {
            @Override public String map(String internalName) { return TYPES.getOrDefault(internalName, internalName); }
            @Override public String mapMethodName(String owner, String method, String descriptor) {
                return owner.startsWith("net/minecraft/") ? methods.getOrDefault(method + descriptor, method) : method;
            }
            @Override public String mapFieldName(String owner, String field, String descriptor) {
                return owner.startsWith("net/minecraft/") ? fields.getOrDefault(field, field) : field;
            }
        }));
        Class<?> clazz = new ClassLoader(TestBleeding.class.getClassLoader()) {
            Class<?> load() { byte[] b = writer.toByteArray(); return defineClass(n.name.replace('/', '.'), b, 0, b.length); }
        }.load();
        if (name.equals("MixinBloodAccumulationEvent")) tickTests(clazz);
        else hitTests(clazz, name.equals("MixinDualBladeMain"));
    }
    static void invoke(Method m, Object event) throws Exception {
        CallbackInfo ci = new CallbackInfo(); m.invoke(null, event, ci); check(ci.cancelled, "native handler cancelled");
    }
    static void hitTests(Class<?> clazz, boolean dual) throws Exception {
        Method m = clazz.getDeclaredMethod("sendims$attackBasedAccumulation", HitEvent.class, CallbackInfo.class); m.setAccessible(true);
        for (double attack : new double[]{-10, 0, 0.49, 0.5, 0.999, 1, 20.8, 22.5, 1e12})
            for (float hp : new float[]{0.5F, 1, 20, 100.9F, 1000, Float.MAX_VALUE})
                for (int old : new int[]{0, 1, 50, Integer.MAX_VALUE}) {
                    ServerLevel level = new ServerLevel(); Player p = new Player(level); p.attack = attack;
                    LivingEntity target = new LivingEntity(level); target.max = hp; target.blood.accum = old; target.invulnerableTime = 7;
                    HitEvent e = new HitEvent(p, target, new BladeState());
                    invoke(m, e);
                    int amount = (int)Math.floor(attack * 2), limit = Math.max(1, (int)Math.floor(hp));
                    int expected = amount <= 0 ? old : (int)Math.min(limit, (long)old + amount);
                    check(target.blood.accum == expected, "floor and cap: " + attack + "/" + hp + "/" + old);
                    check(target.invulnerableTime == (amount > 0 ? 0 : 7), "invulnerability reset on positive addition");
                    check(Objects.equals(target.blood.last, amount > 0 ? p.uuid : null), "last attacker set only on addition");
                }
        for (int invalid = 0; invalid < (dual ? 6 : 5); invalid++) {
            ServerLevel level = new ServerLevel(); Player p = new Player(level); LivingEntity target = new LivingEntity(level);
            BladeState state = new BladeState(); HitEvent e = new HitEvent(p, target, state);
            switch (invalid) {
                case 0 -> level.client = true;
                case 1 -> e.user = new LivingEntity(level);
                case 2 -> state.enabled = false;
                case 3 -> { if (dual) p.offhand.item = new Item(); else p.experienceLevel = 19; }
                case 4 -> { if (dual) p.offhand.state = null; else target.capability = false; }
                case 5 -> p.offhand.state.enabled = false;
            }
            invoke(m, e); check(target.blood.accum == 0, "original eligibility " + invalid + "/dual=" + dual);
        }
        if (dual) {
            ServerLevel level = new ServerLevel(); Player p = new Player(level); p.experienceLevel = 0;
            LivingEntity target = new LivingEntity(level); invoke(m, new HitEvent(p,target,new BladeState()));
            check(target.blood.accum == 40, "dual retains original lack of XP gate");
        }
        ServerLevel level = new ServerLevel(); Player p = new Player(level); p.attack=20.8;
        LivingEntity target = new LivingEntity(level); HitEvent repeated = new HitEvent(p,target,new BladeState());
        invoke(m,repeated); invoke(m,repeated);
        check(target.blood.accum==82,"each hit floors independently; no fractional remainder storage");
        invoke(m,repeated); check(target.blood.accum==100,"third hit clamps at full meter");
    }
    static void tickTests(Class<?> clazz) throws Exception {
        Method m = clazz.getDeclaredMethod("injectOnLivingTick", LivingTickEvent.class, CallbackInfo.class); m.setAccessible(true);
        for (float max : new float[]{0.5F, 1, 20, 100.9F, 1000})
            for (float fraction : new float[]{0, 0.2F, 0.5F, 1})
                for (boolean attributed : new boolean[]{false,true}) {
                    ServerLevel level = new ServerLevel(); Player p = new Player(level); level.entities.put(p.uuid, p);
                    LivingEntity t = new LivingEntity(level); t.max=max; t.health=max*fraction;
                    t.blood.accum=Math.max(1,(int)Math.floor(max)); t.blood.last=attributed?p.uuid:UUID.randomUUID();
                    float expected=8+(max-t.health)*0.15F;
                    invoke(m,new LivingTickEvent(t));
                    check(t.hits.size()==4,"four physical hits");
                    for (float damage:t.hits) check(Math.abs(damage-expected/4)<0.0001F,"15% missing-health formula computed once");
                    check(t.source.attacker==(attributed?p:t),"attacker attribution/fallback");
                    check(t.blood.accum==0 && t.blood.last==null,"reset after burst");
                    check(t.invulnerableTime==0,"reset after last hit");
                    check(level.particles==2,"both particle groups retained");
                }
        for (int tick=0;tick<20;tick++) {
            LivingEntity t=new LivingEntity(new ServerLevel()); t.blood.accum=50; t.tickCount=tick;
            invoke(m,new LivingTickEvent(t));
            check(t.blood.accum==(tick%5==0?49:50),"decay once per 5 ticks"); check(t.hits.isEmpty(),"below threshold does not burst");
        }
        LivingEntity blocked=new LivingEntity(new ServerLevel()); blocked.blood.accum=150; blocked.invulnerableTime=5;
        invoke(m,new LivingTickEvent(blocked)); check(blocked.hits.isEmpty() && blocked.blood.accum==100,"cap applied while burst blocked");
        LivingEntity client=new LivingEntity(new ServerLevel()); client.level.client=true; client.blood.accum=100;
        invoke(m,new LivingTickEvent(client)); check(client.hits.isEmpty() && client.blood.accum==100,"client does not mutate");
        LivingEntity noCap=new LivingEntity(new ServerLevel()); noCap.capability=false; noCap.blood.accum=100;
        invoke(m,new LivingTickEvent(noCap)); check(noCap.hits.isEmpty(),"missing capability is safe");
    }

    public static class Level { boolean client; public boolean isClientSide(){return client;} }
    public static class ServerLevel extends Level {
        Map<UUID,Entity> entities=new HashMap<>(); int particles;
        public Entity getEntity(UUID id){return entities.get(id);}
        public int sendParticles(ParticleOptions p,double x,double y,double z,int count,double a,double b,double c,double speed){particles++;return count;}
    }
    public static class Entity {
        Level level; UUID uuid=UUID.randomUUID(); public int invulnerableTime,tickCount=1;
        Entity(Level level){this.level=level;}
        public Level level(){return level;} public UUID getUUID(){return uuid;}
        public double getX(){return 0;} public double getY(){return 0;} public double getZ(){return 0;}
        public float getBbWidth(){return 1;} public float getBbHeight(){return 2;}
    }
    public static class LivingEntity extends Entity {
        float max=100,health=50; double attack=20; Blood blood=new Blood(); boolean capability=true;
        List<Float> hits=new ArrayList<>(); DamageSource source;
        LivingEntity(Level level){super(level);}
        public float getMaxHealth(){return max;} public float getHealth(){return health;}
        public double getAttributeValue(Attribute a){return attack;}
        public <T> LazyOptional<T> getCapability(Capability<T> c){return new LazyOptional<>((T)(capability?blood:null));}
        public DamageSources damageSources(){return new DamageSources();}
        public boolean hurt(DamageSource s,float amount){check(invulnerableTime==0,"each segment bypasses hurt cooldown");hits.add(amount);health-=amount;invulnerableTime=10;source=s;return true;}
    }
    public static class Player extends LivingEntity {
        public int experienceLevel=20; ItemStack offhand=new ItemStack();
        Player(Level level){super(level);} public ItemStack getOffhandItem(){return offhand;}
    }
    public static class Attribute {}
    public static class Attributes { public static final Attribute ATTACK_DAMAGE=new Attribute(); }
    public static class ResourceLocation {}
    public static class Capability<T> {}
    public interface NonNullConsumer<T> { void accept(T t); }
    public static class LazyOptional<T> {
        T value; LazyOptional(T v){value=v;} public void ifPresent(NonNullConsumer<T> c){if(value!=null)c.accept(value);}
        public T orElse(T other){return value==null?other:value;}
    }
    public interface IBloodAccumulation {
        int getAccumulation(); void setAccumulation(int value); void addAccumulation(int value); void clearAccumulation();
        UUID getLastAttackerUUID(); void setLastAttackerUUID(UUID id);
    }
    public static class Blood implements IBloodAccumulation {
        int accum; UUID last;
        public int getAccumulation(){return accum;} public void setAccumulation(int v){accum=v;}
        public void addAccumulation(int v){accum+=v;} public void clearAccumulation(){accum=0;last=null;}
        public UUID getLastAttackerUUID(){return last;} public void setLastAttackerUUID(UUID id){last=id;}
    }
    public static class ModCapabilities { public static final Capability<IBloodAccumulation> BLOOD_ACCUMULATION_CAPABILITY=new Capability<>(); }
    public static class RegistryObject<T> { public ResourceLocation getId(){return new ResourceLocation();} public T get(){return (T)new SpecialEffect();} }
    public static class SERegistry {
        public static final RegistryObject<SpecialEffect> BLEEDING_CUTTING=new RegistryObject<>(),DUAL_BLADE_MAIN=new RegistryObject<>(),DUAL_BLADE_OFF=new RegistryObject<>();
    }
    public static class SpecialEffect { public static boolean isEffective(SpecialEffect effect,int level){return level>=20;} }
    public interface ISlashBladeState { boolean hasSpecialEffect(ResourceLocation id); }
    public static class BladeState implements ISlashBladeState { boolean enabled=true; public boolean hasSpecialEffect(ResourceLocation id){return enabled;} }
    public static class Item {}
    public static class ItemSlashBlade extends Item { public static final Capability<ISlashBladeState> BLADESTATE=new Capability<>(); }
    public static class ItemStack {
        Item item=new ItemSlashBlade(); BladeState state=new BladeState();
        public Item getItem(){return item;} public <T> LazyOptional<T> getCapability(Capability<T> c){return new LazyOptional<>((T)state);}
    }
    public static class HitEvent {
        LivingEntity user,target; ISlashBladeState state;
        HitEvent(LivingEntity p,LivingEntity t,ISlashBladeState s){user=p;target=t;state=s;}
        public LivingEntity getUser(){return user;} public LivingEntity getTarget(){return target;} public ISlashBladeState getSlashBladeState(){return state;}
    }
    public static class LivingTickEvent { LivingEntity entity; LivingTickEvent(LivingEntity e){entity=e;} public LivingEntity getEntity(){return entity;} }
    public static class CallbackInfo { boolean cancelled; public void cancel(){cancelled=true;} }
    public static class DamageSource { LivingEntity attacker; DamageSource(LivingEntity e){attacker=e;} }
    public static class DamageSources { public DamageSource mobAttack(LivingEntity e){return new DamageSource(e);} }
    public interface ParticleOptions {}
    public static class Vector3f { public Vector3f(float x,float y,float z){} }
    public static class DustParticleOptions implements ParticleOptions { public DustParticleOptions(Vector3f v,float size){} }
}
