import java.nio.file.*;
import java.lang.reflect.Method;
import java.util.*;
import java.util.jar.JarFile;
import java.util.regex.*;
import com.themahjong.driver.MatchPhase;
import com.themahjong.yaku.*;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;

/** Actual table -> win effects -> advancement grant bytecode, with Minecraft boundaries. */
public final class TestMahjongAdvancements extends TestServerBugs {
    static final String FX = PatchServerBugs.WIN_EFFECTS;
    static final String ADV = "com/riichimahjongforge/mahjongcore/MahjongYakuAdvancements";
    static final Map<Yakuman,String> NATURAL = Map.ofEntries(
        Map.entry(Yakuman.KOKUSHIMUSOU,"kokushi_musou"),Map.entry(Yakuman.SUUANKOU,"suu_ankou"),
        Map.entry(Yakuman.CHUURENPOUTOU,"chuuren_poutou"),Map.entry(Yakuman.DAISANGEN,"daisangen"),
        Map.entry(Yakuman.TSUISOU,"tsuuiisou"),Map.entry(Yakuman.SHOUSUUSHI,"shousuushii"),
        Map.entry(Yakuman.DAISUUSHI,"daisuushii"),Map.entry(Yakuman.RYUUIISOU,"ryuuiisou"),
        Map.entry(Yakuman.CHINROUTOU,"chinroutou"),Map.entry(Yakuman.SUUKANTSU,"suukantsu"),
        Map.entry(Yakuman.RENHOU,"renhou"),Map.entry(Yakuman.CHIHOU,"chiihou"),Map.entry(Yakuman.TENHOU,"tenhou"));
    static final Map<String,String> ORDINARY_ALIASES = Map.ofEntries(
        Map.entry("IIPEIKO","iipeikou"),Map.entry("HAKU","yakuhai_haku"),
        Map.entry("HATSU","yakuhai_hatsu"),Map.entry("CHUN","yakuhai_chun"),
        Map.entry("SEAT_WIND","yakuhai_jikaze"),Map.entry("ROUND_WIND","yakuhai_bakaze"),
        Map.entry("ITTSU","ikkitsuukan"),Map.entry("CHIITOI","chiitoitsu"));
    static Map<String,Advancement> definitions;

