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

public final class PatchInsolator implements Opcodes {
    static final String OWNER="cofh/thermal/expansion/common/block/entity/machine/MachineInsolatorBlockEntity";
    static final String RECIPE="cofh/thermal/lib/util/recipes/internal/IMachineRecipe";
    static final String FLUID="net/minecraftforge/fluids/FluidStack";
    static int checks;
    static void check(boolean ok,String why){if(!ok)throw new AssertionError(why);checks++;}
    static String sha(byte[] b)throws Exception{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(b));}
    static ClassNode node(byte[] b){ClassNode n=new ClassNode();new ClassReader(b).accept(n,0);return n;}
    static byte[] bytes(ClassNode n){ClassWriter w=new ClassWriter(ClassWriter.COMPUTE_MAXS);n.accept(w);return w.toByteArray();}
    static byte[] patch(byte[] original,byte[] support)throws Exception{
        check(sha(original).equals("8c78442e4ab98ad0ef3c2c79fcac132e56d12e1465cb48ca5def8c40cce8a1e2"),"supported Thermal Expansion machine class");
        ClassNode n=node(original),helper=new ClassNode();
        new ClassReader(support).accept(new ClassRemapper(helper,new SimpleRemapper("InsolatorHydrogenSupport",OWNER)),0);
        for(MethodNode method:helper.methods)if(!method.name.equals("<init>")){
            check(method.name.startsWith("sdbf$"),"only namespaced helper methods embedded");
            check(n.methods.stream().noneMatch(m->m.name.equals(method.name)),"helper does not conflict");
            n.methods.add(method);
            for(var i:method.instructions)if(i instanceof MethodInsnNode c && c.owner.startsWith("net/minecraft/"))
                check(c.name.equals("<init>"),"no named Minecraft member needs reobfuscation");
        }
        MethodNode constructor=n.methods.stream().filter(m->m.name.equals("<init>")).findFirst().orElseThrow();
        int replacements=0;
        for(var i:constructor.instructions.toArray())if(i instanceof FieldInsnNode f && f.owner.equals("cofh/core/util/helpers/FluidHelper") && f.name.equals("IS_WATER")){
            constructor.instructions.set(f,new MethodInsnNode(INVOKESTATIC,OWNER,"sdbf$allowedFluid","()Ljava/util/function/Predicate;",false));replacements++;
        }
        check(replacements==1,"one machine-tank validator changed");
        MethodNode cache=n.methods.stream().filter(m->m.name.equals("cacheRecipe") && m.desc.equals("()Z")).findFirst().orElseThrow();
        int returns=0;
        for(var i:cache.instructions.toArray())if(i.getOpcode()==IRETURN){
            InsnList b=new InsnList();
            b.add(new VarInsnNode(ALOAD,0));b.add(new FieldInsnNode(GETFIELD,OWNER,"curRecipe","L"+RECIPE+";"));
            b.add(new VarInsnNode(ALOAD,0));b.add(new FieldInsnNode(GETFIELD,OWNER,"waterTank","Lcofh/lib/common/fluid/FluidStorageCoFH;"));
            b.add(new MethodInsnNode(INVOKEVIRTUAL,"cofh/lib/common/fluid/FluidStorageCoFH","getFluidStack","()L"+FLUID+";",false));
            b.add(new MethodInsnNode(INVOKESTATIC,OWNER,"sdbf$fluidMatches","(L"+RECIPE+";L"+FLUID+";)Z",false));
            b.add(new InsnNode(IAND));cache.instructions.insertBefore(i,b);returns++;
        }
        check(returns==1,"one cache-return fluid check installed");
        byte[] patched=bytes(n);
        for(var m:node(patched).methods)if((m.access&(ACC_ABSTRACT|ACC_NATIVE))==0)new Analyzer<>(new BasicVerifier()).analyze(n.name,m);
        check(true,"all methods pass ASM verification");
        // All original methods apart from the constructor/cache handler remain exactly as upstream.
        ClassNode old=node(original),fresh=node(patched);
        for(var method:old.methods)if(!method.name.equals("<init>")&&!method.name.equals("cacheRecipe")){
            var next=fresh.methods.stream().filter(m->m.name.equals(method.name)&&m.desc.equals(method.desc)).findFirst().orElseThrow();
            ClassNode a=new ClassNode(),b=new ClassNode();a.version=b.version=V17;a.access=b.access=ACC_PUBLIC;a.name=b.name="Comparison";a.superName=b.superName="java/lang/Object";
            a.methods.add(method);b.methods.add(next);check(Arrays.equals(bytes(a),bytes(b)),"unchanged method "+method.name);
        }
        return patched;
    }
    static byte[] roundTrip(byte[] original,byte[] patched,Path build)throws Exception{
        Path scratch=Files.createTempDirectory(build,"hotai-roundtrip-");
        Path source=scratch.resolve(OWNER+".class");Files.createDirectories(source.getParent());Files.write(source,patched);
        byte[] first=bytes(new BytecodeTransformer(scratch,Map.of(OWNER,patched)).transform(node(original),null));
        MemoryDiff diff=new MemoryDiff();
        try(var input=Files.newInputStream(scratch.resolve(OWNER+".badiff"))){diff.deserialize(DefaultSerialization.newInstance(),input);}
        byte[] restart=bytes(new DiffTransformer(Map.of(OWNER,diff)).transform(node(original),null));
        check(!Files.exists(source)&&Arrays.equals(first,patched)&&Arrays.equals(restart,patched),"real HotAI first-load/restart parity");
        return patched;
    }
    public static void main(String[] args)throws Exception{
        Path root=Path.of(args[0]),build=Path.of(args[1]);byte[] original;
        try(JarFile jar=new JarFile(root.resolve("mods/thermal_expansion-1.20.1-11.0.1.29.jar").toFile())){original=jar.getInputStream(jar.getJarEntry(OWNER+".class")).readAllBytes();}
        byte[] support=Files.readAllBytes(build.resolve("builder/InsolatorHydrogenSupport.class"));
        byte[] patched=roundTrip(original,patch(original,support),build);
        try(JarFile core=new JarFile(build.resolve("thermal_core.jar").toFile())){
            TestInsolator.baseMachine=core.getInputStream(core.getJarEntry("cofh/thermal/lib/common/block/entity/MachineBlockEntity.class")).readAllBytes();
        }
        TestInsolator.run(patched);
        Path output=build.resolve("release/hotai/"+OWNER+".class");Files.createDirectories(output.getParent());Files.write(output,patched);
        String report="PASS: "+checks+" structural/HotAI checks, "+TestInsolator.checks+" executed behavior checks.\nOriginal SHA-256: "+sha(original)+"\nPatched SHA-256: "+sha(patched)+"\nMinecraft not launched; runtime bytecode executed with fixtures.\n";
        Files.writeString(build.resolve("verification-results.txt"),report);System.out.print(report);
    }
}
