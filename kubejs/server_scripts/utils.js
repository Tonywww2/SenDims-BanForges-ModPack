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
const $ForgeRegistries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries');
const $SpawnEggItem = Java.loadClass('net.minecraft.world.item.SpawnEggItem');
const $SlashBladeDefinition = Java.loadClass('mods.flammpfeil.slashblade.registry.slashblade.SlashBladeDefinition');
const $ItemSlashBlade = Java.loadClass('mods.flammpfeil.slashblade.item.ItemSlashBlade');

const $ModularArmorItem = Java.loadClass("ovo.yiran.geotetraarmor.items.ModularArmorItem");

const $ModularItemDamageEvent = Java.loadClass("se.mickelus.tetra.event.ModularItemDamageEvent");
const $LivingHurtEvent = Java.loadClass("net.minecraftforge.event.entity.living.LivingHurtEvent");
const $LivingTickEvent = Java.loadClass('net.minecraftforge.event.entity.living.LivingEvent$LivingTickEvent');
const $PortalSpawnEvent = Java.loadClass("net.minecraftforge.event.level.BlockEvent$PortalSpawnEvent")
const $PerformSlashArtEvent = Java.loadClass("mods.flammpfeil.slashblade.event.SlashBladeEvent$PerformSlashArtEvent")
const $ItemStackedOnOtherEvent = Java.loadClass("net.minecraftforge.event.ItemStackedOnOtherEvent")

const $UmaSoulUtils = Java.loadClass("net.tracen.umapyoi.utils.UmaSoulUtils")
const $UmapyoiAPI = Java.loadClass("net.tracen.umapyoi.api.UmapyoiAPI")

const $UGBlocks = Java.loadClass('quek.undergarden.registry.UGBlocks');
const $UGSoundEvents = Java.loadClass('quek.undergarden.registry.UGSoundEvents');

const $CuriosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi')
const $CuriosHelper = $CuriosApi.getCuriosHelper()

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

const hasCurios = (player, id) => {
    let curiosAll = $CuriosHelper.getEquippedCurios(player).resolve().get()
    // player.tell(curiosAll)
    for (let i = 0; i < curiosAll.getSlots(); i++) {
        let curiosItem = curiosAll.getStackInSlot(i);
        if (!curiosItem.isEmpty()) {
            if (curiosItem.getItem().id === id) {
                return true
            }
        }
    }
    return false
}

