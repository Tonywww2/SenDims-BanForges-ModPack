import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;
import it.unimi.dsi.fastutil.longs.*;
import java.lang.management.ManagementFactory;
import java.lang.reflect.*;
import java.lang.reflect.Method;
import com.sun.management.ThreadMXBean;
import java.nio.file.*;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Stream;

/** Executes original and patched method bytecode against the same deterministic worlds. */
public final class TestTreeExtractor implements Opcodes {
    static int checks;
    static void check(boolean ok,String why){if(!ok)throw new AssertionError(why);checks++;}
    static final Map<String,String> TYPES=new HashMap<>();
    static void type(String name,Class<?> fixture){TYPES.put(name,org.objectweb.asm.Type.getInternalName(fixture));}
    static {
        type("net/minecraft/core/Vec3i",Vec.class);type("net/minecraft/core/BlockPos",Pos.class);type("net/minecraft/core/BlockPos$MutableBlockPos",Mutable.class);
        type("net/minecraft/core/Direction",Dir.class);type("net/minecraft/core/Direction$Plane",Plane.class);
        type("net/minecraft/world/level/Level",World.class);type("net/minecraft/world/level/LevelReader",World.class);type("net/minecraft/world/level/block/state/BlockState",State.class);
        type("net/minecraft/world/level/block/Block",Block.class);type("net/minecraft/world/level/block/Blocks",Blocks.class);
        type("net/minecraftforge/fluids/FluidStack",Fluid.class);type("cofh/lib/common/block/BlockIngredient",Ingredient.class);
        type("cofh/thermal/core/util/recipes/device/TreeExtractorMapping",Mapping.class);type("cofh/thermal/core/util/managers/device/TreeExtractorManager",Manager.class);
        type(PatchTreeExtractor.OWNER+"$TreeInfo",Info.class);type("cofh/thermal/lib/common/block/entity/DeviceBlockEntity",Base.class);
    }
    static Class<?> executable(byte[] bytes,String name)throws Exception{
        ClassNode source=PatchTreeExtractor.node(bytes),n=new ClassNode();n.version=V17;n.access=ACC_PUBLIC;n.name=source.name;n.superName=source.superName;
        Set<String> fields=Set.of("cached","logs","leaves","recipe","timeConstant","TRUNK_SEARCH");
        for(FieldNode f:source.fields)if(fields.contains(f.name)||f.name.startsWith("sdbf$")){f.access&=~ACC_FINAL;n.fields.add(f);}
        Set<String> methods=Set.of("updateValidity","updateActiveState","isValid","detectTree","detectTreeDirection","distManhattan","getTimeConstant","isTreeExtractor");
        for(MethodNode m:source.methods)if(methods.contains(m.name)||m.name.startsWith("sdbf$")||m.name.startsWith("lambda$detectTree")||m.name.startsWith("lambda$updateValidity"))n.methods.add(m);
        MethodNode init=new MethodNode(ACC_PUBLIC,"<init>","()V",null,null);
        init.instructions.add(new VarInsnNode(ALOAD,0));init.instructions.add(new MethodInsnNode(INVOKESPECIAL,n.superName,"<init>","()V",false));init.instructions.add(new InsnNode(RETURN));n.methods.add(init);
        ClassWriter writer=new ClassWriter(ClassWriter.COMPUTE_MAXS);
        n.accept(new ClassRemapper(writer,new Remapper(){
            public String map(String s){return s.equals(PatchTreeExtractor.OWNER)?name:TYPES.getOrDefault(s,s);}
            public String mapMethodName(String owner,String method,String desc){return PatchTreeExtractor.SRG_TO_OFFICIAL.getOrDefault(method,method);}
            public String mapFieldName(String owner,String field,String desc){return PatchTreeExtractor.SRG_TO_OFFICIAL.getOrDefault(field,field);}
        }));
        Class<?> c=new ClassLoader(TestTreeExtractor.class.getClassLoader()){Class<?> define(){byte[] b=writer.toByteArray();return defineClass(name,b,0,b.length);}}.define();
        field(c,"timeConstant").setInt(null,500);
        field(c,"TRUNK_SEARCH").set(null,new Vec[]{new Vec(0,0,0),new Vec(1,0,0),new Vec(-1,0,1),new Vec(-1,0,-1),new Vec(1,0,-1),new Vec(1,0,0),new Vec(0,0,2),new Vec(-2,0,0),new Vec(0,0,-2)});
        return c;
    }
    static Field field(Class<?> c,String name)throws Exception{Field f=c.getDeclaredField(name);f.setAccessible(true);return f;}
    static Method method(Class<?> c,String name,Class<?>... types)throws Exception{Method m=c.getDeclaredMethod(name,types);m.setAccessible(true);return m;}
    static Base machine(Class<?> c,World world,Pos pos)throws Exception{
        Base b=(Base)c.getConstructor().newInstance();b.level=world;b.worldPosition=pos;
        field(c,"logs").set(b,new Pos[0]);field(c,"leaves").set(b,new Pos[0]);return b;
    }
    static Info scan(Class<?> c,Base b,Mapping[] mappings,Pos pos,Dir growth)throws Exception{return (Info)method(c,"detectTreeDirection",Mapping[].class,Pos.class,Dir.class).invoke(b,mappings,pos,growth);}
    static String description(Info info){return info==null?"null":info.recipe.id+"/"+Arrays.toString(info.logs)+"/"+Arrays.toString(info.leaves);}
    static void same(Class<?> old,Class<?> fresh,World world,Mapping[] recipes,Pos base,Dir growth)throws Exception{
        Manager.recipes=List.of(recipes);
        Base a=machine(old,world,base),b=machine(fresh,world,base);
        check(description(scan(old,a,recipes,base,growth)).equals(description(scan(fresh,b,recipes,base,growth))),"exact recipe, trunk path and leaf traversal parity");
        Info ia=(Info)method(old,"detectTree",Pos.class).invoke(a,base),ib=(Info)method(fresh,"detectTree",Pos.class).invoke(b,base);
        check(description(ia).equals(description(ib)),"full detection and up/down priority parity");
    }
    static Mapping mapping(String id,Set<String> logs,Set<String> leaves,int minH,int maxH,int minL,int maxL){return new Mapping(id,new Ingredient(logs),new Ingredient(leaves),null,minH,maxH,minL,maxL);}
    static World tree(int height,Dir growth,int radius){
        World w=new World();Pos p=new Pos(8,0,8);
        for(int i=0;i<height;i++)w.put(p.relative(growth,i),"log");
        Pos top=p.relative(growth,height-1);
        for(int x=-radius;x<=radius;x++)for(int y=-radius;y<=radius;y++)for(int z=-radius;z<=radius;z++)if(Math.abs(x)+Math.abs(y)+Math.abs(z)<=radius){Pos q=top.offset(x,y,z);if(w.get(q).id.equals("air"))w.put(q,"leaf");}
        return w;
    }
    static void run(byte[] original,byte[] patched,Path build)throws Exception{
        Class<?> old=executable(original,"OriginalExtractor"),fresh=executable(patched,"OptimizedExtractor");
        Random random=new Random(0x53444246);
        for(int sample=0;sample<900;sample++){
            int height=1+random.nextInt(36),radius=random.nextInt(7);Dir growth=random.nextBoolean()?Dir.UP:Dir.DOWN;
            World w=tree(height,growth,radius);int count=1+random.nextInt(7);Mapping[] recipes=new Mapping[count];
            for(int i=0;i<count;i++)recipes[i]=mapping("r"+i,random.nextBoolean()?Set.of("log"):Set.of("log","altlog"),random.nextBoolean()?Set.of("leaf"):Set.of("leaf","otherleaf"),1+random.nextInt(10),10+random.nextInt(20),1+random.nextInt(24),24+random.nextInt(60));
            // Curved/branched trunks, missing leaves, mixed candidate predicates and both growth directions.
            for(int i=0;i<random.nextInt(90);i++)w.put(new Pos(8+random.nextInt(13)-6,random.nextInt(height+14)-7,8+random.nextInt(13)-6),List.of("air","log","altlog","leaf","otherleaf","stone").get(random.nextInt(6)));
            same(old,fresh,w,recipes,new Pos(8,0,8),growth);
        }
        Mapping primary=mapping("primary",Set.of("log"),Set.of("leaf"),4,10,16,24);
        Mapping tie=mapping("tie",Set.of("log"),Set.of("leaf"),4,10,16,24);
        for(Dir growth:new Dir[]{Dir.UP,Dir.DOWN})for(int height:new int[]{1,3,4,10,256,1024})for(int radius:new int[]{0,2,6})same(old,fresh,tree(height,growth,radius),new Mapping[]{primary,tie,primary},new Pos(8,0,8),growth);
        World limits=tree(4,Dir.UP,3);limits.min=0;limits.max=4;same(old,fresh,limits,new Mapping[]{primary},new Pos(8,0,8),Dir.UP);
        Mapping disabled=mapping("disabled",Set.of("log"),Set.of("leaf"),4,10,16,24);disabled.sapling=new Block("sapling",false);
        same(old,fresh,tree(6,Dir.UP,3),new Mapping[]{disabled,primary},new Pos(8,0,8),Dir.UP);
        World stable=tree(12,Dir.UP,4);stable.put(new Pos(7,0,8),"machine");Manager.recipes=List.of(primary);
        Base b=machine(fresh,stable,new Pos(7,0,8));method(fresh,"updateValidity").invoke(b);
        check(field(fresh,"recipe").get(b)==primary,"initial validation finds the original tree");
        stable.reads=0;
        for(int i=0;i<100;i++){method(fresh,"updateValidity").invoke(b);method(fresh,"updateActiveState").invoke(b);}
        check(stable.reads==0,"same-tick repeated neighbors perform no extra block scans");
        stable.time++;method(fresh,"updateActiveState").invoke(b);
        check(stable.reads>0&&!field(fresh,"sdbf$pending").getBoolean(b),"deferred validation executes on the next tick");
        stable.put(new Pos(8,0,8),"air");method(fresh,"sdbf$forceUpdateValidity").invoke(b);
        check(field(fresh,"recipe").get(b)==null,"production bypasses same-tick cache after trunk removal");
        World growing=new World();growing.put(new Pos(7,0,8),"machine");Manager.recipes=List.of(primary);Base pending=machine(fresh,growing,new Pos(7,0,8));method(fresh,"updateValidity").invoke(pending);
        growing.states.putAll(tree(8,Dir.UP,4).states);method(fresh,"updateValidity").invoke(pending);
        check(field(fresh,"recipe").get(pending)==null,"new tree notification coalesces");
        growing.time++;method(fresh,"updateActiveState").invoke(pending);
        check(field(fresh,"recipe").get(pending)==primary,"growth while invalid is not lost");
        int duration=(int)method(fresh,"getTimeConstant").invoke(pending);
        check(duration==750,"one neighboring extractor retains original shared-tree duration");
        growing.put(new Pos(8,0,9),"machine");check((int)method(fresh,"getTimeConstant").invoke(pending)==1000,"extra extractor preserves contention penalty");

        World boundary=tree(8,Dir.UP,6);boundary.allowedChunks=Set.of(World.chunk(0,0));
        // Shift the tree and machine toward the unloaded neighboring chunk.
        Map<Long,State> shifted=new HashMap<>();for(var e:boundary.states.entrySet()){Pos p=Pos.of(e.getKey());shifted.put(p.offset(6,0,0).asLong(),e.getValue());}boundary.states=shifted;
        Mapping broad=mapping("boundary",Set.of("log"),Set.of("leaf"),4,10,16,300);Manager.recipes=List.of(broad);
        Base edge=machine(fresh,boundary,new Pos(13,0,8));method(fresh,"updateValidity").invoke(edge);
        check(boundary.forced==0&&field(fresh,"recipe").get(edge)==null,"unloaded canopy causes no synchronous chunk load or partial production");
        int before=boundary.reads;for(int t=1;t<20;t++){boundary.time=t;method(fresh,"updateActiveState").invoke(edge);}check(boundary.reads==before,"unloaded scans wait twenty ticks before retry");
        boundary.allowedChunks=null;boundary.time=20;method(fresh,"updateActiveState").invoke(edge);
        check(field(fresh,"recipe").get(edge)==broad,"tree resumes after chunk is available");
        boundary.allowedChunks=Set.of(World.chunk(0,0));edge.worldPosition=new Pos(15,0,8);method(fresh,"sdbf$forceUpdateValidity").invoke(edge);
        check(field(fresh,"recipe").get(edge)==null&&boundary.forced==0,"production also invalidates cached trees when the machine's immediate area unloads");
        primary.trunk.fail=true;
        try{method(fresh,"sdbf$forceUpdateValidity").invoke(pending);throw new AssertionError("expected predicate exception");}catch(InvocationTargetException expected){check(expected.getCause() instanceof IllegalStateException,"upstream predicate error propagates");}finally{primary.trunk.fail=false;}
        check(!field(fresh,"sdbf$force").getBoolean(pending),"force flag resets even when validation throws");
        benchmark(old,fresh,build);
    }
    static void benchmark(Class<?> old,Class<?> fresh,Path build)throws Exception{
        World w=tree(512,Dir.UP,5);Mapping[] recipes=new Mapping[24];
        for(int i=0;i<recipes.length;i++)recipes[i]=mapping("bench"+i,Set.of("log"),i==23?Set.of("leaf"):Set.of("otherleaf"),4,16,16,200);
        ThreadMXBean bean=(ThreadMXBean)ManagementFactory.getThreadMXBean();bean.setThreadAllocatedMemoryEnabled(true);
        long[] time=new long[2],allocated=new long[2];Class<?>[] classes={old,fresh};
        for(int k=0;k<2;k++){
            Base b=machine(classes[k],w,new Pos(8,0,8));Method m=method(classes[k],"detectTreeDirection",Mapping[].class,Pos.class,Dir.class);Pos base=new Pos(8,0,8);
            for(int i=0;i<120;i++)m.invoke(b,recipes,base,Dir.UP);
            long startBytes=bean.getThreadAllocatedBytes(Thread.currentThread().getId()),start=System.nanoTime();
            for(int i=0;i<240;i++)m.invoke(b,recipes,base,Dir.UP);
            time[k]=(System.nanoTime()-start)/240;allocated[k]=(bean.getThreadAllocatedBytes(Thread.currentThread().getId())-startBytes)/240;
        }
        check(allocated[1]<allocated[0],"actual bytecode benchmark allocates fewer bytes");
        String report="{\"scenario\":\"512 logs, 24 overlapping recipes, radius-five canopy\",\"iterations\":240,\"originalNsPerScan\":"+time[0]+",\"patchedNsPerScan\":"+time[1]+",\"originalBytesPerScan\":"+allocated[0]+",\"patchedBytesPerScan\":"+allocated[1]+"}\n";
        Files.writeString(build.resolve("benchmark.json"),report);System.out.print(report);
    }

