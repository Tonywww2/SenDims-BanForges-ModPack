"""Run the actual Forge storage source against small NBT/list fixtures, without Minecraft."""
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[3]
work = root / '.cache/astral_gems/container_resize_fixture'
sources = work / 'src'
classes = work / 'classes'
sources.mkdir(parents=True, exist_ok=True)
classes.mkdir(parents=True, exist_ok=True)
fixtures = {
    'net/minecraft/core/NonNullList.java': '''package net.minecraft.core;
import java.util.*;
public class NonNullList<E> extends AbstractList<E> {
    private final List<E> values;
    protected NonNullList(List<E> values, E empty) { this.values=values; }
    public static <E> NonNullList<E> withSize(int size,E empty) {
        return new NonNullList<>(new ArrayList<>(Collections.nCopies(size,empty)),empty);
    }
    public E get(int index) { return values.get(index); }
    public E set(int index,E value) { return values.set(index,value); }
    public int size() { return values.size(); }
}''',
    'net/minecraft/nbt/Tag.java': '''package net.minecraft.nbt;
public class Tag { public static final int TAG_COMPOUND=10; }''',
    'net/minecraft/nbt/ListTag.java': '''package net.minecraft.nbt;
import java.util.ArrayList;
public class ListTag extends ArrayList<CompoundTag> {
    public CompoundTag getCompound(int index) { return get(index); }
    public ListTag copy() { ListTag copy=new ListTag(); for(CompoundTag tag:this)copy.add(tag.copy());return copy; }
}''',
    'net/minecraft/nbt/CompoundTag.java': '''package net.minecraft.nbt;
import java.util.*;
public class CompoundTag {
    private final Map<String,Object> values=new HashMap<>();
    public void putInt(String key,int value) { values.put(key,value); }
    public int getInt(String key) { return (int)values.getOrDefault(key,0); }
    public void putString(String key,String value) { values.put(key,value); }
    public String getString(String key) { return (String)values.getOrDefault(key,""); }
    public void put(String key,Object value) { values.put(key,value); }
    public CompoundTag getCompound(String key) { return (CompoundTag)values.getOrDefault(key,new CompoundTag()); }
    public ListTag getList(String key,int type) { return (ListTag)values.getOrDefault(key,new ListTag()); }
    public boolean contains(String key) { return values.containsKey(key); }
    public CompoundTag copy() {
        CompoundTag copy=new CompoundTag(); values.forEach((key,value)->copy.values.put(key,
            value instanceof CompoundTag tag?tag.copy():value instanceof ListTag list?list.copy():value));return copy;
    }
    public boolean equals(Object other) { return other instanceof CompoundTag tag && values.equals(tag.values); }
    public int hashCode() { return values.hashCode(); }
}''',
    'net/minecraft/world/item/ItemStack.java': '''package net.minecraft.world.item;
import net.minecraft.nbt.CompoundTag;
public class ItemStack {
    public static final ItemStack EMPTY=new ItemStack("empty",0,0);
    private final String id; private final int marker; private int count; private CompoundTag tag;
    public ItemStack(String id,int marker,int count) { this.id=id;this.marker=marker;this.count=count; }
    public boolean isEmpty() { return count==0; }
    public void setCount(int value) { count=value; }
    public int marker() { return marker; }
    public Object getItem() { return id; }
    public CompoundTag getTagElement(String key) { return tag!=null&&tag.contains(key)?tag.getCompound(key):null; }
    public CompoundTag getOrCreateTag() { if(tag==null)tag=new CompoundTag();return tag; }
    public static ItemStack of(CompoundTag tag) { return new ItemStack(tag.getString("id"),tag.getInt("Marker"),tag.getInt("Count")); }
    public CompoundTag save(CompoundTag tag) { tag.putString("id",id);tag.putInt("Marker",marker);tag.putInt("Count",count);return tag; }
    public ItemStack copyWithCount(int count) { ItemStack copy=new ItemStack(id,marker,count);if(tag!=null)copy.tag=tag.copy();return copy; }
}''',
    'net/minecraft/core/registries/BuiltInRegistries.java': '''package net.minecraft.core.registries;
public class BuiltInRegistries {
    public static final Registry ITEM=new Registry();
    public static class Registry { public Object getKey(Object item) { return item; } }
}''',
    'ResizeVerification.java': '''import com.tonywww.deeprealm4th.platform.data.AstralStoredItems;
import net.minecraft.core.NonNullList;
import net.minecraft.nbt.*;
import net.minecraft.world.item.ItemStack;
public class ResizeVerification {
    private static void require(boolean value,String message) { if(!value)throw new AssertionError(message); }
    private static ItemStack owner(String id,int size) {
        ItemStack stack=new ItemStack(id,-1,1);CompoundTag data=new CompoundTag();
        data.putInt("Version",1);data.putInt("Size",size);data.put("Items",new ListTag());
        stack.getOrCreateTag().put("AstralContainer",data);return stack;
    }
    private static void add(ItemStack owner,int slot,int marker) {
        CompoundTag entry=new CompoundTag();entry.putInt("Slot",slot);
        entry.put("Stack",new ItemStack("test:filler",marker,1).save(new CompoundTag()));
        owner.getTagElement("AstralContainer").getList("Items",10).add(entry);
    }
    private static int count(NonNullList<ItemStack> items) { int count=0;for(ItemStack stack:items)if(!stack.isEmpty())count++;return count; }
    public static void main(String[] args) {
        ItemStack base=owner("deeprealm_4th:base_container",108);
        for(int y=0;y<5;y++)for(int x=0;x<4;x++)add(base,(y+2)*12+x+4,y*4+x);
        CompoundTag before=base.getOrCreateTag().copy();
        NonNullList<ItemStack> items=AstralStoredItems.read(base,20);
        require(before.equals(base.getOrCreateTag()),"read must leave original NBT untouched");
        for(int i=0;i<20;i++)require(items.get(i).marker()==i,"base relative position "+i);
        AstralStoredItems.write(base,items);require(base.getTagElement("AstralContainer").getInt("Size")==20,"base stored size");
        NonNullList<ItemStack> again=AstralStoredItems.read(base,20);
        for(int i=0;i<20;i++)require(again.get(i).marker()==i,"base roundtrip "+i);
        ItemStack rune=owner("kubejs:astral_rune",64);
        for(int y=0;y<6;y++)for(int x=0;x<6;x++)add(rune,(y+1)*8+x+1,y*6+x);
        items=AstralStoredItems.read(rune,36);
        for(int i=0;i<36;i++)require(items.get(i).marker()==i,"rune relative position "+i);
        AstralStoredItems.write(rune,items);require(rune.getTagElement("AstralContainer").getInt("Size")==36,"rune stored size");
        ItemStack crowded=owner("deeprealm_4th:base_container",108);
        for(int y=0;y<5;y++)for(int x=0;x<4;x++)add(crowded,(y+2)*12+x+4,y*4+x);
        add(crowded,27,700);add(crowded,32,701);add(crowded,0,702);
        items=AstralStoredItems.read(crowded,20);
        items.set(0,ItemStack.EMPTY);AstralStoredItems.write(crowded,items);
        items.set(1,ItemStack.EMPTY);AstralStoredItems.write(crowded,items);
        require(crowded.getTagElement("AstralContainer").getList("Items",10).size()==18,"two items removed");
        require(crowded.getTagElement("AstralContainer").getList("Overflow",10).size()==3,"repeated edits retain all overflow");
        items=AstralStoredItems.read(crowded,20);require(count(items)==20,"free cells recover overflow");
        require(items.get(0).marker()==700&&items.get(1).marker()==701,"overflow recovery order");
        AstralStoredItems.write(crowded,items);
        require(crowded.getTagElement("AstralContainer").getList("Overflow",10).size()==1,"only unrecovered item remains queued");
        items.set(2,ItemStack.EMPTY);AstralStoredItems.write(crowded,items);
        items=AstralStoredItems.read(crowded,20);require(items.get(2).marker()==702,"final overflow recovery");
        AstralStoredItems.write(crowded,items);
        require(crowded.getTagElement("AstralContainer").getList("Overflow",10).isEmpty(),"overflow removed after complete recovery");
        ItemStack frame=owner("kubejs:astral_frame",80);add(frame,4,888);
        items=AstralStoredItems.read(frame,80);require(count(items)==1&&items.get(4).marker()==888,"frame position preserved");
        System.out.println("PASS: actual storage source; base/rune reindexing, read-only NBT, save roundtrip, repeated-edit overflow retention/recovery, unchanged frame.");
    }
}''',
}
for relative, text in fixtures.items():
    target = sources / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding='utf-8')
target = sources / 'com/tonywww/deeprealm4th/platform/data/AstralStoredItems.java'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_bytes((root / '.cache/astral_gems/container_resize_mod_sources/AstralStoredItems.java').read_bytes())
java = Path('C:/Program Files/Java/openjdk-19.0.1/bin')
subprocess.run([str(java / 'javac.exe'), '--release', '17', '-d', str(classes), *map(str, sources.rglob('*.java'))], check=True)
subprocess.run([str(java / 'java.exe'), '-cp', str(classes), 'ResizeVerification'], check=True)
