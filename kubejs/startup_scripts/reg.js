// priority: 0

StartupEvents.registry('item', event => {

    event.create('neptune_ingot').fireResistant().rarity('rare')
    event.create('valkyrie_ingot').fireResistant().rarity('rare')
    event.create('phoenix_ingot').fireResistant().rarity('rare')

    event.create('virtual_gold_ingot').fireResistant().rarity('rare')
	event.create('trinity_alloy_ingot').fireResistant().rarity('rare')
    event.create('beryllium_bronze_alloy_ingot').fireResistant().rarity('rare').glow(true)

    event.create('alpha_dust').fireResistant()
    event.create('beta_dust').fireResistant().rarity('rare')
    event.create('gamma_dust').fireResistant().rarity('rare')
    event.create('delta_dust').fireResistant().rarity('epic')
    event.create('epsilon_dust').fireResistant().rarity('epic')
    
    event.create('garden_lighter').fireResistant().rarity('rare')
    event.create('bedrock_breaker').fireResistant().rarity('rare').maxStackSize(16)
    

})