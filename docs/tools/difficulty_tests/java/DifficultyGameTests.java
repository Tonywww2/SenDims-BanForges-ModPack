package sdbf.difficultytests;

import com.mojang.authlib.GameProfile;
import dev.latvian.mods.kubejs.stages.Stages;
import dev.shadowsoffire.attributeslib.api.ALObjects;
import java.util.UUID;
import java.util.List;
import java.lang.reflect.Field;
import net.minecraft.core.BlockPos;
import net.minecraft.gametest.framework.GameTest;
import net.minecraft.gametest.framework.GameTestHelper;
import net.minecraft.network.Connection;
import net.minecraft.network.PacketSendListener;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.PacketFlow;
import net.minecraft.server.network.ServerGamePacketListenerImpl;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.server.players.PlayerList;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.entity.monster.Zombie;
import net.minecraft.world.entity.projectile.Arrow;
import net.minecraft.world.level.GameType;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.common.util.FakePlayerFactory;
import net.minecraftforge.event.entity.living.LivingHurtEvent;
import net.minecraftforge.gametest.GameTestHolder;
import net.minecraftforge.gametest.PrefixGameTestTemplate;

/** Runs production pack scripts on Forge, EventJS and KubeJS in an isolated world. */
@GameTestHolder("sdbf_difficulty_test")
@PrefixGameTestTemplate(false)
public final class DifficultyGameTests {
    private static final String FALLBACK = "sdbf_difficulty_used_fallback";
    private static final String REBOUND = "sdbf_difficulty_player_reapplied";

    private static ServerPlayer player(GameTestHelper helper, int axis, String... modifiers) {
        ServerPlayer player = new ServerPlayer(helper.getLevel().getServer(), helper.getLevel(),
                new GameProfile(UUID.randomUUID(), "DifficultyTest"));
        player.connection = new ServerGamePacketListenerImpl(helper.getLevel().getServer(),
                new Connection(PacketFlow.SERVERBOUND), player) {
            @Override public void send(Packet<?> packet) {}
            @Override public void send(Packet<?> packet, PacketSendListener listener) {}
        };
        BlockPos pos = helper.absolutePos(new BlockPos(1, 2, 1));
        player.setPos(pos.getX(), pos.getY(), pos.getZ());
        player.setGameMode(GameType.SURVIVAL);
        try {
            Field protection = ServerPlayer.class.getDeclaredField("spawnInvulnerableTime");
            protection.setAccessible(true);
            protection.setInt(player, 0);
        } catch (ReflectiveOperationException exception) { throw new RuntimeException(exception); }
        player.getAttribute(ALObjects.Attributes.CRIT_CHANCE.get()).setBaseValue(0);
        player.getAttribute(ALObjects.Attributes.CRIT_DAMAGE.get()).setBaseValue(1);
        player.getAttribute(Attributes.MAX_HEALTH).setBaseValue(100);
        player.setHealth(100);
        Stages.get(player).addNoUpdate("sdbf_difficulty_schema_v5");
        Stages.get(player).addNoUpdate("sdbf_difficulty_axis_n_" + axis);
        for (String modifier : modifiers) Stages.get(player).addNoUpdate("sdbf_difficulty_sub_" + modifier);
        return player;
    }

    @SuppressWarnings("unchecked")
    private static List<ServerPlayer> onlinePlayers(GameTestHelper helper) {
        // getPlayers() is an unmodifiable view; these disconnected fixtures are added
        // to the backing list only for synchronous nearby-player lookup, then removed.
        try {
            Field players = PlayerList.class.getDeclaredField("players");
            players.setAccessible(true);
            return (List<ServerPlayer>) players.get(helper.getLevel().getServer().getPlayerList());
        } catch (ReflectiveOperationException exception) { throw new RuntimeException(exception); }
    }