    public static class Vec {public int x,y,z;public Vec(int x,int y,int z){this.x=x;this.y=y;this.z=z;}public int getX(){return x;}public int getY(){return y;}public int getZ(){return z;}}
    public static class Pos extends Vec {
        public Pos(int x,int y,int z){super(x,y,z);}public Pos immutable(){return new Pos(x,y,z);}public Mutable mutable(){return new Mutable(x,y,z);}public long asLong(){return ((long)x&0x3FFFFFF)<<38|((long)z&0x3FFFFFF)<<12|(y&0xFFFL);}
        public static int getX(long p){return(int)(p>>38);}public static int getY(long p){return(int)(p<<52>>52);}public static int getZ(long p){return(int)(p<<26>>38);}public static Pos of(long p){return new Pos(getX(p),getY(p),getZ(p));}
        public Pos relative(Dir d){return relative(d,1);}public Pos relative(Dir d,int n){return offset(d.x*n,d.y*n,d.z*n);}public Pos offset(int x,int y,int z){return new Pos(this.x+x,this.y+y,this.z+z);}public static long offset(long p,Dir d){return of(p).relative(d).asLong();}
        public String toString(){return x+","+y+","+z;}
    }
    public static class Mutable extends Pos {public Mutable(int x,int y,int z){super(x,y,z);}public Mutable move(Dir d){x+=d.x;y+=d.y;z+=d.z;return this;}public Mutable move(Vec d){x+=d.x;y+=d.y;z+=d.z;return this;}public Mutable set(long p){x=getX(p);y=getY(p);z=getZ(p);return this;}}
    public enum Dir {DOWN(0,-1,0),UP(0,1,0),NORTH(0,0,-1),SOUTH(0,0,1),WEST(-1,0,0),EAST(1,0,0);final int x,y,z;Dir(int x,int y,int z){this.x=x;this.y=y;this.z=z;}}
    public enum Plane implements Iterable<Dir> {HORIZONTAL;public Iterator<Dir> iterator(){return List.of(Dir.NORTH,Dir.EAST,Dir.SOUTH,Dir.WEST).iterator();}}
    public static class Block {final String id;final boolean survives;Block(String id){this(id,true);}Block(String id,boolean survives){this.id=id;this.survives=survives;}public State defaultBlockState(){return new State(id);} }
    public static class Blocks {public static final Block AIR=new Block("air");}
    static final Map<String,Block> BLOCKS=new HashMap<>();
    public static class State {final String id;State(String id){this.id=id;}public Block getBlock(){return BLOCKS.computeIfAbsent(id,Block::new);}public boolean canSurvive(World level,Pos pos){return !id.equals("sapling");}}
    public static class World {
        public boolean isClientSide;long time;int min=-2048,max=2048,reads,forced;Map<Long,State> states=new HashMap<>();Set<Long> allowedChunks;
        static long chunk(int x,int z){return (long)x<<32^(z&0xFFFFFFFFL);}public boolean hasChunkAt(Pos p){return allowedChunks==null||allowedChunks.contains(chunk(p.x>>4,p.z>>4));}
        public boolean isOutsideBuildHeight(Pos p){return p.y<min||p.y>=max;}public int getMinBuildHeight(){return min;}public int getMaxBuildHeight(){return max;}public long getGameTime(){return time;}
        public boolean isAreaLoaded(Pos p,int radius){return hasChunkAt(p.offset(radius,0,radius))&&hasChunkAt(p.offset(-radius,0,-radius));}
        public State getBlockState(Pos p){reads++;if(isOutsideBuildHeight(p))return new State("air");if(!hasChunkAt(p))forced++;return get(p);}
        State get(Pos p){return states.getOrDefault(p.asLong(),new State("air"));}void put(Pos p,String id){states.put(p.asLong(),new State(id));}
    }
    public static class Ingredient implements Predicate<State> {final Set<String> accepted;boolean fail;Ingredient(Set<String> accepted){this.accepted=accepted;}public boolean test(State state){if(fail)throw new IllegalStateException("fixture predicate");return accepted.contains(state.id);}}
    public static class Fluid {public static final Fluid EMPTY=new Fluid();}
    public static class Mapping {
        final String id;final Ingredient trunk,leaves;Block sapling;final int minH,maxH,minL,maxL;final Fluid fluid=new Fluid();
        Mapping(String id,Ingredient trunk,Ingredient leaves,Block sapling,int minH,int maxH,int minL,int maxL){this.id=id;this.trunk=trunk;this.leaves=leaves;this.sapling=sapling;this.minH=minH;this.maxH=maxH;this.minL=minL;this.maxL=maxL;}
        public Ingredient getTrunk(){return trunk;}public Ingredient getLeaves(){return leaves;}public Block getSapling(){return sapling;}public Fluid getFluid(){return fluid;}public int getMinHeight(){return minH;}public int getMaxHeight(){return maxH;}public int getMinLeaves(){return minL;}public int getMaxLeaves(){return maxL;}
    }
    public static class Manager {static List<Mapping> recipes=List.of();public static Manager instance(){return new Manager();}public Stream<Mapping> getRecipes(){return recipes.stream();}}
    public static class Info {
        public final Mapping recipe;public final Pos[] logs,leaves;
        public Info(Mapping recipe,Collection<Pos> logs,LongCollection leaves){this.recipe=recipe;this.logs=logs.toArray(new Pos[0]);this.leaves=leaves.longStream().limit(recipe.maxL).mapToObj(Pos::of).toArray(Pos[]::new);}
        public Mapping recipe(){return recipe;}public Pos[] logs(){return logs;}public Pos[] leaves(){return leaves;}
    }
    public static class Base {
        public World level;public Pos worldPosition;public Fluid renderFluid=Fluid.EMPTY;public boolean isActive;
        public Base(){}protected boolean isValid(){return false;}protected void updateActiveState(){isActive=isValid();}protected Dir[] getSearchOrder(){return new Dir[]{Dir.EAST,Dir.SOUTH,Dir.NORTH};}public State getBlockState(){return new State("machine");}
    }
}
