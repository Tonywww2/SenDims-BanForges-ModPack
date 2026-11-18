import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipFile;
import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.commons.ClassRemapper;
import org.objectweb.asm.commons.SimpleRemapper;
import org.objectweb.asm.tree.ClassNode;
import org.objectweb.asm.tree.MethodNode;
import org.objectweb.asm.util.CheckClassAdapter;

/**
 * 用 SidebarSaveTemplate.saveConfig() 替换 FTB Library 2001.2.13 的 SidebarButtonManager.saveConfig()。
 * 参数：ftb-library JAR、模板 .class 所在目录、输出目录、编译/校验用 classpath（以系统分隔符连接）。
 */
public final class PatchSidebarButtons {
    static final String OWNER = "dev/ftb/mods/ftblibrary/sidebar/SidebarButtonManager";
    static final String TEMPLATE = "SidebarSaveTemplate";
    static final String JAR_SHA256 = "41810281b65336265cae2c88412022d02f2f0a3f28c66a06173d86f98acf14a7";

    public static void main(String[] args) throws Exception {
        Path jar = Path.of(args[0]);
        Path builder = Path.of(args[1]);
        Path output = Path.of(args[2]);
        String digest = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(jar)));
        if (!digest.equals(JAR_SHA256)) {
            throw new IllegalStateException("Unexpected ftb-library jar " + digest);
        }
        byte[] original;
        try (ZipFile zip = new ZipFile(jar.toFile())) {
            original = zip.getInputStream(zip.getEntry(OWNER + ".class")).readAllBytes();
        }

        ClassNode target = new ClassNode();
        new ClassReader(original).accept(target, 0);
        ClassNode template = new ClassNode();
        new ClassReader(Files.readAllBytes(builder.resolve(TEMPLATE + ".class")))
            .accept(new ClassRemapper(template, new SimpleRemapper(Map.of(TEMPLATE, OWNER))), 0);
        MethodNode replacement = template.methods.stream()
            .filter(m -> m.name.equals("saveConfig") && m.desc.equals("()V")).findFirst().orElseThrow();
        if (template.methods.stream().anyMatch(m -> m.name.startsWith("lambda$"))) {
            throw new IllegalStateException("Template must not contain lambdas");
        }
        int replaced = 0;
        for (int i = 0; i < target.methods.size(); i++) {
            MethodNode method = target.methods.get(i);
            if (method.name.equals("saveConfig") && method.desc.equals("()V")) {
                replacement.access = method.access;
                target.methods.set(i, replacement);
                replaced++;
            }
        }
        if (replaced != 1) {
            throw new IllegalStateException("saveConfig()V not found exactly once: " + replaced);
        }

        ClassWriter writer = new ClassWriter(ClassWriter.COMPUTE_MAXS);
        target.accept(writer);
        byte[] patched = writer.toByteArray();

        List<URL> urls = new ArrayList<>();
        for (String entry : args[3].split(java.io.File.pathSeparator)) {
            urls.add(Path.of(entry).toUri().toURL());
        }
        try (URLClassLoader loader = new URLClassLoader(urls.toArray(new URL[0]), PatchSidebarButtons.class.getClassLoader())) {
            StringWriter report = new StringWriter();
            CheckClassAdapter.verify(new ClassReader(patched), loader, false, new PrintWriter(report));
            if (!report.toString().isBlank()) {
                throw new IllegalStateException("Bytecode verification failed:\n" + report);
            }
        }

        Path hotai = output.resolve("hotai/" + OWNER + ".class");
        Files.createDirectories(hotai.getParent());
        Files.write(hotai, patched);
        Files.write(output.resolve("SidebarButtonManager.original.class"), original);
        System.out.println("Patched " + OWNER + ".saveConfig(): " + hotai);
    }
}
