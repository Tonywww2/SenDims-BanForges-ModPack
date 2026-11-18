package net.tracen.umapyoi.villager.itemlisting;

import net.minecraft.util.RandomSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.npc.VillagerTrades;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.trading.MerchantOffer;
import net.minecraft.world.level.ItemLike;
import net.tracen.umapyoi.item.ItemRegistry;

/**
 * 买入：玩家付萝卜宝石，得到物品。SDBF HotAI 替换版（2026-11-17）：
 * 价格改为显式区间；交易者或随机源为空时（JEI 交易显示取样）取区间中值，不再抛异常。
 * 方法名使用 SRG 名称，与运行时一致。
 */
public class RandomPriceOrderItemListing implements VillagerTrades.ItemListing {
    private final ItemStack itemStack;
    private final int minPrice;
    private final int maxPrice;
    private final int minCount;
    private final int maxCount;
    private final int maxUses;
    private final int villagerXp;
    private final float priceMultiplier;

    /** 原版构造器：价格为 基础价 + 5~19。 */
    public RandomPriceOrderItemListing(ItemStack itemStack, int pBaseEmeraldCost, int pMaxUses, int pVillagerXp) {
        this(itemStack, pBaseEmeraldCost, 1, 2, pMaxUses, pVillagerXp, 0.05F);
    }

    public RandomPriceOrderItemListing(ItemStack itemStack, int pBaseEmeraldCost, int pMaxUses, int pVillagerXp, float pPriceMultiplier) {
        this(itemStack, pBaseEmeraldCost, 1, 2, pMaxUses, pVillagerXp, pPriceMultiplier);
    }

    public RandomPriceOrderItemListing(ItemStack itemStack, int pBaseEmeraldCost, int pMinCount, int pMaxCount, int pMaxUses, int pVillagerXp) {
        this(itemStack, pBaseEmeraldCost, pMinCount, pMaxCount, pMaxUses, pVillagerXp, 0.05F);
    }

    public RandomPriceOrderItemListing(ItemStack itemStack, int pBaseEmeraldCost, int pMinCount, int pMaxCount, int pMaxUses, int pVillagerXp, float pPriceMultiplier) {
        this(itemStack, pBaseEmeraldCost + 5, pBaseEmeraldCost + 19, pMinCount, pMaxCount, pMaxUses, pVillagerXp, pPriceMultiplier);
    }

    /** 价格 minPrice~maxPrice 宝石，数量 minCount~maxCount，均含两端。 */
    public RandomPriceOrderItemListing(ItemStack itemStack, int minPrice, int maxPrice, int minCount, int maxCount, int maxUses, int villagerXp, float priceMultiplier) {
        this.itemStack = itemStack;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.minCount = minCount;
        this.maxCount = maxCount;
        this.maxUses = maxUses;
        this.villagerXp = villagerXp;
        this.priceMultiplier = priceMultiplier;
    }

    static int roll(RandomSource random, int min, int max) {
        if (max <= min) {
            return min;
        }
        return random == null ? (min + max) / 2 : random.m_216332_(min, max);
    }

    public MerchantOffer m_213663_(Entity pTrader, RandomSource pRand) {
        ItemStack result = this.itemStack.m_41777_();
        result.m_41764_(Math.min(roll(pRand, this.minCount, this.maxCount), 64));
        ItemStack price = new ItemStack((ItemLike) ItemRegistry.JEWEL.get(), Math.min(roll(pRand, this.minPrice, this.maxPrice), 64));
        return new MerchantOffer(price, result, this.maxUses, this.villagerXp, this.priceMultiplier);
    }
}
