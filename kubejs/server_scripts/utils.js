// priority: 2000
const $Double = Java.loadClass("java.lang.Double");
const $StructureQuill = Java.loadClass("com.tonywww.slashblade_sendims.items.StructureQuill");
const $SDUtils = Java.loadClass("com.tonywww.slashblade_sendims.utils.SlashBladeUtil");
const $AttributeModifier = Java.loadClass("net.minecraft.world.entity.ai.attributes.AttributeModifier")
const $SAModuleRegister = Java.loadClass("net.yiran.sbtetra.api.SAModuleRegister");
const $ForgeMod = Java.loadClass("net.minecraftforge.common.ForgeMod");
const $UUID = Java.loadClass("java.util.UUID");

const $TagKey = Java.loadClass('net.minecraft.tags.TagKey');
const $Registries = Java.loadClass('net.minecraft.core.registries.Registries');
// const $ForgeRegistries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries');
const $SpawnEggItem = Java.loadClass('net.minecraft.world.item.SpawnEggItem');
const $SlashBladeDefinition = Java.loadClass('mods.flammpfeil.slashblade.registry.slashblade.SlashBladeDefinition');

const print = any => console.log(any)

const numToInt = (num) => {
    return new $Double(num).intValue();
}

const sqRecipe = (event, structure, material, type, stage) => {
    if (type == 0) {
        event.shapeless($StructureQuill.forStructure(structure), ['minecraft:map', material])
            .id("sdbf:sq_"+structure.replace(":", "_") + "_" + stage);
    } else if (type == 1) {
        event.shaped($StructureQuill.forStructure(structure), [
            'AAA',
            'ABA',
            'AAA'
        ], {
            A: material,
            B: 'minecraft:map'
        }).id("sdbf:sq_"+structure.replace(":", "_") + "_" + stage);
    }
};

const getBladeStack = (registryAccess, bladeKey) => $SDUtils.getBladeItemStack(registryAccess, bladeKey)

