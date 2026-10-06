// priority: 1725
// Container identity and geometry only; scores and badge effects use the shared engine.
let initializeAstralGemContainers = () => {
  let A = global.sdbfAstral;
  A.containers = {
    base: {
      id: 'deeprealm_4th:base_container', width: 4, height: 5,
      rows: [
        'XXXX',
        'XXXX',
        'XXXX',
        'XXXX',
        'XXXX'
      ]
    },
    rune: {
      id: 'kubejs:astral_rune', width: 6, height: 6,
      rows: [
        'XXXXXX',
        'XXXXXX',
        'XXXXXX',
        'XXXXXX',
        'XXXXXX',
        'XXXXXX'
      ]
    },
    frame: {
      id: 'kubejs:astral_frame', width: 10, height: 8,
      rows: [
        '....XX....',
        '....XX....',
        'XXXXXXXXXX',
        '...XXXX...',
        '...XXXX...',
        'XXXXXXXXXX',
        '....XX....',
        '....XX....'
      ]
    }
  };
  StartupEvents.registry('item', event => {
    Object.keys(A.containers).forEach(kind => {
      if (kind === 'base') return;
      let layout = A.containers[kind];
      event.createCustom(layout.id, () => AstralContainers.create(layout.width, layout.height, layout.rows));
    });
  });
};
initializeAstralGemContainers();
