import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.jar.JarFile;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;
import org.objectweb.asm.tree.analysis.*;
import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;
import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

public final class PatchTreeExtractor implements Opcodes {
    static final String OWNER="cofh/thermal/core/common/block/entity/device/DeviceTreeExtractorBlockEntity";
    static final String DONOR="TreeExtractorOptimized";
    static final Set<String> REPLACED=Set.of("updateValidity","updateActiveState","detectTree","detectTreeDirection","getTimeConstant");
    static final Map<String,String> OFFICIAL_TO_SRG=new HashMap<>(), SRG_TO_OFFICIAL=new HashMap<>();
    static final Map<String,ClassNode> HIERARCHY=new HashMap<>();
    static int checks;
    static void check(boolean ok,String message){if(!ok)throw new AssertionError(message);checks++;}
    static String sha(byte[] b)throws Exception{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(b));}
    static ClassNode node(byte[] b){ClassNode n=new ClassNode();new ClassReader(b).accept(n,0);return n;}
    static byte[] bytes(ClassNode n){ClassWriter w=new ClassWriter(ClassWriter.COMPUTE_MAXS);n.accept(w);return w.toByteArray();}
    static void mappings(Path path)throws Exception{
        String owner="";
        for(String line:Files.readAllLines(path)){
            if(line.startsWith("tsrg2")||line.isBlank()||line.startsWith("\t\t"))continue;
            String[] p=line.trim().split(" +");
            if(!line.startsWith("\t")){owner=p[0];continue;}
            String srg=p[0],official=p[p.length-1],desc=p.length==3?p[1]:"";
            OFFICIAL_TO_SRG.put(owner+"."+official+desc,srg);
            if(srg.startsWith("m_")||srg.startsWith("f_"))SRG_TO_OFFICIAL.put(srg,official);
        }
    }
    static String find(String owner,String name,String desc,Set<String> visited){
        if(owner==null||!visited.add(owner))return null;
        String value=OFFICIAL_TO_SRG.get(owner+"."+name+desc);
        if(value!=null)return value;
        try{
            ClassNode n=HIERARCHY.computeIfAbsent(owner,k->{try{ClassNode x=new ClassNode();new ClassReader(k).accept(x,ClassReader.SKIP_CODE);return x;}catch(Exception e){return new ClassNode();}});
            value=find(n.superName,name,desc,visited);
            if(value!=null)return value;
            for(String it:n.interfaces){value=find(it,name,desc,visited);if(value!=null)return value;}
        }catch(Exception ignored){}
        return null;
    }
    static final Remapper OBFUSCATE=new Remapper(){
        public String map(String name){return name.equals(DONOR)?OWNER:name;}
        public String mapMethodName(String owner,String name,String desc){
            if(!owner.startsWith("net/minecraft/")||name.startsWith("<"))return name;
            String value=find(owner,name,desc,new HashSet<>());
            if(value==null){if(name.equals("isAreaLoaded")||name.equals("values")||name.equals("iterator"))return name;throw new IllegalArgumentException("Unmapped Minecraft method: "+owner+"."+name+desc);}
            return value;
        }
        public String mapFieldName(String owner,String name,String desc){
            if(owner.equals(DONOR)&&(name.equals("level")||name.equals("worldPosition")))return name.equals("level")?"f_58857_":"f_58858_";
            if(!owner.startsWith("net/minecraft/"))return name;
            String value=find(owner,name,"",new HashSet<>());
            if(value==null)throw new IllegalArgumentException("Unmapped Minecraft field: "+owner+"."+name);
            return value;
        }
    };
    static byte[] patch(byte[] original,byte[] donor)throws Exception{
        check(sha(original).equals("042e72b90da89fdf518966167f34143e409e5be462e5c6052f74cdf526329aec"),"exact supported Thermal Core class");
        ClassNode n=node(original),d=new ClassNode();
        new ClassReader(donor).accept(new ClassRemapper(d,OBFUSCATE),0);
        for(FieldNode f:d.fields){check(f.name.startsWith("sdbf$"),"only namespaced fields added");check(n.fields.stream().noneMatch(x->x.name.equals(f.name)),"field does not conflict");n.fields.add(f);}
        int replaced=0;
        for(MethodNode m:d.methods){
            if(m.name.equals("<init>"))continue;
            if((m.access&(ACC_BRIDGE|ACC_SYNTHETIC))==(ACC_BRIDGE|ACC_SYNTHETIC))continue;
            if(REPLACED.contains(m.name)){
                check(n.methods.removeIf(x->x.name.equals(m.name)&&x.desc.equals(m.desc)),"override exists: "+m.name);replaced++;
            }else check(m.name.startsWith("sdbf$"),"only namespaced helper methods added: "+m.name);
            if(m.name.equals("updateActiveState"))for(var i:m.instructions)if(i instanceof MethodInsnNode call&&call.getOpcode()==INVOKESPECIAL&&call.owner.equals(OWNER)&&call.name.equals("updateActiveState"))call.owner=n.superName;
            n.methods.add(m);
        }
        check(replaced==5,"five expensive methods replaced");
        int forced=0;
        for(MethodNode m:n.methods)if(m.name.equals("tickServer"))for(var i:m.instructions)if(i instanceof MethodInsnNode call&&call.owner.equals(OWNER)&&call.name.equals("updateValidity")){call.name="sdbf$forceUpdateValidity";forced++;}
        check(forced==1,"production always forces fresh validation");
        byte[] output=bytes(n);
        for(MethodNode m:node(output).methods)if((m.access&(ACC_ABSTRACT|ACC_NATIVE))==0)new Analyzer<>(new BasicVerifier()).analyze(OWNER,m);
        check(true,"all methods pass ASM verification");
        ClassNode before=node(original),after=node(output);
        for(MethodNode m:before.methods)if(!REPLACED.contains(m.name)){
            MethodNode next=after.methods.stream().filter(x->x.name.equals(m.name)&&x.desc.equals(m.desc)).findFirst().orElseThrow();
            if(m.name.equals("tickServer"))for(var i:next.instructions)if(i instanceof MethodInsnNode call&&call.name.equals("sdbf$forceUpdateValidity"))call.name="updateValidity";
            ClassNode a=new ClassNode(),b=new ClassNode();a.version=b.version=V17;a.access=b.access=ACC_PUBLIC;a.name=b.name="Comparison";a.superName=b.superName="java/lang/Object";a.methods.add(m);b.methods.add(next);
            check(Arrays.equals(bytes(a),bytes(b)),"unchanged upstream method: "+m.name);
        }
        ClassNode patched=node(output);
        MethodNode scan=patched.methods.stream().filter(m->m.name.equals("detectTreeDirection")).findFirst().orElseThrow();
        check(Arrays.stream(scan.instructions.toArray()).noneMatch(i->i instanceof MethodInsnNode call&&call.owner.equals("java/util/Arrays")&&call.name.equals("stream")),"no per-block recipe streams");
        return output;
    }
    static void roundTrip(byte[] original,byte[] patched,Path build)throws Exception{
        Path scratch=Files.createTempDirectory(build,"hotai-roundtrip-");
        Path source=scratch.resolve(OWNER+".class");Files.createDirectories(source.getParent());Files.write(source,patched);
        byte[] first=bytes(new BytecodeTransformer(scratch,Map.of(OWNER,patched)).transform(node(original),null));
        MemoryDiff diff=new MemoryDiff();
        try(var in=Files.newInputStream(scratch.resolve(OWNER+".badiff"))){diff.deserialize(DefaultSerialization.newInstance(),in);}
        byte[] restarted=bytes(new DiffTransformer(Map.of(OWNER,diff)).transform(node(original),null));
        check(!Files.exists(source)&&Arrays.equals(first,patched)&&Arrays.equals(restarted,patched),"actual HotAI initial load and restart parity");
    }
    public static void main(String[] args)throws Exception{
        Path root=Path.of(args[0]),build=Path.of(args[1]);mappings(Path.of(args[2]));
        byte[] original;
        try(JarFile jar=new JarFile(build.resolve("thermal_core.jar").toFile())){original=jar.getInputStream(jar.getJarEntry(OWNER+".class")).readAllBytes();}
        byte[] patched=patch(original,Files.readAllBytes(build.resolve("builder/TreeExtractorOptimized.class")));
        roundTrip(original,patched,build);
        TestTreeExtractor.run(original,patched,build);
        Path output=build.resolve("release/hotai/"+OWNER+".class");Files.createDirectories(output.getParent());Files.write(output,patched);
        String report="PASS: "+checks+" structural/HotAI checks; "+TestTreeExtractor.checks+" differential and behavior checks.\nOriginal SHA-256: "+sha(original)+"\nPatched SHA-256: "+sha(patched)+"\nNo Minecraft process launched.\n";
        Files.writeString(build.resolve("verification-results.txt"),report);System.out.print(report);
    }
}