    private static Zombie zombie(GameTestHelper helper) {
        Zombie mob = EntityType.ZOMBIE.create(helper.getLevel());
        BlockPos pos = helper.absolutePos(new BlockPos(1, 2, 1));
        mob.setPos(pos.getX(), pos.getY(), pos.getZ());
        for (String roll : new String[]{"attack", "health", "armor"})
            mob.getPersistentData().putDouble("sdbf_difficulty_roll_" + roll, 0);
        helper.getLevel().addFreshEntity(mob);
        return mob;
    }

    private static float hurtEvent(net.minecraft.world.entity.LivingEntity target, DamageSource source, float amount) {
        LivingHurtEvent event = new LivingHurtEvent(target, source, amount);
        MinecraftForge.EVENT_BUS.post(event);
        return event.getAmount();
    }

    private static void near(GameTestHelper helper, double actual, double expected, String message) {
        helper.assertTrue(Math.abs(actual - expected) < 0.001, message + ": " + actual + " != " + expected);
    }

    @GameTest(template = "difficulty_test")
    public static void victimDifficultyAndExistingModifiers(GameTestHelper helper) {
        DamageSource source = helper.getLevel().damageSources().generic();
        near(helper, hurtEvent(player(helper, -7), source, 20), 4, "N-7 incoming damage");
        near(helper, hurtEvent(player(helper, 5), source, 20), 25, "N+5 incoming damage");
        near(helper, hurtEvent(player(helper, 5, "enemy_attack_1", "enemy_attack_2"), source, 20), 27,
                "Existing saved attack modifiers now add to received damage");
        ServerPlayer attacker = player(helper, 18);
        near(helper, hurtEvent(player(helper, -7), helper.getLevel().damageSources().playerAttack(attacker), 20), 2.4,
                "PvP reduction composes with victim's difficulty, not attacker's");
        near(helper, hurtEvent(player(helper, 5), helper.getLevel().damageSources().starve(), 20), 31.25,
                "Existing additive max-health damage adjustment happens before difficulty");
        helper.succeed();
    }

    @GameTest(template = "difficulty_test")
    public static void voidAndKillTagBypassesScaling(GameTestHelper helper) {
        for (int axis : new int[]{-7, 5, 18}) {
            ServerPlayer player = player(helper, axis);
            near(helper, hurtEvent(player, helper.getLevel().damageSources().fellOutOfWorld(), 20), 20, "Void exemption");
            near(helper, hurtEvent(player, helper.getLevel().damageSources().genericKill(), 20), 20, "Kill exemption");
        }
        helper.succeed();
    }

    @GameTest(template = "difficulty_test")
    public static void multiplierRunsBeforeArmor(GameTestHelper helper) {
        ServerPlayer scaled = player(helper, 5);
        ServerPlayer reference = player(helper, 1); // N+1 is exactly 1.0 incoming damage.
        scaled.getAttribute(Attributes.ARMOR).setBaseValue(20);
        reference.getAttribute(Attributes.ARMOR).setBaseValue(20);
        DamageSource source = helper.getLevel().damageSources().cactus();
        helper.assertTrue(scaled.hurt(source, 20), "Scaled hit accepted");
        helper.assertTrue(reference.hurt(source, 25), "Reference hit accepted");
        near(helper, 100 - scaled.getHealth(), 100 - reference.getHealth(),
                "N+5 at 20 damage must equal N+1 at 25 damage through real armor pipeline");
        helper.assertTrue(scaled.getHealth() < 100 && scaled.getHealth() > 75, "Armor must actually reduce the hit");
        helper.succeed();
    }

