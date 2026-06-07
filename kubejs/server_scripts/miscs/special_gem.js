// priority: 1
// 宝石服务端代码：数据生成

let GEM_TIER_TO_VAL_RANGE = [
    // 初始大小，大小成长范围，初始纯度，纯度成长范围，初始抛光，抛光成长范围
    [1, 99, 1, 75, 1, 99],
    [51, 199, 15, 99, 51, 199],
    [101, 299, 25, 99, 101, 299],
    [151, 399, 50, 119, 151, 399],
];

let generateGemData = (player, stack) => {
    let existing = stack.getOrCreateTag().getCompound(GEM_GENERAL_KEY);
    if (existing && !existing.isEmpty()) return stack;

    let luck = player ? player.getLuck() : 0;
    let tier = stack.getOrCreateTag().getInt(GEM_TIER_KEY);
    if (tier < 0 || tier >= GEM_TIER_TO_VAL_RANGE.length) tier = 0;

    let [scaleMin, scaleRange, purityMin, purityRange, polishMin, polishRange] = GEM_TIER_TO_VAL_RANGE[tier];

    // 幸运提升基础成功率，从 0.99 向上微调
    let baseSuccess = Math.min(0.999, 0.99 + luck * 0.0008);

    let rollStat = (min, max) => {
        if (min >= max) return min;
        let range = max - min;

        // 1. 反推: 当 d 刚好等于 range 时，target 的最大理论值
        // Calculate the theoretical max target when d exactly equals range
        let maxTarget = (range - 1) / 2;

        // 2. 根据 maxTarget 算出 u 允许的最小值
        // Calculate the minimum allowable 'u' based on maxTarget
        let minU = Math.pow(baseSuccess, maxTarget);

        // 3. 将随机数安全地映射到 [minU, 1] 区间，从根本上杜绝 d 溢出
        // Safely map the random number to the [minU, 1] interval, fundamentally preventing 'd' from overflowing
        let u = minU + (1 - minU) * Math.random();

        let target = Math.log(u) / Math.log(baseSuccess);

        // 此时的判别式算出的 d 最大刚好就是 range
        // The discriminant will now produce a 'd' that exactly maxes out at 'range'
        let discriminant = 1 + 8 * range * target;
        if (discriminant <= 0) return min;

        let d = Math.floor((1 + Math.sqrt(discriminant)) / 2);

        // 因为 d 自然受到限制，不需要再用 Math.min 强制截断，尖峰被完美消除
        // Because 'd' is naturally bounded, no forced clamping with Math.min is needed, perfectly eliminating the spike
        return min + d;
    };

    let scale = rollStat(scaleMin, scaleMin + scaleRange);
    let purity = rollStat(purityMin, purityMin + purityRange);
    let polish = rollStat(polishMin, polishMin + polishRange);

    // 词缀选取
    let positiveAffixes = Object.values(GEM_AFFIX).slice(0, 9);
    let negativeAffixes = Object.values(GEM_AFFIX).slice(9);

    let affixCount = Math.min(5, Math.max(1, Math.random() * (tier + 1) * (luck + 1) * 0.5));
    let negativeChance = Math.max(0, 0.25 - luck * 0.02);

    let selectedAffixes = [];
    let usedAffixes = {};
    for (let i = 0; i < affixCount; i++) {
        let pool = Math.random() < negativeChance ? negativeAffixes : positiveAffixes;
        let available = pool.filter(a => !usedAffixes[a]);
        if (available.length === 0) break;
        let picked = available[Math.floor(Math.random() * available.length)];
        usedAffixes[picked] = true;
        selectedAffixes.push(picked);
    }

    // 写入 NBT
    let tag = stack.getOrCreateTag();
    let gemData = {};

    gemData[GEM_SCALE_KEY] = scale;
    gemData[GEM_PURITY_KEY] = purity;
    gemData[GEM_POLISH_KEY] = polish;

    gemData[GEM_AFFIX_KEY] = selectedAffixes;

    tag.put(GEM_GENERAL_KEY, gemData);
    return stack;
}


// 测试
// ItemEvents.rightClicked(event => {
//     if (event.item.hasTag("forge:gems")) {
//         generateGemData(event.player, event.item);
//     }
// })