// priority: 200
// By Tonywww, 原始用途：千界万锻整合包

const tetraMaterialBuilder = (event, id) => {
    const key = id;
    let category = "metal";
    let primary = 0;
    let secondary = 0;
    let tertiary = 0;
    let durability = 0;
    let integrityCost = 0;
    let integrityGain = 0;
    let magicCapacity = 0;
    let toolLevel = "minecraft:netherite";
    let toolEfficiency = 0;
    let experienceCost = 0;
    let replace = true;
    let hidden = false;
    let hiddenOutcomes = false;

    const tints = {
        "glyph": "",
        "texture": ""
    };
    const textures = [];
    const material = {
        "items": [],
        "count": 1
    };
    const requiredTools = {};
    const effects = {};
    const attributes = {};
    const improvements = {};
    let tags = undefined;
    let features = undefined;
    const builder = {
        setCategory(str) { category = str; return builder; },
        setPrimary(num) { primary = num; return builder; },
        setSecondary(num) { secondary = num; return builder; },
        setTertiary(num) { tertiary = num; return builder; },
        setDurability(int) { durability = int; return builder; },
        setIntegrityCost(int) { integrityCost = int; return builder; },
        setIntegrityGain(int) { integrityGain = int; return builder; },
        setMagicCapacity(int) { magicCapacity = int; return builder; },
        setToolLevel(str) { toolLevel = str; return builder; },
        setToolEfficiency(int) { toolEfficiency = int; return builder; },
        setTints(glyph, texture) { tints.glyph = glyph; tints.texture = texture; return builder; },
        addTexture(texture) { textures.push(texture); return builder; },
        addItemMaterial(item) { material.items.push(item); return builder; },
        setTagMaterial(tag) { material["tag"] = tag; return builder; },
        setMaterialNBT(any) { material[nbt] = any; return builder; },
        addMaterialCount(num) { material.count = num; return builder; },
        setRequiredTool(tool, level) { requiredTools[tool] = level; return builder; },
        setReplace(bool) { replace = bool; return builder; },
        setHidden(bool) { hidden = bool; return builder; },
        setHiddenOutcomes(bool) { hiddenOutcomes = bool; return builder; },
        addEffects(eff, int) { effects[eff] = int; return builder; },
        addAttributes(att, num) { attributes[att] = num; return builder; },
        addImprovements(str, any) { improvements[str] = any; return builder; },
        setExperienceCost(num) { experienceCost = num; return builder; },
        setTags(lst) { tags = lst; return builder; },
        setFeatures(lst) { features = lst; return builder; },

        build() {
            const json = {
                key: key,
                category: category,
                primary: primary,
                secondary: secondary,
                tertiary: tertiary,
                durability: durability,
                integrityCost: integrityCost,
                integrityGain: integrityGain,
                magicCapacity: magicCapacity,
                toolLevel: toolLevel,
                toolEfficiency: toolEfficiency,
                experienceCost: experienceCost,
                replace: replace,
                hidden: hidden,
                hiddenOutcomes: hiddenOutcomes,
                tints: tints,
                textures: textures,
                material: material,
                requiredTools: requiredTools,
                effects: effects,
                attributes: attributes,
                improvements: improvements
            };
            if (features) json["features"] = features;
            if (tags) json["tags"] = tags;
            event.addJson(`tetra:materials/${category}/${key}.json`, json);
            console.log(`[Tetra Wheel Chair] Material "${key}" Build-ed. `);
        }
    };
    return builder;
}