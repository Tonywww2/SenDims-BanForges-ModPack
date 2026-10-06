// priority: 1750
// Both tooltip levels share the same mechanism catalogue and approved parameters.
; (() => {
  let A = global.sdbfAstral;
  A.describe = (r, p) => {
    let key = r.kind + ':' + r.primary, lines = [];
    let pct = v => (v * 100).toFixed(2) + '%';
    if (r.role === 'producer') lines.push('基础总分＝' + p.producerBase + '×e。');
    else lines.push('自身基础总分＝' + p.readerBase + '×e；读取公式的结果再乘 ' + p.multiplier + '×e，加入自身基础分。');
    let kRules = ['7:beta', '8:beta', '8:gamma', '13:alpha', '13:beta', '15:beta', '16:beta', '16:gamma', '19:beta', '19:gamma', '22:gamma', '23:beta', '23:gamma', '28:alpha', '28:beta', '30:beta', '34:gamma', '34:delta'];
    if (kRules.indexOf(key) >= 0) lines.push('固定尺度 K＝' + p.K + '。');
    let quantityRules = ['1:alpha', '1:beta', '3:alpha', '4:alpha', '4:beta', '15:alpha', '18:beta', '19:alpha', '20:beta', '21:alpha', '22:alpha', '22:beta', '23:alpha', '25:beta', '27:alpha', '34:beta'];
    if (quantityRules.indexOf(key) >= 0) lines.push('每次数量奖励乘 ' + p.step + '。');
    switch (key) {
      case '2:alpha': lines.push('等级倍率＝1＋' + p.bonus + 'ln(1＋等级/' + p.levelScale + ')。'); break;
      case '3:beta': lines.push('额外倍率＝1＋' + p.bonus + '×max(最大归一化三维−1，0)。'); break;
      case '5:alpha': case '5:beta': lines.push('主世界时间13000–22999为夜晚；夜晚效率乘 ' + p.nightMultiplier + '。'); break;
      case '6:alpha': lines.push('平衡倍率＝1＋' + p.bonus + 'exp(−' + p.matchSensitivity + '×归一化三维最大差距)。'); break;
      case '7:alpha': case '7:gamma': lines.push('共用暴击率目标 ' + pct(p.target) + '；α最高条件奖励 ' + pct(p.bonus) + '。'); break;
      case '8:alpha': lines.push('转换所得敏捷占 ' + pct(p.share) + '，魔力占 ' + pct(1 - p.share) + '。'); break;
      case '9:alpha': lines.push('没有负面自然附加修饰时乘 ' + p.cleanMultiplier + '。'); break;
      case '10:alpha': lines.push('拔刀剑伤害系数目标 ' + p.target + '；最高条件奖励 ' + pct(p.bonus) + '。'); break;
      case '10:beta': lines.push('盔甲穿透目标 ' + p.target + '点；力量份额由 ' + pct(p.share) + '升至 ' + pct(p.maxShare) + '，剩余为体质。'); break;
      case '11:alpha': lines.push('离地时乘 ' + p.airMultiplier + '。'); break;
      case '11:beta': lines.push('落地时乘 ' + p.groundMultiplier + '。'); break;
      case '12:alpha': case '12:beta': lines.push('周期 ' + p.periodTicks / 20 + '秒；倍率＝1＋' + p.bonus + '×(1−cos(2πt/' + p.periodTicks / 20 + '))/2，t为游戏秒数。'); break;
      case '16:alpha': lines.push('晴天倍率 ' + p.clearMultiplier + '。'); break;
      case '17:alpha': lines.push('倍率＝1＋' + p.bonus + '×经验条进度。'); break;
      case '17:beta': lines.push('满足顺时针顺序时乘 ' + p.orderMultiplier + '。'); break;
      case '18:alpha': lines.push('倍率＝1＋' + p.bonus + 'ln(1＋(火焰伤害＋寒冰伤害)/' + p.target + ')。'); break;
      case '24:alpha': case '24:beta': lines.push('耐久比例提供最多 ' + pct(p.bonus) + '额外奖励；无可损坏主手物品时不奖励。'); break;
      case '25:alpha': case '25:beta': lines.push('火焰、寒冰目标 ' + p.target + '点；α最高奖励 ' + pct(p.bonus) + '。'); break;
      case '25:gamma': lines.push('癫火伤害目标 ' + pct(p.target) + '；最高条件奖励 ' + pct(p.bonus) + '。'); break;
      case '26:alpha': lines.push('受到治疗倍率目标 ' + p.target + '；最高条件奖励 ' + pct(p.bonus) + '。'); break;
      case '26:beta': lines.push('满生命时额外奖励 ' + pct(p.bonus) + '，随当前生命比例线性提高。'); break;
      case '27:beta': lines.push('魔力份额＝' + pct(p.share) + '＋(' + pct(p.maxShare - p.share) + '×正面百分比修饰数/5)，剩余为智力。'); break;
      case '29:alpha': lines.push('生命 ' + pct(p.lowHealth) + '及以下最高额外奖励 ' + pct(p.bonus) + '；以上随生命提高线性回落。'); break;
      case '29:beta': lines.push('实际攻击力 ' + p.target + '及以上读取两颗，否则一颗。'); break;
      case '29:gamma': lines.push('在 ' + pct(p.lowHealth - p.healthWidth / 2) + '至 ' + pct(p.lowHealth + p.healthWidth / 2) + '生命间平滑过渡；魔力份额由 ' + pct(p.share) + '增至 ' + pct(p.maxShare) + '，复制体质由全部保留降至零。'); break;
      case '30:alpha': lines.push('潜行时乘 ' + p.crouchMultiplier + '。'); break;
      case '30:beta': lines.push('指数 p＝' + p.powerBase + '＋(' + p.powerLimit + '−' + p.powerBase + ')×(1−exp(−e))。'); break;
      case '31:beta': lines.push('B转敏捷系数 ' + p.baseShare + '；Δ转智力系数 ' + p.gainShare + '；选择本公式总产出最高的来源。'); break;
      case '32:alpha': lines.push('倍率＝1＋' + p.bonus + '×当前饥饿值/20。'); break;
      case '32:beta': lines.push('体质份额按饥饿比例由 ' + pct(p.share) + '增至 ' + pct(p.maxShare) + '；其余为魔力。'); break;
      case '33:alpha': case '33:beta': lines.push('匹配奖励＝1＋' + p.bonus + 'exp(−' + p.matchSensitivity + '×归一化差距)。'); break;
      case '34:alpha': lines.push('K₁＝' + p.K1 + '，K₂＝' + p.K2 + '。'); break;
    }
    return lines;
  };
})();
