if (Platform.isClientEnvironment()) {
    let $MaterialManager = Java.loadClass("net.yiran.extraholopage.api.MaterialManager");
    let $ForgeRegistries = Java.loadClass("net.minecraftforge.registries.ForgeRegistries");

    ClientEvents.init(event => {
        let registerAttrFilter = (attributeKey, langKey) => {
            $MaterialManager.INSTANCE.registerFilter((data) => {
                return global.MMAttribute(data, attributeKey);
            }, langKey);
        };

        let getAttr = (id) => $ForgeRegistries.ATTRIBUTES.getValue(ResourceLocation.parse(id));

        registerAttrFilter(getAttr("attributeslib:crit_chance"), "attributeslib:crit_chance");
        registerAttrFilter(getAttr("attributeslib:crit_damage"), "attributeslib:crit_damage");
        registerAttrFilter(getAttr("attributeslib:cold_damage"), "attributeslib:cold_damage");
        registerAttrFilter(getAttr("attributeslib:fire_damage"), "attributeslib:fire_damage");
        registerAttrFilter(getAttr("attributeslib:experience_gained"), "attributeslib:experience_gained");
        registerAttrFilter(getAttr("attributeslib:armor_pierce"), "attributeslib:armor_pierce");
        registerAttrFilter(getAttr("attributeslib:armor_shred"), "attributeslib:armor_shred");

        registerAttrFilter(getAttr("slashblade_sendims:sprint_cd"), "attribute.name.sbsd.sprint_cd");
        registerAttrFilter(getAttr("slashblade_sendims:sprint_cd_return"), "attribute.name.sbsd.sprint_cd_return");
        registerAttrFilter(getAttr("slashblade_sendims:parry_heal_amount"), "attribute.name.sbsd.parry_heal_amount");
        registerAttrFilter(getAttr("slashblade_sendims:ap_reduce_amount"), "attribute.name.sbsd.ap_reduce_amount");
        registerAttrFilter(getAttr("slashblade_sendims:ap_gain_percentage"), "attribute.name.sbsd.ap_gain_percentage");
        registerAttrFilter(getAttr("slashblade_sendims:madness_reduce"), "attribute.name.sbsd.madness_reduce");
        registerAttrFilter(getAttr("slashblade_sendims:frenzy_resistance"), "attribute.name.sbsd.frenzy_resistance");
        registerAttrFilter(getAttr("slashblade_sendims:frenzy_damage"), "attribute.name.sbsd.frenzy_damage");
        registerAttrFilter(getAttr("slashblade_sendims:magic_resistance"), "attribute.name.sbsd.magic_resistance");
        registerAttrFilter(getAttr("slashblade_sendims:magic_penetration"), "attribute.name.sbsd.magic_penetration");
    })
}

global.MMAttribute = (data, attribute) => {
    return data.attributes != null && data.attributes.containsKey(attribute);
}
