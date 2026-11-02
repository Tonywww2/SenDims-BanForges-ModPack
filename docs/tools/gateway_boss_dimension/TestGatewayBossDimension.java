import java.util.*;
import java.util.function.*;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;

/** Executes the original/patched creation method with registry and world boundaries supplied as fixtures. */
public final class TestGatewayBossDimension implements Opcodes {
    static int checks;
    static void check(boolean ok,String why) { if (!ok) throw new AssertionError(why); checks++; }
    public interface Provider {}
    public interface Accessor {}
    public static class Living {}
    public static class Mob extends Living { Boss template; Mob(Boss b) { template=b; } }
    public static class RandomSource { int offset; }
    public static class Pos { public static final Pos f_121853_=new Pos(); }
    public static class Level implements Accessor {
        String dimension; public RandomSource f_46441_=new RandomSource();
        Level(String d) { dimension=d; }
    }
    public interface Rules {
        Set<String> getDimensions();
        static Predicate<Boss> matches(Level l) {
            // This is the already existing Placebo rule, not new production filtering code.
            return b -> b.getDimensions()==null || b.getDimensions().isEmpty() || b.getDimensions().contains(l.dimension);
        }
    }
    public static class Boss implements Provider,Rules {
        String id; Set<String> dimensions; int weight,creates;
        Boss(String id,int weight,String...dims) { this.id=id;this.weight=weight;dimensions=Set.of(dims); }
        public Set<String> getDimensions() { return dimensions; }
        public Mob createBoss(Accessor level,Pos pos,RandomSource r,float luck) {
            check(luck==0,"upstream creation luck unchanged");creates++;return new Mob(this);
        }
    }
    public static class Registry {
        public static Registry INSTANCE=new Registry();
        List<Boss> entries=new ArrayList<>(); int globals,scoped;
        public Provider getRandomItem(RandomSource r) { globals++;return pick(r,b -> true); }
        @SafeVarargs public final Provider getRandomItem(RandomSource r,float luck,Predicate<Boss>...filters) {
            scoped++;check(luck==0 && filters.length==1,"same luck and exactly one dimension predicate");
            return pick(r,b -> Arrays.stream(filters).allMatch(p -> p.test(b)));
        }
        Boss pick(RandomSource r,Predicate<Boss> filter) {
            List<Boss> eligible=entries.stream().filter(filter).toList();
            int total=eligible.stream().mapToInt(b -> b.weight).sum();
            if (total==0) return null;
            int roll=Math.floorMod(r.offset,total);
            for (Boss b:eligible) { if (roll<b.weight) return b;roll-=b.weight; }
            throw new AssertionError();
        }
    }
    static class Loader extends ClassLoader {
        Class<?> define(byte[] b) { return defineClass(null,b,0,b.length); }
    }
    static Class<?> subject(byte[] data,String subject) {
        ClassNode n=PatchGatewayBossDimension.node(data);
        n.methods.removeIf(m -> !m.name.equals("createEntity"));
        n.fields.removeIf(f -> !Set.of("bossId","boss").contains(f.name));
        n.interfaces.clear();n.innerClasses.clear();n.nestHostClass=null;n.nestMembers=null;
        n.visibleAnnotations=null;n.invisibleAnnotations=null;
        MethodNode ctor=new MethodNode(ACC_PUBLIC,"<init>","(Ljava/util/Optional;Ljava/util/function/Supplier;)V",null,null);
        ctor.instructions.add(new VarInsnNode(ALOAD,0));
        ctor.instructions.add(new MethodInsnNode(INVOKESPECIAL,"java/lang/Object","<init>","()V",false));
        ctor.instructions.add(new VarInsnNode(ALOAD,0));ctor.instructions.add(new VarInsnNode(ALOAD,1));
        ctor.instructions.add(new FieldInsnNode(PUTFIELD,n.name,"bossId","Ljava/util/Optional;"));
        ctor.instructions.add(new VarInsnNode(ALOAD,0));ctor.instructions.add(new VarInsnNode(ALOAD,2));
        ctor.instructions.add(new FieldInsnNode(PUTFIELD,n.name,"boss","Ljava/util/function/Supplier;"));
        ctor.instructions.add(new InsnNode(RETURN));ctor.maxLocals=3;ctor.maxStack=2;n.methods.add(ctor);
        Map<String,String> map=new HashMap<>();map.put(n.name,subject);
        Map<String,Class<?>> types=Map.ofEntries(
                Map.entry(PatchGatewayBossDimension.REGISTRY,Registry.class),Map.entry(PatchGatewayBossDimension.LEVEL,Level.class),
                Map.entry(PatchGatewayBossDimension.RANDOM,RandomSource.class),Map.entry(PatchGatewayBossDimension.RULES,Rules.class),
                Map.entry(PatchGatewayBossDimension.PROVIDER,Provider.class),Map.entry("net/minecraft/world/entity/LivingEntity",Living.class),
                Map.entry("net/minecraft/world/entity/Mob",Mob.class),Map.entry("net/minecraft/core/BlockPos",Pos.class),
                Map.entry("net/minecraft/world/level/ServerLevelAccessor",Accessor.class),
                Map.entry("dev/shadowsoffire/apotheosis/adventure/boss/ApothBoss",Boss.class));
        for (var entry:types.entrySet()) map.put(entry.getKey(),Type.getInternalName(entry.getValue()));
        ClassWriter w=new ClassWriter(0);n.accept(new ClassRemapper(w,new SimpleRemapper(map)));
        return new Loader().define(w.toByteArray());
    }
    static Mob create(Class<?> c,Level level,Boss explicit) throws Exception {
        Supplier<Boss> supplier=() -> explicit;
        Object obj=c.getConstructor(Optional.class,Supplier.class).newInstance(
                explicit==null?Optional.empty():Optional.of(explicit.id),supplier);
        return (Mob)c.getMethod("createEntity",Level.class).invoke(obj,level);
    }
    public static void run(byte[] original,byte[] patched) throws Exception {
        Class<?> before=subject(original,"GatewayBossBefore"),after=subject(patched,"GatewayBossAfter");
        Boss endA=new Boss("end_a",2,"minecraft:the_end"),endB=new Boss("end_b",5,"minecraft:the_end");
        Boss nether=new Boss("nether",1000,"minecraft:the_nether"),asteroid=new Boss("asteroid",1000,"sdbf:asteroid_belt");
        Registry.INSTANCE.entries=List.of(nether,endA,asteroid,endB);
        int a=0,b=0;
        for (int i=0;i<70;i++) {
            Level level=new Level("minecraft:the_end");level.f_46441_.offset=i;
            Mob mob=create(after,level,null);
            check(mob.template==endA || mob.template==endB,"End rejects other-dimension bosses");
            if (mob.template==endA) a++;else b++;
        }
        check(a==20 && b==50,"eligible boss weight ratio preserved");
        check(Registry.INSTANCE.globals==0 && Registry.INSTANCE.scoped==70,"no global fallback in random path");
        Level other=new Level("sdbf:asteroid_belt");
        check(create(after,other,null).template==asteroid,"current world dimension is read at creation");
        Registry.INSTANCE.entries=List.of(nether);
        check(create(before,new Level("minecraft:the_end"),null).template==nether,"reproduces upstream cross-dimension selection");
        check(create(after,new Level("minecraft:the_end"),null)==null,"empty current-dimension pool does not fall back globally");
        check(create(after,new Level("minecraft:the_end"),nether).template==nether,"explicit boss path unchanged");
        Boss unrestricted=new Boss("anywhere",1);
        Registry.INSTANCE.entries=List.of(unrestricted);
        check(create(after,new Level("minecraft:the_end"),null).template==unrestricted,"unrestricted bosses follow Placebo's existing rule");
    }
}
