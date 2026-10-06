// priority: 1720
// Select the original gem model while retaining one physical filler item ID.
let initializeAstralGemPresentation = () => {
  let A = global.sdbfAstral;
  // These catalogue entries have no original item model in the current instance.
  let unavailable = ['thermal:apatite', 'thermal:cinnabar', 'thermal:niter'];
  A.prototypeModels = {};
  let species = A.species.filter(gem => unavailable.indexOf(gem.item) < 0)
    .sort((left, right) => left.number - right.number);
  A.fillerModel = {
    parent: 'minecraft:item/generated',
    textures: { layer0: 'deeprealm_4th:item/magic_gem' },
    overrides: species.map(gem => {
      let value = gem.number / 100;
      let model = gem.item.replace(':', ':item/');
      A.prototypeModels[gem.item] = { value: value, model: model };
      return { predicate: { 'sdbf_astral:prototype': value }, model: model };
    })
  };

  ItemEvents.modelProperties(event => {
    event.register(A.fillerId, 'sdbf_astral:prototype', (stack, level, entity, seed) => {
      if (!A.apiReady) return 0;
      let parsed = A.read(stack);
      let model = parsed.payload ? A.prototypeModels[parsed.payload.source_item] : null;
      return model ? model.value : 0;
    });
  });
};
initializeAstralGemPresentation();
