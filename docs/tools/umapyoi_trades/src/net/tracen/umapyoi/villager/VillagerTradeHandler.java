package net.tracen.umapyoi.villager;

import it.unimi.dsi.fastutil.ints.Int2ObjectMap;
import java.util.List;
import net.minecraft.world.entity.npc.VillagerProfession;
import net.minecraft.world.entity.npc.VillagerTrades;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.ItemLike;
import net.minecraftforge.event.village.VillagerTradesEvent;
import net.minecraftforge.event.village.WandererTradesEvent;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.registries.RegistryObject;
import net.tracen.umapyoi.item.ItemRegistry;
import net.tracen.umapyoi.villager.itemlisting.RaceTicketItemListing;
import net.tracen.umapyoi.villager.itemlisting.RandomItemOrderItemListing;
import net.tracen.umapyoi.villager.itemlisting.RandomPriceOrderItemListing;
import net.tracen.umapyoi.villager.itemlisting.RandomPriceSellItemListing;
import net.tracen.umapyoi.villager.itemlisting.SkillBooksItemListing;

/**
 * 马娘的村民与流浪商人交易。SDBF HotAI 替换版（2026-11-17），数值见整合包
 * docs/development/马娘村民交易与JEI显示-2026-11-17.md。区间均含两端，货币为萝卜宝石。
 */
@Mod.EventBusSubscriber
public class VillagerTradeHandler {
    @SubscribeEvent
    public static void onVillagerTrades(VillagerTradesEvent event) {
        addVillageTrade(event, "farmer", 2, order(ItemRegistry.CUPCAKE, 11, 15, 9, 11, 16, 5, 0.05F));
        addVillageTrade(event, "farmer", 4, order(ItemRegistry.SWEET_CUPCAKE, 12, 16, 8, 10, 16, 30, 0.2F));
        addVillageTrade(event, "cleric", 3, new RandomPriceSellItemListing(new ItemStack((ItemLike) Items.f_42616_), 2, 1, 2, 8, 20));
        addVillageTrade(event, "mason", 3, order(ItemRegistry.UMA_STATUE, 11, 15, 1, 1, 8, 20, 0.05F));
        addVillageTrade(event, "mason", 5, order(ItemRegistry.THREE_GODDESS, 11, 15, 1, 1, 8, 30, 0.2F));
        addVillageTrade(event, "shepherd", 5, order(ItemRegistry.SUMMER_UNIFORM, 11, 15, 1, 1, 8, 30, 0.2F));
        addVillageTrade(event, "shepherd", 5, order(ItemRegistry.WINTER_UNIFORM, 11, 15, 1, 1, 8, 30, 0.2F));
        addVillageTrade(event, "shepherd", 5, order(ItemRegistry.TRAINNING_SUIT, 11, 15, 1, 1, 8, 30, 0.2F));
        addTrainerTrade(event);
    }

