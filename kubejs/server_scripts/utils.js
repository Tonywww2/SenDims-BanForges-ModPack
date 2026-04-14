// priority: 2000
const $Double = Java.loadClass("java.lang.Double");
const $StructureQuill = Java.loadClass("com.tonywww.slashblade_sendims.items.StructureQuill");
const $AttributeModifier = Java.loadClass("net.minecraft.world.entity.ai.attributes.AttributeModifier")
const $SAModuleRegister = Java.loadClass("net.yiran.sbtetra.api.SAModuleRegister");
const $ForgeMod = Java.loadClass("net.minecraftforge.common.ForgeMod");
const $UUID = Java.loadClass("java.util.UUID");

const $TagKey = Java.loadClass('net.minecraft.tags.TagKey');
const $Registries = Java.loadClass('net.minecraft.core.registries.Registries');
// const $ForgeRegistries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries');
const $SpawnEggItem = Java.loadClass('net.minecraft.world.item.SpawnEggItem');

const print = any=> console.log(any)

const numToInt = (num) => {
    return new $Double(num).intValue();
}