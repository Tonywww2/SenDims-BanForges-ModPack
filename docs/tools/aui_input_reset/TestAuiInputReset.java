import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.jar.JarFile;
import java.lang.reflect.*;
import org.objectweb.asm.*;
import org.objectweb.asm.Type;
import org.objectweb.asm.commons.ClassRemapper;
import org.objectweb.asm.commons.Remapper;
import org.objectweb.asm.tree.*;

/** Execute unmodified AUI editing methods; only document/render/event services use fixtures. */
public final class TestAuiInputReset implements Opcodes {
    static final String OWNER="com/sighs/apricityui/element/AbstractText";
    static int checks;
    static void check(boolean ok,String why){if(!ok)throw new AssertionError(why);checks++;}
    static Class<?> executable(byte[] original)throws Exception{
        ClassNode source=new ClassNode();new ClassReader(original).accept(source,0);
        ClassNode n=new ClassNode();n.version=V17;n.access=ACC_PUBLIC;n.name=OWNER;n.superName="com/sighs/apricityui/init/Element";
        for(FieldNode f:source.fields)if(!f.name.equals("undoStack")){f.access=ACC_PUBLIC|(f.access&ACC_STATIC);n.fields.add(f);}
        Set<String> keep=Set.of("setAttribute","syncTextAttribute","ensureValue","hasSelection","selMin","selMax","clearSelection","insertText","normalizeInsertedText","clamp","setSelectionRange","normalizeSelectionDirection");
        for(MethodNode m:source.methods)if(keep.contains(m.name))n.methods.add(m);
        MethodNode init=new MethodNode(ACC_PUBLIC,"<init>","()V",null,null);
        init.instructions.add(new VarInsnNode(ALOAD,0));init.instructions.add(new MethodInsnNode(INVOKESPECIAL,n.superName,"<init>","()V",false));init.instructions.add(new InsnNode(RETURN));n.methods.add(init);
        Map<String,String> types=Map.of(OWNER,"NativeAuiTextProbe",n.superName,Type.getInternalName(Element.class),"com/sighs/apricityui/dom/RenderElement",Type.getInternalName(Renderer.class),"com/sighs/apricityui/dom/RenderElement$Cache",Type.getInternalName(Cache.class));
        ClassWriter writer=new ClassWriter(ClassWriter.COMPUTE_MAXS);n.accept(new ClassRemapper(writer,new Remapper(){public String map(String name){return types.getOrDefault(name,name);}}));
        return new ClassLoader(TestAuiInputReset.class.getClassLoader()){Class<?> define(){byte[] b=writer.toByteArray();return defineClass("NativeAuiTextProbe",b,0,b.length);}}.define();
    }
    static Field field(Class<?> c,String name)throws Exception{Field f=c.getField(name);f.setAccessible(true);return f;}
    static Element input(Class<?> c)throws Exception{
        Element value=(Element)c.getConstructor().newInstance();field(c,"maxLength").setInt(value,32);field(c,"selectionDirection").set(value,"none");return value;
    }
    static void insert(Class<?> c,Element input,String text)throws Exception{c.getMethod("insertText",String.class).invoke(input,text);}
    static void reset(Class<?> c,Element input)throws Exception{
        input.value="";
        c.getMethod("setAttribute",String.class,String.class).invoke(input,"value","");
        c.getMethod("setSelectionRange",int.class,int.class).invoke(input,0,0);
    }
    public static void main(String[] args)throws Exception{
        Path root=Path.of(args[0]),out=Path.of(args[1]);byte[] original;
        try(JarFile jar=new JarFile(root.resolve("mods/ApricityUI-forge-1.20.1-1.2.7.jar").toFile())){original=jar.getInputStream(jar.getJarEntry(OWNER+".class")).readAllBytes();}
        String hash=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(original));
        check(hash.equals("d7cd371d59ac0ccf1c91848fb11a7d3d01f0067b9b54b68c7ef842b998de5c20"),"exact crashing AUI class");
        Class<?> c=executable(original);
        for(String first:List.of("Yes","YES","Confirmed","partial")){
            Element old=input(c);insert(c,old,first);old.value="";
            try{insert(c,old,"C");throw new AssertionError("old reset must reproduce the crash");}catch(InvocationTargetException failure){check(failure.getCause() instanceof StringIndexOutOfBoundsException,"actual AUI insertText reproduces stale-caret crash");}
            Element fresh=input(c);insert(c,fresh,first);
            check(!fresh.undoStack.isEmpty(),"native editing has undo history");reset(c,fresh);
            for(String index:List.of("cursor","selectionStart","selectionEnd","selectionAnchor"))check(field(c,index).getInt(fresh)==0,"native "+index+" reset");
            check(fresh.value.isEmpty()&&fresh.undoStack.isEmpty(),"new reset clears native value and undo history");
            for(char character:"Confirmed".toCharArray())insert(c,fresh,String.valueOf(character));
            check(fresh.value.equals("Confirmed")&&field(c,"cursor").getInt(fresh)==9,"native character typing works after reset");
            c.getMethod("setSelectionRange",int.class,int.class,String.class).invoke(fresh,0,9,"backward");reset(c,fresh);
            for(String index:List.of("cursor","selectionStart","selectionEnd","selectionAnchor"))check(field(c,index).getInt(fresh)==0,"cancel clears native selection index");
            check(fresh.undoStack.isEmpty(),"cancel clears undo history");insert(c,fresh,"Yes");check(fresh.value.equals("Yes"),"reopened field is editable");
        }
        Element edge=input(c);field(c,"cursor").setInt(edge,-3);reset(c,edge);insert(c,edge,"Y");check(edge.value.equals("Y"),"explicit selection reset also repairs a negative stale caret");
        String report="PASS: "+checks+" actual AUI bytecode checks; original crash reproduced, new reset and subsequent typing verified.\nAUI SHA-256: "+hash+"\nMinecraft rendering/events use fixtures; no game launched.\n";
        Files.createDirectories(out);Files.writeString(out.resolve("native-verification.txt"),report);System.out.print(report);
    }
    public static class Cache {public void clear(){}}
    public static class Renderer {public Cache text=new Cache();}
    public static class Element {
        public String value="";public Deque<String> undoStack=new ArrayDeque<>();public Renderer renderer=new Renderer();
        public Element(){}public void setAttribute(String key,String text){}public Renderer getRenderer(){return renderer;}
        public boolean canEditText(){return true;}public boolean supportsMultilineInput(){return false;}
        public void pushUndoState(){undoStack.push(value);}public boolean dispatchBeforeInputEvent(String type,String text){return true;}
        public void dispatchInputEvent(String type,String text){}public void addDirtyFlags(int flags){}public void clampScroll(){}
    }
}
