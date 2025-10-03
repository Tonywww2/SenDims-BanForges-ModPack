// priority: 0

StartupEvents.registry('item', event => {

    event.create('alpha_dust').fireResistant()
    event.create('beta_dust').fireResistant().rarity('rare')
    event.create('gamma_dust').fireResistant().rarity('rare')
    event.create('delta_dust').fireResistant().rarity('epic')
    event.create('epsilon_dust').fireResistant().rarity('epic')

})