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

/** Applies Placebo's existing dimension predicate to random Apotheosis gateway bosses. */
public final class PatchGatewayBossDimension implements Opcodes {
    static final String OWNER = "dev/shadowsoffire/apotheosis/adventure/compat/GatewaysCompat$BossWaveEntity";
    static final String REGISTRY = "dev/shadowsoffire/apotheosis/adventure/boss/BossRegistry";
    static final String RULES = "dev/shadowsoffire/placebo/reload/WeightedDynamicRegistry$IDimensional";
    static final String LEVEL = "net/minecraft/world/level/Level";
    static final String RANDOM = "net/minecraft/util/RandomSource";
    static final String PROVIDER = "dev/shadowsoffire/placebo/codec/CodecProvider";
    static final String PREDICATE = "java/util/function/Predicate";
    static int checks;
    static void check(boolean ok, String why) { if (!ok) throw new AssertionError(why); checks++; }
    static String sha(byte[] b) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(b));
    }
    static ClassNode node(byte[] b) { ClassNode n=new ClassNode(); new ClassReader(b).accept(n,0); return n; }
    static byte[] bytes(ClassNode n) { ClassWriter w=new ClassWriter(0); n.accept(w); return w.toByteArray(); }
    static byte[] patch(byte[] original) throws Exception {
        check(sha(original).equals("668fe669f029ea2f091b1a5bafbd50ccca1698f729c1ba777ef3937b40bf3f38"), "supported original Apotheosis gateway class");
        ClassNode n=node(original);
        MethodNode m=n.methods.stream().filter(v -> v.name.equals("createEntity")
                && v.desc.equals("(L"+LEVEL+";)Lnet/minecraft/world/entity/LivingEntity;")).findFirst().orElseThrow();
        List<MethodInsnNode> calls=Arrays.stream(m.instructions.toArray())
                .filter(i -> i instanceof MethodInsnNode call && call.owner.equals(REGISTRY)
                        && call.name.equals("getRandomItem") && call.desc.equals("(L"+RANDOM+";)L"+PROVIDER+";"))
                .map(i -> (MethodInsnNode)i).toList();
        check(calls.size()==1, "one global random-boss selection call");
        MethodInsnNode call=calls.get(0);
        String originalDesc=call.desc;
        int originalStack=m.maxStack;
        InsnList filter=new InsnList();
        filter.add(new InsnNode(FCONST_0)); // Same zero luck as upstream's one-argument overload.
        filter.add(new InsnNode(ICONST_1));
        filter.add(new TypeInsnNode(ANEWARRAY,PREDICATE));
        filter.add(new InsnNode(DUP));
        filter.add(new InsnNode(ICONST_0));
        filter.add(new VarInsnNode(ALOAD,1));
        filter.add(new MethodInsnNode(INVOKESTATIC,RULES,"matches","(L"+LEVEL+";)Ljava/util/function/Predicate;",true));
        filter.add(new InsnNode(AASTORE));
        AbstractInsnNode[] additions=filter.toArray();
        m.instructions.insertBefore(call,filter);
        call.desc="(L"+RANDOM+";F[Ljava/util/function/Predicate;)L"+PROVIDER+";";
        m.maxStack=Math.max(m.maxStack,7);
        new Analyzer<>(new BasicVerifier()).analyze(n.name,m);
        byte[] patched=bytes(n);
        for (AbstractInsnNode i:additions) m.instructions.remove(i);
        call.desc=originalDesc; m.maxStack=originalStack;
        check(Arrays.equals(bytes(n),bytes(node(original))), "only random selection changed; explicit bosses and null handling preserved");
        return patched;
    }
    static byte[] roundTrip(byte[] original, byte[] patched, Path build) throws Exception {
        Path scratch=Files.createTempDirectory(build,"hotai-roundtrip-");
        Path source=scratch.resolve(OWNER+".class");
        Files.createDirectories(source.getParent()); Files.write(source,patched);
        byte[] first=bytes(new BytecodeTransformer(scratch,Map.of(OWNER,patched)).transform(node(original),null));
        Path diffPath=scratch.resolve(OWNER+".badiff");
        check(!Files.exists(source) && Files.isRegularFile(diffPath), "HotAI first-load conversion");
        MemoryDiff diff=new MemoryDiff();
        try (var input=Files.newInputStream(diffPath)) { diff.deserialize(DefaultSerialization.newInstance(),input); }
        byte[] restart=bytes(new DiffTransformer(Map.of(OWNER,diff)).transform(node(original),null));
        check(Arrays.equals(first,patched) && Arrays.equals(restart,patched), "HotAI first load and restart parity");
        return restart;
    }
    public static void main(String[] args) throws Exception {
        Path root=Path.of(args[0]),build=Path.of(args[1]);
        byte[] original;
        try (JarFile jar=new JarFile(root.resolve("mods/Apotheosis-1.20.1-7.4.8.jar").toFile())) {
            original=jar.getInputStream(jar.getJarEntry(OWNER+".class")).readAllBytes();
        }
        byte[] patched=roundTrip(original,patch(original),build);
        TestGatewayBossDimension.run(original,patched);
        Path output=build.resolve("release/hotai/"+OWNER+".class");
        Files.createDirectories(output.getParent()); Files.write(output,patched);
        String result="PASS "+checks+" structural/HotAI checks; "+TestGatewayBossDimension.checks+" executed behavior checks.\n"
                +"Original class SHA256: "+sha(original)+"\nPatched class SHA256: "+sha(patched)+"\n"
                +"Actual createEntity bytecode executed; Minecraft/Placebo boundary objects are fixtures.\n"
                +"Full Minecraft runtime not launched.\n";
        Files.writeString(build.resolve("verification-results.txt"),result);
        System.out.print(result);
    }
}
