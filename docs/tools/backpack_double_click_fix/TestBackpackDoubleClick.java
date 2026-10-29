import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.*;
import org.objectweb.asm.*;
import org.objectweb.asm.commons.*;
import org.objectweb.asm.tree.*;

/** Executes the mod's original/patched methods. UI, networking and inventory edges are fixtures. */
public final class TestBackpackDoubleClick implements Opcodes {
    static int checks;
    static int packets, normalToBackpack, normalToPlayer, touches, syncs, menuSyncs;
    static Access active;
    static void check(boolean success, String label) { if (!success) throw new AssertionError(label); checks++; }
    static String name(Class<?> cls) { return org.objectweb.asm.Type.getInternalName(cls); }
    public static class Container {}
    public static class Inventory extends Container {}
    public static class Player {}
    public static class Drop {}
    public static class NList extends ArrayList<Object> {}
    public static class Stack {
        public static final Stack f_41583_ = new Stack(0);
        final int count;
        Stack(int count) { this.count = count; }
        public boolean m_41619_() { return count == 0; }
        public Stack m_41777_() { return new Stack(count); }
        public int m_41613_() { return count; }
    }
    public static class Menu {
        public NList f_38839_ = new NList();
        Stack carried = Stack.f_41583_;
        public Stack m_142621_() { return carried; }
        public void m_142503_(Stack value) { carried = value; }
    }
    public static class LocalPlayer extends Player { public Menu f_36096_ = new Menu(); }
    public static class ServerPlayer extends Player {
        public Menu f_36096_ = new Menu();
        public Inventory inventory = new Inventory();
        public Inventory m_150109_() { return inventory; }
        public Drop m_36176_(Stack stack, boolean random) { throw new AssertionError("unexpected item drop"); }
    }
    public static class Minecraft { public LocalPlayer f_91074_ = new LocalPlayer(); }
    public static class ScreenBase { public static boolean shift; public static boolean m_96638_() { return shift; } }
    public static class Screen extends ScreenBase { public int hovered; }
    public static class Rect {}
    public static class BoolValue { boolean value = true; public Object get() { return value; } }
    public static class Config { public static BoolValue PANEL_HIDDEN = new BoolValue(); }
    public static class Network { public static void sendMenuDoubleTransfer(int backpack, int menu) { packets++; } }
    public static class Slot {
        public Container f_40218_;
        Stack stack;
        boolean allowed = true;
        Slot(Container container, int count) { f_40218_ = container; stack = new Stack(count); }
        public boolean m_6657_() { return !stack.m_41619_(); }
        public boolean m_8010_(Player player) { return allowed; }
        public Stack m_7993_() { return stack; }
        public Stack m_6201_(int count) { Stack result = stack; stack = Stack.f_41583_; return result; }
        public void m_142406_(Player player, Stack taken) {}
        public void m_6654_() {}
    }
    public interface Handler { int getSlots(); Stack insertItem(int slot, Stack stack, boolean simulate); }
    public static class Bag implements Handler {
        int items, calls;
        public int getSlots() { return 1; }
        public Stack insertItem(int slot, Stack stack, boolean simulate) {
            calls++; if (!simulate) items += stack.count; return Stack.f_41583_;
        }
    }
    public static class Access { public Handler handler; Access(Handler handler) { this.handler = handler; } }

    public static Optional<Access> getBackpack(ServerPlayer player, int slot) { return Optional.ofNullable(active); }
    public static void syncTo(ServerPlayer player) { syncs++; }
    public static void touchBackpack(ServerPlayer player, Access bag) { touches++; }
    public static void sendFullMenuAndCarried(ServerPlayer player) { menuSyncs++; }
    public static void transferBackpackSlotToPlayer(ServerPlayer player, Access bag, int slot) { normalToPlayer++; }
    public static void transferMenuSlotToBackpack(ServerPlayer player, Access bag, int slot) { normalToBackpack++; }
    public static Stack insertIntoPlayerInventory(ServerPlayer player, Stack stack) { return Stack.f_41583_; }

