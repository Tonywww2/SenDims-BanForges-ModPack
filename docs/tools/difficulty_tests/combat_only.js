// priority: 95
// The source mod's dev runtime lacks unrelated starter-kit item mods from the pack.
// Preserve all combat modifiers and execute their production configuration unchanged.
global.sdbfDifficultyData.modifiers = global.sdbfDifficultyData.modifiers.filter(modifier =>
    modifier.effect.type == 'enemy' || modifier.effect.type == 'damage_taken');
