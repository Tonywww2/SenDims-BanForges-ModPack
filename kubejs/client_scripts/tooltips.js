let GEM_TICKET_DIM_PATH = "sdbf.gt.dim";
let LIMIT_DIMENSTION_KEY = "sdbf.use_in";


ItemEvents.tooltip(event => {

    event.add('minecraft:arrow', Text.translatable('info.kubejs.material.arrow.1').color(Color.LIME_DYE));
    event.add('minecraft:book', Text.translatable('info.kubejs.material.book.1').color(Color.LIME_DYE));
    event.add('umapyoi:speed_low_item', Text.translatable('info.kubejs.material.lowbook').color(Color.LIME_DYE));
    event.add('umapyoi:speed_mid_item', Text.translatable('info.kubejs.material.midbook').color(Color.LIME_DYE));
    event.add('umapyoi:speed_high_item', Text.translatable('info.kubejs.material.highbook').color(Color.LIME_DYE));

    event.add('slashblade_sendims:blessing_petals', Text.translatable('info.kubejs.blessing_petals'))
    event.add('slashblade_sendims:principle_of_sword_arts', Text.translatable('info.kubejs.principle_of_sword_arts'))

    event.add('slashblade_sendims:the_nectar_quest', Text.translatable('info.kubejs.the_nectar_quest'))
    event.add('slashblade_sendims:the_nectar_quest', Text.translatable('info.kubejs.the_nectar_quest_2'))

    event.add('#slashblade:can_copy_sa', Text.translatable('info.kubejs.slashblade.can_copy_sa').color(Color.AQUA));
    event.add('#slashblade:can_copy_se', Text.translatable('info.kubejs.slashblade.can_copy_se').color(Color.AQUA));
    
    event.add("powerful_dummy:dummy_stand", Text.translatable('info.kubejs.dummy_stand').color(Color.AQUA))

    event.add('kubejs:anchor_shard', Text.translatable('info.kubejs.anchor_shard').color(Color.AQUA));
    event.add('kubejs:chaotic_truth', Text.translatable('info.kubejs.chaotic_truth').color(Color.AQUA));
    event.add('kubejs:apoth_boss_remover', Text.translatable('info.kubejs.apoth_boss_remover').color(Color.AQUA));
    event.add('kubejs:apoth_boss_remover', Text.translatable('info.kubejs.apoth_boss_remover.consume').color(Color.GRAY));
    
    event.add('tofucraft:blocktofugrilled', Text.translatable('info.kubejs.blocktofugrilled').color(Color.AQUA));
    event.add('ad_astra:moon_stone', Text.translatable('info.kubejs.moon_stone').color(Color.AQUA));
    event.add('ad_astra:moon_cobblestone', Text.translatable('info.kubejs.moon_cobblestone').color(Color.AQUA));
    event.add('terra_entity:king_slime_spawn_egg', Text.translatable('info.kubejs.king_slime_spawn_egg').color(Color.AQUA));
    
    event.add('slashblade_sendims:deeprealm_certificate', Text.translatable('info.kubejs.deeprealm_certificate'));

    event.add([
        'energyblade:forge_energy_blade',
        // 'slashbladetetra:hf'
    ], Text.translatable('info.kubejs.forge_energy_blade').color(Color.AQUA));

    event.add('nuclearcraft:analyzer', Text.translatable('info.kubejs.banned').color(Color.RED));

    event.add([
        'nuclearcraft:light',
        'nuclearcraft:medium',
        'nuclearcraft:heavy',
        'nuclearcraft:dps'
    ], Text.translatable('info.kubejs.nuclearcraft.apply_rad_prot').color(Color.AQUA));

    event.add([
        'draconicevolution:draconic_sword',
        'draconicevolution:draconic_staff',
        'draconicevolution:draconic_bow',
        'draconicevolution:chaotic_sword',
        'draconicevolution:chaotic_staff',
        'draconicevolution:chaotic_bow',
        'draconicevolution:wyvern_sword',
        'draconicevolution:wyvern_bow'
    ], Text.translatable('info.kubejs.draconic_weapon_warning').color(Color.RED));

    event.addAdvanced([
        'slashblade:slashblade',
        'energyblade:forge_energy_blade',
        'slashbladetetra:slashblade',
        'slashbladetetra:hf'
    ], (item, advanced, text) => {
        if (item.nbt && item.nbt.bladeState && item.nbt.bladeState.translationKey) {
            text.add(Text.of(String(item.nbt.bladeState.translationKey).substring(5).replace(".", ":")).color(Color.LIME_DYE));
        }
    })

    event.addAdvanced('kubejs:gem_ticket', (item, advanced, text) => {
        text.add(Text.translatable('info.kubejs.gem_ticket').color(Color.AQUA));
        if (item.nbt && item.nbt.getString(GEM_TICKET_DIM_PATH)) {
            text.add(Text.of(item.nbt.getString(GEM_TICKET_DIM_PATH)).color(Color.WHITE));

        }
    })

    event.addAdvanced('midnight:rift_placer', (item, advanced, text) => {
        if (!item.nbt || !item.nbt.getBoolean("sdbf.midnight")) {
            text.add(Text.translatable('info.kubejs.item_unactivated').color(Color.RED));

        } else {
            text.add(Text.translatable('info.kubejs.rift_placer_activated').color(Color.AQUA));
        }
    })

    event.addAdvanced(Ingredient.all, (item, advanced, text) => {
        if (item.nbt && item.nbt.getString(LIMIT_DIMENSTION_KEY)) {
            text.add(Text.translatable("info.kubejs.dimension_limit").append(
                Text.of(item.nbt.getString(LIMIT_DIMENSTION_KEY))
            ).color(Color.WHITE));

        }

        if (event.alt && item.nbt) {
            text.add(Text.of('NBT: ').append(Text.prettyPrintNbt(item.nbt)));
        }
    })

    event.addAdvanced('#forge:gems', (item, advanced, text) => {
        let gemInfo = getGemInfo(item);
        if (gemInfo) {
            buildGemTooltip(gemInfo).forEach(line => text.add(line));
        }
    })

    event.add('sdbf:fantasy_bubble', Text.translatable('info.kubejs.fantasy_bubble').color(Color.GRAY));
    event.add('sdbf:chaos_anchor', Text.translatable('info.kubejs.chaos_anchor').color(Color.GRAY));
    event.add('sdbf:dream_cat', Text.translatable('info.kubejs.dream_cat').color(Color.GRAY));
    event.add('sdbf:dream_cat', Text.translatable('info.kubejs.dream_cat_2').color(Color.GRAY));
    event.add('sdbf:stationary_matter', Text.translatable('info.kubejs.stationary_matter').color(Color.GRAY));

})