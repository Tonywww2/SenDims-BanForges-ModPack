let someArgs = {
    path: "slashblade/blade",
    texturePath: "slashbladetetra:textures/gui/texture.png"
}

const ImprovementBuilder = function (scrollKey) {
    this.key = scrollKey;
    this.attributes = null;
    this.effects = null;
    this.improvementName = scrollKey;
    this.isHone = false;
    this.textureX = 16;
    this.textureY = 0;
    this.textureLocation = someArgs.texturePath;
    this.antiImprovement = [];
    this.requiredTools = null;
    this.experienceCost = null;
    this.material = null;
    this.group = null;
    this.build = (event) => {
        this.buildImprovement(event);
        this.buildSchematics(event);
    }
    this.buildImprovement = (event) => {
        let result = {
            "key": this.improvementName,
            "level": 0
        }
        if (this.group != null) {
            result.group = this.group;
        }
        if (this.effects != null) {
            result.effects = this.effects;
        }
        if (this.attributes != null) {
            result.attributes = this.attributes;
        }
        event.addJson(`tetra:improvements/${someArgs.path}/${this.key.replace(":", "_")}.json`, [result])
    }
    this.buildSchematics = (event) => {
        let requirements = []
        requirements.push({
            "type": "tetra:locked",
            "key": this.key
        });
        this.antiImprovement.push(this.improvementName);
        this.antiImprovement.forEach((improvement) => {
            requirements.push(
                {
                    "type": "tetra:not",
                    "requirement": {
                        "type": "tetra:improvement",
                        "improvement": improvement
                    }
                });
        })
        let result = {
            "replace": true,
            "slots": [
                someArgs.path
            ],
            "hone": this.isHone,
            "rarity": "hone",
            "displayType": "major",
            "glyph": {
                "textureX": this.textureX,
                "textureY": this.textureY,
                "textureLocation": this.textureLocation
            },
            "requirement": {
                "type": "tetra:and",
                "requirements": requirements
            }
        }
        let outcome = {};
        outcome.improvements = {}
        outcome.improvements[this.improvementName] = 0;
        if (this.material != null) {
            outcome.material = this.material;
            result.materialSlotCount = 1;
        }
        if (this.requiredTools != null) {
            outcome.requiredTools = this.requiredTools;
        }
        if (this.experienceCost != null) {
            outcome.experienceCost = this.experienceCost;
        }
        result.outcomes = [outcome]
        // Client.tell(outcome)
        event.addJson(`tetra:schematics/${someArgs.path}/${this.key.replace(":", "_")}.json`, result)
    }
    this.addAttribute = (attributeName, prefix, value) => {
        if (this.attributes == null) {
            this.attributes = {};
        }
        attributeName = prefix + attributeName;
        this.attributes[attributeName] = value;
        return this;
    }
    this.addAntiImprovement = (antiImprovement) => {
        if (this.antiImprovement == null) {
            this.antiImprovement = [];
        }
        this.antiImprovement.push(antiImprovement);
        return this;
    }
    this.addGroup = (group) => {
        this.group = group;
        return this;
    }
    this.setHone = () => {
        this.isHone = true;
        return this;
    }
    this.setGlyph = (location, x, y) => {
        this.textureLocation = location;
        this.textureX = x;
        this.textureY = y;
        return this;
    }
    this.addRequireTool = (tool, level, efficiency) => {
        if (this.requiredTools != null) {
            this.requiredTools = {};
        }
        if (efficiency != null) {
            this.requiredTools[tool] = [level, efficiency];
        } else {
            this.requiredTools[tool] = level;
        }
        return this;
    }
    this.addEffect = (effect, level, efficiency) => {
        if (this.effects == null) {
            this.effects = {};
        }
        if (efficiency != null) {
            this.effects[effect] = [level, efficiency];
        } else {
            this.effects[effect] = level;
        }
        return this;
    }
    this.setImprovementName = (improvementName) => {
        this.improvementName = improvementName;
        return this;
    }
    this.setExperienceCost = (experienceCost) => {
        this.experienceCost = experienceCost;
        return this;
    }
    this.setMaterial = (item, count) => {
        this.material = {
            "items": [item],
            "count": count
        }
        return this;
    }
    this.setMaterialList = (items, count) => {
        this.material = {
            "items": items,
            "count": count
        }
        return this;
    }
    this.setMaterialTag = (tag, count) => {
        if (tag.startsWith("#")) {
            tag = tag.substring(1);
        }
        this.material = {
            "tag": tag,
            "count": count
        }
        return this;
    }
}

