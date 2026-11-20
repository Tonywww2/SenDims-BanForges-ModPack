package com.themahjong.yaku;

import com.riichimahjongforge.mahjongcore.MahjongYakuAdvancements;
import com.riichimahjongforge.mahjongtable.MahjongTableBlockEntity;
import com.riichimahjongforge.mahjongtable.MahjongTableHumanPlayer;
import com.themahjong.TheMahjongMatch;
import com.themahjong.TheMahjongRound;
import com.themahjong.TheMahjongRuleSet;
import com.themahjong.TheMahjongTile;
import com.themahjong.driver.MahjongPlayerInterface;
import com.themahjong.driver.MatchPhase;
import com.themahjong.driver.TheMahjongDriver;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import net.minecraft.network.chat.Component;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.level.Level;

/**
 * Method templates for PatchMahjong. These classes are never shipped or loaded.
 * PatchMahjong copies every member whose name starts with "sdbf$" into the real
 * mod class and renames both template owners to their targets:
 * MahjongAchievementHelpers -> WinCalculator, MahjongTableHelpers -> MahjongTableBlockEntity.
 */
public final class MahjongAchievementHelpers {
    private static final int SDBF_RECORD_LIMIT = 128;
    private static ArrayDeque<Object[]> sdbf$records;

    private MahjongAchievementHelpers() {
    }

    /** Called before each return of calculateBest. Records achievement-only facts for this exact result. */
    static WinResult sdbf$record(WinResult result, WinContext ctx, List<TheMahjongTile> tiles,
                                 List<TheMahjongTile> doraIndicators, List<TheMahjongTile> uraIndicators,
                                 int playerCount, TheMahjongRuleSet rules, int kitaCount) {
        if (result == null || tiles == null) return result;
        try {
            ArrayList<String> extras = new ArrayList<>();
            if (result.yakuman().isEmpty()) {
                if (!result.yaku().isEmpty()) {
                    int dora = sdbf$countIndicated(tiles, doraIndicators, playerCount);
                    if (rules != null && rules.kitaCountsAsDora()) dora += Math.max(0, kitaCount);
                    if (dora > 0) extras.add("dora");
                    int aka = 0;
                    for (TheMahjongTile tile : tiles) if (tile.redDora()) aka++;
                    if (aka > 0) extras.add("akadora");
                    if (sdbf$countIndicated(tiles, uraIndicators, playerCount) > 0) extras.add("uradora");
                }
            } else if (ctx != null && ctx.winningTile() != null) {
                TheMahjongTile winning = ctx.winningTile();
                int same = 0;
                for (TheMahjongTile tile : tiles) if (tile.matchesSuitRank(winning)) same++;
                // The winning tile completed the only pair: 13-sided Kokushi / tanki Suu Ankou.
                if (same == 2 && result.yakuman().contains(Yakuman.KOKUSHIMUSOU)) extras.add("kokushi_musou_juusanmen_machi");
                if (same == 2 && result.yakuman().contains(Yakuman.SUUANKOU)) extras.add("suu_ankou_tanki");
                if (result.yakuman().contains(Yakuman.CHUURENPOUTOU) && sdbf$pureNineGates(tiles, winning)) {
                    extras.add("junsei_chuuren_poutou");
                }
            }
            if (!extras.isEmpty()) sdbf$store(result, List.copyOf(extras));
        } catch (RuntimeException ignored) {
            // Achievement bookkeeping must never change scoring.
        }
        return result;
    }

    private static int sdbf$countIndicated(List<TheMahjongTile> tiles, List<TheMahjongTile> indicators, int playerCount) {
        if (indicators == null) return 0;
        int count = 0;
        for (TheMahjongTile indicator : indicators) {
            TheMahjongTile dora = WinCalculator.doraFromIndicator(indicator, playerCount);
            for (TheMahjongTile tile : tiles) if (tile.matchesSuitRank(dora)) count++;
        }
        return count;
    }

    /** 1112345678999 before the winning tile. */
    private static boolean sdbf$pureNineGates(List<TheMahjongTile> tiles, TheMahjongTile winning) {
        if (tiles.size() != 14 || winning.rank() < 1 || winning.rank() > 9) return false;
        int[] counts = new int[10];
        for (TheMahjongTile tile : tiles) {
            if (tile.suit() != winning.suit() || tile.rank() < 1 || tile.rank() > 9) return false;
            counts[tile.rank()]++;
        }
        counts[winning.rank()]--;
        for (int rank = 1; rank <= 9; rank++) {
            int expected = rank == 1 || rank == 9 ? 3 : 1;
            if (counts[rank] != expected) return false;
        }
        return true;
    }

