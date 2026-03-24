ForgeEvents.onEvent("net.minecraftforge.event.entity.EntityAttributeModificationEvent", event=> {
    event.add("minecraft:shulker", "minecraft:generic.attack_damage");
    event.add("undergarden:minion", "minecraft:generic.attack_damage");

})