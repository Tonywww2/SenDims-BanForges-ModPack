// Verify actual bridge previews and tooltip code with small presentation/API doubles.
let fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let {A,scope,Compound}=require('./verify_processing.js'),{N,Num}=require('./verify.js'),root=path.resolve(__dirname,'../../..');
let parse=value=>{let m=String(value).match(/^([\d.]+)(?:e([+-]?\d+))?$/i);return Num.log(Math.log(Number(m[1]))+Number(m[2]||0)*Math.log(10),1);};
let lang=JSON.parse(fs.readFileSync(path.join(root,'kubejs/assets/sdbf_astral/lang/zh_cn.json'),'utf8'));
class TextValue {
  constructor(s){this.raw=s;this.s=s.replace(/\u00a7r/g,'');this.parts=[{s:this.s,color:null,reset:s==='\u00a7r'}];}
  append(x){this.raw+=x.raw;this.s+=x.s;this.parts.push(...x.parts);return this;}
  getString(){return this.s;}
  color(value){this.parts.forEach(p=>p.color=value);return this;}
  gray(){return this.color(2);} gold(){return this.color(3);} yellow(){return this.color(1);} darkGray(){return this.color(4);}
}
class JavaList extends Array {constructor(items=[]){super();this.push(...items);}get(i){return this[i];}add(x){this.push(x);}size(){return this.length;}indexOf(x){return super.indexOf(x);}}
class Screen {constructor(menu,slot){this.menu=menu;this.slot=slot;}getMenu(){return this.menu;}getSlotUnderMouse(){return this.slot;}}
let tick=100,calls=0,shift=false,logout,packet;
let tooltips=new Map();
let logouts=[];
let names=new Map(),foils=new Map(),fluent=new Proxy({}, {get:()=>()=>fluent});
let scoreColors={STRENGTH:0xe76868,AGILITY:0x55cbb3,INTELLIGENCE:0x71a9ed,CONSTITUTION:0xe6b85c,PERCEPTION:0xbca1ec,MAGIC:0xe182d9};
let attrs={};A.rules.forEach(r=>r.badgeChannels.forEach(c=>attrs[c.attribute]=0));
let snapshot={healthRatio:()=>0.3,experienceLevel:()=>50,experienceProgress:()=>0.7,food:()=>20,
  onGround:()=>true,crouching:()=>true,raining:()=>false,thundering:()=>false,gameTime:()=>tick,dayTime:()=>6000,
  mainHandDamageable:()=>true,mainHandRemaining:()=>0.5,attribute:id=>attrs[id]||0};
let sheet=v=>({get:s=>N(v[s]||0)});
let Engine={calculate:()=>{calls++;return {nodeResults:()=>new Map([[0,{finalScores:()=>sheet({STRENGTH:125})}],
  [1,{finalScores:()=>sheet({STRENGTH:999})}],[2,{finalScores:()=>sheet({MAGIC:0})}],
  [3,{finalScores:()=>({get:s=>s==='MAGIC'?Num.log(400*Math.log(10),1):N(0)})}]])};}};
