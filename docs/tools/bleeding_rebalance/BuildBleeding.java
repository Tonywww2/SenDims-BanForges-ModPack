import com.google.gson.*;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;
import org.objectweb.asm.tree.analysis.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.jar.*;

/** Compile in named mappings, reobfuscate only Minecraft members, merge into installed JAR. */
public final class BuildBleeding {
    static final String PREFIX = "com/tonywww/slashblade_sendims/mixin/lsp/";
    static final List<String> MIXINS = List.of("MixinBloodAccumulationEvent", "MixinBleedingCutting", "MixinDualBladeMain");
    static int checks;
    static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
        checks++;
    }
    static String sha(byte[] bytes) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
    }
    static ClassNode node(byte[] bytes) {
        ClassNode n = new ClassNode(); new ClassReader(bytes).accept(n, 0); return n;
    }
    static final class Srg extends Remapper implements AutoCloseable {
        final Map<String, String> methods = new HashMap<>(), fields = new HashMap<>();
        final Map<String, ClassNode> hierarchy = new HashMap<>();
        final JarFile forge;
        int changed;
        Srg(Path forgePath, Path mapping) throws Exception {
            forge = new JarFile(forgePath.toFile());
            String owner = null;
            for (String line : Files.readAllLines(mapping)) {
                if (line.startsWith("tsrg2 ") || line.isBlank()) continue;
                if (!line.startsWith("\t")) {
                    String[] p = line.split(" "); owner = p[0];
                    check(p[0].equals(p[1]), "Minecraft class mappings remain named: " + p[0]);
                } else if (!line.startsWith("\t\t")) {
                    String[] p = line.trim().split(" ");
                    if (p.length == 2) fields.put(owner + "." + p[0], p[1]);
                    else if (p.length == 3) methods.put(owner + "." + p[0] + p[1], p[2]);
                }
            }
        }
        ClassNode type(String owner) {
            if (!hierarchy.containsKey(owner)) {
                var entry = forge.getJarEntry(owner + ".class");
                try {
                    if (entry == null) hierarchy.put(owner, null);
                    else {
                        ClassNode n = new ClassNode();
                        new ClassReader(forge.getInputStream(entry)).accept(n, ClassReader.SKIP_CODE | ClassReader.SKIP_DEBUG | ClassReader.SKIP_FRAMES);
                        hierarchy.put(owner, n);
                    }
                } catch (Exception e) { throw new IllegalStateException(owner, e); }
            }
            return hierarchy.get(owner);
        }
        String resolve(String owner, String member, Map<String,String> mappings) {
            String value = mappings.get(owner + "." + member);
            if (value != null) return value;
            ClassNode n = type(owner);
            if (n == null) return null;
            if (n.superName != null) { value = resolve(n.superName, member, mappings); if (value != null) return value; }
            for (String itf : n.interfaces) { value = resolve(itf, member, mappings); if (value != null) return value; }
            return null;
        }
        @Override public String mapMethodName(String owner, String name, String desc) {
            if (!owner.startsWith("net/minecraft/") || name.startsWith("<")) return name;
            String value = resolve(owner, name + desc, methods);
            if (value != null && !value.equals(name)) changed++;
            return value == null ? name : value;
        }
        @Override public String mapFieldName(String owner, String name, String desc) {
            if (!owner.startsWith("net/minecraft/")) return name;
            String value = resolve(owner, name, fields);
            if (value != null && !value.equals(name)) changed++;
            return value == null ? name : value;
        }
        @Override public void close() throws Exception { forge.close(); }
    }
    public static void main(String[] args) throws Exception {
        Path named = Path.of(args[0]), input = Path.of(args[3]), output = Path.of(args[4]);
        Map<String,byte[]> replacements = new LinkedHashMap<>();
        try (Srg srg = new Srg(Path.of(args[1]), Path.of(args[2]))) {
            for (String name : MIXINS) {
                byte[] compiled = Files.readAllBytes(named.resolve(PREFIX + name + ".class"));
                ClassNode n = node(compiled);
                check(n.version == Opcodes.V17, "Java 17 bytecode: " + name);
                for (MethodNode m : n.methods) new Analyzer<>(new BasicVerifier()).analyze(n.name, m);
                check(true, "ASM verifies " + name);
                ClassWriter writer = new ClassWriter(0);
                new ClassReader(compiled).accept(new ClassRemapper(writer, srg), 0);
                byte[] runtime = writer.toByteArray();
                ClassNode runNode = node(runtime);
                for (MethodNode m : runNode.methods) new Analyzer<>(new BasicVerifier()).analyze(runNode.name, m);
                check(true, "ASM verifies SRG " + name);
                // Exercise exactly the generated runtime bytes, reverse member mappings only in fixtures.
                TestBleeding.run(name, runtime, srg);
                replacements.put(PREFIX + name + ".class", runtime);
            }
            check(srg.changed >= 30, "Minecraft methods and inherited fields reobfuscated");
        }
        try (JarFile jar = new JarFile(input.toFile())) {
            String tick = PREFIX + MIXINS.get(0) + ".class";
            byte[] old = jar.getInputStream(jar.getJarEntry(tick)).readAllBytes();
            check(sha(old).equals("44ef209d9d4bfd635108dd9b27f3058c53b00b61023b2f19451803860787281f") || Arrays.equals(old, replacements.get(tick)), "known installed bleeding implementation");
            var configEntry = jar.getJarEntry("slashblade_sendims.mixins.json");
            JsonObject config = JsonParser.parseString(new String(jar.getInputStream(configEntry).readAllBytes(), StandardCharsets.UTF_8)).getAsJsonObject();
            JsonArray mixins = config.getAsJsonArray("mixins");
            for (String name : MIXINS.subList(1, 3)) {
                String id = "lsp." + name;
                if (!mixins.contains(new JsonPrimitive(id))) mixins.add(id);
                check(mixins.asList().stream().filter(e -> e.getAsString().equals(id)).count() == 1, "exactly one registration: " + id);
            }
            replacements.put("slashblade_sendims.mixins.json", (new GsonBuilder().setPrettyPrinting().create().toJson(config) + "\n").getBytes(StandardCharsets.UTF_8));
            Files.createDirectories(output.getParent());
            try (var out = new JarOutputStream(Files.newOutputStream(output))) {
                var entries = jar.entries(); Set<String> written = new HashSet<>();
                while (entries.hasMoreElements()) {
                    JarEntry entry = entries.nextElement();
                    JarEntry next = new JarEntry(entry.getName()); next.setTime(entry.getTime());
                    out.putNextEntry(next);
                    out.write(replacements.getOrDefault(entry.getName(), jar.getInputStream(entry).readAllBytes()));
                    out.closeEntry(); written.add(entry.getName());
                }
                for (var replacement : replacements.entrySet()) if (!written.contains(replacement.getKey())) {
                    out.putNextEntry(new JarEntry(replacement.getKey())); out.write(replacement.getValue()); out.closeEntry();
                }
            }
            try (var patched = new JarFile(output.toFile())) {
                var entries = jar.entries();
                while (entries.hasMoreElements()) {
                    JarEntry entry = entries.nextElement();
                    if (!replacements.containsKey(entry.getName()))
                        check(Arrays.equals(jar.getInputStream(entry).readAllBytes(), patched.getInputStream(patched.getJarEntry(entry.getName())).readAllBytes()), "preserved " + entry.getName());
                }
                check(patched.getJarEntry("com/tonywww/slashblade_sendims/compat/InteractionStackBounds.class") != null, "preserves existing server patch");
            }
        }
        String hash = sha(Files.readAllBytes(output));
        Files.writeString(output.resolveSibling(output.getFileName() + ".sha256"), hash + "\n");
        System.out.println("PASS: " + checks + " structure/preservation checks, " + TestBleeding.checks + " behavior checks");
        System.out.println("Built: " + output + "\nSHA-256: " + hash);
    }
}