    static Class<?> executable(byte[] data, boolean client) {
        ClassNode n = PatchBackpackDoubleClick.node(data);
        Set<String> keep = client ? Set.of("tryMenuDoubleClickTransfer", "resetMenuClickMemory")
            : Set.of("transferMenuSlotToBackpackByDoubleClick", "insertIntoBackpackUsingHandler", "handleQuickTransfer");
        n.methods.removeIf(m -> !keep.contains(m.name));
        Set<String> fields = new HashSet<>();
        for (MethodNode m : n.methods) for (AbstractInsnNode insn : m.instructions)
            if (insn instanceof FieldInsnNode f && f.owner.equals(n.name)) fields.add(f.name);
        // The patched client no longer references any fields; retain test-controlled click state too.
        if (client) fields.addAll(Set.of("available", "backpackSlot", "clickLockedTicks", "lastMenuClickSlot", "lastMenuClickMs", "lastMenuClickStartedWithEmptyCursor"));
        n.fields.removeIf(f -> !fields.contains(f.name));
        n.innerClasses.clear(); n.nestHostClass = null; n.nestMembers = null;
        for (MethodNode m : n.methods) m.access = (m.access & ~ACC_PRIVATE) | ACC_PUBLIC;
        if (client) {
            MethodNode hovered = new MethodNode(ACC_PRIVATE | ACC_STATIC, "getHoveredMenuSlot", "(Lnet/minecraft/client/gui/screens/inventory/AbstractContainerScreen;)I", null, null);
            hovered.instructions.add(new VarInsnNode(ALOAD, 0));
            hovered.instructions.add(new FieldInsnNode(GETFIELD, "net/minecraft/client/gui/screens/inventory/AbstractContainerScreen", "hovered", "I"));
            hovered.instructions.add(new InsnNode(IRETURN)); hovered.maxStack = 1; hovered.maxLocals = 1; n.methods.add(hovered);
            MethodNode inside = new MethodNode(ACC_PRIVATE | ACC_STATIC, "panelInteractiveContains", "(L" + n.name + "$PanelRect;DD)Z", null, null);
            inside.instructions.add(new InsnNode(ICONST_0)); inside.instructions.add(new InsnNode(IRETURN)); inside.maxStack = 1; inside.maxLocals = 5; n.methods.add(inside);
        } else {
            ClassNode original = PatchBackpackDoubleClick.node(data);
            for (String helper : List.of("getBackpack", "syncTo", "touchBackpack", "sendFullMenuAndCarried", "transferBackpackSlotToPlayer", "transferMenuSlotToBackpack", "insertIntoPlayerInventory")) {
                MethodNode source = original.methods.stream().filter(m -> m.name.equals(helper))
                    .filter(m -> !helper.equals("syncTo") || m.desc.equals("(Lnet/minecraft/server/level/ServerPlayer;)V"))
                    .findFirst().orElseThrow();
                MethodNode bridge = new MethodNode(ACC_PRIVATE | ACC_STATIC, helper, source.desc, null, null);
                int index = 0;
                for (org.objectweb.asm.Type t : org.objectweb.asm.Type.getArgumentTypes(source.desc)) {
                    bridge.instructions.add(new VarInsnNode(t.getOpcode(ILOAD), index)); index += t.getSize();
                }
                bridge.instructions.add(new MethodInsnNode(INVOKESTATIC, name(TestBackpackDoubleClick.class), helper, source.desc, false));
                bridge.instructions.add(new InsnNode(org.objectweb.asm.Type.getReturnType(source.desc).getOpcode(IRETURN)));
                bridge.maxLocals = index; bridge.maxStack = index; n.methods.add(bridge);
            }
        }
        Map<String,String> map = new HashMap<>();
        map.put("net/minecraft/client/Minecraft", name(Minecraft.class));
        map.put("net/minecraft/client/player/LocalPlayer", name(LocalPlayer.class));
        map.put("net/minecraft/client/gui/screens/Screen", name(ScreenBase.class));
        map.put("net/minecraft/client/gui/screens/inventory/AbstractContainerScreen", name(Screen.class));
        map.put(PatchBackpackDoubleClick.CLIENT + "$PanelRect", name(Rect.class));
        map.put("com/locknar/backpacksidegui/BackpackSideGuiConfig", name(Config.class));
        map.put("net/minecraftforge/common/ForgeConfigSpec$BooleanValue", name(BoolValue.class));
        map.put("com/locknar/backpacksidegui/network/ModNetwork", name(Network.class));
        map.put("net/minecraft/server/level/ServerPlayer", name(ServerPlayer.class));
        map.put("net/minecraft/world/entity/player/Player", name(Player.class));
        map.put("net/minecraft/world/entity/player/Inventory", name(Inventory.class));
        map.put("net/minecraft/world/entity/item/ItemEntity", name(Drop.class));
        map.put("net/minecraft/world/inventory/AbstractContainerMenu", name(Menu.class));
        map.put("net/minecraft/core/NonNullList", name(NList.class));
        map.put("net/minecraft/world/inventory/Slot", name(Slot.class));
        map.put("net/minecraft/world/Container", name(Container.class));
        map.put("net/minecraft/world/item/ItemStack", name(Stack.class));
        map.put("net/minecraftforge/items/IItemHandler", name(Handler.class));
        map.put(PatchBackpackDoubleClick.SERVER + "$BackpackAccess", name(Access.class));
        ClassWriter writer = new ClassWriter(0); n.accept(new ClassRemapper(writer, new SimpleRemapper(map)));
        class Loader extends ClassLoader { Class<?> define(byte[] b) { return defineClass(null, b, 0, b.length); } }
        return new Loader().define(writer.toByteArray());
    }
    static void set(Class<?> cls, String field, Object value) throws Exception {
        Field f = cls.getDeclaredField(field); f.setAccessible(true); f.set(null, value);
    }
    static Object get(Class<?> cls, String field) throws Exception {
        Field f = cls.getDeclaredField(field); f.setAccessible(true); return f.get(null);
    }
    static void client(byte[] before, byte[] after) throws Exception {
        Class<?> old = executable(before, true), patched = executable(after, true);
        Method original = old.getMethod("tryMenuDoubleClickTransfer", Minecraft.class, Screen.class, Rect.class, double.class, double.class, int.class);
        Method fixed = patched.getMethod(original.getName(), original.getParameterTypes());
        Minecraft mc = new Minecraft(); Screen screen = new Screen(); mc.f_91074_.f_36096_.f_38839_.add(new Slot(new Inventory(), 64));
        set(old, "available", true); set(old, "backpackSlot", 7); set(old, "lastMenuClickSlot", -1);
        packets = 0;
        check(!(Boolean)original.invoke(null, mc, screen, null, 0d, 0d, 0), "original first click passes through");
        mc.f_91074_.f_36096_.carried = new Stack(64);
        set(old, "lastMenuClickMs", System.currentTimeMillis());
        check((Boolean)original.invoke(null, mc, screen, null, 0d, 0d, 0) && packets == 1, "original hidden-panel double click intercepts and sends transfer");
        for (boolean hidden : new boolean[]{true,false}) for (boolean shift : new boolean[]{true,false}) for (int button : new int[]{0,1,2}) {
            Config.PANEL_HIDDEN.value = hidden; ScreenBase.shift = shift; packets = 0;
            set(patched, "available", true); set(patched, "lastMenuClickSlot", 0); set(patched, "lastMenuClickStartedWithEmptyCursor", true);
            set(patched, "lastMenuClickMs", System.currentTimeMillis()); set(patched, "clickLockedTicks", 0);
            Stack cursor = mc.f_91074_.f_36096_.carried;
            check(!(Boolean)fixed.invoke(null, mc, screen, new Rect(), 0d, 0d, button), "patched click is never intercepted");
            check(packets == 0 && (Integer)get(patched,"clickLockedTicks") == 0 && mc.f_91074_.f_36096_.carried == cursor, "no transfer packet, lock or cursor mutation");
        }
        check(!(Boolean)fixed.invoke(null, null, null, null, 0d, 0d, 0), "disabled entry does not access UI objects");
        ScreenBase.shift = false; Config.PANEL_HIDDEN.value = true;
        System.out.println("PASS client: reproduced original interception; patched clicks pass through without packets");
    }
    static void server(byte[] before, byte[] after) throws Exception {
        Class<?> old = executable(before, false), patched = executable(after, false);
        Method original = old.getMethod("transferMenuSlotToBackpackByDoubleClick", ServerPlayer.class, Access.class, int.class);
        Method fixed = patched.getMethod(original.getName(), original.getParameterTypes());
        for (boolean cursor : new boolean[]{true,false}) {
            ServerPlayer p = new ServerPlayer(); Bag bag = new Bag(); Access access = new Access(bag);
            p.f_36096_.f_38839_.add(new Slot(new Container(),64));
            if (cursor) p.f_36096_.carried = new Stack(32);
            original.invoke(null, p, access, 0);
            check(bag.items == (cursor ? 32 : 64), "original double transfer moves cursor/container items");
        }
        for (int index : new int[]{-1,0,1,999}) for (int count : new int[]{0,1,64}) {
            ServerPlayer p = new ServerPlayer(); Bag bag = new Bag(); Access access = new Access(bag);
            Slot slot = new Slot(new Container(),64); p.f_36096_.f_38839_.add(slot); p.f_36096_.carried = new Stack(count);
            Stack cursor = p.f_36096_.carried, contents = slot.stack;
            fixed.invoke(null, p, access, index);
            check(bag.items == 0 && bag.calls == 0 && p.f_36096_.carried == cursor && slot.stack == contents, "patched double transfer never moves cursor/container items");
        }
        fixed.invoke(null, null, null, 0);
        check(true, "disabled server method does not access player or backpack");
        Method dispatch = patched.getMethod("handleQuickTransfer", ServerPlayer.class,int.class,int.class,int.class,boolean.class);
        ServerPlayer p = new ServerPlayer(); Bag bag = new Bag(); active = new Access(bag);
        p.f_36096_.f_38839_.add(new Slot(new Container(),64)); p.f_36096_.carried = new Stack(32);
        normalToBackpack = normalToPlayer = touches = syncs = menuSyncs = 0;
        dispatch.invoke(null,p,7,-1,0,true);
        check(bag.items == 0 && p.f_36096_.carried.count == 32 && normalToBackpack == 0 && normalToPlayer == 0, "real dispatch double-click branch cannot fall through to ordinary transfer");
        dispatch.invoke(null,p,7,0,-1,false);
        dispatch.invoke(null,p,7,-1,0,false);
        check(normalToPlayer == 1 && normalToBackpack == 1, "ordinary quick transfer still dispatches in both directions");
        check(touches == 3 && menuSyncs == 3 && syncs == 3, "original synchronization dispatch preserved");
        System.out.println("PASS server: original transfers reproduced; disabled branch preserves items; ordinary routes preserved");
    }
    static void run(byte[] before, byte[] after, boolean isClient) throws Exception {
        if (isClient) client(before,after); else server(before,after);
    }
}
