import java.lang.reflect.*;
import java.util.*;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.ClassRemapper;
import org.objectweb.asm.commons.SimpleRemapper;
import org.objectweb.asm.tree.*;

public final class TestSkyblockLightning implements Opcodes {
    static int checks;
    static int worldChecks;
    static void check(boolean ok,String why){if(!ok)throw new AssertionError(why);checks++;}
    static final Map<String,String> TYPES=new HashMap<>();
    static void type(String name,Class<?> fixture){TYPES.put(name,org.objectweb.asm.Type.getInternalName(fixture));}
    static {
        type(PatchSkyblockLightning.EVENT,JoinEvent.class);type(PatchSkyblockLightning.LEVEL,Level.class);type(PatchSkyblockLightning.SERVER,ServerLevel.class);
        type("net/minecraft/world/entity/Entity",Entity.class);type("net/minecraft/world/entity/LightningBolt",Lightning.class);
        type("net/minecraft/core/Vec3i",Vec3i.class);type("net/minecraft/core/BlockPos",Pos.class);type("net/minecraft/world/phys/Vec3",Vec.class);
        type("de/melanx/skyblockbuilder/util/WorldUtil",WorldUtil.class);
    }
    static Method executable(byte[] bytes,String name)throws Exception{
        ClassNode original=PatchSkyblockLightning.node(bytes),n=new ClassNode();n.version=V17;n.access=ACC_PUBLIC;n.name=original.name;n.superName="java/lang/Object";
        for(MethodNode m:original.methods)if(m.name.equals("onEntityJoinLevel")||m.name.startsWith("lambda$onEntityJoinLevel$"))n.methods.add(m);
        Map<String,String> map=new HashMap<>(TYPES);map.put(PatchSkyblockLightning.OWNER,name);
        ClassWriter writer=new ClassWriter(ClassWriter.COMPUTE_MAXS);n.accept(new ClassRemapper(writer,new SimpleRemapper(map)));
        Class<?> c=new ClassLoader(TestSkyblockLightning.class.getClassLoader()){Class<?> define(){byte[] b=writer.toByteArray();return defineClass(name,b,0,b.length);}}.define();
        return c.getMethod("onEntityJoinLevel",JoinEvent.class);
    }
    static JoinEvent event(int side,boolean sky,boolean lightning,boolean destination,double x,double z){
        Level level=side==0?new ServerLevel(sky,destination):side==1?new ClientLevel(sky):new Level(sky);
        Entity entity=lightning?new Lightning(new Vec(x,90.5,z)):new Entity();return new JoinEvent(level,entity);
    }
    static String state(JoinEvent e){
        String entity=e.entity instanceof Lightning bolt?bolt.position+"/moves="+bolt.moves:"ordinary";
        return entity+"/worldChecks="+worldChecks+(e.level instanceof ServerLevel server?"/query="+server.query+"/heightCalls="+server.heightCalls+"/searchCalls="+server.searchCalls:"");
    }
    static void run(byte[] original,byte[] patched)throws Exception{
        Method old=executable(original,"OriginalSkyblockLightning"),fresh=executable(patched,"PatchedSkyblockLightning");
        int reproduced=0;
        for(int side=0;side<3;side++)for(boolean sky:new boolean[]{false,true})for(boolean lightning:new boolean[]{false,true})for(boolean destination:new boolean[]{false,true})for(double pos:new double[]{-100.9,-1.2,-0.2,0,1.9,200.5}){
            JoinEvent a=event(side,sky,lightning,destination,pos,-pos),b=event(side,sky,lightning,destination,pos,-pos);
            worldChecks=0;boolean crashed=false;String before="";
            try{old.invoke(null,a);before=state(a);}catch(InvocationTargetException error){check(error.getCause() instanceof ClassCastException,"original known client-level cast crash");crashed=true;reproduced++;}
            worldChecks=0;fresh.invoke(null,b);String after=state(b);
            if(side==0){check(!crashed&&after.equals(before),"server lightning, rod search and relocation exactly match original");}
            else{
                check(worldChecks==0,"non-server event skipped before skyblock/server logic");
                check(!(b.entity instanceof Lightning bolt)||bolt.moves==0,"client lightning not relocated");
                check(crashed==(sky&&lightning),"only original client skyblock lightning path throws");
            }
        }
        check(reproduced==24,"original exception reproduced for every non-server skyblock lightning case");
        worldChecks=0;fresh.invoke(null,new JoinEvent(null,new Lightning(new Vec(0,0,0))));check(worldChecks==0,"invalid null world does not enter server logic");
    }
    public static class Level {final boolean sky;Level(boolean sky){this.sky=sky;}}
    public static class ClientLevel extends Level {ClientLevel(boolean sky){super(sky);}}
    public static class ServerLevel extends Level {
        final boolean destination;int heightCalls,searchCalls;String query;
        ServerLevel(boolean sky,boolean destination){super(sky);this.destination=destination;}
        public int m_5736_(){heightCalls++;return 384;}
        public Optional<Pos> m_143248_(Pos pos){searchCalls++;query=pos.x+","+pos.y+","+pos.z;return destination?Optional.of(new Pos(16,70,-32)):Optional.empty();}
    }
    public static class Entity {}
    public static class Lightning extends Entity {Vec position;int moves;Lightning(Vec pos){position=pos;}public Vec m_20182_(){return position;}public void m_20219_(Vec position){this.position=position;moves++;}}
    public static class Vec3i {int x,y,z;Vec3i(int x,int y,int z){this.x=x;this.y=y;this.z=z;}}
    public static class Pos extends Vec3i {public Pos(int x,int y,int z){super(x,y,z);}}
    public static class Vec {
        public double f_82479_,f_82481_;final double y;
        Vec(double x,double y,double z){f_82479_=x;this.y=y;f_82481_=z;}
        public static Vec m_82539_(Vec3i pos){return new Vec(pos.x+.5,pos.y,pos.z+.5);}
        public String toString(){return f_82479_+","+y+","+f_82481_;}
    }
    public static class JoinEvent {final Level level;final Entity entity;JoinEvent(Level level,Entity entity){this.level=level;this.entity=entity;}public Level getLevel(){return level;}public Entity getEntity(){return entity;}}
    public static class WorldUtil {public static boolean isSkyblock(Level level){worldChecks++;return level.sky;}}
}
