const $ArmorItem = Java.loadClass("net.minecraft.world.item.ArmorItem");
const $SwordItem = Java.loadClass("net.minecraft.world.item.SwordItem");
const $AxeItem = Java.loadClass("net.minecraft.world.item.AxeItem");

ItemEvents.modification(event => {
    Ingredient.all.getItemTypes().forEach(item => {
        if (item instanceof $ArmorItem) {
            item.setArmorProtection(1);
            item.setArmorToughness(0.2);
        }
        if (item instanceof $SwordItem) {
            item.setAttackDamage(1);
        }
        if (item instanceof $AxeItem) {
            item.setAttackDamage(1);
        }
    });
    
})