    @GameTest(template = "difficulty_test")
    public static void defaultMobRebindsOnceToActualAttacker(GameTestHelper helper) {
        Zombie mob = zombie(helper);
        near(helper, mob.getMaxHealth(), 17, "Default N0 health at spawn");
        near(helper, mob.getAttributeValue(Attributes.ATTACK_DAMAGE), 4, "Default difficulty leaves attack template intact");
        helper.assertTrue(mob.getPersistentData().getBoolean(FALLBACK), "No player marks fallback");
        mob.setHealth(8.5f);
        ServerPlayer attacker = player(helper, 5, "enemy_health_1");
        ServerPlayer nearby = player(helper, 18);
        onlinePlayers(helper).add(nearby);
        try {
            hurtEvent(mob, helper.getLevel().damageSources().playerAttack(attacker), 1);
            near(helper, mob.getMaxHealth(), 46, "Attacker overrides nearby higher difficulty");
            near(helper, mob.getHealth(), 23, "Rebind preserves health fraction");
            helper.assertTrue(mob.getPersistentData().getBoolean(REBOUND), "Rebind recorded");
            hurtEvent(mob, helper.getLevel().damageSources().playerAttack(nearby), 1);
            near(helper, mob.getMaxHealth(), 46, "Second player's hit cannot rebind again");
            near(helper, mob.getAttributeValue(Attributes.ATTACK_DAMAGE), 4, "Attack never gains personal difficulty modifier");
        } finally { onlinePlayers(helper).remove(nearby); }
        helper.succeed();
    }

    @GameTest(template = "difficulty_test")
    public static void projectileOwnerAndDimensionStageAreUsed(GameTestHelper helper) {
        Zombie mob = zombie(helper);
        ServerPlayer attacker = player(helper, 5);
        Stages.get(attacker).addNoUpdate("sdbf.world_lock");
        Arrow arrow = new Arrow(helper.getLevel(), attacker);
        hurtEvent(mob, helper.getLevel().damageSources().arrow(arrow, attacker), 1);
        helper.assertTrue(mob.getPersistentData().getBoolean(REBOUND), "Arrow owner resolved as real player");
        helper.assertTrue(mob.getPersistentData().getString("sbsd.diff").equals("3_3"), "Dimension progression uses attacker");
        near(helper, mob.getAttributeValue(Attributes.ATTACK_DAMAGE), 700, "Dimension template attack still applies");
        // This dev runtime omits AttributeFix, so vanilla clamps the effective health
        // to 1024. Check the computed base independently of that unrelated cap.
        near(helper, mob.getAttribute(Attributes.MAX_HEALTH).getBaseValue(), 26908.2,
                "Both dimension and personal health recomputed");
        helper.succeed();
    }

    @GameTest(template = "difficulty_test")
    public static void explicitlyInitializedN0MobDoesNotRebind(GameTestHelper helper) {
        ServerPlayer nearby = player(helper, 0);
        onlinePlayers(helper).add(nearby);
        Zombie mob;
        try { mob = zombie(helper); }
        finally { onlinePlayers(helper).remove(nearby); }
        helper.assertTrue(!mob.getPersistentData().getBoolean(FALLBACK), "Actual nearby N0 is not a fallback");
        hurtEvent(mob, helper.getLevel().damageSources().playerAttack(player(helper, 18)), 1);
        near(helper, mob.getMaxHealth(), 17, "Explicit N0 stays unchanged");
        helper.succeed();
    }

    @GameTest(template = "difficulty_test")
    public static void environmentalAndFakePlayerHitsDoNotConsumeRetry(GameTestHelper helper) {
        Zombie mob = zombie(helper);
        hurtEvent(mob, helper.getLevel().damageSources().generic(), 1);
        hurtEvent(mob, helper.getLevel().damageSources().playerAttack(FakePlayerFactory.getMinecraft(helper.getLevel())), 1);
        hurtEvent(mob, helper.getLevel().damageSources().playerAttack(player(helper, 5)), 0);
        helper.assertTrue(!mob.getPersistentData().getBoolean(REBOUND), "Still waiting for a real player's positive hit");
        hurtEvent(mob, helper.getLevel().damageSources().playerAttack(player(helper, 5)), 1);
        near(helper, mob.getMaxHealth(), 36, "Real first hit can still rebind");
        helper.succeed();
    }
}
