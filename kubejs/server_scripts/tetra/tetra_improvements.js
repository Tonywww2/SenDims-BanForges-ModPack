let someArgs = {
    path: "slashblade/blade",
    texturePath: "slashbladetetra:textures/gui/texture.png"
}
ServerEvents.highPriorityData(event => {
    event.addJson(`tetra:improvements/${someArgs.path}/test.json`, [
        {
            "key": "zzz",
            "level": 1,
            "effects": {
                "RefineStrengthening": 1
            }
        }
    ])
    event.addJson(`tetra:schematics/${someArgs.path}/test.json`, {
        "replace": true,
        "slots": [
            someArgs.path
        ],
        "hone": true,
        "rarity": "hone",
        "displayType": "major",
        "glyph": {
            "textureX": 16,
            "textureY": 0,
            "textureLocation": someArgs.texturePath
        },
        "requirement": {
            "type": "tetra:and",
            "requirements": [
                {
                    "type": "tetra:locked",
                    //原理图的id
                    "key": "tetra:warforge/axe"
                }/*,//限制与其他improvement不兼容
                {
                    "type": "tetra:not",
                    "requirement": {
                        "type": "tetra:improvement",
                        "improvement": "double/warforged"
                    }
                }*/
            ]
        },
        "outcomes": [
            {
                "requiredTools": {
                    "hammer_dig": 1
                },
                "experienceCost": 3,
                "improvements": {
                    "zzz": 1
                }
            }
        ]
    })
})