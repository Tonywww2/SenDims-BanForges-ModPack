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

public final class PatchSkyblockLightning implements Opcodes {
    static final String OWNER="de/melanx/skyblockbuilder/EventListener";
    static final String EVENT="net/minecraftforge/event/entity/EntityJoinLevelEvent";
    static final String LEVEL="net/minecraft/world/level/Level";
    static final String SERVER="net/minecraft/server/level/ServerLevel";
    static int checks;
    static void check(boolean ok,String why){if(!ok)throw new AssertionError(why);checks++;}
    static String sha(byte[] b)throws Exception{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(b));}
    static ClassNode node(byte[] b){ClassNode n=new ClassNode();new ClassReader(b).accept(n,0);return n;}
    static byte[] bytes(ClassNode n){ClassWriter w=new ClassWriter(ClassWriter.COMPUTE_MAXS);n.accept(w);return w.toByteArray();}
    static byte[] patch(byte[] original)throws Exception{
        check(sha(original).equals("d2c8c39d3b47d8142e7ea7c6356ddf87fc0edec0dd9d618084cf08cb1fdd5ea0"),"exact supported SkyblockBuilder 5.1.33 class");
        ClassNode n=node(original);
        MethodNode m=n.methods.stream().filter(x->x.name.equals("onEntityJoinLevel")&&x.desc.equals("(L"+EVENT+";)V")).findFirst().orElseThrow();
        check((m.access&ACC_STATIC)!=0,"static Forge event handler");
        check(Arrays.stream(m.instructions.toArray()).filter(i->i instanceof TypeInsnNode t&&t.getOpcode()==CHECKCAST&&t.desc.equals(SERVER)).count()==1,"original unsafe ServerLevel cast found");
        LabelNode resume=new LabelNode();InsnList guard=new InsnList();
        guard.add(new VarInsnNode(ALOAD,0));
        guard.add(new MethodInsnNode(INVOKEVIRTUAL,EVENT,"getLevel","()L"+LEVEL+";",false));
        guard.add(new TypeInsnNode(INSTANCEOF,SERVER));
        guard.add(new JumpInsnNode(IFNE,resume));
        guard.add(new InsnNode(RETURN));
        guard.add(resume);guard.add(new FrameNode(F_SAME,0,null,0,null));
        AbstractInsnNode[] added=guard.toArray();m.instructions.insert(guard);
        byte[] patched=bytes(n);
        for(MethodNode method:node(patched).methods)if((method.access&(ACC_ABSTRACT|ACC_NATIVE))==0)new Analyzer<>(new BasicVerifier()).analyze(OWNER,method);
        check(true,"all class methods pass ASM verification");
        for(AbstractInsnNode i:added)m.instructions.remove(i);
        check(Arrays.equals(bytes(n),bytes(node(original))),"only the leading server-world guard changed; all original code and annotations preserved");
        return patched;
    }
    static void roundTrip(byte[] original,byte[] patched,Path build)throws Exception{
        Path scratch=Files.createTempDirectory(build,"hotai-roundtrip-");
        Path source=scratch.resolve(OWNER+".class");Files.createDirectories(source.getParent());Files.write(source,patched);
        byte[] first=bytes(new BytecodeTransformer(scratch,Map.of(OWNER,patched)).transform(node(original),null));
        Path diffPath=scratch.resolve(OWNER+".badiff");
        check(!Files.exists(source)&&Files.isRegularFile(diffPath),"HotAI class-to-diff conversion");
        MemoryDiff diff=new MemoryDiff();try(var in=Files.newInputStream(diffPath)){diff.deserialize(DefaultSerialization.newInstance(),in);}
        byte[] restarted=bytes(new DiffTransformer(Map.of(OWNER,diff)).transform(node(original),null));
        check(Arrays.equals(first,patched)&&Arrays.equals(restarted,patched),"real HotAI first-load/restart bytecode parity");
    }
    public static void main(String[] args)throws Exception{
        Path root=Path.of(args[0]),build=Path.of(args[1]);byte[] original;
        try(JarFile jar=new JarFile(root.resolve("mods/SkyblockBuilder-1.20.1-5.1.33.jar").toFile())){original=jar.getInputStream(jar.getJarEntry(OWNER+".class")).readAllBytes();}
        byte[] patched=patch(original);roundTrip(original,patched,build);TestSkyblockLightning.run(original,patched);
        Path output=build.resolve("release/hotai/"+OWNER+".class");Files.createDirectories(output.getParent());Files.write(output,patched);
        String report="PASS: "+checks+" structural/HotAI checks, "+TestSkyblockLightning.checks+" executed behavior checks.\nOriginal SHA-256: "+sha(original)+"\nPatched SHA-256: "+sha(patched)+"\nClient lightning crash reproduced using original method bytecode. Server behavior compared against original.\nMinecraft boundary objects use fixtures; no full game launched.\n";
        Files.writeString(build.resolve("verification-results.txt"),report);System.out.print(report);
    }
}
