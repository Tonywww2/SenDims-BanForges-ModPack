import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;
import java.lang.reflect.Method;
import java.util.*;
import java.util.function.Predicate;

/** Execute patched helpers/cache and upstream amount validation using boundary fixtures. */
public final class TestInsolator implements Opcodes {
    static int checks;
    static void check(boolean ok,String why){if(!ok)throw new AssertionError(why);checks++;}
    static final Map<String,String> TYPES=new HashMap<>();
    static void type(String original,Class<?> fixture){TYPES.put(original,org.objectweb.asm.Type.getInternalName(fixture));}
    static {
        type("net/minecraft/resources/ResourceLocation",Resource.class);
        type("net/minecraft/tags/TagKey",Tag.class);
        type("net/minecraft/world/level/material/Fluid",Fluid.class);
        type("net/minecraft/world/item/ItemStack",ItemStack.class);
        type("net/minecraftforge/fluids/FluidStack",FluidStack.class);
        type("net/minecraftforge/registries/ForgeRegistries",Registries.class);
        type("net/minecraftforge/registries/IForgeRegistry",Registry.class);
        type("net/minecraftforge/registries/tags/ITagManager",TagManager.class);
        type("net/minecraftforge/registries/tags/ITag",FluidTag.class);
        type("cofh/core/util/helpers/FluidHelper",FluidHelper.class);
        type("cofh/lib/api/inventory/IItemStackHolder",ItemHolder.class);
        type("cofh/lib/common/inventory/ItemStorageCoFH",ItemStorage.class);
        type("cofh/lib/common/fluid/FluidStorageCoFH",Tank.class);
        type("cofh/thermal/lib/util/recipes/IMachineInventory",Inventory.class);
        type("cofh/thermal/lib/util/recipes/IThermalInventory",Inventory.class);
        type("cofh/thermal/lib/util/recipes/internal/IMachineRecipe",Recipe.class);
        type("cofh/thermal/lib/util/recipes/internal/IRecipeCatalyst",Catalyst.class);
        type("cofh/thermal/core/util/managers/machine/InsolatorRecipeManager",Manager.class);
        TYPES.put("cofh/thermal/lib/common/block/entity/MachineBlockEntity",PatchInsolator.OWNER);
    }
    static MethodNode getter(String name,String field,String desc){
        MethodNode m=new MethodNode(ACC_PUBLIC,name,"()Ljava/util/List;",null,null);
        m.instructions.add(new VarInsnNode(ALOAD,0));m.instructions.add(new FieldInsnNode(GETFIELD,PatchInsolator.OWNER,field,desc));
        m.instructions.add(new MethodInsnNode(INVOKESTATIC,"java/util/Collections","singletonList","(Ljava/lang/Object;)Ljava/util/List;",false));
        m.instructions.add(new InsnNode(ARETURN));return m;
    }
    static void run(byte[] patched)throws Exception{
        ClassNode source=PatchInsolator.node(patched),n=new ClassNode();n.version=V17;n.access=ACC_PUBLIC;n.name=source.name;n.superName="java/lang/Object";
        n.interfaces.add("cofh/thermal/lib/util/recipes/IMachineInventory");
        n.fields.add(new FieldNode(ACC_PUBLIC,"curRecipe","L"+PatchInsolator.RECIPE+";",null,null));
        n.fields.add(new FieldNode(ACC_PUBLIC,"curCatalyst","Lcofh/thermal/lib/util/recipes/internal/IRecipeCatalyst;",null,null));
        for(String field:List.of("itemInputCounts","fluidInputCounts"))n.fields.add(new FieldNode(ACC_PUBLIC,field,"Ljava/util/List;",null,null));
        for(String field:List.of("inputSlot","catalystSlot"))n.fields.add(new FieldNode(ACC_PUBLIC,field,"Lcofh/lib/common/inventory/ItemStorageCoFH;",null,null));
        n.fields.add(new FieldNode(ACC_PUBLIC,"waterTank","Lcofh/lib/common/fluid/FluidStorageCoFH;",null,null));
        for(var method:source.methods)if(method.name.startsWith("sdbf$")||method.name.equals("cacheRecipe"))n.methods.add(method);
        ClassNode base=PatchInsolator.node(baseMachine);
        n.methods.add(base.methods.stream().filter(m->m.name.equals("validateInputs")).findFirst().orElseThrow());
        n.methods.add(getter("inputSlots","inputSlot","Lcofh/lib/common/inventory/ItemStorageCoFH;"));
        n.methods.add(getter("inputTanks","waterTank","Lcofh/lib/common/fluid/FluidStorageCoFH;"));
        MethodNode init=new MethodNode(ACC_PUBLIC,"<init>","()V",null,null);
        init.instructions.add(new VarInsnNode(ALOAD,0));init.instructions.add(new MethodInsnNode(INVOKESPECIAL,"java/lang/Object","<init>","()V",false));init.instructions.add(new InsnNode(RETURN));n.methods.add(init);
        ClassWriter writer=new ClassWriter(ClassWriter.COMPUTE_MAXS);n.accept(new ClassRemapper(writer,new SimpleRemapper(TYPES)));
        Class<?> clazz=new ClassLoader(TestInsolator.class.getClassLoader()){
            Class<?> load(){byte[] b=writer.toByteArray();return defineClass(n.name.replace('/','.'),b,0,b.length);}
        }.load();
        Method allowed=clazz.getDeclaredMethod("sdbf$allowedFluid");
        Predicate<FluidStack> predicate=(Predicate<FluidStack>)allowed.invoke(null);
        Method matches=clazz.getDeclaredMethod("sdbf$fluidMatches",Recipe.class,FluidStack.class);
        Method validate=clazz.getDeclaredMethod("validateInputs");validate.setAccessible(true);
        String[] fluids={"empty","water","flowing_water","mod_water","titan_hydrogen","flowing_hydrogen","other_hydrogen","lava"};
        String[] requirements={"water","titan_hydrogen","flowing_hydrogen","other_hydrogen","lava"};
        for(String fluid:fluids)for(int amount:new int[]{0,1,999,1000,2000}){
            FluidStack actual=new FluidStack(fluid,amount);
            boolean water=actual.isWater(),hydrogen=actual.isHydrogen();
            check(predicate.test(actual)==(water||hydrogen),"tank accepts water/hydrogen tag only");
            for(String required:requirements){
                Recipe recipe=new RecipeImpl(new FluidStack(required,1000));
                boolean expected=required.contains("hydrogen")?hydrogen:required.equals("water")?water:actual.id.equals(required)&&!actual.isEmpty();
                check((boolean)matches.invoke(null,recipe,actual)==expected,"fluid identity/tag check: "+required+"/"+fluid);
                Object machine=clazz.getConstructor().newInstance();
                clazz.getField("inputSlot").set(machine,new ItemStorage(1));clazz.getField("catalystSlot").set(machine,new ItemStorage(1));
                clazz.getField("waterTank").set(machine,new Tank(actual));Manager.recipe=recipe;
                check((boolean)validate.invoke(machine)==(expected&&amount>=1000),"actual cache + upstream amount validation: "+required+"/"+fluid+"/"+amount);
                check(((List<?>)clazz.getField("fluidInputCounts").get(machine)).get(0).equals(1000),"native consumption amount retained");
            }
        }
        check(!(boolean)matches.invoke(null,null,new FluidStack("water",1000)),"no recipe is safe");
        for(String fluid:fluids) {
            Recipe freeRecipe=new RecipeImpl(new FluidStack("water",0));
            FluidStack actual=new FluidStack(fluid,0);
            check((boolean)matches.invoke(null,freeRecipe,actual),"zero-fluid recipes retain original behavior");
            Object machine=clazz.getConstructor().newInstance();
            clazz.getField("inputSlot").set(machine,new ItemStorage(1));clazz.getField("catalystSlot").set(machine,new ItemStorage(1));
            clazz.getField("waterTank").set(machine,new Tank(actual));Manager.recipe=freeRecipe;
            check((boolean)validate.invoke(machine),"upstream zero-fluid amount check remains valid");
        }
        FluidStack alias=new FluidStack("reload_alias",1000);Recipe hydrogenRecipe=new RecipeImpl(new FluidStack("titan_hydrogen",1000));
        check(!(boolean)matches.invoke(null,hydrogenRecipe,alias),"unknown fluid rejected before tag reload");
        hydrogen.add("reload_alias");check((boolean)matches.invoke(null,hydrogenRecipe,alias)&&predicate.test(alias),"tag membership is queried dynamically");
    }
    static byte[] baseMachine;
    static Set<String> hydrogen=new HashSet<>(Set.of("titan_hydrogen","flowing_hydrogen","other_hydrogen"));
    public static class Resource { String namespace,path;public Resource(String n,String p){namespace=n;path=p;} }
    public static class Tag { Resource id;Tag(Resource id){this.id=id;} }
    public static class Fluid { String id;Fluid(String id){this.id=id;} }
    public static class ItemStack { int count;ItemStack(int count){this.count=count;}public int m_41613_(){return count;} }
    public static class FluidStack {
        String id;int amount;FluidStack(String id,int amount){this.id=id;this.amount=amount;}
        public boolean isEmpty(){return amount<=0||id.equals("empty");}public int getAmount(){return amount;}public Fluid getFluid(){return new Fluid(id);}
        public boolean isFluidEqual(FluidStack other){return !isEmpty()&&!other.isEmpty()&&id.equals(other.id);}
        boolean isWater(){return !isEmpty()&&Set.of("water","flowing_water","mod_water").contains(id);}boolean isHydrogen(){return !isEmpty()&&hydrogen.contains(id);}
    }
    public static class FluidHelper {public static final Predicate<FluidStack> IS_WATER=FluidStack::isWater;}
    public interface Registry {TagManager tags();}
    public interface TagManager {Tag createTagKey(Resource id);FluidTag getTag(Tag key);}
    public interface FluidTag {boolean contains(Object fluid);}
    public static class Registries {public static final Registry FLUIDS=()->new TagManager(){
        public Tag createTagKey(Resource id){check(id.namespace.equals("forge")&&id.path.equals("hydrogen"),"correct fluid tag");return new Tag(id);}
        public FluidTag getTag(Tag key){return object->hydrogen.contains(((Fluid)object).id);}
    };}
    public interface ItemHolder {}
    public static class ItemStorage implements ItemHolder {ItemStack value;ItemStorage(int count){value=new ItemStack(count);}public ItemStack getItemStack(){return value;}}
    public static class Tank {FluidStack value;Tank(FluidStack value){this.value=value;}public FluidStack getFluidStack(){return value;}}
    public interface Inventory {}
    public interface Catalyst {}
    public interface Recipe {List<FluidStack> getInputFluids();List<Integer> getInputItemCounts(Inventory inventory);List<Integer> getInputFluidCounts(Inventory inventory);}
    public static class RecipeImpl implements Recipe {
        FluidStack required;RecipeImpl(FluidStack required){this.required=required;}
        public List<FluidStack> getInputFluids(){return List.of(required);}public List<Integer> getInputItemCounts(Inventory inventory){return List.of(1);}public List<Integer> getInputFluidCounts(Inventory inventory){return List.of(required.amount);}
    }
    public static class Manager {
        static Recipe recipe;public static Manager instance(){return new Manager();}public Recipe getRecipe(Inventory inventory){return recipe;}public Catalyst getCatalyst(ItemHolder slot){return null;}
    }
}
