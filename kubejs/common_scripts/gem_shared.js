// priority: 0
// 宝石共享代码：同时用于客户端 (tooltip) 和服务端 (数据生成)

let GEM_GENERAL_KEY = "sdbf.gemdata";
let GEM_TIER_KEY = "sdbf.gem_tier";

let GEM_AFFIX_KEY = "gemAffix";
let GEM_SCALE_KEY = "gemScale";
let GEM_PURITY_KEY = "gemPurity";
let GEM_POLISH_KEY = "gemPolish";

let GEM_AFFIX = {
    // 正面词缀 (9)
    giant: "giant",
    brilliant: "brilliant",
    creamy: "creamy",
    flawless: "flawless",
    radiant: "radiant",
    lustrous: "lustrous",
    pristine: "pristine",
    exquisite: "exquisite",
    majestic: "majestic",
    // 负面词缀 (3)
    cracked: "cracked",
    dull: "dull",
    flawed: "flawed",
};

let getGemInfo = (stack) => {
    let tag = stack.getNbt();
    if (!tag || !tag.contains(GEM_GENERAL_KEY)) return null;
    let gemData = tag.getCompound(GEM_GENERAL_KEY);
    if (!gemData) return null;
    return {
        affix: gemData.getList(GEM_AFFIX_KEY, 8 /* String */),
        scale: gemData.getInt(GEM_SCALE_KEY),
        purity: gemData.getInt(GEM_PURITY_KEY),
        polish: gemData.getInt(GEM_POLISH_KEY),
    };
};

let getGemAffixText = (affix) => {
    return Text.translatable(`info.sdbf.gem.affix.${affix}`);
};

let buildGemTooltip = (gemInfo) => {
    if (!gemInfo) return [];
    let lines = [];
    // 标题
    lines.push(Text.translatable("info.sdbf.gem.title").gold());
    // 词缀列表
    if (gemInfo.affix && gemInfo.affix.length > 0) {
        let affixLine = Text.translatable("info.sdbf.gem.affix_label").append(Text.literal(": "));
        for (let i = 0; i < gemInfo.affix.length; i++) {
            if (i > 0) affixLine.append(Text.literal(", "));
            affixLine.append(getGemAffixText(gemInfo.affix.get(i).getAsString()));
        }
        lines.push(affixLine);
    }
    // 数值属性
    lines.push(Text.translatable("info.sdbf.gem.scale").append(Text.literal(`: ${gemInfo.scale}`)));
    lines.push(Text.translatable("info.sdbf.gem.purity").append(Text.literal(`: ${gemInfo.purity}%`)));
    lines.push(Text.translatable("info.sdbf.gem.polish").append(Text.literal(`: ${gemInfo.polish}`)));
    return lines;
};
