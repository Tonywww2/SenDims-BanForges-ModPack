ItemEvents.tooltip(event => {
    let data = global.sdbfOmniAlloy;
    if (!data) return;
    data.packaging.forEach(entry => event.add(entry.output, Text.gray(entry.note)));
    event.add('kubejs:omni_alloy_ingot', Text.lightPurple('土卫六与深境四层材料，经八条制造支线统合而成'));
    event.add('kubejs:omni_bio_01_block', Text.gray('盐卤凝固后采集，用于陶瓷承压膜装配'));
    event.add('kubejs:omni_aether_06_block', Text.gray('在天境极寒群系放置，完成群系转化后采集'));
    event.add('kubejs:omni_aether_04_block', Text.gray('放在冰石附近冻结；同一位置采集后有冷却'));
    event.add('kubejs:omni_aether_05_block', Text.gray('佩戴冰饰品靠近，使其冻结'));
    event.add('kubejs:omni_engineering_08_precursor', Text.gray('放在万用电解机正下方；为产物和掉落物保留空间'));
    event.add('kubejs:omni_pneumatic_13', Text.gray('与红石一起置于隔离爆炸工位，进行 AE 爆炸转化'));
});
