import java.lang.reflect.Method;
import java.util.*;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;

/** Execute both upstream handler bodies; only unavailable Minecraft/Forge objects are fixtures. */
public final class TestUmaMotivation implements Opcodes {
    static int checks;
    static void check(boolean ok, String why) { if (!ok) throw new AssertionError(why); checks++; }
    public static class Value { double value; Value(double v) { value=v; } public Object get() { return value; } }
    public static class Config { public static Value DAMAGE_MOTIVATION_EFFECT, CHANCE_MOTIVATION_EFFECT; }
    public static class Builder {
        String key; double initial, min, max; String[] comments;
        public Builder comment(String[] v) { comments=v; return this; }
        public Value defineInRange(String k, double v, double lo, double hi) {
            key=k; initial=v; min=lo; max=hi; return new Value(v);
        }
    }
    public interface RandomSource { double m_188500_(); }
    public static class Level {
        double roll; int draws;
        public RandomSource m_213780_() { return () -> { draws++; return roll; }; }
    }
    public enum Motivations { BAD, GOOD }
    public static class Stack {
        boolean empty; int drops; Motivations mood=Motivations.GOOD;
        public boolean m_41619_() { return empty; }
    }
    public static class Effect {}
    public static class EffectInstance {
        Effect effect; int duration;
        public EffectInstance(Effect e, int d) { effect=e; duration=d; }
    }
    public static class RegistryObject {
        Object value; RegistryObject(Object v) { value=v; }
        public Object get() { return value; }
    }
    public static class Effects {
        public static RegistryObject MOOD_BONUS=new RegistryObject(new Effect()), PANICKING=new RegistryObject(new Effect());
    }
    public static class Living {
        public float maxHealth; public Stack soul=new Stack(); public Level level=new Level();
        boolean bonus, panic; int duration;
        public float m_21233_() { return maxHealth; }
        public Level m_9236_() { return level; }
        public boolean m_21023_(Effect e) { return bonus; }
        public boolean m_21195_(Effect e) { bonus=false; return true; }
        public boolean m_7292_(EffectInstance e) { panic=true; duration=e.duration; return true; }
    }
    public static class Event {
        Living entity; float amount;
        Event(Living e, float a) { entity=e; amount=a; }
        public Living getEntity() { return entity; }
        public float getAmount() { return amount; }
    }
    public static class API { public static Stack getUmaSoul(Living e) { return e.soul; } }
    public static class Status { public static void downMotivation(Stack s) { s.drops++; } }
    public static class Soul { public static Motivations getMotivation(Stack s) { return s.mood; } }
    static class Loader extends ClassLoader {
        Class<?> define(byte[] b) { return defineClass(null,b,0,b.length); }
    }
    static Map<String,String> mapping(String owner, String subject) {
        Map<String,String> map=new HashMap<>(); map.put(owner,subject);
        Map<String,Class<?>> types=Map.ofEntries(
                Map.entry(PatchUmaMotivation.CONFIG,Config.class), Map.entry(PatchUmaMotivation.BUILDER,Builder.class),
                Map.entry(PatchUmaMotivation.DOUBLE_VALUE,Value.class), Map.entry(PatchUmaMotivation.DAMAGE_EVENT,Event.class),
                Map.entry(PatchUmaMotivation.LIVING,Living.class), Map.entry("net/minecraft/world/item/ItemStack",Stack.class),
                Map.entry("net/minecraft/world/level/Level",Level.class), Map.entry("net/minecraft/util/RandomSource",RandomSource.class),
                Map.entry("net/tracen/umapyoi/api/UmapyoiAPI",API.class), Map.entry("net/tracen/umapyoi/utils/UmaStatusUtils",Status.class),
                Map.entry("net/tracen/umapyoi/utils/UmaSoulUtils",Soul.class), Map.entry("net/tracen/umapyoi/registry/umadata/Motivations",Motivations.class),
                Map.entry("net/tracen/umapyoi/effect/MobEffectRegistry",Effects.class), Map.entry("net/minecraftforge/registries/RegistryObject",RegistryObject.class),
                Map.entry("net/minecraft/world/effect/MobEffect",Effect.class), Map.entry("net/minecraft/world/effect/MobEffectInstance",EffectInstance.class));
        for (var e:types.entrySet()) map.put(e.getKey(),Type.getInternalName(e.getValue()));
        // A handler subject is separate from the config fixture referenced by its field reads.
        if (!owner.equals(PatchUmaMotivation.CONFIG)) map.put(owner,subject);
        return map;
    }
    static Class<?> define(ClassNode n, Map<String,String> mapping) {
        ClassWriter w=new ClassWriter(0); n.accept(new ClassRemapper(w,new SimpleRemapper(mapping)));
        return new Loader().define(w.toByteArray());
    }
    static Class<?> handlers(byte[] bytes, String name) {
        ClassNode n=PatchUmaMotivation.node(bytes);
        n.methods.removeIf(m -> !PatchUmaMotivation.HANDLERS.contains(m.name));
        n.fields.clear(); n.innerClasses.clear(); n.nestHostClass=null; n.nestMembers=null;
        n.visibleAnnotations=null; n.invisibleAnnotations=null;
        for (MethodNode m:n.methods) { m.visibleAnnotations=null; m.invisibleAnnotations=null; }
        return define(n,mapping(n.name,name));
    }
    static void config(byte[] data) throws Exception {
        ClassNode input=PatchUmaMotivation.node(data);
        MethodNode init=input.methods.stream().filter(m -> m.name.equals("<clinit>")).findFirst().orElseThrow();
        LdcInsnNode text=Arrays.stream(init.instructions.toArray()).filter(i -> i instanceof LdcInsnNode l
                && l.cst.equals(PatchUmaMotivation.COMMENT)).map(i -> (LdcInsnNode)i).findFirst().orElseThrow();
        AbstractInsnNode start=text;
        while (!(start instanceof VarInsnNode v && v.getOpcode()==ALOAD && v.var==0)) start=start.getPrevious();
        MethodNode snippet=new MethodNode(ACC_PUBLIC|ACC_STATIC,"install","(L"+PatchUmaMotivation.BUILDER+";)V",null,null);
        Map<LabelNode,LabelNode> labels=new HashMap<>();
        for (AbstractInsnNode i=start;;i=i.getNext()) {
            if (i.getOpcode() >= 0) snippet.instructions.add(i.clone(labels));
            if (i instanceof FieldInsnNode f && f.getOpcode()==PUTSTATIC && f.name.equals(PatchUmaMotivation.FIELD)) break;
        }
        snippet.instructions.add(new InsnNode(RETURN)); snippet.maxLocals=1; snippet.maxStack=12;
        ClassNode n=new ClassNode(); n.version=V17; n.access=ACC_PUBLIC; n.name="UmaMotivationConfigSubject";
        n.superName="java/lang/Object"; n.methods.add(snippet);
        Builder builder=new Builder();
        define(n,mapping("unused","unused")).getMethod("install",Builder.class).invoke(null,builder);
        check(builder.key.equals("damage_motivation_health_percent"),"explicit percentage config key");
        check(builder.initial==30 && builder.min==0 && builder.max==100,"default 30%, valid range 0..100");
        check(builder.comments[0].contains("maximum health") && builder.comments[1].contains("0"),"percentage/disable config descriptions");
    }
    static Living apply(Method method, float hp, float amount, double percent, double chance, double roll,
                        boolean empty, boolean bad, boolean bonus) throws Exception {
        Config.DAMAGE_MOTIVATION_EFFECT=new Value(percent); Config.CHANCE_MOTIVATION_EFFECT=new Value(chance);
        Living e=new Living(); e.maxHealth=hp; e.level.roll=roll; e.soul.empty=empty;
        e.soul.mood=bad?Motivations.BAD:Motivations.GOOD; e.bonus=bonus;
        method.invoke(null,new Event(e,amount)); return e;
    }
    public static void run(byte[] original, byte[] patched, byte[] config) throws Exception {
        config(config);
        Class<?> before=handlers(original,"UmaMotivationBefore"), after=handlers(patched,"UmaMotivationAfter");
        for (String name:PatchUmaMotivation.HANDLERS) {
            Method method=after.getMethod(name,Event.class), old=before.getMethod(name,Event.class);
            boolean panic=name.equals("onDamagePanicking");
            for (float hp:new float[]{20,40,100,400,1000}) for (double percent:new double[]{1,10,30,50,100}) {
                float boundary=(float)(hp*percent/100.0);
                for (float amount:new float[]{0,Math.nextDown(boundary),boundary,Math.nextUp(boundary),hp}) {
                    Living e=apply(method,hp,amount,percent,1,0,false,panic,false);
                    boolean expected=amount>=hp*percent/100.0;
                    check((panic?e.panic:e.soul.drops==1)==expected,"percentage boundary "+name+" hp="+hp+" amount="+amount);
                    check(e.level.draws==(expected?1:0),"below-threshold damage never rolls chance");
                }
            }
            for (boolean empty:new boolean[]{true,false}) for (boolean bad:new boolean[]{true,false})
                for (boolean bonus:new boolean[]{true,false}) for (double chance:new double[]{0,0.2,1})
                    for (double roll:new double[]{0,0.2,0.20000001,0.99}) for (float amount:new float[]{119,120,121}) {
                        Living a=apply(old,400,amount,120,chance,roll,empty,bad,bonus);
                        Living b=apply(method,400,amount,30,chance,roll,empty,bad,bonus);
                        check(a.soul.drops==b.soul.drops && a.panic==b.panic && a.bonus==b.bonus
                                && a.duration==b.duration && a.level.draws==b.level.draws,"upstream probability, empty soul and mood-bonus parity");
                    }
            Living disabled=apply(method,100,10000,0,1,0,false,panic,false);
            check(disabled.soul.drops==0 && !disabled.panic && disabled.level.draws==0,"zero percent disables damage penalty");
            Living small=apply(method,100,30,30,1,0,false,panic,false);
            Living large=apply(method,200,30,30,1,0,false,panic,false);
            check((panic?small.panic:small.soul.drops==1) && !(panic?large.panic:large.soul.drops==1),"current maximum health controls the threshold");
        }
    }
}
