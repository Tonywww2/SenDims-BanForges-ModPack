// Local verification of the actual configuration; this harness is not loaded by KubeJS.
let fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let path=require('node:path'),root=path.resolve(__dirname,'../../..');
let scope={global:{},console};vm.createContext(scope);
for(let file of ['00_catalog.js','10_rules.js','12_balance.js','15_descriptions.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,'kubejs/startup_scripts/astral_gems',file),'utf8'),scope,{filename:file});
}
let A=scope.global.sdbfAstral;
assert.equal(A.species.length,34);assert.equal(A.rules.length,84);assert(A.balance);
assert.equal(new Set(A.rules.map(r=>r.identity)).size,84);
let attrs=new Set(A.rules.flatMap(r=>r.badgeChannels.map(c=>c.attribute)));
assert.equal(attrs.size,13);assert(!attrs.has(undefined));
assert.deepEqual(new Set(Object.keys(A.balance.badge.attributes)),attrs);
Object.values(A.balance.badge.attributes).forEach(c=>assert(c.factor>0 && ['add','multiplyTotal'].includes(c.operation)));
// Final-result dependency graph: base-only reads must never add final edges.
let visiting=new Set(),visited=new Set();
let visit = r => {
  assert(!visiting.has(r.identity),'cycle: '+r.identity);
  if(visited.has(r.identity))return;
  visiting.add(r.identity);
  r.ports.filter(p=>p.mode==='final').forEach(p=>A.rules.filter(x=>A.allowed(p,x)).forEach(visit));
  visiting.delete(r.identity);visited.add(r.identity);
};
A.rules.forEach(visit);
// Independent logarithmic test adapter keeps very large intermediate scores finite.
class Num {
  constructor(value,sign) {this.l=typeof sign==='number'?value:value===0?-Infinity:Math.log(Math.abs(value));this.s=typeof sign==='number'?sign:Math.sign(value);}
  static log(l,s) {return new Num(l,s);}
  sign(){return this.s;}
  compareTo(x){return this.s!==x.s?Math.sign(this.s-x.s):this.s===0?0:this.s*Math.sign(this.l-x.l);}
  add(x){if(!this.s)return x;if(!x.s)return this;let h=this.l>=x.l?this:x,lo=this.l>=x.l?x:this;
    if(h.s===lo.s)return Num.log(h.l+Math.log1p(Math.exp(lo.l-h.l)),h.s);
    if(h.l===lo.l)return N(0);return Num.log(h.l+Math.log1p(-Math.exp(lo.l-h.l)),h.s);}
  subtract(x){return this.add(Num.log(x.l,-x.s));}
  multiply(x){return this.s&&x.s?Num.log(this.l+x.l,this.s*x.s):N(0);}
  divide(x){assert(x.s);return this.s?Num.log(this.l-x.l,this.s*x.s):N(0);}
  pow(p){assert(this.s>=0);return this.s?Num.log(this.l*p,1):N(0);}
  max(x){return this.compareTo(x)>=0?this:x;}
  min(x){return this.compareTo(x)<=0?this:x;}
  abs(){return Num.log(this.l,Math.abs(this.s));}
  value(){return this.s*Math.exp(this.l);}
  ln = () => this.l;
  toFiniteDouble = () => Math.min(Number.MAX_VALUE,Math.exp(this.l))*this.s;
}
let N=v=>new Num(v),zero=N(0),scoreTypes=Object.keys(A.scoreNames);
let payload={schema:1,source_item:A.species[0].item,primary:'alpha',natural:{size:200,purity:80,polish:40},
  affixes:[{stat:'size',operation:'flat',value:20}],reinforcements:[],extensions:{}};
let state={healthRatio:0.3,level:50,experienceProgress:0.7,food:20,onGround:true,crouching:true,raining:true,
  thundering:true,gameTime:600,overworldDayTime:18000,mainHandDamageable:true,mainHandRemaining:0.5,
  attributes:Object.fromEntries(Array.from(attrs).map(id=>[id,1300]))};
let coords=[[2,1],[3,2],[2,3],[1,2],[1,1],[3,1],[3,3],[1,3]];
let cells=coords.map((c,i)=>({index:i,x:c[0],y:c[1],inBounds:true,open:true,occupied:true,effective:true,
  rule:A.rules.filter(r=>r.role==='producer')[i],payload:payload}));
let env={index:99,x:2,y:2,cells:cells,neighbors:cells.slice(0,4),diagonal:cells.slice(4),
  squares:[[...cells.slice(0,3),{index:99,effective:true,rule:A.rules[0]}]],
  rays:[cells.slice(0,4)],cluster:()=>cells,state:state};
let makeInputs=(r,huge=false)=>Object.fromEntries(r.ports.map(p=>[p.name,cells.map((c,i)=>({index:c.index,
  identity:c.rule.identity,baseTotal:N(50),scores:Object.fromEntries(scoreTypes.map((s,j)=>[s,huge?Num.log((400+i)*Math.log(10),1):N((i+1)*(j+1)*100)]))}))]));
let base={STRENGTH:N(20)};
let snapshot=x=>JSON.stringify(x);
for(let r of A.rules) {
  let params=A.parameters(r);
  let own=Object.assign({},payload,{source_item:r.item,primary:r.primary});
  assert.equal(A.validate(own),null);
  for(let huge of [false,true]) {
    let input=makeInputs(r,huge),before=snapshot(input);
    let out=A.evaluate(r,own,env,input,base,N,params);
    assert.equal(snapshot(input),before,'source mutated: '+r.identity);
    Object.values(out).forEach(n=>assert(n.sign()>=0 && (Number.isFinite(n.l)||!n.sign()),r.identity));
  }
  let empty=A.evaluate(r,own,env,{},base,N,params);
  assert(empty.STRENGTH.compareTo(base.STRENGTH)>=0,'lost own base: '+r.identity);
  assert(A.describe(r,params).length>0);
}
let near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-8,actual+' != '+expected);
let ruby=A.byIdentity['thermal:ruby#alpha'];
near(A.evaluate(ruby,payload,env,{},base,N,A.parameters(ruby)).STRENGTH.value(),30);
let fluix=A.byIdentity['ae2:fluix_crystal#beta'];
let oneSource={source:[{index:0,identity:'test',baseTotal:N(10),scores:{STRENGTH:N(100),PERCEPTION:N(100),MAGIC:N(100)}}]};
let out=A.evaluate(fluix,payload,env,oneSource,base,N,A.parameters(fluix));
assert(!out.INTELLIGENCE || out.INTELLIGENCE.sign()===0,'one source reused as three cells');
let corrected=JSON.parse(JSON.stringify(payload));corrected.natural.size=500;corrected.affixes=[{stat:'size',operation:'flat',value:50},{stat:'size',operation:'percent',value:0.25}];
near(A.effective(corrected).size,687.5);assert.equal(A.validate(corrected),null);
corrected.affixes[0].value=51;assert.equal(A.validate(corrected),'natural_affix_out_of_range');
near(A.quality(payload,A.rules[0]),0.36);
let b=A.balance.badge,attack=(s,e)=>b.scoreCoefficient*Math.log1p(s/Number(b.scoreScale))*Math.pow(Math.log1p(e)/Math.log1p(b.referenceEfficiency),b.efficiencyPower);
near(attack(0,0.4),0);assert(Math.abs(attack(32115,0.4)-0.35)<0.00001);
assert(Math.abs(attack(147413,0.4)-0.5)<0.00001);assert(attack(1e6,0.4)>0.5);
assert(attack(32115,1)>attack(32115,0.4));
let blocked=fs.readFileSync(path.join(root,'kubejs/startup_scripts/astral_gems/20_bridge.js'),'utf8');
assert(blocked.includes("if(!A.apiReady)"));assert(blocked.includes("if(!A.balance)return FillerNode.invalid"));
let lang=JSON.parse(fs.readFileSync(path.join(root,'kubejs/assets/sdbf_astral/lang/zh_cn.json'),'utf8'));
assert(!JSON.stringify(lang).includes('§'));
console.log('PASS: 34 gems / 84 rule evaluators, 13 allowed attributes, acyclic final reads, empty-input fallback, distinct sources, source immutability, 1e400 inputs, effective stats and quality.');
module.exports={A,scope,N,Num};
