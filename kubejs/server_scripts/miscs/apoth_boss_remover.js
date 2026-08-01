const APOTH_BOSS_REMOVER_ITEM = 'kubejs:apoth_boss_remover';
const APOTH_BOSS_REMOVER_RANGE = 64;
const APOTH_BOSS_REMOVER_RANGE_SQR = APOTH_BOSS_REMOVER_RANGE * APOTH_BOSS_REMOVER_RANGE;
const APOTH_BOSS_MARKER_KEY = 'apoth.boss';
const APOTH_BOSS_RARITY_KEY = 'apoth.rarity';
const APOTH_MYTHIC_RARITY = 'apotheosis:mythic';

// const isMythicApothBoss = entity => {
// 	if (!entity || !entity.isAlive() || !entity.forgePersistentData) return false;

// 	let data = entity.forgePersistentData;
// 	return data.getBoolean(APOTH_BOSS_MARKER_KEY) &&
// 		String(data.getString(APOTH_BOSS_RARITY_KEY)) === APOTH_MYTHIC_RARITY;
// };

const findNearestMythicApothBoss = (level, player) => {
	let searchBox = player.boundingBox.inflate(APOTH_BOSS_REMOVER_RANGE);
	let nearestBoss = null;
	let nearestDistanceSqr = APOTH_BOSS_REMOVER_RANGE_SQR + 1;

	level.getEntities(player, searchBox).forEach(entity => {
		// if (!isMythicApothBoss(entity)) return;

		let distanceSqr = player.distanceToSqr(entity);
		if (distanceSqr <= APOTH_BOSS_REMOVER_RANGE_SQR && distanceSqr < nearestDistanceSqr) {
			nearestBoss = entity;
			nearestDistanceSqr = distanceSqr;
		}
	});

	return nearestBoss;
};

ItemEvents.rightClicked(APOTH_BOSS_REMOVER_ITEM, event => {
	let player = event.player;
	if (!player || player.isFake()) return;

	let target = findNearestMythicApothBoss(player.level, player);
	if (!target) {
		player.tell(Text.translatable('info.kubejs.apoth_boss_remover.not_found').color(Color.RED));
		return;
	}

	let targetName = target.displayName;
	target.discard();

	player.cooldowns.addCooldown(event.item, 40);
	event.item.shrink(1);
	player.tell(Text.translatable('info.kubejs.apoth_boss_remover.success', targetName).color(Color.LIME_DYE));
});