    static Map<String,String> mapping(String suffix) {
        Map<String,String> m = new HashMap<>();
        m.put(FX,"AwardEffects"+suffix); m.put(ADV,"AwardAdvancements"+suffix); m.put(TABLE,"AwardTable"+suffix);
        m.put("net/minecraft/server/level/ServerLevel",name(World.class));
        m.put("net/minecraft/server/level/ServerPlayer",name(Winner.class));
        m.put("net/minecraft/server/MinecraftServer",name(Server.class));
        m.put("net/minecraft/server/players/PlayerList",name(Players.class));
        m.put("net/minecraft/server/ServerAdvancementManager",name(AdvancementManager.class));
        m.put("net/minecraft/server/PlayerAdvancements",name(ProgressManager.class));
        m.put("net/minecraft/advancements/Advancement",name(Advancement.class));
        m.put("net/minecraft/advancements/AdvancementProgress",name(Progress.class));
        m.put("net/minecraft/resources/ResourceLocation",name(ResourceId.class));
        m.put("net/minecraft/network/chat/Component",name(Text.class));
        m.put("net/minecraft/network/chat/MutableComponent",name(MutableText.class));
        m.put("net/minecraft/sounds/SoundEvent",name(Sound.class));
        m.put("net/minecraft/sounds/SoundEvents",name(Sounds.class));
        m.put("net/minecraft/sounds/SoundSource",name(SoundChannel.class));
        m.put("net/minecraft/core/BlockPos",name(Position.class));
        m.put("net/minecraft/world/level/block/entity/BlockEntity",name(TableBase.class));
        m.put(TABLE+"$SeatInfo",name(Seat.class));
        m.put("net/minecraftforge/common/MinecraftForge",name(Forge.class));
        m.put("net/minecraftforge/eventbus/api/Event",name(Event.class));
        m.put("net/minecraftforge/eventbus/api/IEventBus",name(Bus.class));
        m.put("com/riichimahjongforge/mahjongcore/MahjongRoundResolvedEvent",name(RoundEvent.class));
        return m;
    }
    static byte[] mapped(ClassNode n, Map<String,String> m) {
        n.innerClasses.clear(); n.nestHostClass=null; n.nestMembers=null;
        ClassWriter w = new ClassWriter(ClassWriter.COMPUTE_MAXS);
        n.accept(new ClassRemapper(w,new SimpleRemapper(m))); return w.toByteArray();
    }
    static ClassNode tableNode(byte[] bytes) {
        ClassNode n=node(bytes); n.interfaces.clear(); n.signature=null;
        n.fields.removeIf(f -> !f.name.equals("seats"));
        n.fields.forEach(f -> f.access=ACC_PUBLIC);
        n.methods.removeIf(m -> !Set.of("playFinalWinEffects","fallbackSeatName").contains(m.name));
        n.methods.forEach(m -> m.access=(m.access & ~ACC_PRIVATE) | ACC_PUBLIC);
        MethodNode ctor=new MethodNode(ACC_PUBLIC,"<init>","()V",null,null);
        ctor.instructions.add(new VarInsnNode(ALOAD,0));
        ctor.instructions.add(new MethodInsnNode(INVOKESPECIAL,n.superName,"<init>","()V",false));
        ctor.instructions.add(new InsnNode(RETURN)); ctor.maxLocals=1;n.methods.add(ctor);
        MethodNode stars=new MethodNode(ACC_PUBLIC|ACC_STATIC,"giveOrDropStars",
            "(Lnet/minecraft/server/level/ServerLevel;Lnet/minecraft/server/level/ServerPlayer;I)V",null,null);
        stars.instructions.add(new VarInsnNode(ALOAD,1));stars.instructions.add(new VarInsnNode(ILOAD,2));
        stars.instructions.add(new MethodInsnNode(INVOKEVIRTUAL,name(Winner.class),"giveStars","(I)V",false));
        stars.instructions.add(new InsnNode(RETURN));stars.maxLocals=3;n.methods.add(stars);
        return n;
    }
    static Class<?> load(Path root,byte[] effects,byte[] table,String suffix) throws Exception {
        Map<String,String> m=mapping(suffix);
        Map<String,byte[]> classes=Map.of(m.get(FX),mapped(node(effects),m),
            m.get(ADV),mapped(node(original(root,"riichi_mahjong_forge-0.2.0.jar",ADV)),m),
            m.get(TABLE),mapped(tableNode(table),m));
        ClassLoader loader=new ClassLoader(TestMahjongAdvancements.class.getClassLoader()) {
            protected Class<?> findClass(String n) throws ClassNotFoundException {
                byte[] b=classes.get(n); if(b==null) throw new ClassNotFoundException(n);
                return defineClass(n,b,0,b.length);
            }
        };
        return loader.loadClass(m.get(TABLE));
    }
    static Map<String,Advancement> readDefinitions(Path root) throws Exception {
        Map<String,Advancement> result=new HashMap<>();
        String prefix="data/riichi_mahjong_forge/advancements/yaku/";
        try(JarFile jar=new JarFile(root.resolve("mods/riichi_mahjong_forge-0.2.0.jar").toFile())) {
            for(var e:Collections.list(jar.entries())) if(e.getName().startsWith(prefix)&&e.getName().endsWith(".json")) {
                String key=e.getName().substring(prefix.length(),e.getName().length()-5);
                Path override=root.resolve("kubejs/"+e.getName());
                String json=Files.exists(override)?Files.readString(override):new String(jar.getInputStream(e).readAllBytes(),java.nio.charset.StandardCharsets.UTF_8);
                check(json.contains("\"earned\""),"data definition uses the criterion awarded by the mod: "+key);
                Matcher matcher=Pattern.compile("kubejs:rewards/yakuman_certificates/([a-z_]+)").matcher(json);
                String reward=matcher.find()?matcher.group(1):null;
                if(reward!=null) {
                    String loot=Files.readString(root.resolve("kubejs/data/kubejs/loot_tables/rewards/yakuman_certificates/"+reward+".json"));
                    check(loot.contains("\"kubejs:yakuman_certificate_"+reward+"\""),"certificate loot exists for "+key);
                }
                result.put(key,new Advancement(key,reward));
            }
        }
        return result;
    }
    static WinResult win(int count,int winner,List<NonYakuman> ordinary,List<Yakuman> natural,int han) {
        List<Integer> deltas=new ArrayList<>(Collections.nCopies(count,-8000));deltas.set(winner,8000*(count-1));
        return new WinResult(ordinary,natural,han,30,0,List.copyOf(deltas));
    }
    static Object table(Class<?> cls,World world,int count) throws Exception {
        Object t=cls.getConstructor().newInstance();List<Seat> seats=new ArrayList<>();
        for(int i=0;i<count;i++) seats.add(new Seat(true,Optional.of(world.server.players.list.get(i).id)));
        // Keep the actual four physical slots even in a three-player game.
        while(seats.size()<4) seats.add(Seat.closed());
        cls.getField("seats").set(t,seats);return t;
    }
    static void finish(Object t,World world,WinResult... results) throws Exception {
        t.getClass().getMethod("playFinalWinEffects",World.class,MatchPhase.RoundEnded.class)
            .invoke(t,world,new MatchPhase.RoundEnded(List.of(results)));
    }
    static Set<String> done(Winner p) { return p.progress.done; }
    public static void main(String[] args) throws Exception {
        Path root=Path.of(args[0]), patches=Path.of(args[1]), scratch=Path.of(args[2]);
        definitions=readDefinitions(root);
        byte[] original=original(root,"riichi_mahjong_forge-0.2.0.jar",FX);
        byte[] patched=hotaiRoundTrip(original,Files.readAllBytes(patches.resolve(FX+".class")),FX,scratch);
        byte[] table=Files.readAllBytes(patches.resolve(TABLE+".class"));
        Class<?> before=load(root,original,table,"Old"), after=load(root,patched,table,"Fixed");
        for(Yakuman y:List.of(Yakuman.DAISANGEN,Yakuman.KOKUSHIMUSOU)) {
            World w=new World(3);finish(table(before,w,3),w,win(3,1,List.of(),List.of(y),13));
            check(done(w.player(1)).equals(Set.of("root","yakuman")),"old code awards only generic yakuman for "+y);
            check(w.player(1).progress.rewards.isEmpty(),"old code delivers no specific certificate");
            check(w.server.players.broadcasts==1,"old code still broadcasts the yakuman");
        }
        System.out.println("PASS original Daisangen/Kokushi failures: broadcast and generic award, no specific advancement");
        check(NATURAL.size()==Yakuman.values().length,"every natural yakuman enum has an independent expected ID");
        for(int count:List.of(3,4)) for(int seat=0;seat<count;seat++) for(Yakuman y:Yakuman.values()) {
            World w=new World(count);Object t=table(after,w,count);Winner winner=w.player(seat);String key=NATURAL.get(y);
            WinResult result=win(count,seat,List.of(),List.of(y),13);
            finish(t,w,result);
            check(done(winner).equals(Set.of("root","yakuman",key)),"specific advancement for "+count+" players, seat "+seat+", "+y);
            check(winner.progress.rewards.equals(List.of(key)),"specific certificate granted once: "+key);
            check(w.server.players.list.stream().allMatch(p -> p==winner || done(p).isEmpty()),"only actual winner gets awards");
            check(w.server.players.broadcasts==1 && w.server.players.list.stream().allMatch(p->p.sounds==1),"broadcast and fanfare unchanged");
            check(winner.stars==13,"existing star delivery unchanged");
            finish(t,w,result);
            check(winner.progress.rewards.equals(List.of(key)),"repeated wins do not repeat first-completion loot");
            check(winner.progress.awards==3,"root and generic criteria not granted twice by the additional call");
        }
        for(NonYakuman y:NonYakuman.values()) {
            World w=new World(3);String key=ORDINARY_ALIASES.getOrDefault(y.name(),y.name().toLowerCase(Locale.ROOT));
            finish(table(after,w,3),w,win(3,1,List.of(y),List.of(),3));
            check(done(w.player(1)).equals(Set.of("root",key)),"ordinary enum ID is valid: "+y);
            check(w.player(1).progress.rewards.isEmpty(),"ordinary yaku does not grant yakuman certificates");
            check(w.server.players.broadcasts==0 && w.player(1).sounds==1,"ordinary sound unchanged");
        }
        World kazoe=new World(4);finish(table(after,kazoe,4),kazoe,win(4,2,List.of(NonYakuman.RIICHI),List.of(),13));
        check(done(kazoe.player(2)).equals(Set.of("root","riichi","kazoe_yakuman")),"counted yakuman remains distinct");
        check(kazoe.player(2).progress.rewards.equals(List.of("kazoe_yakuman")),"counted certificate exactly once");
        World multiple=new World(4);Object mt=table(after,multiple,4);
        finish(mt,multiple,win(4,1,List.of(),List.of(Yakuman.DAISANGEN,Yakuman.TSUISOU),26),
            win(4,2,List.of(),List.of(Yakuman.KOKUSHIMUSOU),13));
        check(done(multiple.player(1)).equals(Set.of("root","yakuman","daisangen","tsuuiisou")),"stacked yakuman awards both types");
        check(done(multiple.player(2)).equals(Set.of("root","yakuman","kokushi_musou")),"second winner gets only own result");
        check(done(multiple.player(0)).isEmpty()&&done(multiple.player(3)).isEmpty(),"nonwinners remain unchanged");
        World offline=new World(3);Object ot=table(after,offline,3);offline.server.players.list.remove(1);
        finish(ot,offline,win(3,1,List.of(),List.of(Yakuman.DAISANGEN),13));
        check(offline.server.players.list.stream().allMatch(p->done(p).isEmpty()),"offline/bot winner awards nobody else");
        check(offline.server.players.broadcasts==1,"offline winner broadcast unchanged");
        World draw=new World(3);finish(table(after,draw,3),draw);
        check(draw.server.players.list.stream().allMatch(p->done(p).isEmpty()),"draw grants nothing");
        // Direct boundary cases accepted by the existing award API: null lists and duplicate names.
        Class<?> fx=after.getClassLoader().loadClass("AwardEffectsFixed");
        Method play=fx.getMethod("playWinEffects",World.class,Winner.class,String.class,int.class,boolean.class,List.class,List.class);
        World direct=new World(3);
        play.invoke(null,direct,direct.player(0),"Winner",13,true,null,List.of("DAISANGEN","daisangen"));
        check(direct.player(0).progress.rewards.equals(List.of("daisangen")),"null ordinary list and duplicate natural keys are safe");
        World unknown=new World(3);
        play.invoke(null,unknown,unknown.player(0),"Winner",0,false,null,null);
        check(done(unknown.player(0)).isEmpty(),"empty lists do not grant anything");
        play.invoke(null,unknown,unknown.player(0),"Winner",13,true,List.of(),List.of("UNKNOWN_YAKU"));
        check(done(unknown.player(0)).equals(Set.of("root","yakuman")),"unknown keys do not grant arbitrary advancements");
        check(unknown.player(0).progress.rewards.isEmpty(),"unknown type cannot produce a certificate");
        System.out.println("PASS all "+checks+" advancement assertions; real table/effects/grant methods, Minecraft grant/loot boundaries are fixtures");
    }

