let SACostMap = new Map();
// id -> 固定值， 百分比
SACostMap.set("slashblade:none", (0, 0));

SACostMap.set("slashblade:judgement_cut", [200, 0.2]);
SACostMap.set("slashblade:judgement_cut_slash_air", [200, 0.2]);
SACostMap.set("slashblade:judgement_cut_slash_just", [400, 0.2]);

SACostMap.set("slashblade:heavens_slash_start", [200, 0.15]);
SACostMap.set("slashblade:wave_edge_vertical", [200, 0.15]);

let defaultCost = [200, 0.2];

NativeEvents.onEvent($PerformSlashArtEvent, event => {
    let entity = event.getEntityLiving();
    if (!entity.isPlayer()) return;

    let saId = String(event.getComboState());
    let costs = defaultCost;

    if (!SACostMap.has(saId)) {
        console.log(`[SlashBlade] Player ${entity.username} is attempting SA [${saId}] without defined cost!`);
        entity.tell(
            Text.of(`[SlashBlade] Player ${entity.username} is attempting SA [`)
                .append(Text.of(saId).underlined().clickCopy(saId))
                .append(Text.of(`] without defined cost!`))
        );
    } else {
        costs = SACostMap.get(saId);
    }

    let cost = costs[0];
    let cost_persentage = costs[1];
    if (cost == 0 && cost_persentage == 0) return;

    let attributeInstance = entity.getAttribute("slashblade_sendims:ap_reduce_amount");
    if (attributeInstance) {
        cost = Math.max(0, cost - attributeInstance.getValue());
    }
    
    let soul = $UmapyoiAPI.getUmaSoul(entity);
    if (!soul || soul.isEmpty()) {
        entity.tell(Text.translatable("text.slashblade_sendims.no_ap"));
        event.setCanceled(true);
    }

    let currentAP = $UmaSoulUtils.getActionPoint(soul);
    let maxAP = $UmaSoulUtils.getMaxActionPoint(soul);
    let total_cost = cost + (maxAP * cost_persentage);

    let hasEnoughAP = currentAP >= total_cost;

    if (!hasEnoughAP && total_cost > 0) {
        let mainHandItem = entity.getMainHandItem();
        if (mainHandItem && !mainHandItem.isEmpty()) {
            entity.addItemCooldown(mainHandItem, 20);
        }
        entity.tell(Text.translatable("text.slashblade_sendims.no_ap"));
        event.setCanceled(true);

    } else {
        $UmaSoulUtils.addActionPoint(soul, -total_cost);

    }
});