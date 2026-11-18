package net.tracen.umapyoi.villager.itemlisting;

import java.util.List;
import net.minecraft.util.RandomSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.npc.VillagerTrades;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.trading.MerchantOffer;
import net.minecraft.world.level.ItemLike;
import net.tracen.umapyoi.item.ItemRegistry;

/**
 * 买入随机物品：玩家付固定数量的萝卜宝石，从列表中随机得到一种物品。SDBF HotAI 替换版（2026-11-17）：
 * 数值规则不变；随机源为空时（JEI 交易显示取样）取列表第一项和数量区间中值，不再抛异常。
 */
public class RandomItemOrderItemListing implements VillagerTrades.ItemListing {
    private final List<ItemStack> itemStacks;
    private final int baseEmeraldCost;
    private final int minCount;
    private final int maxCount;
    private final int maxUses;
    private final int villagerXp;
    private final float priceMultiplier;

    public RandomItemOrderItemListing(List<ItemStack> itemStacks, int pBaseEmeraldCost, int pMaxUses, int pVillagerXp) {
        this(itemStacks, pBaseEmeraldCost, 1, 1, pMaxUses, pVillagerXp, 0.05F);
    }

    public RandomItemOrderItemListing(List<ItemStack> itemStacks, int pBaseEmeraldCost, int pMaxUses, int pVillagerXp, float pPriceMultiplier) {
        this(itemStacks, pBaseEmeraldCost, 1, 1, pMaxUses, pVillagerXp, pPriceMultiplier);
    }

    public RandomItemOrderItemListing(List<ItemStack> itemStacks, int pBaseEmeraldCost, int pMinCount, int pMaxCount, int pMaxUses, int pVillagerXp) {
        this(itemStacks, pBaseEmeraldCost, pMinCount, pMaxCount, pMaxUses, pVillagerXp, 0.05F);
    }

    public RandomItemOrderItemListing(List<ItemStack> itemStacks, int pBaseEmeraldCost, int pMinCount, int pMaxCount, int pMaxUses, int pVillagerXp, float pPriceMultiplier) {
        this.itemStacks = itemStacks;
        this.baseEmeraldCost = pBaseEmeraldCost;
        this.minCount = pMinCount;
        this.maxCount = pMaxCount;
        this.maxUses = pMaxUses;
        this.villagerXp = pVillagerXp;
        this.priceMultiplier = pPriceMultiplier;
    }

    public MerchantOffer m_213663_(Entity pTrader, RandomSource pRand) {
        if (this.itemStacks.isEmpty()) {
            return null;
        }
        int index = pRand == null ? 0 : pRand.m_188503_(this.itemStacks.size());
        ItemStack result = this.itemStacks.get(index).m_41777_();
        result.m_41764_(Math.min(RandomPriceOrderItemListing.roll(pRand, this.minCount, this.maxCount), 64));
        ItemStack price = new ItemStack((ItemLike) ItemRegistry.JEWEL.get(), Math.min(this.baseEmeraldCost, 64));
        return new MerchantOffer(price, result, this.maxUses, this.villagerXp, this.priceMultiplier);
    }
}
