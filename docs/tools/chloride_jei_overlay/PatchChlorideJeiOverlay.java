import java.io.InputStream;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.jar.JarFile;
import mezz.jei.gui.filter.IFilterTextSource;
import org.badiff.imp.MemoryDiff;
import org.badiff.io.DefaultSerialization;
import org.objectweb.asm.*;
import org.objectweb.asm.tree.*;
import org.objectweb.asm.tree.analysis.*;
import youyihj.hotai.transformers.BytecodeTransformer;
import youyihj.hotai.transformers.DiffTransformer;

/** Verifies the HotAI replacement of Chloride 1.8.1 JeiOverlayMixin for JEI 15.74 and writes the release class. */
public final class PatchChlorideJeiOverlay {
    static final String OWNER = "me/srrapero720/chloride/mixins/impl/jei_rei_emi/JeiOverlayMixin";
    static final String CONTROLLER = "mezz/jei/gui/overlay/IngredientListOverlayController";
    static final String OVERLAY = "mezz/jei/gui/overlay/IngredientListOverlay";
    static final String ORIGINAL_SHA = "9da7e063bd167800b9396d3c7f58b0e924bc88b23893e2a98c9f1cc2d2404378";
    static int checks;

    static void check(boolean valid, String label) {
        if (!valid) throw new AssertionError(label);
        checks++;
        System.out.println("PASS " + label);
    }
    static String sha(byte[] data) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(data));
    }
    static ClassNode node(byte[] data) {
        ClassNode n = new ClassNode();
        new ClassReader(data).accept(n, 0);
        return n;
    }
    static byte[] bytes(ClassNode n) {
        ClassWriter w = new ClassWriter(0);
        n.accept(w);
        return w.toByteArray();
    }
    static byte[] entry(Path jar, String name) throws Exception {
        try (JarFile file = new JarFile(jar.toFile())) {
            var e = file.getJarEntry(name);
            if (e == null) return null;
            try (InputStream in = file.getInputStream(e)) { return in.readAllBytes(); }
        }
    }
    static AnnotationNode annotation(List<AnnotationNode> list, String desc) {
        return list == null ? null : list.stream().filter(a -> a.desc.equals(desc)).findFirst().orElse(null);
    }
    static Object value(AnnotationNode a, String key) {
        for (int i = 0; a.values != null && i < a.values.size(); i += 2) if (a.values.get(i).equals(key)) return a.values.get(i + 1);
        return null;
    }
    static boolean mentions(byte[] data, String text) {
        return new String(data, java.nio.charset.StandardCharsets.ISO_8859_1).contains(text);
    }

    public static final class FakeSource implements IFilterTextSource {
        final String text;
        public FakeSource(String text) { this.text = text; }
        public String getFilterText() { return text; }
        public boolean setFilterText(String t) { return false; }
        public void addListener(IFilterTextSource.Listener l) { }
    }
    public static final class FakeController {
        private final IFilterTextSource filterTextSource;
        public FakeController(String text) { filterTextSource = new FakeSource(text); }
    }
    public static final class FakeControllerWithoutField {
        private final Object other = new Object();
    }

    /** Runs the patched helper in a fresh class loader so its static cache starts empty. */
    static Method helper(byte[] patched, URL[] deps) throws Exception {
        ClassLoader loader = new URLClassLoader(deps, PatchChlorideJeiOverlay.class.getClassLoader()) {
            @Override protected Class<?> findClass(String name) throws ClassNotFoundException {
                if (name.equals(OWNER.replace('/', '.'))) return defineClass(name, patched, 0, patched.length);
                return super.findClass(name);
            }
        };
        Method m = Class.forName(OWNER.replace('/', '.'), true, loader).getDeclaredMethod("chloride$filterText", Object.class);
        m.setAccessible(true);
        return m;
    }

    public static void main(String[] args) throws Exception {
        Path chloride = Path.of(args[0]), jei = Path.of(args[1]), patchedFile = Path.of(args[2]), build = Path.of(args[3]);
        byte[] original = entry(chloride, OWNER + ".class");
        check(original != null && sha(original).equals(ORIGINAL_SHA), "supported Chloride 1.8.1 JeiOverlayMixin SHA256");
        ClassNode orig = node(original);
        check(orig.fields.stream().anyMatch(f -> f.name.equals("configButton") && f.desc.equals("Lmezz/jei/gui/elements/GuiIconToggleButton;")),
                "original mixin shadows configButton as GuiIconToggleButton");

        ClassNode overlay = node(entry(jei, OVERLAY + ".class"));
        check(overlay.fields.stream().noneMatch(f -> f.name.equals("configButton") && f.desc.equals("Lmezz/jei/gui/elements/GuiIconToggleButton;"))
                && entry(jei, "mezz/jei/gui/elements/GuiIconToggleButton.class") == null,
                "installed JEI no longer has that field type (the reported crash cause)");
        ClassNode controller = node(entry(jei, CONTROLLER + ".class"));
        check(controller.methods.stream().anyMatch(m -> m.name.equals("isListHiddenWhenNotSearching") && m.desc.equals("()Z")),
                "JEI controller has isListHiddenWhenNotSearching()Z");
        check(controller.fields.stream().anyMatch(f -> f.name.equals("filterTextSource") && f.desc.equals("Lmezz/jei/gui/filter/IFilterTextSource;")),
                "JEI controller has filterTextSource");
        check(controller.methods.stream().filter(m -> m.name.equals("isListDisplayed") && m.desc.equals("()Z"))
                .anyMatch(m -> Arrays.stream(m.instructions.toArray()).anyMatch(i -> i instanceof MethodInsnNode c
                        && c.owner.equals(CONTROLLER) && c.name.equals("isListHiddenWhenNotSearching"))),
                "JEI hides the ingredient list through that check");

        byte[] patched = Files.readAllBytes(patchedFile);
        ClassNode p = node(patched);
        check(p.name.equals(OWNER) && p.version == Opcodes.V17 && p.superName.equals("java/lang/Object"), "same class name, Java 17, plain mixin");
        AnnotationNode mixin = annotation(p.invisibleAnnotations, "Lorg/spongepowered/asm/mixin/Mixin;");
        check(mixin != null && List.of(CONTROLLER.replace('/', '.')).equals(value(mixin, "targets")) && Boolean.FALSE.equals(value(mixin, "remap")),
                "@Mixin targets the controller with remap=false");
        check(annotation(p.invisibleAnnotations, "Lorg/spongepowered/asm/mixin/Pseudo;") != null, "@Pseudo keeps other JEI versions from failing");
        check(p.fields.stream().allMatch(f -> f.visibleAnnotations == null || annotation(f.visibleAnnotations, "Lorg/spongepowered/asm/mixin/Shadow;") == null),
                "no @Shadow members that could fail to resolve");
        check(!mentions(patched, "GuiIconToggleButton") && !mentions(patched, "configButton") && !mentions(patched, OVERLAY + ";"),
                "no reference to the removed field or its type");
        List<MethodNode> injects = p.methods.stream().filter(m -> annotation(m.visibleAnnotations, "Lorg/spongepowered/asm/mixin/injection/Inject;") != null).toList();
        check(injects.size() == 1, "exactly one injector");
        AnnotationNode inject = annotation(injects.get(0).visibleAnnotations, "Lorg/spongepowered/asm/mixin/injection/Inject;");
        check(List.of("isListHiddenWhenNotSearching()Z").equals(value(inject, "method")) && Boolean.TRUE.equals(value(inject, "cancellable"))
                && Integer.valueOf(0).equals(value(inject, "require")), "HEAD injector on isListHiddenWhenNotSearching()Z, cancellable, require=0");
        for (MethodNode m : p.methods) new Analyzer<>(new BasicVerifier()).analyze(p.name, m);
        check(true, "ASM verifies every method");

        URL[] deps = { chloride.toUri().toURL(), jei.toUri().toURL() };
        check("".equals(helper(patched, deps).invoke(null, new FakeController(""))), "blank search text is read");
        Method h = helper(patched, deps);
        check("iron".equals(h.invoke(null, new FakeController("iron"))) && "  ".equals(h.invoke(null, new FakeController("  "))),
                "search text is read on repeated calls through the cached field");
        Method missing = helper(patched, deps);
        check(missing.invoke(null, new FakeControllerWithoutField()) == null && missing.invoke(null, new FakeController("")) == null,
                "missing field disables the option instead of throwing");

        Path scratch = Files.createTempDirectory(build, "hotai-roundtrip-");
        Path file = scratch.resolve(OWNER + ".class");
        Files.createDirectories(file.getParent());
        Files.write(file, patched);
        byte[] first = bytes(new BytecodeTransformer(scratch, Map.of(OWNER, patched)).transform(node(original), null));
        Path diffPath = scratch.resolve(OWNER + ".badiff");
        check(!Files.exists(file) && Files.isRegularFile(diffPath), "HotAI converts the class to a diff on first load");
        MemoryDiff diff = new MemoryDiff();
        try (var input = Files.newInputStream(diffPath)) { diff.deserialize(DefaultSerialization.newInstance(), input); }
        byte[] restart = bytes(new DiffTransformer(Map.of(OWNER, diff)).transform(node(original), null));
        check(Arrays.equals(first, bytes(node(patched))) && Arrays.equals(restart, first), "HotAI first load and restart produce the same class");

        Path output = build.resolve("release/hotai/" + OWNER + ".class");
        Files.createDirectories(output.getParent());
        Files.write(output, patched);
        String result = "Chloride 1.8.1 + JEI 15.74.0.228; HotAI 1.0\n"
                + "Original class SHA256: " + sha(original) + "\n"
                + "Patched class SHA256: " + sha(patched) + "\n"
                + checks + " structural, behavior and HotAI round-trip checks passed. Minecraft was not launched.\n";
        Files.writeString(build.resolve("verification-results.txt"), result);
        System.out.print(result);
        System.out.println("Output: " + output);
    }
}
