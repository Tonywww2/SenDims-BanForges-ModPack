// priority: 200
// 用于构建 tetra:modules/slashblade/soul/sa.json

const tetraSlashBladeSABuilder = (event) => {
    let type = "slashbladetetra:blade";
    let slots = ["slashblade/soul"];
    let improvements = ["tetra:slashblade/shared/"];
    let variants = [];

    let builder = {
        setType(str) { type = str; return builder; },
        setSlots(arr) { slots = arr; return builder; },
        addSlot(str) { slots.push(str); return builder; },
        setImprovements(arr) { improvements = arr; return builder; },
        addImprovement(str) { improvements.push(str); return builder; },

        /**
         * 开启一个新的 Variant 构建过程
         * @param {string} key variant 的 key, 例如 "sa/slashblade:sakura_end"
         */
        variant(key) {
            let attributes = {};
            let effects = {};
            let glyph = undefined;

            let variantBuilder = {
                addAttributes(att, val) { attributes[att] = val; return variantBuilder; },
                addEffects(eff, val) { effects[eff] = val; return variantBuilder; },
                setGlyph(textureX, textureY, textureLocation) {
                    glyph = {
                        textureX: textureX,
                        textureY: textureY,
                        textureLocation: textureLocation
                    };
                    return variantBuilder;
                },
                // 结束当前 Variant 配置并将其保存到 variants 列表中，返回主 builder 供继续链式调用
                end() {
                    let json = { key: key };
                    if (Object.keys(attributes).length > 0) json["attributes"] = attributes;
                    if (Object.keys(effects).length > 0) json["effects"] = effects;
                    if (glyph) json["glyph"] = glyph;

                    variants.push(json);
                    return builder;
                }
            };
            return variantBuilder;
        },

        build() {
            let json = {
                type: type,
                slots: slots,
                improvements: improvements,
                variants: variants
            };

            event.addJson('tetra:modules/slashblade/soul/sa.json', json);
            // print(json)
            console.log(`[Tetra Wheel Chair] Module "slashblade/soul/sa.json" Build-ed. `);
        }
    };
    return builder;
}

let saSoulOverride = Utils.newMap();

saSoulOverride.put("slashblade_sendims:explosive_dawn_ammo", (builer) => { return builer.addAttributes("forge:entity_reach", 0.5).addAttributes("attributeslib:armor_pierce", 12) })

ServerEvents.highPriorityData(event => {
    let builder = tetraSlashBladeSABuilder(event);
    let saRegistry = $RegistryManager.ACTIVE.getRegistry(ResourceLocation.parse("slashblade:slash_arts"));
    // print(saRegistry)
    saRegistry.forEach(saLocation => {
        let saId = String(saLocation.toString());

        let tempBuilder = builder.variant(`sa/${saId}`);

        if (saSoulOverride.containsKey(saId)) {
            tempBuilder = saSoulOverride.get(saId)(tempBuilder);

        } else {
            tempBuilder = tempBuilder
                .addAttributes("forge:entity_reach", 1)
                .addEffects("RefineStrengthening", 8);
        }

        tempBuilder
            .setGlyph(64, 0, "slashbladetetra:textures/gui/texture.png")
            .end();
    });

    builder.build();
});

