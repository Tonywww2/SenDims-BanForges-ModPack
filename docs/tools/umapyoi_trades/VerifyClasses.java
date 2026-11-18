import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import org.objectweb.asm.ClassReader;
import org.objectweb.asm.util.CheckClassAdapter;

/** 用 ASM 的 CheckClassAdapter 校验目录下所有 .class。参数：类目录、校验用 classpath（以系统分隔符连接）。 */
public final class VerifyClasses {
    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]);
        List<URL> urls = new ArrayList<>();
        urls.add(root.toUri().toURL());
        for (String entry : args[1].split(java.io.File.pathSeparator)) {
            urls.add(Path.of(entry).toUri().toURL());
        }
        List<Path> classes;
        try (Stream<Path> walk = Files.walk(root)) {
            classes = walk.filter(p -> p.toString().endsWith(".class")).sorted().toList();
        }
        try (URLClassLoader loader = new URLClassLoader(urls.toArray(new URL[0]), VerifyClasses.class.getClassLoader())) {
            for (Path file : classes) {
                StringWriter report = new StringWriter();
                CheckClassAdapter.verify(new ClassReader(Files.readAllBytes(file)), loader, false, new PrintWriter(report));
                if (!report.toString().isBlank()) {
                    throw new IllegalStateException("Bytecode verification failed for " + file + ":\n" + report);
                }
                System.out.println("OK " + root.relativize(file));
            }
        }
    }
}