    public record ResourceId(String namespace,String path) {
        public static ResourceId fromNamespaceAndPath(String n,String p){return new ResourceId(n,p);}
    }
    public record Advancement(String key,String reward) {}
    public static class Progress {
        final ProgressManager owner;final Advancement advancement;
        Progress(ProgressManager o,Advancement a){owner=o;advancement=a;}
        public boolean m_8193_(){return owner.done.contains(advancement.key);}
        public Iterable<String> m_8219_(){return m_8193_()?List.of():List.of("earned");}
    }
    public static class ProgressManager {
        public final Set<String> done=new LinkedHashSet<>();public final List<String> rewards=new ArrayList<>();public int awards;
        public Progress m_135996_(Advancement a){return new Progress(this,a);}
        public boolean m_135988_(Advancement a,String criterion){
            if(!criterion.equals("earned")) throw new AssertionError(criterion);
            if(!done.add(a.key)) return false;awards++;if(a.reward!=null)rewards.add(a.reward);return true;
        }
    }
    public static class AdvancementManager {
        public Advancement m_136041_(ResourceId id){return id.namespace.equals("riichi_mahjong_forge")&&id.path.startsWith("yaku/")?definitions.get(id.path.substring(5)):null;}
    }
    public static class Server {
        public final Players players=new Players();public final AdvancementManager advancements=new AdvancementManager();
        public Players m_6846_(){return players;} public AdvancementManager m_129889_(){return advancements;}
    }
    public static class Players {
        public final List<Winner> list=new ArrayList<>();public int broadcasts;
        public Winner m_11259_(UUID id){return list.stream().filter(p->p.id.equals(id)).findFirst().orElse(null);}
        public List<Winner> m_11314_(){return list;}public void m_240416_(Text msg,boolean overlay){broadcasts++;}
    }
    public static class Winner {
        final UUID id;final Server server;final ProgressManager progress=new ProgressManager();int sounds,stars;
        Winner(UUID id,Server server){this.id=id;this.server=server;}
        public Server m_20194_(){return server;}public ProgressManager m_8960_(){return progress;}
        public Text m_7755_(){return new MutableText("Winner");}
        public void m_6330_(Sound sound,SoundChannel channel,float volume,float pitch){sounds++;}
        public void giveStars(int n){stars+=n;}
    }
    public static class World {
        final Server server=new Server();World(int count){for(int i=0;i<count;i++)server.players.list.add(new Winner(new UUID(0,i+1),server));}
        public Server m_7654_(){return server;}Winner player(int seat){return server.players.list.get(seat);}
    }
    public interface Text {
        String getString();
        static MutableText m_237119_(){return new MutableText("");}
        static MutableText m_237115_(String s){return new MutableText(s);}
        static MutableText m_237113_(String s){return new MutableText(s);}
        static MutableText m_237110_(String s,Object[] args){return new MutableText(s);}
        static MutableText m_264568_(String s,String fallback){return new MutableText(s);}
    }
    public static class MutableText implements Text {
        String value;MutableText(String s){value=s;}public String getString(){return value;}
        public MutableText m_7220_(Text other){value+=other.getString();return this;}
    }
    public static class Sound {}
    public enum SoundChannel {MASTER,PLAYERS}
    public static class Sounds {public static final Sound f_11891_=new Sound(),f_11871_=new Sound(),f_12275_=new Sound(),f_12496_=new Sound(),f_12563_=new Sound();}
    public static class Position {}
    public static class TableBase {public Position f_58858_=new Position();}
    public static class Event {}
    public static class RoundEvent extends Event {public RoundEvent(World w,Position p,int han){}}
    public interface Bus {boolean post(Event event);}
    public static class Forge {public static final Bus EVENT_BUS=e->false;}
}