ServerEvents.highPriorityData(event => {
    new ImprovementBuilder("tetra:warforge/axe")
        .addGroup("slashblade_warforge")
        .addAttribute("minecraft:generic.max_health", "**", -0.2)
        .addAttribute("minecraft:generic.attack_damage", "**", 0.25)
        // .addEffect("RefineStrengthening", 1000)
        .setMaterial('slashblade:proudsoul_tiny', 16)
        .setExperienceCost(20)
        .build(event)

    new ImprovementBuilder("tetra:warforge/hammer")
        .addGroup("slashblade_warforge")
        .addAttribute("minecraft:generic.max_health", "**", -0.1)
        .addAttribute("minecraft:generic.armor", "**", 0.15)
        .setMaterial('slashblade:proudsoul_tiny', 8)
        .setExperienceCost(10)
        .build(event)

    new ImprovementBuilder("tetra:warforge/pickaxe")
        .addGroup("slashblade_warforge")
        .addAttribute("minecraft:generic.max_health", "**", 0.1)
        .addAttribute("minecraft:generic.armor", "**", 0.1)
        .addAttribute("minecraft:generic.attack_damage", "**", -0.1)
        .setMaterial('slashblade:proudsoul_tiny', 8)
        .setExperienceCost(10)
        .build(event)

    new ImprovementBuilder("tetra:warforge/butt")
        .addGroup("slashblade_warforge")
        .addAttribute("minecraft:generic.knockback_resistance", "", 0.25)
        .addAttribute("minecraft:generic.attack_damage", "**", -0.05)
        .setMaterial('slashblade:proudsoul_tiny', 8)
        .setExperienceCost(10)
        .build(event)

    new ImprovementBuilder("tetra:warforge/claw")
        .addGroup("slashblade_warforge")
        .addAttribute("attributeslib:fire_damage", "**", 0.2)
        .addAttribute("attributeslib:cold_damage", "**", 0.2)
        .setMaterial('slashblade:proudsoul_tiny', 16)
        .setExperienceCost(20)
        .build(event)

    new ImprovementBuilder("tetra:warforge/hoe")
        .addGroup("slashblade_warforge")
        .addAttribute("attributeslib:cold_damage", "**", 1.0)
        .addAttribute("minecraft:generic.attack_damage", "**", -0.75)
        .setMaterial('slashblade:proudsoul_tiny', 16)
        .setExperienceCost(20)
        .build(event)

    new ImprovementBuilder("tetra:warforge/sickle")
        .addGroup("slashblade_warforge")
        .addAttribute("attributeslib:fire_damage", "**", 1.0)
        .addAttribute("minecraft:generic.attack_damage", "**", -0.75)
        .setMaterial('slashblade:proudsoul_tiny', 16)
        .setExperienceCost(20)
        .build(event)

    new ImprovementBuilder("tetra:sword/sturdy_guard")
        .addGroup("slashblade_warforge")
        .addAttribute("attributeslib:life_steal", "", 0.05)
        .addAttribute("minecraft:generic.max_health", "**", -0.5)
        .setMaterial('slashblade:proudsoul_tiny', 16)
        .setExperienceCost(20)
        .build(event)

    new ImprovementBuilder("tetra:sword/howling")
        .addGroup("slashblade_warforge")
        .addAttribute("attributeslib:armor_shred", "", 0.05)
        .setMaterial('slashblade:proudsoul_tiny', 16)
        .setExperienceCost(20)
        .build(event)

    new ImprovementBuilder("tetra:sword/throwing_knife")
        .addGroup("slashblade_warforge")
        .addAttribute("terra_curio:magic_damage", "", 0.1)
        .addAttribute("minecraft:generic.attack_damage", "**", -0.05)
        .setMaterial('slashblade:proudsoul_tiny', 16)
        .setExperienceCost(20)
        .build(event)

})