let classes={
  'java.util.ArrayList':JavaList,'java.util.HashMap':Map,'java.lang.Integer':{valueOf:v=>v},
  'net.minecraft.nbt.CompoundTag':Compound,'net.minecraft.nbt.ListTag':JavaList,
  'net.minecraft.network.chat.Component':{literal:s=>s,translatable:(key,...args)=>({key,args})},
  'net.minecraft.core.registries.BuiltInRegistries':{ITEM:{getKey:s=>s.id}},
  'net.minecraft.world.item.ItemStack':{matches:(x,y)=>x.id===y.id&&x.token===y.token},
  'com.tonywww.deeprealm4th.screen.AstralScreen':Screen,
  'com.tonywww.deeprealm4th.astral.score.AstralScoreEngine':Engine,
  'com.tonywww.deeprealm4th.astral.score.AstralScoreColors':{rgb:score=>scoreColors[score]}
};
Object.assign(scope,{Java:{loadClass:name=>{assert(classes[name],name);return classes[name];}},
  StartupEvents:{registry:()=>{}},FillerNode:{},GemPayloadTransfer:{},EffectScope:{PLAYER:'PLAYER'},
  FillerPresentations:{registerName:(id,fn)=>names.set(id,fn),registerFoil:(id,fn)=>foils.set(id,fn)},FillerActivation:{STACKABLE:'STACKABLE'},
  FillerDefinition:{builder:()=>fluent},AstralFillers:{register:()=>{},disable:()=>{}},
  AstralNumber:{fromDouble:N,parse,ZERO:N(0)},PlayerStateSnapshot:{capture:()=>snapshot},
  AstralDataPredicates:{register:()=>{}},AstralTransforms:{register:()=>{}},
  ScoreType:Object.fromEntries(Object.keys(A.scoreNames).map(s=>[s,s])),
  Text:{of:s=>new TextValue(s),translatable:key=>new TextValue(lang[key]||key)},Color:{YELLOW:1,GRAY:2},
  Client:{player:{getServer:()=>null},level:{getTime:()=>tick},screen:null},
  NetworkEvents:{dataReceived:(key,fn)=>packet=fn},ClientEvents:{loggedOut:fn=>logouts.push(fn)},
  ItemEvents:{tooltip:fn=>fn({get shift(){return shift;},addAdvanced:(ids,fn)=>{(Array.isArray(ids)?ids:[ids]).forEach(id=>tooltips.set(id,fn));}})},JEIEvents:{hideItems:()=>{}}
});
vm.runInContext(fs.readFileSync(path.join(root,'kubejs/startup_scripts/astral_gems/20_bridge.js'),'utf8'),scope);
assert(A.apiReady);assert(!names.has(A.fillerId),'filler must retain normal item name');
assert.equal(names.size,1);assert(names.has(A.badgeId));assert.equal(foils.size,34);
for(let species of A.species)assert(!names.has(species.item),'gem retains original translated name: '+species.item);
assert.equal(lang['name.sdbf_astral.filler'],lang['item.sdbf_astral.filler']);
A.read=item=>item.parsed||{};
vm.runInContext(fs.readFileSync(path.join(root,'kubejs/client_scripts/astral_gem_tooltips.js'),'utf8'),scope);
packet({getData:()=>({getBoolean:()=>{throw new Error('clock packet must not gate gems');},contains:()=>true,getLong:()=>18000})});
assert.equal(A.clientDayTime,18000);
let itemFor = (r,id=A.fillerId) => {let payload={schema:1,source_item:r.item,primary:r.primary,
  natural:{size:200,purity:80,polish:40},affixes:[{stat:'size',operation:'flat',value:20}],
    reinforcements:[{stat:'size',operation:'percent',value:0.25}],extensions:new Compound()};
  return {id,token:r.identity,parsed:{rule:r,payload},getNbt:()=>r.identity,getItem:()=>({id})};};