    private static synchronized void sdbf$store(WinResult result, List<String> extras) {
        if (sdbf$records == null) sdbf$records = new ArrayDeque<>();
        sdbf$records.addFirst(new Object[] {result, extras});
        while (sdbf$records.size() > SDBF_RECORD_LIMIT) sdbf$records.removeLast();
    }

    /** Extra advancement keys recorded for this exact WinResult instance, or an empty list. */
    @SuppressWarnings("unchecked")
    public static synchronized List<String> sdbf$extraYaku(WinResult result) {
        if (result == null || sdbf$records == null) return List.of();
        for (Object[] entry : sdbf$records) {
            if (entry[0] == result) return (List<String>) entry[1];
        }
        return List.of();
    }
}

/** Template for MahjongTableBlockEntity. Non-sdbf members only mirror the real fields/methods. */
final class MahjongTableHelpers {
    private TheMahjongDriver driver;
    private List<MahjongTableBlockEntity.SeatInfo> seats;
    private boolean lastPowered;
    protected Level f_58857_;

    private int seatOfOccupant(UUID uuid) {
        throw new AssertionError();
    }

    private void clearResultAnimState() {
        throw new AssertionError();
    }

    public void endGame() {
        throw new AssertionError();
    }

    /** Head of playFinalWinEffects: an exhaustive draw has no WinResult, so nagashi mangan is checked here. */
    private void sdbf$awardNagashi(ServerLevel level, MatchPhase.RoundEnded ended) {
        try {
            if (level == null || ended == null || !ended.winResults().isEmpty() || this.driver == null) return;
            TheMahjongMatch match = this.driver.match();
            if (match == null || !match.ruleSet().nagashiManganAllowed()) return;
            Optional<TheMahjongRound> current = match.currentRound();
            if (current.isEmpty()) return;
            TheMahjongRound round = current.get();
            if (!round.liveWall().isEmpty()) return;
            int count = Math.min(round.players().size(), this.seats.size());
            for (int seat = 0; seat < count; seat++) {
                if (!round.isNagashiManganEligible(seat)) continue;
                UUID id = this.seats.get(seat).occupant().orElse(null);
                if (id == null) continue;
                ServerPlayer player = level.m_7654_().m_6846_().m_11259_(id);
                MahjongYakuAdvancements.awardForWin(player, 0, false, List.of("nagashi_mangan"));
            }
        } catch (RuntimeException ignored) {
            // Advancement failures must not interrupt the result display.
        }
    }

    /** After MahjongWinEffects.playWinEffects: dora kinds and the three double-yakuman waits. */
    private static void sdbf$awardExtraYaku(ServerPlayer player, WinResult win) {
        if (player == null || win == null) return;
        List<String> extras = MahjongAchievementHelpers.sdbf$extraYaku(win);
        if (!extras.isEmpty()) MahjongYakuAdvancements.awardForWin(player, 0, false, extras);
    }

    /** Wrench + sneak at the table centre while the table receives redstone power. */
    private boolean sdbf$tryForceEnd(ServerPlayer player) {
        if (player == null || !player.m_6144_() || this.driver == null || !this.lastPowered) return false;
        if (this.seatOfOccupant(player.m_20148_()) < 0 && !player.m_20310_(2)) {
            player.m_5661_(Component.m_237113_("只有入座玩家或管理员可以强制终止本局麻将。"), true);
            return true;
        }
        ArrayList<ServerPlayer> notify = new ArrayList<>();
        notify.add(player);
        if (this.f_58857_ instanceof ServerLevel level) {
            MatchPhase finished = new MatchPhase.RoundEnded(List.of());
            int players = this.driver.match().playerCount();
            for (int seat = 0; seat < players; seat++) {
                MahjongPlayerInterface seated = this.driver.playerAt(seat);
                if (!(seated instanceof MahjongTableHumanPlayer human)) continue;
                try {
                    // Same path as a normal phase change: take back a delivered drawn tile.
                    human.tickAfterAdvance(level, (MahjongTableBlockEntity) (Object) this, seat, finished);
                } catch (RuntimeException ignored) {
                    // Ending the match must still succeed.
                }
            }
            for (MahjongTableBlockEntity.SeatInfo info : this.seats) {
                UUID id = info.occupant().orElse(null);
                if (id == null) continue;
                ServerPlayer occupant = level.m_7654_().m_6846_().m_11259_(id);
                if (occupant != null && !notify.contains(occupant)) notify.add(occupant);
            }
        }
        this.clearResultAnimState();
        this.endGame();
        Component message = Component.m_237113_("[麻将] " + player.m_7755_().getString() + " 强制终止了本局。");
        for (ServerPlayer target : notify) target.m_5661_(message, false);
        return true;
    }
}
