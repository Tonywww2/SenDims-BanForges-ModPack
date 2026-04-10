let someArgs = {
    path: "slashblade/blade",
    texturePath: "slashbladetetra:textures/gui/texture.png"
}

function ImprovementBuilder(scrollKey) {
    this.key = scrollKey;
    this.attributes = null;
    this.effects = null;
    this.improvementName = scrollKey;
    this.isHone = false;
    this.textureX = 16;
    this.textureY = 0;
    this.textureLocation = someArgs.texturePath;
    this.antiImprovement = null;
    this.requiredTools = null;
    this.experienceCost = null;
    this.material = null;
    this.build = function (event) {
        this.buildImprovement(event);
        this.buildSchematics(event);
    }
    this.buildImprovement = function (event) {
        let result = {
            "key": this.improvementName,
            "level": 0
        }
        if (this.effects != null) {
            result["effects"] = this.effects;
        }
        if (this.attributes != null) {
            result["attributes"] = this.attributes;
        }
        event.addJson(`tetra:improvements/${someArgs.path}/${this.key.replace(":", "_")}.json`, [result])
    }
    this.buildSchematics = function (event) {
        let requirements = []
        requirements.push({
            "type": "tetra:locked",
            "key": this.key
        });
        if (this.antiImprovement != null) {
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
        }
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
        Client.tell(outcome)
        event.addJson(`tetra:schematics/${someArgs.path}/${this.key.replace(":", "_")}.json`, result)
    }
    this.addAttribute = function (attributeName, modifier, value) {
        if (this.attributes == null) {
            this.attributes = {};
        }
        if (modifier === 1) {
            attributeName = "*" + attributeName;
        }
        if (modifier === 2) {
            attributeName = "**" + attributeName;
        }
        this.attributes[attributeName] = value;
        return this;
    }
    this.addAntiImprovement = function (antiImprovement) {
        if (this.antiImprovement == null) {
            this.antiImprovement = [];
        }
        this.antiImprovement.push(antiImprovement);
        return this;
    }
    this.setHone = function () {
        this.isHone = true;
        return this;
    }
    this.setGlyph = function (location, x, y) {
        this.textureLocation = location;
        this.textureX = x;
        this.textureY = y;
        return this;
    }
    this.addRequireTool = function (tool, level, efficiency) {
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
    this.addEffect = function (effect, level, efficiency) {
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
    this.setImprovementName = function (improvementName) {
        this.improvementName = improvementName;
        return this;
    }
    this.setExperienceCost = function (experienceCost) {
        this.experienceCost = experienceCost;
        return this;
    }
    this.setMaterial = function (item, count) {
        this.material = {
            "item": item,
            "count": count
        }
        return this;
    }
    this.setMaterialList = function (items, count) {
        this.material = {
            "items": items,
            "count": count
        }
        return this;
    }
    this.setMaterialTag = function (tag, count) {
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
        .addAttribute("attributeslib:armor_pierce", 0, 100)
        .addEffect("RefineStrengthening", 1000)
        .setMaterial("minecraft:jungle_planks", 35)
        .setExperienceCost(5)
        .build(event)
})