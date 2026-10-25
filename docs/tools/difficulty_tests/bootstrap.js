// priority: 2000
// Isolated GameTest fixture: only the shared bindings used by the production scripts.
let $UUID = Java.loadClass('java.util.UUID');
let $AttributeModifier = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier');
let $AttributeModifierOperation = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation');
let $ForgeRegistries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries');
let $PlayerNameFormatEvent = Java.loadClass('net.minecraftforge.event.entity.player.PlayerEvent$NameFormat');
let $LivingHurtEvent = Java.loadClass('net.minecraftforge.event.entity.living.LivingHurtEvent');
let $TagKey = Java.loadClass('net.minecraft.tags.TagKey');
let $Registries = Java.loadClass('net.minecraft.core.registries.Registries');
let $StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType');
let $ClickEvent = Java.loadClass('net.minecraft.network.chat.ClickEvent');
let $ClickEventAction = Java.loadClass('net.minecraft.network.chat.ClickEvent$Action');
let $CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag');
let OVERWORLD_STAGE = 'sdbf.world_lock';
