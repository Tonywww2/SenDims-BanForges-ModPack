package net.tracen.umapyoi.villager.itemlisting;

import net.minecraft.util.RandomSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.npc.VillagerTrades;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.trading.MerchantOffer;
import net.minecraft.world.level.ItemLike;
import net.tracen.umapyoi.item.ItemRegistry;

/**
 * 卖出：玩家交出物品，得到固定数量的萝卜宝石。SDBF HotAI 替换版（2026-11-17）：
 * 数值规则不变；随机源为空时（JEI 交易显示取样）取数量区间中值，不再抛异常。
 */
public class RandomPriceSellItemListing implements VillagerTrades.ItemListing {
    private final ItemStack itemStack;
    private final int baseEmeraldCost;
    private final int minCount;
    private final int maxCount;
    private final int maxUses;
    private final int villagerXp;
    private final float priceMultiplier;

    public RandomPriceSellItemListing(ItemStack itemStack, int pBaseEmeraldCost, int pMaxUses, int pVillagerXp) {
        this(itemStack, pBaseEmeraldCost, 1, 1, pMaxUses, pVillagerXp, 0.05F);
    }

    public RandomPriceSellItemListing(ItemStack itemStack, int pBaseEmeraldCost, int pMaxUses, int pVillagerXp, float pPriceMultiplier) {
        this(itemStack, pBaseEmeraldCost, 1, 1, pMaxUses, pVillagerXp, pPriceMultiplier);
    }

    public RandomPriceSellItemListing(ItemStack itemStack, int pBaseEmeraldCost, int pMinCount, int pMaxCount, int pMaxUses, int pVillagerXp) {
        this(itemStack, pBaseEmeraldCost, pMinCount, pMaxCount, pMaxUses, pVillagerXp, 0.05F);
    }

    public RandomPriceSellItemListing(ItemStack itemStack, int pBaseEmeraldCost, int pMinCount, int pMaxCount, int pMaxUses, int pVillagerXp, float pPriceMultiplier) {
        this.itemStack = itemStack;
        this.baseEmeraldCost = pBaseEmeraldCost;
        this.minCount = pMinCount;
        this.maxCount = pMaxCount;
        this.maxUses = pMaxUses;
        this.villagerXp = pVillagerXp;
        this.priceMultiplier = pPriceMultiplier;
    }

    public MerchantOffer m_213663_(Entity pTrader, RandomSource pRand) {
        ItemStack sold = this.itemStack.m_41777_();
        sold.m_41764_(Math.min(RandomPriceOrderItemListing.roll(pRand, this.minCount, this.maxCount), 64));
        ItemStack jewels = new ItemStack((ItemLike) ItemRegistry.JEWEL.get(), Math.min(this.baseEmeraldCost, 64));
        return new MerchantOffer(sold, jewels, this.maxUses, this.villagerXp, this.priceMultiplier);
    }
}
