// Display the existing gem interactions in Sendims' native stacking category.
let initializeAstralGemStackingJei = () => {
  let A = global.sdbfAstral;
  if (!A.apiReady) return;
  let RecipesUpdated = Java.loadClass('net.minecraftforge.client.event.RecipesUpdatedEvent');
  let Priority = Java.loadClass('net.minecraftforge.eventbus.api.EventPriority');
  let Compound = Java.loadClass('net.minecraft.nbt.CompoundTag');
  let prefix = 'jei.sdbf_astral.';

  let registerAstralGemStackingJei = event => {
    let StackData = Java.loadClass('com.tonywww.slashblade_sendims.compat.jei.StackData');
    let displays = [];
    let samples = [];
    let add = (key, carried, target) => {
      displays.push({lang: prefix + key, carried: Ingredient.of(carried), target: target});
    };
    A.species.forEach(species => {
      if (!Item.exists(species.item)) return;
      let extensions = new Compound();
      extensions.putBoolean('processed', true);
      extensions.putInt('enhancement_uses', 0);
      let data = {schema: 1, source_item: species.item, primary: A.byItem[species.item][0].primary,
        natural: {size: 250, purity: 100, polish: 50},
        affixes: [{stat: 'size', operation: 'flat', value: -10}], reinforcements: [], extensions: extensions};
      let gem = A.write(Item.of(species.item), data);
      samples.push({data: data, gem: gem});

      let agents = Object.keys(A.processing.tiers).filter(tier => A.canProcess(species.item, tier))
        .map(tier => A.processing.tiers[tier].id);
      add('process', agents, Item.of(species.item));
      Object.keys(A.processing.enhancements).forEach(kind => {
        add('enhancement.' + kind, A.processing.enhancements[kind].id, gem);
      });
      add('filler', 'minecraft:paper', gem);
      add('embed', A.badgeId, gem);
    });

    if (samples.length) {
      let example = samples.find(sample => sample.data.source_item === 'thermal:ruby') || samples[0];
      let filler = A.write(Item.of(A.fillerId), example.data);
      let badge = A.write(Item.of(A.badgeId), example.data);
      Object.keys(A.processing.enhancements).forEach(kind => {
        let agent = A.processing.enhancements[kind].id;
        add('enhancement.' + kind, agent, filler);
        add('enhancement.' + kind, agent, badge);
      });
      let badges = samples.map(sample => A.write(Item.of(A.badgeId), sample.data));
      add('extract', badges, Item.of('minecraft:air'));
    }

    // Rebuild only our displays when recipes synchronize.
    StackData.AllData.removeIf(data => String(data.lang()).startsWith(prefix));
    displays.forEach(display => StackData.register(display.lang, display.carried, display.target));
    console.info('[Astral gems] Registered ' + displays.length + ' Sendims stacking JEI displays.');
  };
  NativeEvents.onEvent(Priority.HIGHEST, false, RecipesUpdated, registerAstralGemStackingJei);
};
initializeAstralGemStackingJei();
