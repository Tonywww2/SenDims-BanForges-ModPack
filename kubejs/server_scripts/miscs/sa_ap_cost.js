let SACostMap = new Map();

SACostMap.set("slashblade:none", 0);

SACostMap.set("slashblade:judgement_cut", 400);
SACostMap.set("slashblade:judgement_cut_slash_just", 600);

SACostMap.set("slashblade:heavens_slash_start", 400);

let defaultCost = 400;

NativeEvents.onEvent($PerformSlashArtEvent, event => {
    let entity = event.getEntityLiving();
    if (!entity.isPlayer()) return;

    let saId = String(event.getComboState());
    let cost = defaultCost;

    if (!SACostMap.has(saId)) {
        console.log(`[SlashBlade] Player ${entity.username} is attempting SA [${saId}] without defined cost!`);
        entity.tell(`[SlashBlade] Player ${entity.username} is attempting SA [${saId}] without defined cost!`);
    } else {
        cost = SACostMap.get(saId);
    }

    let attributeInstance = entity.getAttribute("slashblade_sendims:ap_reduce_amount");
    if (attributeInstance) {
        cost = Math.max(0, cost - attributeInstance.getValue());
    }

    // console.log(`[SlashBlade] Player ${entity.username} is attempting SA [${saId}] with AP cost: ${cost}`);

    let soul = $UmapyoiAPI.getUmaSoul(entity);
    if (!soul || soul.isEmpty()) {
        entity.tell(Text.translatable("text.slashblade_sendims.no_ap"));
        event.setCanceled(true);
    }

    let currentAP = $UmaSoulUtils.getActionPoint(soul);
    let hasEnoughAP = currentAP >= cost;

    if (!hasEnoughAP && cost > 0) {
        let mainHandItem = entity.getMainHandItem();
        if (mainHandItem && !mainHandItem.isEmpty()) {
            entity.addItemCooldown(mainHandItem, 20);
        }
        entity.tell(Text.translatable("text.slashblade_sendims.no_ap"));
        event.setCanceled(true);

    } else {
        $UmaSoulUtils.addActionPoint(soul, -cost);

    }
});