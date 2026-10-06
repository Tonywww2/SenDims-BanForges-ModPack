// Ordinary-number fixtures for executing every rule in the actual instance Rhino engine.
// This file is outside the script loading directories and uses the actual configuration.
;(() => {
  let A=global.sdbfAstral;
  let N = value => {
    let score = {v:value};
    score.sign = () => Math.sign(value);
    score.add = other => N(value+other.v);
    score.subtract = other => N(value-other.v);
    score.multiply = other => N(value*other.v);
    score.divide = other => {if(!other.v)throw new Error('divide by zero');return N(value/other.v);};
    score.pow = power => N(Math.pow(value,power));
    score.max = other => value>=other.v ? score : other;
    score.min = other => value<=other.v ? score : other;
    score.abs = () => N(Math.abs(value));
    score.compareTo = other => Math.sign(value-other.v);
    return score;
  };
  let payload={schema:1,source_item:'thermal:ruby',primary:'alpha',natural:{size:200,purity:80,polish:40},
    affixes:[{stat:'size',operation:'flat',value:20}],reinforcements:[],extensions:{}};
  let rolled=A.rollGem('thermal:ruby','mid',()=>0.5);
  if(A.validate(rolled)!==null || rolled.affixes.length<1)throw new Error('Rhino random processing');
  A.stats.forEach(stat=>{if(!Number.isInteger(rolled.natural[stat])||rolled.natural[stat]<1||rolled.natural[stat]>A.limits[stat])throw new Error('Rhino integer natural dimensions');});
  let lucky=A.rollGem('thermal:ruby','mid',()=>0.5,1e6);
  if(lucky.natural.size<rolled.natural.size||lucky.natural.size>rolled.natural.size*1.05)throw new Error('Rhino bounded luck');
  if(rolled.affixes[0].value!==0.0625)throw new Error('Rhino affix magnitude distribution');
  rolled.affixes=[{stat:'size',operation:'flat',value:-10}];
  let cleaned=A.enhanceData(rolled,'cleanse',0);
  if(cleaned.affixes.length!==0 || rolled.affixes.length!==1)throw new Error('Rhino cleanse copy');
  if(A.enhanceData(cleaned,'size',1).reinforcements[0].value!==10)throw new Error('Rhino enhancement');
  let limited=false;try{A.enhanceData(cleaned,'size',A.balance.enhancementMaxUses);}catch(error){limited=String(error.message)==='enhancement_limit';}
  if(!limited)throw new Error('Rhino enhancement limit');
  let attrs={};A.rules.forEach(r=>r.badgeChannels.forEach(c=>{attrs[c.attribute]=1300;}));
  let state={healthRatio:0.3,level:50,experienceProgress:0.7,food:20,onGround:true,crouching:true,raining:true,
    thundering:true,gameTime:600,overworldDayTime:18000,mainHandDamageable:true,mainHandRemaining:0.5,attributes:attrs};
  let coordinates=[[2,1],[3,2],[2,3],[1,2],[1,1],[3,1],[3,3],[1,3]];
  let cells=coordinates.map((c,i)=>({index:i,x:c[0],y:c[1],inBounds:true,open:true,occupied:true,effective:true,
    rule:A.rules.filter(r=>r.role==='producer')[i],payload:payload}));
  let env={index:99,x:2,y:2,cells:cells,neighbors:cells.slice(0,4),diagonal:cells.slice(4),
    squares:[cells.slice(0,3).concat([{index:99,effective:true,rule:A.rules[0]}])],rays:[cells.slice(0,4)],cluster:()=>cells,state:state};
  A.rules.forEach(r=>{
    let params=A.parameters(r);
    let inputs={};r.ports.forEach(p=>{inputs[p.name]=cells.map((c,i)=>{
      let scores={};Object.keys(A.scoreNames).forEach((s,j)=>{scores[s]=N((i+1)*(j+1)*100);});
      return {index:c.index,identity:c.rule.identity,baseTotal:N(50),scores:scores};
    });});
    let base={STRENGTH:N(20)},output=A.evaluate(r,payload,env,inputs,base,N,params);
    Object.keys(output).forEach(s=>{if(!Number.isFinite(output[s].v)||output[s].v<0)throw new Error('bad score '+r.identity+' value='+output[s].v+' time='+state.gameTime+' period='+params.periodTicks+' pi='+Math.PI+' cos='+Math.cos(Math.PI));});
    A.evaluate(r,payload,env,{},base,N,params);
    A.describe(r,params);
  });
  if(!A.balance || Object.keys(A.balance.badge.attributes).length!==13)throw new Error('incomplete game balance');
})();
