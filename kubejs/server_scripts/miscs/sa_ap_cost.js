let SACostMap = Utils.newMap();
// id -> 固定值， 百分比
SACostMap.put("slashblade:none", [0, 0]);

SACostMap.put("slashblade:judgement_cut", [200, 0.2]);
SACostMap.put("slashblade:judgement_cut_slash_air", [200, 0.2]);
SACostMap.put("slashblade:judgement_cut_slash_just", [400, 0.2]);

SACostMap.put("slashblade:wave_edge_vertical", [200, 0.05]);
SACostMap.put("slashblade:drive_horizontal", [200, 0.05]);

SACostMap.put("slashblade:heavens_slash_start", [200, 0.15]);

SACostMap.put("sjap_adder:illusion_drive", [400, 0.2]);

SACostMap.put("slashblade:sakura_end_left", [200, 0.05]);
SACostMap.put("slashblade:sakura_end_left_air", [200, 0.05]);

SACostMap.put("slashblade_sendims:golden_crux", [400, 0.2]);

SACostMap.put("pseudoedge_break_dawn:black_hole", [300, 0.15]);

SACostMap.put("slashblade:circle_slash", [300, 0.15]);

SACostMap.put("slashblade:storm_bias_start", [400, 0.1]);

SACostMap.put("slashblade:piercing_just", [300, 0.05]);

SACostMap.put("sjap_adder:explosive_dawn", [300, 0.2]);

SACostMap.put("sjap_adder:wave_edge_super", [300, 0.2]);

SACostMap.put("slashblade_addon:spiral_edge", [300, 0.15]);

SACostMap.put("sjap_adder:super_blood_cut", [300, 0.15]);

SACostMap.put("slashblade_addon:fire_spiral", [300, 0.1]);

SACostMap.put("last_smith:odachi_combo_a1", [300, 0.2]);

SACostMap.put("slashblade_sendims:frenzied_burst", [200, 0.15]);

let defaultCost = [200, 0.2];
let superSlashArtCost = [400, 0.3];

let consumeAPForSA = (entity, event, cost, cost_persentage) => {
    if (cost == 0 && cost_persentage == 0) return true;

    let attributeInstance = entity.getAttribute("slashblade_sendims:ap_reduce_amount");
    if (attributeInstance) {
        cost = Math.max(0, cost - attributeInstance.getValue());
    }

    let soul = $UmapyoiAPI.getUmaSoul(entity);
    if (!soul || soul.isEmpty()) {
        entity.tell(Text.translatable("text.slashblade_sendims.no_ap"));
        event.setCanceled(true);
        return false;
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
        return false;
    } else {
        // entity.tell(total_cost)
        $UmaSoulUtils.addActionPoint(soul, -total_cost);
        return true;
    }
}

NativeEvents.onEvent($PerformSlashArtEvent, event => {
    let entity = event.getEntityLiving();
    if (!entity.isPlayer()) return;

    let saId = String(event.getComboState());
    let costs = defaultCost;

    if (!SACostMap.containsKey(saId)) {
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

    consumeAPForSA(entity, event, cost, cost_persentage);
});

NativeEvents.onEvent($SuperSlashArtsReleaseEvent, event => {
    let player = event.getPlayer();

    let cost = superSlashArtCost[0];
    let cost_persentage = superSlashArtCost[1];

    consumeAPForSA(player, event, cost, cost_persentage);

})