    public static void addTrainerTrade(VillagerTradesEvent event) {
        addVillageTrade(event, "trainer", 1, sell(ItemRegistry.CRYSTAL_SILVER, 1, 1, 2, 16, 1, 0.05F));
        addVillageTrade(event, "trainer", 1, sell(ItemRegistry.HORSESHOE_SILVER, 1, 1, 2, 16, 1, 0.05F));
        addVillageTrade(event, "trainer", 1, order(ItemRegistry.UMA_TICKET, 8, 12, 3, 5, 16, 2, 0.05F));
        addVillageTrade(event, "trainer", 1, order(ItemRegistry.CARD_TICKET, 8, 12, 3, 5, 16, 2, 0.05F));

        addVillageTrade(event, "trainer", 2, new RandomItemOrderItemListing(List.of(
                stack(ItemRegistry.SPEED_LOW_ITEM), stack(ItemRegistry.STAMINA_LOW_ITEM), stack(ItemRegistry.STRENGTH_LOW_ITEM),
                stack(ItemRegistry.MENTALITY_LOW_ITEM), stack(ItemRegistry.WISDOM_LOW_ITEM)), 1, 2, 2, 16, 10));
        addVillageTrade(event, "trainer", 2, new SkillBooksItemListing(10));

        addVillageTrade(event, "trainer", 3, sell(ItemRegistry.CRYSTAL_GOLD, 3, 1, 2, 16, 10, 0.05F));
        addVillageTrade(event, "trainer", 3, sell(ItemRegistry.HORSESHOE_GOLD, 3, 1, 2, 16, 10, 0.05F));
        addVillageTrade(event, "trainer", 3, order(ItemRegistry.SR_UMA_TICKET, 11, 15, 2, 2, 12, 20, 0.05F));
        addVillageTrade(event, "trainer", 3, order(ItemRegistry.SR_CARD_TICKET, 11, 15, 2, 2, 12, 20, 0.05F));
        addVillageTrade(event, "trainer", 3, new SkillBooksItemListing(20));

        addVillageTrade(event, "trainer", 4, new RandomItemOrderItemListing(List.of(
                stack(ItemRegistry.SPEED_MID_ITEM), stack(ItemRegistry.STAMINA_MID_ITEM), stack(ItemRegistry.STRENGTH_MID_ITEM),
                stack(ItemRegistry.MENTALITY_MID_ITEM), stack(ItemRegistry.WISDOM_MID_ITEM)), 2, 2, 2, 6, 30));
        addVillageTrade(event, "trainer", 4, new SkillBooksItemListing(30));

        addVillageTrade(event, "trainer", 5, sell(ItemRegistry.CRYSTAL_RAINBOW, 5, 1, 2, 16, 30, 0.2F));
        addVillageTrade(event, "trainer", 5, sell(ItemRegistry.HORSESHOE_RAINBOW, 5, 1, 2, 16, 30, 0.2F));
        addVillageTrade(event, "trainer", 5, order(ItemRegistry.SSR_UMA_TICKET, 12, 16, 1, 2, 12, 30, 0.2F));
        addVillageTrade(event, "trainer", 5, order(ItemRegistry.SSR_CARD_TICKET, 12, 16, 1, 2, 12, 30, 0.2F));
        addVillageTrade(event, "trainer", 5, new SkillBooksItemListing(30));
        addVillageTrade(event, "trainer", 5, new RandomItemOrderItemListing(List.of(
                stack(ItemRegistry.SPEED_HIGH_ITEM), stack(ItemRegistry.STAMINA_HIGH_ITEM), stack(ItemRegistry.STRENGTH_HIGH_ITEM),
                stack(ItemRegistry.MENTALITY_HIGH_ITEM), stack(ItemRegistry.WISDOM_HIGH_ITEM)), 2, 2, 2, 6, 30, 0.2F));

        for (int i = 1; i <= 5; ++i) {
            addVillageTrade(event, "trainer", i, new RaceTicketItemListing(i));
        }
    }

    @SubscribeEvent
    public static void onWandererTrades(WandererTradesEvent event) {
        List<VillagerTrades.ItemListing> genericTrades = event.getGenericTrades();
        genericTrades.add(order(ItemRegistry.HACHIMI_MID, 11, 15, 2, 3, 32, 2, 0.05F));
        genericTrades.add(order(ItemRegistry.HACHIMI_BIG, 12, 16, 2, 3, 32, 2, 0.05F));
        genericTrades.add(order(ItemRegistry.SMALL_ENERGY_DRINK, 11, 15, 2, 3, 32, 2, 0.05F));
        genericTrades.add(order(ItemRegistry.MEDIUM_ENERGY_DRINK, 12, 16, 2, 3, 32, 2, 0.05F));
        List<VillagerTrades.ItemListing> rareTrades = event.getRareTrades();
        rareTrades.add(order(ItemRegistry.LARGE_ENERGY_DRINK, 13, 17, 1, 2, 32, 15, 0.05F));
        rareTrades.add(order(ItemRegistry.ROYAL_BITTER, 12, 16, 2, 3, 32, 15, 0.05F));
    }

    private static ItemStack stack(RegistryObject<? extends ItemLike> item) {
        return new ItemStack((ItemLike) item.get());
    }

    private static VillagerTrades.ItemListing order(RegistryObject<? extends ItemLike> item, int minPrice, int maxPrice,
            int minCount, int maxCount, int maxUses, int xp, float priceMultiplier) {
        return new RandomPriceOrderItemListing(stack(item), minPrice, maxPrice, minCount, maxCount, maxUses, xp, priceMultiplier);
    }

    private static VillagerTrades.ItemListing sell(RegistryObject<? extends ItemLike> item, int jewels, int minCount, int maxCount,
            int maxUses, int xp, float priceMultiplier) {
        return new RandomPriceSellItemListing(stack(item), jewels, minCount, maxCount, maxUses, xp, priceMultiplier);
    }

    public static void addVillageTrade(VillagerTradesEvent event, String villager, int level, VillagerTrades.ItemListing listing) {
        Int2ObjectMap<List<VillagerTrades.ItemListing>> trades = event.getTrades();
        VillagerProfession profession = event.getType();
        if (profession.f_35600_() == null) {
            return;
        }
        if (profession.f_35600_().equals(villager)) {
            trades.get(level).add(listing);
        }
    }
}
