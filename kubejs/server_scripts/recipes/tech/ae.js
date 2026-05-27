ServerEvents.recipes(event => {

    event.custom({
        "type": "ae2:inscriber",
        "ingredients": {
            "bottom": { "item": "ae2:printed_silicon" },
            "middle": { "item": "nuclearcraft:basic_voltaic_pile" },
            "top": { "item": "appflux:printed_energy_processor" }
        }, "mode": "press",
        "result": { "item": "appflux:energy_processor" }
    }).id('sdbf:energy_processor')

})