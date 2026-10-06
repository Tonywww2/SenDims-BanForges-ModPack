// Test the actual processing callbacks and recipe definitions with inventory/API doubles.
let fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let {A,scope}=require('./verify.js'),root=path.resolve(__dirname,'../../..');
let run=file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),scope,{filename:file});
run('kubejs/startup_scripts/astral_gems/13_processing_config.js');
run('kubejs/startup_scripts/astral_gems/16_processing.js');
class JavaList extends Array {static get [Symbol.species](){return Array;}constructor(items=[]){super();this.push(...items);}get(i){return this[i];}size(){return this.length;}add(x){this.push(x);}}
let clone=v=>v instanceof Compound?v.copy():v instanceof JavaList?new JavaList(v.map(clone)):v;
class Compound {
  constructor(){this.values=new Map();}
  putValue(k,v,t){this.values.set(k,{value:v,type:t});}
  putInt(k,v){this.putValue(k,v,3);}putDouble(k,v){this.putValue(k,v,6);}putBoolean(k,v){this.putValue(k,v,1);}putString(k,v){this.putValue(k,v,8);}
  put(k,v){this.putValue(k,v,v instanceof Compound?10:9);}
  contains(k,t){return this.values.has(k)&&(t===undefined||this.values.get(k).type===t);}
  get(k){return this.values.get(k)?.value;}getInt(k){return this.get(k)||0;}getDouble(k){return this.get(k)||0;}getString(k){return this.get(k)||'';}getBoolean(k){return !!this.get(k);}
  getCompound(k){return this.contains(k,10)?this.get(k):new Compound();}getList(k){return this.contains(k,9)?this.get(k):new JavaList();}
  remove(k){this.values.delete(k);}isEmpty(){return this.values.size===0;}
  copy(){let out=new Compound();for(let [k,v]of this.values)out.putValue(k,clone(v.value),v.type);return out;}
}
class Stack {
  constructor(id,count=1,tag=null){this.id=id;this.count=count;this.tag=tag;}
  getItem(){return this;}getNbt(){return this.tag;}getCount(){return this.count;}isEmpty(){return this.count===0||this.id==='minecraft:air';}
  copy(){return new Stack(this.id,this.count,this.tag?.copy()||null);}copyWithCount(n){let copy=this.copy();copy.count=n;return copy;}
}
let success=value=>({ok:()=>true,value:()=>value,error:()=>null});
let failure=error=>({ok:()=>false,error:()=>error});
class Output {constructor(stack,consumed=new Map(),returned=new JavaList()){this.stack=stack;this.consumption=consumed;this.returns=returned;}result(){return this.stack.copy();}consumed(){return this.consumption;}returned(){return this.returns;}}
let transforms=new Map(),predicates=new Map(),items=new Map(),fluent=new Proxy({},{get:()=>()=>fluent});
let foils=new Map(),names=new Set();
let models=new Map(),modelProperties=new Map();
let stackedHandler,invalidations=0;
let builder=id=>{let item={id,maxStackSize:()=>item,rarity:()=>item,texture:()=>item,modelJson:model=>{models.set(id,model);return item;}};return item;};
let draws=0,seed=78137;
let random=()=>{draws++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
let read=(stack,key)=>stack.tag?.contains(key,10)?stack.tag.getCompound(key).copy():null;
let write=(stack,key,data)=>{let copy=stack.copy();copy.tag=copy.tag||new Compound();copy.tag.put(key,data.copy());return copy;};
let remove=(stack,key)=>{let copy=stack.copy();if(copy.tag){copy.tag.remove(key);if(copy.tag.isEmpty())copy.tag=null;}return copy;};
let classes={
  'net.minecraft.nbt.CompoundTag':Compound,'net.minecraft.nbt.ListTag':JavaList,'java.util.ArrayList':JavaList,'java.util.HashMap':Map,
  'net.minecraft.network.chat.Component':{literal:s=>s,translatable:(...args)=>args},
  'net.minecraft.core.registries.BuiltInRegistries':{ITEM:{getKey:item=>item.id}},
  'net.minecraftforge.event.ItemStackedOnOtherEvent':class {},
  'net.minecraftforge.eventbus.api.EventPriority':{HIGHEST:'HIGHEST'},
  'com.tonywww.deeprealm4th.astral.AstralRuntime':{invalidate:()=>invalidations++},
  'com.tonywww.deeprealm4th.astral.process.AstralTransforms$ProcessOutput':Output,
  'com.tonywww.deeprealm4th.astral.process.AstralTransforms$Result':{success}
};
Object.assign(scope,{
  randomSource:random,Java:{loadClass:name=>{assert(classes[name],name);return classes[name];}},Item:{of:(id,n)=>new Stack(id,n)},
  Text:{translatable:key=>key,of:value=>value},StartupEvents:{registry:(type,fn)=>fn({create:id=>{items.set('kubejs:'+id,true);return builder('kubejs:'+id);}})},
  NativeEvents:{onEvent:(priority,receiveCanceled,type,fn)=>{assert.equal(priority,'HIGHEST');assert.equal(receiveCanceled,false);stackedHandler=fn;}},
  ItemEvents:{modelProperties:fn=>fn({register:(id,key,callback)=>modelProperties.set(id,{key,callback})})},
  FillerNode:{},FillerPresentations:{registerName:id=>names.add(id),registerFoil:(id,fn)=>foils.set(id,fn),applyNameCopy:stack=>stack.copy()},EffectScope:{PLAYER:1},
  FillerDefinition:{builder:()=>fluent},FillerActivation:{STACKABLE:1},AstralFillers:{register:()=>{},disable:()=>{}},
  AstralItemData:{read,writeCopy:write,removeCopy:remove},AstralDataPredicates:{register:(id,fn)=>{assert(!predicates.has(id),id);predicates.set(id,fn);}},
  AstralTransforms:{register:(id,matches,preview,produce)=>{assert(!transforms.has(id),id);transforms.set(id,{matches,preview,produce});},
    previewItem:success,producedItem:stack=>success(new Output(stack)),failedPreview:failure,failedProduce:failure},
  GemPayload:{decode:tag=>{
    if(!tag||!tag.contains('natural',10)||!tag.contains('affixes',9))return failure('invalid');
    let affixes=list=>new JavaList(list.map(a=>({stat:()=>({name:()=>a.getString('stat').toUpperCase()}),operation:()=>({name:()=>a.getString('operation').toUpperCase()}),value:()=>a.getDouble('value')})));
    return success({sourceItem:()=>tag.getString('source_item'),primary:()=>tag.getString('primary'),natural:()=>({size:()=>tag.getCompound('natural').getDouble('size'),purity:()=>tag.getCompound('natural').getDouble('purity'),polish:()=>tag.getCompound('natural').getDouble('polish')}),
      affixes:()=>affixes(tag.getList('affixes')),reinforcements:()=>affixes(tag.getList('reinforcements')),extensions:()=>tag.getCompound('extensions').copy()});
  }},GemPayloadTransfer:{
    toFiller:(gem,key,template)=>{let p=A.read(gem);return p.payload?{ok:()=>true,stack:()=>A.write(template,p.payload)}:failure('invalid');},
    embed:(gem,key,badge)=>{let p=A.read(gem);if(read(badge,A.badgeKey)?.contains('gem'))return failure('badge_socket_occupied');return {ok:()=>true,stack:()=>A.write(badge,p.payload)};}
  }
});
vm.runInContext('Math.random=randomSource',scope);
run('kubejs/startup_scripts/astral_gems/18_presentation.js');
run('kubejs/startup_scripts/astral_gems/20_bridge.js');
run('kubejs/startup_scripts/astral_gems/25_inventory_stacking.js');
run('kubejs/startup_scripts/astral_gems/30_processing_bridge.js');
assert.equal(items.size,9,'two equipment items and seven consumables');
assert.equal(names.size,1);assert(names.has(A.badgeId),'only the badge gets a dynamic name');
assert.equal(foils.size,34);assert(!foils.get('thermal:ruby')(new Stack('thermal:ruby')),'ordinary gems have no added glint');
let fillerModel=models.get(A.fillerId),iconProperty=modelProperties.get(A.fillerId);
assert(fillerModel);assert.equal(fillerModel.overrides.length,31);assert.equal(iconProperty.key,'sdbf_astral:prototype');
assert.equal(iconProperty.callback(new Stack(A.fillerId)),0,'empty filler uses default icon');
for(let species of A.species){
  let payload=A.generateProcessed(species.item,'high',()=>.5),filler=A.write(new Stack(A.fillerId),payload);
  let value=iconProperty.callback(filler),expected=A.prototypeModels[species.item];
  assert.equal(value,expected?expected.value:0,'prototype predicate: '+species.item);
  let matched=fillerModel.overrides.filter(entry=>Math.fround(value)>=Math.fround(entry.predicate['sdbf_astral:prototype'])).at(-1);
  assert.equal(matched?.model,expected?.model,'prototype model: '+species.item);
}
let itemLang=JSON.parse(fs.readFileSync(path.join(root,'kubejs/assets/kubejs/lang/zh_cn.json'),'utf8'));
for(let id of items.keys())assert(itemLang['item.'+id.replace(':','.')],'native item translation: '+id);
assert.deepEqual([1,2,3].map(t=>Object.values(A.gemTiers).filter(x=>x===t).length),[19,13,2]);
assert(!A.canProcess('botania:dragonstone','mid'));assert(A.canProcess('botania:dragonstone','high'));
for(let [tier,power]of [['low',3],['mid',2],['high',1]]){
  assert.equal(A.rollGem('thermal:ruby',tier,()=>.5).affixes[0].value,.25*.5**power);
  assert(Math.abs(A.rollGem('thermal:ruby',tier,()=>.9).affixes[0].value-(-.125*.9**2))<1e-12);
}
let client=false;
let luckReads=0;
let player={level:{get clientSide(){return client;}},getLuck:()=>{luckReads++;return 10;},getTags:()=>{throw new Error('gem operations must not read unlock tags');}};
let ctx=(gem,agent,template=gem)=>({player:()=>player,source:name=>({gem,agent,badge:agent}[name]||new Stack('minecraft:air',0)),template:()=>template});
let generated=transforms.get('sdbf:astral_generate_gem');
let raw=new Stack('thermal:ruby',64),agent=new Stack(A.processing.tiers.mid.id,64),context=ctx(raw,agent),before=draws;
assert(generated.preview(context).ok());assert(generated.preview(context).ok());assert.equal(draws,before,'preview must not draw');
assert.equal(luckReads,0,'preview does not read luck');
let result=generated.produce(context);assert(result.ok());let gem=result.value().result(),data=A.read(gem).payload;
assert.equal(luckReads,1,'the API processing path reads the player luck');
assert.equal(gem.count,1);assert.equal(raw.count,64);assert.equal(raw.tag,null);assert(!agent.tag);
assert(data.affixes.length>=1&&data.affixes.length<=5);assert.equal(A.enhancementUses(data),0);assert(data.extensions.getBoolean('processed'));
assert(foils.get('thermal:ruby')(gem),'valid processed gem has glint');assert(!gem.tag.contains('display'),'processing retains original name and adds no enchantment');assert(!gem.tag.contains('Enchantments'));
assert.equal(data.extensions.getString('processing_tier'),'mid');assert.equal(data.extensions.getInt('probability_version'),A.processing.generationVersion);
before=draws;result=generated.produce(ctx(gem,agent));assert(!result.ok());assert.equal(result.error(),'宝石已加工。');assert.equal(draws,before);
let damaged=new Stack('thermal:ruby');damaged.tag=new Compound();damaged.tag.putString(A.gemKey,'bad');
assert(!foils.get('thermal:ruby')(damaged),'invalid payload must not add glint');
assert.equal(generated.produce(ctx(damaged,agent)).error(),'宝石已加工。');assert.equal(draws,before);
assert.equal(generated.produce(ctx(new Stack('botania:dragonstone'),agent)).error(),'加工剂不适用。');
client=true;assert(generated.preview(context).ok(),'client preview needs no dimension unlock');client=false;
assert(generated.produce(context).ok(),'processing needs no dimension unlock');
data.affixes=[{stat:'purity',operation:'flat',value:-10}];data.extensions.putString('custom_extension','retained');gem=A.write(gem,data);
let original=A.encode(A.read(gem).payload),enhance=transforms.get('sdbf:astral_enhance_gem'),cleanser=new Stack(A.processing.enhancements.cleanse.id);
let cleanedPreview=enhance.preview(ctx(gem,cleanser));assert(cleanedPreview.ok());assert.equal(A.enhancementUses(A.read(gem).payload),0);
result=enhance.produce(ctx(gem,cleanser));assert(result.ok());gem=result.value().result();data=A.read(gem).payload;
assert.equal(data.affixes.length,0);assert.equal(A.enhancementUses(data),1);assert.equal(original.getList('affixes').length,1);
assert.equal(enhance.produce(ctx(gem,cleanser)).error(),'无负面词条。');assert.equal(A.enhancementUses(A.read(gem).payload),1);
for(let i=0;i<9;i++){let kind=['size','purity','polish'][i%3];result=enhance.produce(ctx(gem,new Stack(A.processing.enhancements[kind].id)));assert(result.ok());gem=result.value().result();}
data=A.read(gem).payload;assert.equal(A.enhancementUses(data),10);assert.equal(data.reinforcements.length,9);
assert.equal(data.extensions.getString('custom_extension'),'retained');assert.equal(enhance.produce(ctx(gem,cleanser)).error(),'强化次数已满。');
let transfer=transforms.get('sdbf:astral_gem_to_filler').produce(ctx(gem,null,new Stack(A.fillerId)));
assert(transfer.ok());assert.equal(A.enhancementUses(A.read(transfer.value().result()).payload),10);
let badge=transforms.get('sdbf:astral_embed_gem').produce(ctx(gem,new Stack(A.badgeId))).value().result();
assert.equal(A.enhancementUses(A.read(badge).payload),10);assert(!transforms.get('sdbf:astral_embed_gem').produce(ctx(gem,badge)).ok());
let extract=transforms.get('sdbf:astral_extract_gem').produce(ctx(badge,null));assert(extract.ok());
assert.equal(extract.value().returned().length,1);assert(!A.read(extract.value().returned()[0]).payload);
assert.equal(A.enhancementUses(A.read(extract.value().result()).payload),10);assert.equal(A.read(extract.value().result()).payload.affixes.length,0);
A.balance.enhancementMaxUses=9;assert.throws(()=>A.enhanceStack(gem,'size'),/enhancement_limit/);A.balance.enhancementMaxUses=10;
let badCounter=gem.copy(),badTag=read(badCounter,A.gemKey);badTag.getCompound('extensions').putInt('enhancement_uses',-1);
badCounter.tag.put(A.gemKey,badTag);assert(!A.read(badCounter).payload,'invalid counter must be rejected before tooltip rendering');
let decoratedSoul=new Stack(A.processing.materials.soul);decoratedSoul.tag=new Compound();decoratedSoul.tag.putString('custom','retained');
assert(predicates.get('sdbf:astral_material')(decoratedSoul),'material NBT must not block soul ingredients');
// Exercise the registered Forge stacking dispatcher, including prediction and stack splitting.
let savedSeed=seed,messages=[];
let inventory=[];
let menuSyncs=0;
let sounds=[];
let createCooldowns=()=>{
  let ticks=0,expires=new Map(),added=[];
  return {added,addCooldown:(item,duration)=>{assert(item instanceof Stack);expires.set(item.id,ticks+duration);added.push({id:item.id,duration});},
    isOnCooldown:item=>(expires.get(item.id)||0)>ticks,tick:duration=>{ticks+=duration;},getTicks:()=>ticks};
};
player.cooldowns=createCooldowns();player.soundSource='players';
player.playNotifySound=(id,source,volume,pitch)=>sounds.push({id,source,volume,pitch,tick:player.cooldowns.getTicks()});
player.containerMenu={sendAllDataToRemote:()=>menuSyncs++};
let resetInventory=full=>{inventory=Array.from({length:36},()=>new Stack(full?'minecraft:stone':'minecraft:air',full?64:0));};
player.isShiftKeyDown=()=>{throw new Error('stacking must not depend on Shift');};
player.getInventory=()=>({getFreeSlot:()=>inventory.findIndex(s=>s.isEmpty()),setItem:(i,s)=>{assert(inventory[i].isEmpty());inventory[i]=s;},setChanged:()=>{}});
player.displayClientMessage=message=>messages.push(message);
let clientPlayer=Object.assign({},player,{cooldowns:createCooldowns(),playNotifySound:()=>assert.fail('client prediction must not play sound')});
let click=(carried,target,options={})=>{
  let actingPlayer=options.player|| (client?clientPlayer:player),soundCount=sounds.length;
  actingPlayer.cooldowns.tick(options.advance===undefined?5:options.advance);
  // Forge 47.4.20 passes slot first and cursor second, despite the event getter names.
  let event={carried,target,canceled:false,getPlayer:()=>actingPlayer,getCarriedItem:()=>target,getStackedOnItem:()=>carried,
    getClickAction:()=>({name:()=>options.left?'PRIMARY':'SECONDARY'}),isCanceled:()=>event.canceled,setCanceled:value=>event.canceled=value,
    getSlot:()=>({getItem:()=>event.target,isActive:()=>true,allowModification:()=>!options.protected,mayPlace:()=>!options.rejectOutput,set:s=>event.target=s,setChanged:()=>{}}),
    getCarriedSlotAccess:()=>({get:()=>event.carried,set:s=>{assert(event.canceled,'cancel vanilla exchange before changing the cursor');if(options.rejectCursor)return false;event.carried=s;return true;}})};
  event.interactionResult=stackedHandler(event);
  assert.equal(event.interactionResult,event.canceled,'handled callbacks return true; unrelated callbacks return false');
  event.vanillaExchange=!event.canceled&&!event.carried.isEmpty()&&!event.target.isEmpty()&&event.carried.id!==event.target.id;
  if(event.vanillaExchange){let previous=event.carried;event.carried=event.target;event.target=previous;}
  assert.equal(sounds.length-soundCount,!client&&event.canceled&&!options.silent?1:0,'one server sound per completed success/failure; none for prediction, cooldown or unrelated items');
  return event;
};
resetInventory(false);client=true;before=draws;
let previousLuckReads=luckReads;
let stacked=click(new Stack(A.processing.tiers.mid.id,64),new Stack('thermal:ruby',64));
assert(stacked.canceled);assert.equal(draws,before);assert.equal(stacked.target.count,64);assert.equal(stacked.carried.count,64);assert(inventory.every(s=>s.isEmpty()));
assert.equal(menuSyncs,0,'client prediction does not synchronize a server menu');
assert.equal(luckReads,previousLuckReads,'client prediction does not read luck');
client=false;stacked=click(stacked.carried,stacked.target);
assert.equal(stacked.carried.id,A.processing.tiers.mid.id,'processing material stays on cursor');
assert.equal(stacked.target.id,'thermal:ruby','gem stays in its slot');assert(!stacked.vanillaExchange);
assert.equal(luckReads,previousLuckReads+1,'server stacking reads the player luck');
assert(stacked.canceled);assert.equal(stacked.target.count,63);assert.equal(stacked.carried.count,63);
let stackedGem=inventory[0];assert.equal(stackedGem.count,1);assert(A.read(stackedGem).payload);assert(draws>before);
before=draws;let refused=click(stacked.carried,stackedGem);assert(refused.canceled);assert.equal(draws,before);assert.equal(refused.carried.count,63);assert.equal(messages.at(-1),'宝石已加工。');
let left=click(stacked.carried,stacked.target,{left:true});assert(!left.canceled);assert.equal(draws,before);
let unrelated=click(new Stack('minecraft:paper',8),new Stack('minecraft:stone'));
assert(!unrelated.canceled,'unrelated stacking retains vanilla behavior');
assert(unrelated.vanillaExchange);assert.equal(unrelated.carried.id,'minecraft:stone');
resetInventory(true);refused=click(stacked.carried,stacked.target);assert(refused.canceled);assert.equal(draws,before);assert.equal(refused.target.count,63);assert.equal(refused.carried.count,63);
resetInventory(false);refused=click(new Stack(A.processing.tiers.low.id,4),new Stack('botania:dragonstone'));
assert(refused.canceled);assert.equal(messages.at(-1),'加工剂不适用。');assert.equal(draws,before);
let validData=A.generateProcessed('thermal:ruby','mid',()=>.5);validData.affixes=[{stat:'size',operation:'flat',value:-5}];validData.extensions.putInt('enhancement_uses',9);
stackedGem=A.write(new Stack('thermal:ruby'),validData);
stacked=click(new Stack(A.processing.enhancements.cleanse.id,2),stackedGem);
assert(stacked.canceled);assert.equal(stacked.carried.count,1);assert.equal(A.read(stacked.target).payload.affixes.length,0);assert.equal(A.enhancementUses(A.read(stacked.target).payload),10);
refused=click(stacked.carried,stacked.target);assert.equal(refused.carried.count,1);assert.equal(messages.at(-1),'强化次数已满。');
let filled=click(new Stack('minecraft:paper',8),stacked.target);
assert(filled.canceled);assert.equal(filled.carried.count,7);assert.equal(filled.target.id,A.fillerId);assert.equal(A.enhancementUses(A.read(filled.target).payload),10);
let embedded=click(new Stack(A.badgeId),stacked.target);
assert(embedded.canceled);assert.equal(embedded.target.count,0);assert.equal(embedded.carried.id,A.badgeId);assert.equal(A.enhancementUses(A.read(embedded.carried).payload),10);
for(let options of [{protected:true},{rejectOutput:true},{rejectCursor:true}]){
  let blocked=click(embedded.carried,new Stack('minecraft:air',0),options);
  assert(blocked.canceled);assert(A.read(blocked.carried).payload);assert(blocked.target.isEmpty());
}
client=true;let predicted=click(embedded.carried,new Stack('minecraft:air',0));
assert(predicted.canceled);assert(A.read(predicted.carried).payload);assert(predicted.target.isEmpty());client=false;
let extracted=click(embedded.carried,new Stack('minecraft:air',0));
assert(extracted.canceled);assert(!A.read(extracted.carried).payload);assert.equal(extracted.target.id,'thermal:ruby');assert.equal(A.enhancementUses(A.read(extracted.target).payload),10);
let emptyPlacement=click(extracted.carried,new Stack('minecraft:air',0));
assert(!emptyPlacement.canceled,'an empty badge retains normal placement and cannot extract again');
let reembedded=click(extracted.carried,extracted.target);
assert(reembedded.canceled);assert.equal(reembedded.target.count,0);
assert.equal(A.enhancementUses(A.read(reembedded.carried).payload),10,'an extracted badge can embed again without losing gem data');
let occupied=click(reembedded.carried,extracted.target);
assert(occupied.canceled);assert.equal(occupied.carried,reembedded.carried);assert.equal(occupied.target,extracted.target,'an occupied badge consumes no replacement gem');
assert.equal(messages.at(-1),'徽章已镶嵌宝石。','an occupied badge uses the approved specific message');
let metadata=new Compound();metadata.putString('custom_badge','retained');
for(let badgeData of [new Compound(),metadata]){
  let emptyBadge=write(new Stack(A.badgeId),A.badgeKey,badgeData);
  emptyBadge.tag.putString('custom_item','retained');
  client=true;let predictedEmbed=click(emptyBadge,extracted.target);client=false;
  assert(predictedEmbed.canceled);assert.equal(predictedEmbed.carried,emptyBadge);assert.equal(predictedEmbed.target,extracted.target,'prediction does not change empty badge or gem');
  let reused=click(emptyBadge,extracted.target);
  assert(reused.canceled);assert.equal(reused.target.count,0);assert(A.read(reused.carried).payload,'empty or metadata-only badge data must allow embedding');
  assert(!read(emptyBadge,A.badgeKey).contains('gem'),'embedding does not mutate the original badge');
  let removed=click(reused.carried,new Stack('minecraft:air',0));
  assert(removed.canceled);assert.equal(removed.carried.getNbt().getString('custom_item'),'retained');
  assert.equal(A.enhancementUses(A.read(removed.target).payload),10);
  if(badgeData.isEmpty())assert(!removed.carried.getNbt().contains(A.badgeKey),'extraction removes an empty badge namespace');
  else assert.equal(read(removed.carried,A.badgeKey).getString('custom_badge'),'retained','extraction preserves unrelated badge metadata');
}
let malformedBadge=new Stack(A.badgeId);malformedBadge.tag=new Compound();malformedBadge.tag.putString(A.badgeKey,'invalid');
let malformedSocket=new Compound();malformedSocket.putString('gem','invalid');
for(let badBadge of [malformedBadge,write(new Stack(A.badgeId),A.badgeKey,malformedSocket)]){
  let blocked=click(badBadge,extracted.target);
  assert(blocked.canceled);assert.equal(blocked.carried,badBadge);assert.equal(blocked.target,extracted.target,'malformed badge data is not silently overwritten');
  assert.equal(messages.at(-1),'宝石数据无效。');
}
resetInventory(false);client=true;before=draws;
let reversePredicted=click(new Stack('thermal:ruby'),new Stack(A.processing.tiers.mid.id,8));
assert(reversePredicted.canceled);assert.equal(draws,before);assert.equal(reversePredicted.carried.tag,null);assert.equal(reversePredicted.target.count,8);
client=false;let reverseProcessed=click(reversePredicted.carried,reversePredicted.target);
assert(reverseProcessed.canceled);assert(A.read(reverseProcessed.carried).payload);assert.equal(reverseProcessed.carried.id,'thermal:ruby');assert.equal(reverseProcessed.target.count,7);
assert.equal(inventory.filter(s=>!s.isEmpty()).length,0,'single carried gem remains on cursor');
let reverseRepeated=click(reverseProcessed.carried,reverseProcessed.target);assert(reverseRepeated.canceled);assert.equal(reverseRepeated.target.count,7);assert.equal(messages.at(-1),'宝石已加工。');
let reverseEnhanced=click(reverseProcessed.carried,new Stack(A.processing.enhancements.size.id,8));
assert(reverseEnhanced.canceled);assert.equal(reverseEnhanced.target.count,7);assert.equal(A.enhancementUses(A.read(reverseEnhanced.carried).payload),1);
for(let reversed of [false,true]){
  let payload=A.generateProcessed('thermal:ruby','mid',()=>.5);payload.affixes=[];
  let ruby=A.write(new Stack('thermal:ruby'),payload);
  let purifier=new Stack(A.processing.enhancements.purity.id,8),purity=A.effective(A.read(ruby).payload).purity;
  let purified=click(reversed?ruby:purifier,reversed?purifier:ruby);
  assert(purified.canceled);assert(!purified.vanillaExchange);
  let resultGem=reversed?purified.carried:purified.target,resultAgent=reversed?purified.target:purified.carried;
  assert.equal(resultGem.id,'thermal:ruby','purified gem stays in its original position');
  assert.equal(resultAgent.id,purifier.id,'purifier stays in its original position');assert.equal(resultAgent.count,7);
  assert.equal(A.effective(A.read(resultGem).payload).purity,purity+4);
}
let reverseBadgeEnhanced=click(embedded.carried,new Stack(A.processing.enhancements.size.id,8));
assert(reverseBadgeEnhanced.canceled);assert.equal(reverseBadgeEnhanced.target.count,8);assert.equal(messages.at(-1),'强化次数已满。');
before=draws;let reverseInapplicable=click(new Stack('botania:dragonstone'),new Stack(A.processing.tiers.low.id,8));
assert(reverseInapplicable.canceled);assert.equal(reverseInapplicable.target.count,8);assert.equal(draws,before);assert.equal(messages.at(-1),'加工剂不适用。');
for(let options of [{protected:true},{rejectCursor:true}]){
  let blocked=click(new Stack('thermal:ruby'),new Stack(A.processing.tiers.mid.id,8),options);
  assert(blocked.canceled);assert.equal(blocked.carried.tag,null);assert.equal(blocked.target.count,8);assert(inventory.every(s=>s.isEmpty()));
}
resetInventory(false);let reverseSplit=click(new Stack('thermal:ruby',8),new Stack(A.processing.tiers.mid.id,8));
assert(reverseSplit.canceled);assert.equal(reverseSplit.carried.count,7);assert.equal(reverseSplit.carried.tag,null);assert.equal(reverseSplit.target.count,7);assert(A.read(inventory[0]).payload);assert.equal(inventory[0].count,1);
resetInventory(true);before=draws;let reverseFull=click(new Stack('thermal:ruby',8),new Stack(A.processing.tiers.mid.id,8));
assert(reverseFull.canceled);assert.equal(reverseFull.carried.count,8);assert.equal(reverseFull.target.count,8);assert.equal(draws,before);
let reverseUnrelated=click(new Stack('minecraft:stone'),new Stack(A.processing.tiers.mid.id,8));assert(!reverseUnrelated.canceled);
for(let options of [{protected:true},{rejectOutput:true},{rejectCursor:true}]){
  let blocked=click(new Stack('minecraft:paper',8),stackedGem,options);assert(blocked.canceled);assert.equal(blocked.carried.count,8);assert.equal(blocked.target.id,'thermal:ruby');
}
validData.extensions.putInt('enhancement_uses',0);let stackedCopies=A.write(new Stack('thermal:ruby',4),validData);
resetInventory(false);let splitFilled=click(new Stack('minecraft:paper',8),stackedCopies);
assert.equal(splitFilled.carried.count,7);assert.equal(splitFilled.target.count,3);assert.equal(inventory[0].id,A.fillerId);assert.equal(inventory[0].count,1);
let splitEnhance=click(new Stack(A.processing.enhancements.size.id,8),stackedCopies);
assert.equal(splitEnhance.carried.count,7);assert.equal(splitEnhance.target.count,3);assert.equal(A.enhancementUses(A.read(inventory[1]).payload),1);assert.equal(A.enhancementUses(A.read(splitEnhance.target).payload),0);
assert.equal(A.processing.interaction.cooldownTicks,5);
resetInventory(false);let cooldownGem=click(new Stack(A.processing.tiers.mid.id,8),new Stack('thermal:ruby'));
assert(A.read(cooldownGem.target).payload);assert.equal(sounds.at(-1).id,A.processing.interaction.successSound);
for(let id of [A.badgeId,A.fillerId,'minecraft:paper','thermal:ruby',...Object.keys(A.agentTiers),...Object.keys(A.enhancementKinds)]){
  assert(player.cooldowns.isOnCooldown(new Stack(id)),'native cooldown overlay for '+id);
}
let wrapperPlayer=Object.assign({},player);
let wrapperCooling=click(new Stack(A.processing.enhancements.size.id,8),cooldownGem.target,{player:wrapperPlayer,advance:0,silent:true});
assert.equal(wrapperCooling.carried.count,8);assert.equal(A.enhancementUses(A.read(wrapperCooling.target).payload),0,'another wrapper for the same player must share native cooldowns');
before=draws;let cooling=click(new Stack(A.processing.enhancements.size.id,8),cooldownGem.target,{advance:0,silent:true});
assert(cooling.canceled);assert.equal(cooling.carried.count,8);assert.equal(A.enhancementUses(A.read(cooling.target).payload),0);assert.equal(draws,before);
cooling=click(new Stack(A.processing.enhancements.size.id,8),cooldownGem.target,{advance:4,silent:true});
assert(cooling.canceled);assert.equal(cooling.carried.count,8);assert.equal(A.enhancementUses(A.read(cooling.target).payload),0);
let afterCooldown=click(new Stack(A.processing.enhancements.size.id,8),cooldownGem.target,{advance:1});
assert.equal(afterCooldown.carried.count,7);assert.equal(A.enhancementUses(A.read(afterCooldown.target).payload),1);
let failureCooldown=click(new Stack(A.processing.tiers.low.id,8),new Stack('botania:dragonstone'));
assert(failureCooldown.canceled);assert.equal(failureCooldown.carried.count,8);assert.equal(sounds.at(-1).id,A.processing.interaction.failureSound);
let failedCooling=click(new Stack('minecraft:paper',8),afterCooldown.target,{advance:4,silent:true});
assert(failedCooling.canceled);assert.equal(failedCooling.carried.count,8);assert.equal(failedCooling.target.id,'thermal:ruby');
let afterFailure=click(new Stack('minecraft:paper',8),afterCooldown.target,{advance:1});
assert.equal(afterFailure.carried.count,7);assert.equal(afterFailure.target.id,A.fillerId);
let otherPlayer=Object.assign({},player,{cooldowns:createCooldowns()});let independent=click(new Stack(A.processing.tiers.mid.id,8),new Stack('thermal:ruby'),{player:otherPlayer,advance:0});
assert(A.read(independent.target).payload,'players have independent cooldowns');
assert.equal(sounds.filter(sound=>sound.id===A.processing.interaction.successSound).length,invalidations,'every committed operation has a success sound');
assert(sounds.filter(sound=>sound.id===A.processing.interaction.failureSound).length>0);
assert(sounds.every(sound=>sound.source==='players'&&sound.volume===A.processing.interaction.volume));
assert(invalidations>=7);assert.equal(menuSyncs,invalidations,'each committed stacking operation synchronizes cursor and slots');seed=savedSeed;
assert(player.cooldowns.added.every(entry=>entry.duration===5),'all completed operations use the configured native cooldown');
console.log('PASS: registered meonother callbacks return true for success, failure and cooldown, false for unrelated items; native dispatcher cancels exchange; both consumable directions, native shared 5-tick cooldown and overlay, same-player wrappers, independent players, outcome sounds, zero random prediction, consumption, inventory constraints, stack splitting, paper conversion, badge embed/extract/re-embed and metadata preservation.');
let recipes=new Map();let save=json=>({id:id=>{assert(!recipes.has(id),id);recipes.set(id,json);}});
scope.ServerEvents={recipes:fn=>fn({custom:save,shaped:(result,pattern,key)=>save({type:'minecraft:crafting_shaped',result,pattern,key})})};
run('kubejs/server_scripts/recipes/astral_gems.js');
for(let [id,recipe]of recipes){
  if(recipe.type==='deeprealm_4th:combination_forging'){
    assert(recipe.ingredients.length<=12,id);assert(recipe.result.count<=64,id);
    for(let input of recipe.ingredients){assert(input.stack.count>=1&&input.stack.count<=64,id);if(input.data_predicate)assert(predicates.has(input.data_predicate),id);}
    if(recipe.data_transform)assert(transforms.has(recipe.data_transform),id);
  }
  if(recipe.type==='pneumaticcraft:pressure_chamber'){
    assert.equal(new Set(recipe.inputs.map(x=>x.item)).size,recipe.inputs.length,'pressure chamber must not repeat item requirements: '+id);
    for(let input of recipe.inputs)assert(input.count<=64,id);
  }
}
assert.equal(recipes.size,19,'only equipment and regular consumable manufacture recipes remain');
assert(![...recipes.keys()].some(x=>/\/(process|filler|embed|extract|apply)_/.test(x)),'gem operations use registered stacking callbacks');
assert(!recipes.has('sdbf:astral/agent_high_bulk')&&!recipes.has('sdbf:astral/agent_high_bulk_pressure'),'high-tier bulk recipes are removed');
assert(fs.readFileSync(path.join(root,'kubejs/server_scripts/recipes/remove.js'),'utf8').includes('"deeprealm_4th:base_container"'));
let thresholds=[.4,.6,.8,.9,.99],simulation={samplesPerRegime:50000,thresholds,tiers:{}};
for(let tier of ['low','mid','high']){
  let counts=[thresholds.map(()=>0),thresholds.map(()=>0)],affixTotal=0,positiveTotal=0;
  for(let i=0;i<50000;i++){
    let data=A.rollGem('thermal:ruby',tier,random);affixTotal+=data.affixes.length;positiveTotal+=data.affixes.filter(a=>a.value>0).length;
    let values=[A.quality(data,{main:'size',badgeMain:'size'}),A.quality(data,{main:'size',badgeMain:'purity'})];
    values.forEach((q,regime)=>thresholds.forEach((threshold,t)=>{if(q>=threshold)counts[regime][t]++;}));
  }
  simulation.tiers[tier]={sameMain:counts[0].map(x=>x/50000),differentMain:counts[1].map(x=>x/50000),meanAffixes:affixTotal/50000,meanPositive:positiveTotal/50000};
}
fs.writeFileSync(path.join(root,'.cache/astral_gem_investigation/generation_actual.json'),JSON.stringify(simulation,null,2)+'\n');
console.log('PASS: '+recipes.size+' recipes; 19/13/2 coverage; preview has zero random draws; one-time processing; cleansing to zero; shared 10 uses; failed operations preserve input; filler/embed/extract counters; no dimension gate; independent distribution simulation.');
module.exports={A,scope,Compound};
