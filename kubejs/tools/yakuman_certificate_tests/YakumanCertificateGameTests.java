package com.tonywww.slashblade_sendims.gametest;

import com.google.gson.JsonParser;
import com.mojang.authlib.GameProfile;
import com.riichimahjongforge.mahjongcore.MahjongYakuAdvancements;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.gametest.framework.GameTest;
import net.minecraft.gametest.framework.GameTestHelper;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.network.ServerGamePacketListenerImpl;
import net.minecraft.network.Connection;
import net.minecraft.network.PacketSendListener;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.PacketFlow;
import net.minecraft.tags.TagKey;
import net.minecraft.world.entity.item.ItemEntity;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.phys.Vec3;
import net.minecraftforge.gametest.GameTestHolder;
import net.minecraftforge.gametest.PrefixGameTestTemplate;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

/** Runs with the actual KubeJS registration, Mahjong jar and advancement loot reward pipeline. */
@GameTestHolder("yakuman_certificate_test")
@PrefixGameTestTemplate(false)
public final class YakumanCertificateGameTests {
    private static final class SilentConnection extends ServerGamePacketListenerImpl {
        SilentConnection(MinecraftServer server,ServerPlayer player) {
            super(server,new Connection(PacketFlow.SERVERBOUND),player);
        }
        @Override public void send(Packet<?> packet) {}
        @Override public void send(Packet<?> packet,PacketSendListener listener) {}
    }
    private static ServerPlayer player(GameTestHelper h) {
        // Forge deliberately refuses advancement awards to FakePlayer instances.
        // Use the real server player implementation and stub only outgoing network traffic.
        var p=new ServerPlayer(h.getLevel().getServer(),h.getLevel(),new GameProfile(UUID.randomUUID(),"CertificateTest"));
        p.connection=new SilentConnection(h.getLevel().getServer(),p);
        p.setPos(h.absoluteVec(new Vec3(4,2,4)));
        p.getInventory().clearContent();
        return p;
    }
    private static ResourceLocation id(String value) {return ResourceLocation.fromNamespaceAndPath(value.split(":")[0],value.split(":")[1]);}
    private static Item item(String key) {return BuiltInRegistries.ITEM.get(id("kubejs:yakuman_certificate_"+key));}
    private static int count(ServerPlayer p,Item item) {return p.getInventory().countItem(item);}
    private static net.minecraft.advancements.Advancement advancement(GameTestHelper h,String key) {
        var a=h.getLevel().getServer().getAdvancements().getAdvancement(id("riichi_mahjong_forge:yaku/"+key));
        h.assertTrue(a!=null,"Missing Mahjong advancement "+key);return a;
    }
    @GameTest(template="certificate_test",batch="certificates")
    public static void allCertificatesAwardExactlyOnce(GameTestHelper h) throws Exception {
        var p=player(h);
        try {
            var catalog=JsonParser.parseString(Files.readString(Path.of("kubejs/config/yakuman_certificates.json")))
                    .getAsJsonObject().getAsJsonArray("certificates");
            h.assertTrue(catalog.size()==17,"Certificate catalog incomplete");
            for(var element:catalog) {
                var entry=element.getAsJsonObject();String key=entry.get("key").getAsString();
                var item=item(key);h.assertTrue(item!=Items.AIR,"Startup registration missing for "+key);
                var all=TagKey.create(Registries.ITEM,id("kubejs:yakuman_certificates"));
                var family=TagKey.create(Registries.ITEM,id("kubejs:yakuman_certificates/"+entry.get("family").getAsString()));
                h.assertTrue(item.builtInRegistryHolder().is(all),"Missing certificate material tag for "+key);
                h.assertTrue(item.builtInRegistryHolder().is(family),"Missing yaku family tag for "+key);
                var a=advancement(h,key);
                h.assertTrue(p.getAdvancements().award(a,"earned"),"First completion was not accepted: "+key);
                h.assertTrue(count(p,item)==1,"First completion did not deliver exactly one certificate: "+key);
                h.assertFalse(p.getAdvancements().award(a,"earned"),"Repeated completion accepted: "+key);
                h.assertTrue(count(p,item)==1,"Repeated completion duplicated the reward: "+key);
            }
            h.succeed();
        } finally {p.discard();}
    }
    @GameTest(template="certificate_test",batch="certificates")
    public static void nativeMahjongCompoundWinDeliversMatchingCertificates(GameTestHelper h) {
        var p=player(h);
        try {
            MahjongYakuAdvancements.awardForWin(p,0,true,List.of("daisangen","tsuuiisou"));
            h.assertTrue(count(p,item("daisangen"))==1,"Native big-three-dragons result did not deliver its certificate");
            h.assertTrue(count(p,item("tsuuiisou"))==1,"Native all-honors result did not deliver its certificate");
            h.assertTrue(count(p,item("kokushi_musou"))==0,"Compound win delivered an unrelated certificate");
            h.assertTrue(p.getAdvancements().getOrStartProgress(advancement(h,"yakuman")).isDone(),"Native summary advancement not awarded");
            int total=p.getInventory().items.stream().mapToInt(ItemStack::getCount).sum();
            h.assertTrue(total==2,"The generic yakuman summary must not add a second generic reward");
            MahjongYakuAdvancements.awardForWin(p,0,true,List.of("daisangen","tsuuiisou"));
            h.assertTrue(count(p,item("daisangen"))==1&&count(p,item("tsuuiisou"))==1,"Repeat win duplicated completed-advancement rewards");
            h.succeed();
        } finally {p.discard();}
    }
    @GameTest(template="certificate_test",batch="certificates",timeoutTicks=40)
    public static void fullInventoryDropsRewardInsteadOfLosingIt(GameTestHelper h) {
        var p=player(h);
        for(int slot=0;slot<36;slot++)p.getInventory().setItem(slot,new ItemStack(Items.STONE,64));
        p.getAdvancements().award(advancement(h,"tenhou"),"earned");
        h.runAtTickTime(3,()->{
            try {
                var drops=h.getLevel().getEntitiesOfClass(ItemEntity.class,p.getBoundingBox().inflate(3),
                        entity->entity.getItem().is(item("tenhou")));
                int count=drops.stream().mapToInt(entity->entity.getItem().getCount()).sum();
                h.assertTrue(count==1,"A full inventory must drop exactly one heaven certificate, got "+count);
                h.assertTrue(count(p,item("tenhou"))==0,"Full inventory unexpectedly accepted a reward");
                h.succeed();
            } finally {p.discard();}
        });
    }
}
