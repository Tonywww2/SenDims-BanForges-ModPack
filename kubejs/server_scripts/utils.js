// priority: 2000

// ---- Java Std ----
const $Double = Java.loadClass("java.lang.Double");
const $UUID = Java.loadClass("java.util.UUID");
const $HashSet = Java.loadClass("java.util.HashSet");
const $StringArgumentType = Java.loadClass("com.mojang.brigadier.arguments.StringArgumentType");

// ---- Minecraft ----
const $TagKey = Java.loadClass("net.minecraft.tags.TagKey");
const $Registries = Java.loadClass("net.minecraft.core.registries.Registries");
const $SpawnEggItem = Java.loadClass("net.minecraft.world.item.SpawnEggItem");
const $AttributeModifier = Java.loadClass("net.minecraft.world.entity.ai.attributes.AttributeModifier");
const $AttributeModifierOperation = Java.loadClass("net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation");
const $ClickEvent = Java.loadClass("net.minecraft.network.chat.ClickEvent");
const $ClickEventAction = Java.loadClass("net.minecraft.network.chat.ClickEvent$Action");

// ---- Forge ----
const $ForgeMod = Java.loadClass("net.minecraftforge.common.ForgeMod");
const $ForgeRegistries = Java.loadClass("net.minecraftforge.registries.ForgeRegistries");
const $RegistryManager = Java.loadClass("net.minecraftforge.registries.RegistryManager");
const $LivingHurtEvent = Java.loadClass("net.minecraftforge.event.entity.living.LivingHurtEvent");
const $LivingTickEvent = Java.loadClass("net.minecraftforge.event.entity.living.LivingEvent$LivingTickEvent");
const $PlayerNameFormatEvent = Java.loadClass("net.minecraftforge.event.entity.player.PlayerEvent$NameFormat");
const $PortalSpawnEvent = Java.loadClass("net.minecraftforge.event.level.BlockEvent$PortalSpawnEvent");
const $ItemStackedOnOtherEvent = Java.loadClass("net.minecraftforge.event.ItemStackedOnOtherEvent");
const $ModularItemDamageEvent = Java.loadClass("se.mickelus.tetra.event.ModularItemDamageEvent");

// ---- SlashBlade ----
const $ItemSlashBlade = Java.loadClass("mods.flammpfeil.slashblade.item.ItemSlashBlade");
const $SlashBladeDefinition = Java.loadClass("mods.flammpfeil.slashblade.registry.slashblade.SlashBladeDefinition");
const $SlashBladeRegistryEvent = Java.loadClass("mods.flammpfeil.slashblade.event.SlashBladeRegistryEvent");
const $PerformSlashArtEvent = Java.loadClass("mods.flammpfeil.slashblade.event.SlashBladeEvent$PerformSlashArtEvent");

// ---- SlashBlade Sendims ----
const $StructureQuill = Java.loadClass("com.tonywww.slashblade_sendims.items.StructureQuill");
const $SDUtils = Java.loadClass("com.tonywww.slashblade_sendims.utils.SlashBladeUtil");
const $SuperSlashArtsReleaseEvent = Java.loadClass("com.tonywww.slashblade_sendims.events.SuperSlashArtsReleaseEvent");
const $RecipeRemovalHelper = Java.loadClass("com.tonywww.slashblade_sendims.api.RecipeRemovalHelper");

// ---- Tetra ----
const $SAModuleRegister = Java.loadClass("net.yiran.sbtetra.api.SAModuleRegister");

// ---- GeoTetraArmor ----
const $ModularArmorItem = Java.loadClass("ovo.yiran.geotetraarmor.items.ModularArmorItem");

// ---- Umapyoi ----
const $UmaSoulUtils = Java.loadClass("net.tracen.umapyoi.utils.UmaSoulUtils");
const $UmapyoiAPI = Java.loadClass("net.tracen.umapyoi.api.UmapyoiAPI");

// ---- Undergarden ----
const $UGBlocks = Java.loadClass("quek.undergarden.registry.UGBlocks");
const $UGSoundEvents = Java.loadClass("quek.undergarden.registry.UGSoundEvents");

// ---- Curios ----
const $CuriosApi = Java.loadClass("top.theillusivec4.curios.api.CuriosApi");
let $CuriosHelper = $CuriosApi.getCuriosHelper();

// ---- Chisel ----
const $ChiselGroupLookup = Java.loadClass("com.periut.chisel.block.ChiselGroupLookup");

// ---- Apotheosis / Placebo ----
const $GemRegistry = Java.loadClass("dev.shadowsoffire.apotheosis.adventure.socket.gem.GemRegistry");
const $IDimensional = Java.loadClass("dev.shadowsoffire.placebo.reload.WeightedDynamicRegistry").IDimensional;
const $IStaged = Java.loadClass("dev.shadowsoffire.apotheosis.adventure.compat.GameStagesCompat").IStaged;

// ---- Distributed Server Classes ----
const $BloodJade = Java.loadClass("com.tonywww.slashblade_sendims.items.BloodJade");
const $TargetingConditions = Java.loadClass("net.minecraft.world.entity.ai.targeting.TargetingConditions");
const $TheHarbingerEntity = Java.loadClass("com.github.L_Ender.cataclysm.entity.AnimationMonster.BossMonsters.The_Harbinger_Entity");
const $GlobalPos = Java.loadClass("net.minecraft.core.GlobalPos");
const $EntityTravelToDimensionEvent = Java.loadClass("net.minecraftforge.event.entity.EntityTravelToDimensionEvent");
const $SGJourneyUniverse = Java.loadClass("net.povstalec.sgjourney.common.data.Universe");
const $SGJourneyConversion = Java.loadClass("net.povstalec.sgjourney.common.misc.Conversion");
const $SlashArtsRegistry = Java.loadClass("mods.flammpfeil.slashblade.registry.SlashArtsRegistry");

let print = any => console.log(any)

let GEM_TICKET_DIM_PATH = "sdbf.gt.dim";

let numToInt = (num) => {
    return new $Double(num).intValue();
}

let sqRecipe = (event, structure, material, type, stage) => {
    // print(structure);
    if (type == 0) {
        event.shapeless($StructureQuill.forStructure(structure), ['minecraft:map', material])
            .id("sdbf:sq_" + structure.replace(":", "_") + "_" + stage);
    } else if (type == 1) {
        event.shaped($StructureQuill.forStructure(structure), [
            'AAA',
            'ABA',
            'AAA'
        ], {
            A: material,
            B: 'minecraft:map'
        }).id("sdbf:sq_" + structure.replace(":", "_") + "_" + stage);
    }
};

let getBladeStack = (registryAccess, bladeKey) => $SDUtils.getBladeItemStack(registryAccess, bladeKey)

let hasCurios = (player, id) => {
    let curiosAll = $CuriosHelper.getEquippedCurios(player).resolve().get()
    // player.tell(curiosAll)
    for (let i = 0; i < curiosAll.getSlots(); i++) {
        let curiosItem = curiosAll.getStackInSlot(i);
        if (!curiosItem.isEmpty()) {
            if (curiosItem.getItem().id === id) {
                return true;
            }
        }
    }
    return false
}

let executeCommands = (player, command) => {
    command = command.trim();
    if (command !== "") {
        Utils.server.runCommandSilent(`execute as ${player.username} run ${command}`);
    }
}
