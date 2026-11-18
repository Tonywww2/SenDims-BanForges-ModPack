package net.tracen.umapyoi.villager.itemlisting;

import java.util.ArrayList;
import java.util.List;
import net.minecraft.util.RandomSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.npc.VillagerTrades;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.trading.MerchantOffer;
import net.minecraft.world.level.ItemLike;
import net.tracen.umapyoi.item.ItemRegistry;
import net.tracen.umapyoi.registry.UmaSkillRegistry;
import net.tracen.umapyoi.registry.skills.UmaSkill;
import net.tracen.umapyoi.utils.UmaSkillUtils;

/**
 * 随机技能书。SDBF HotAI 替换版（2026-11-17）：
 * 价格改为 16 × 技能等级 + 2 ~ 16 × 技能等级 + 6（1 级 18~22、2 级 34~38、3 级 50~54，最多 64），
 * 期望与原版（2 + [0, 5 + 20 × 等级) + 6 × 等级）基本相同，区间收窄。
 * 随机源为空时（JEI 交易显示取样）取注册表第一个技能和价格区间中值，不再抛异常。
 */
public class SkillBooksItemListing implements VillagerTrades.ItemListing {
    private final int villagerXp;

    public SkillBooksItemListing(int pVillagerXp) {
        this.villagerXp = pVillagerXp;
    }

    public MerchantOffer m_213663_(Entity pTrader, RandomSource pRand) {
        List<UmaSkill> skills = new ArrayList<UmaSkill>(UmaSkillRegistry.REGISTRY.get().getValues());
        if (skills.isEmpty()) {
            return null;
        }
        UmaSkill skill = skills.get(pRand == null ? 0 : pRand.m_188503_(skills.size()));
        ItemStack book = UmaSkillUtils.getSkillBook(skill);
        int min = 16 * skill.getSkillLevel() + 2;
        int price = Math.max(1, Math.min(RandomPriceOrderItemListing.roll(pRand, min, min + 4), 64));
        return new MerchantOffer(new ItemStack((ItemLike) ItemRegistry.JEWEL.get(), price), ItemStack.f_41583_, book, 12, this.villagerXp, 0.2F);
    }
}