let checkClear = text => {
  assert(text.raw.endsWith('\u00a7r'),'every gem tooltip line ends with CLEAR: '+text.s);
  text.parts.forEach((part,index)=>{if(part.s&&part.color!==null)assert(text.parts[index+1]?.reset,'colored span ends with CLEAR: '+part.s);});
};
let render = (item,detail=false) => {shift=detail;let lines=[];tooltips.get(item.id)(item,false,{add:t=>{checkClear(t);lines.push(t.getString());}});return lines;};
let styled = (item,detail=false) => {shift=detail;let lines=[];tooltips.get(item.id)(item,false,{add:t=>{checkClear(t);lines.push(t);}});return lines;};
let checked=0;
for(let r of A.rules){
  for(let id of [r.item,A.fillerId,A.badgeId])for(let detail of [false,true]){
    let lines=render(itemFor(r,id),detail);checked++;
    assert(!lines.some(s=>s.includes('暂不可用')),r.identity);
    assert(lines.every(s=>s.length<=28),r.identity+': '+lines.join('|'));
    if(id===A.fillerId)assert.equal(lines[0],'原型：'+r.name+'·'+r.letter);
    else assert.equal(lines[0],'类型：'+r.letter);
    assert(!lines.some(s=>s.includes('主修饰')),'old displayed label removed');
    if(id!==A.badgeId)assert(lines.some(s=>s.startsWith('产分：')),r.identity);
    assert(!lines.some(s=>/白名单|总体品质|归一化|权重|η|公式/.test(s)),r.identity);
  }
}
let ruby=A.byIdentity['thermal:ruby#alpha'],same=itemFor(ruby);
let many=itemFor(ruby);many.parsed.payload.affixes=[{stat:'size',operation:'flat',value:20},{stat:'purity',operation:'flat',value:-10},{stat:'polish',operation:'percent',value:.1}];
many.parsed.payload.reinforcements=[{stat:'size',operation:'flat',value:10},{stat:'purity',operation:'flat',value:4},{stat:'polish',operation:'flat',value:2}];
let vertical=render(many,true);
for(let expected of ['修饰：大小＋20','　　　纯度－10','　　　抛光＋10%','强化：大小＋10','　　　纯度＋4','　　　抛光＋2'])assert(vertical.includes(expected),'vertical modifier: '+expected);
assert(!vertical.filter(line=>line.startsWith('修饰：')||line.startsWith('　　　')).some(line=>line.includes('，')));
let dimensions={大小:0x87CEEB,纯度:0x9ACD32,抛光:0xFFFFFF};
for(let [label,color]of Object.entries(dimensions)){
  let row=styled(same,true).find(line=>line.s.startsWith(label+'：'));
  assert(row);assert(row.parts.filter(p=>p.s).every(p=>p.color===color),'dimension row color: '+label);
}
let upgrades=styled(same,true).filter(line=>/修饰：|强化：大小/.test(line.s));
assert(upgrades.length);for(let row of upgrades)assert(row.parts.filter(p=>/大小|20|25/.test(p.s)).every(p=>p.color===dimensions.大小));
for(let [kind,label]of [['size','大小'],['purity','纯度'],['polish','抛光']]){
  assert(styled({id:A.processing.enhancements[kind].id})[0].parts.filter(p=>p.s).every(p=>p.color===dimensions[label]));
}
let limits=styled({id:A.processing.tiers.mid.id},true)[1].parts.filter(p=>/^\d+$/.test(p.s));
assert.deepEqual(limits.map(p=>p.color),Object.values(dimensions));
let slots=new JavaList(Array.from({length:4},()=>({getItem:()=>same})));
let menu={containerId:1,slots,layout:()=>({size:()=>4}),owner:()=>({})};
scope.Client.screen=new Screen(menu,slots[0]);
assert(render(same).some(s=>s==='分数：力量 ＋125'));
scope.Client.screen.slot=slots[1];assert(render(same).some(s=>s==='分数：力量 ＋999'));
assert.equal(calls,1,'same tick/layout must reuse one result map');
scope.Client.screen.slot=slots[2];assert(render(same).some(s=>s==='分数：0'));
scope.Client.screen.slot=slots[3];assert(render(same).some(s=>s==='分数：魔力 ＋1e400'));
tick++;render(same);assert.equal(calls,2);
scope.Client.screen=null;
let preview=A.previewScores;
A.previewScores=()=>({STRENGTH:N(11),AGILITY:N(22),INTELLIGENCE:N(33),CONSTITUTION:N(44),PERCEPTION:N(55),MAGIC:N(66)});
let scoreRows=styled(same);
for(let [score,color]of Object.entries(scoreColors)){
  let label=A.scoreNames[score],parts=scoreRows.flatMap(row=>row.parts);
  let index=parts.findIndex(p=>p.s===label&&p.color===color);
  assert(index>=0,'score label color: '+label);
  let value=parts.slice(index+1).find(p=>/\d/.test(p.s));assert(value);assert.equal(value.color,color,'score value color: '+label);
}
A.previewScores=preview;
let amethyst=A.byIdentity['tetra:pristine_amethyst#alpha'];
assert(render(itemFor(amethyst)).some(s=>s.startsWith('产分：魔力')),'night must use overworld clock');
A.clientDayTime=6000;assert(render(itemFor(amethyst)).some(s=>s.startsWith('产分：敏捷')));
scope.Client.player=null;logouts.forEach(fn=>fn());assert(render(same).some(s=>s==='产分：0'),'missing player must not show active score');
scope.Client.player={getServer:()=>null};assert(render(same).some(s=>s.startsWith('产分：')&&s!=='产分：0'),'reconnecting needs no unlock packet');
for(let kind of Object.keys(A.processing.enhancements)){
  let item={id:A.processing.enhancements[kind].id},simple=render(item),detail=render(item,true);
  assert.equal(simple.length,1);assert.deepEqual(detail,simple,'enhancement has no detailed mode');
}
for(let tier of Object.keys(A.processing.tiers)){
  let item={id:A.processing.tiers[tier].id};assert.equal(render(item).length,1);assert.equal(render(item,true).length,3);
}
let counted=itemFor(ruby);counted.parsed.payload.extensions.putInt('enhancement_uses',3);
A.balance.enhancementMaxUses=12;assert(render(counted).includes('强化：3/12'));A.balance.enhancementMaxUses=10;
console.log('PASS: '+checked+' gem presentations, seven agents, unified dimension/score colors, vertical modifiers, original gem names and data-based glint, live counters/scores, duplicate cells, tick cache and scores without unlock gating.');
