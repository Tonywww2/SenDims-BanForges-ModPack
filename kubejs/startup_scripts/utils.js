// priority: 2000

let $ClientQuestFile = null;
let $QuestBrowserScreen = null;
let $Minecraft = null;
let $MaterialManager = null;
let $ForgeRegistries = null;

if (Platform.isClientEnvironment()) {
	$ClientQuestFile = Java.loadClass('dev.ftb.mods.ftbquests.client.ClientQuestFile');
	$QuestBrowserScreen = Java.loadClass('com.twisted_um.uiquest.client.screen.QuestBrowserScreen');
	$Minecraft = Java.loadClass('net.minecraft.client.Minecraft');
	$MaterialManager = Java.loadClass('net.yiran.extraholopage.api.MaterialManager');
	$ForgeRegistries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries');
}

const $ArmorItem = Java.loadClass("net.minecraft.world.item.ArmorItem");
const $SwordItem = Java.loadClass("net.minecraft.world.item.SwordItem");
const $AxeItem = Java.loadClass("net.minecraft.world.item.AxeItem");
