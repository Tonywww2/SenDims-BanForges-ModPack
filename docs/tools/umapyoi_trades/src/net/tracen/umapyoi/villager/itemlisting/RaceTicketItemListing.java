package net.tracen.umapyoi.villager.itemlisting;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import net.minecraft.core.Registry;
import net.minecraft.server.MinecraftServer;
import net.minecraft.util.RandomSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.npc.VillagerTrades;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.trading.MerchantOffer;
import net.minecraft.world.level.ItemLike;
import net.minecraft.world.level.Level;
import net.minecraftforge.server.ServerLifecycleHooks;
import net.tracen.umapyoi.api.UmapyoiAPI;
import net.tracen.umapyoi.item.ItemRegistry;
import net.tracen.umapyoi.registry.races.Race;
import net.tracen.umapyoi.utils.RaceRanking;

/**
 * 比赛券：随机写入一场对应级别的比赛（排除星座杯）。SDBF HotAI 替换版（2026-11-17）：
 * 价格改为 5 × 村民等级 − 2 ~ 5 × 村民等级（Pre-OP 3~5、OP 8~10、G3 13~15、G2 18~20、G1 23~25）。
 * 交易者为空时从当前服务器的主世界读取比赛注册表；随机源为空时取第一场比赛和价格区间中值。
 */
public class RaceTicketItemListing implements VillagerTrades.ItemListing {
    private final int level;

    public RaceTicketItemListing(int level) {
        this.level = level;
    }

    public MerchantOffer m_213663_(Entity pTrader, RandomSource pRandom) {
        Level world = pTrader != null ? pTrader.m_9236_() : null;
        if (world == null) {
            MinecraftServer server = ServerLifecycleHooks.getCurrentServer();
            if (server == null) {
                return null;
            }
            world = server.m_129783_();
        }
        RaceRanking ranking = RaceRanking.values()[this.level];
        Registry<Race> registry = UmapyoiAPI.getRaceRegistry(world);
        List<Race> candidates = new ArrayList<Race>();
        for (Race race : registry) {
            if (race.ranking() == ranking && !Objects.equals(race.texturePredicateOverride(), "champions")) {
                candidates.add(race);
            }
        }
        if (candidates.isEmpty()) {
            return null;
        }
        Race race = candidates.get(pRandom == null ? 0 : pRandom.m_188503_(candidates.size()));
        ItemStack result = ((Item) ItemRegistry.UMA_RACE_TICKET.get()).m_7968_();
        result.m_41784_().m_128359_("race", race.id().toString());
        int max = 5 * this.level;
        int price = Math.max(1, RandomPriceOrderItemListing.roll(pRandom, max - 2, max));
        return new MerchantOffer(new ItemStack((ItemLike) ItemRegistry.JEWEL.get(), price), ItemStack.f_41583_, result, 12, 6 * this.level, 0.2F);
    }
}
