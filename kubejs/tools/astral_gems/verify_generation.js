// Focused regression checks and distribution report for the version-2 natural dimensions.
let fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let root=path.resolve(__dirname,'../../..'),scope={global:{},console};vm.createContext(scope);
for(let file of ['00_catalog.js','10_rules.js','12_balance.js','13_processing_config.js','16_processing.js']){
  vm.runInContext(fs.readFileSync(path.join(root,'kubejs/startup_scripts/astral_gems',file),'utf8'),scope,{filename:file});
}
let A=scope.global.sdbfAstral;
assert.equal(A.processing.generationVersion,2);
let luckValues=[-1e6,-100,0,1,10,100,1e6];
for(let tier of ['low','mid','high']){
  let profile=A.processing.tiers[tier];
  for(let luck of luckValues){
    assert(Math.abs(A.dimensionSuccess(profile,luck)-profile.baseSuccess)<=A.processing.dimensionRoll.luckSuccessBonus);
    for(let u of [0,1e-12,.1,.5,.9,1-1e-12,1]){
      let gem=A.rollGem('thermal:ruby',tier,()=>u,luck);
      for(let stat of A.stats){
        assert(Number.isInteger(gem.natural[stat]));
        assert(gem.natural[stat]>=1&&gem.natural[stat]<=A.limits[stat]);
        if(u===0)assert.equal(gem.natural[stat],A.limits[stat]);
        if(u===1)assert.equal(gem.natural[stat],1);
      }
    }
  }
  assert.equal(A.dimensionSuccess(profile,undefined),profile.baseSuccess);
  assert.equal(A.dimensionSuccess(profile,NaN),profile.baseSuccess);
  assert.equal(A.dimensionSuccess(profile,Infinity),profile.baseSuccess);
  assert(A.dimensionSuccess(profile,100)>profile.baseSuccess);
  assert(A.sampleDimension(profile,()=>.5,100)>A.sampleDimension(profile,()=>.5,0));
  assert(A.sampleDimension(profile,()=>.5,1e6)<A.sampleDimension(profile,()=>.5,0)*1.05,'even extreme luck must have a small effect');
}
let sequence=[0,0,.5,1,1,1,1,1,0,0,0,.5],index=0;
let separate=A.rollGem('thermal:ruby','mid',()=>sequence[index++]);
assert.equal(index,sequence.length);
assert.equal(separate.natural.size,500);assert.equal(separate.natural.polish,1);
assert(separate.natural.purity>1&&separate.natural.purity<200,'three dimensions use separate draws');
let seed=73891,random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
let samples=100000,report={generationVersion:2,samplesPerTier:samples,luck:0,limits:A.limits,config:A.processing.dimensionRoll,tiers:{}};
for(let tier of ['low','mid','high']){
  let values={size:[],purity:[],polish:[]},any80=0,any95=0,all80=0,anyMax=0;
  for(let i=0;i<samples;i++){
    let data=A.rollGem('thermal:ruby',tier,random,0),high80=0,high95=0,max=0;
    for(let stat of A.stats){
      let value=data.natural[stat];assert(Number.isInteger(value));assert(value>=1&&value<=A.limits[stat]);
      values[stat].push(value);
      if(value>=A.limits[stat]*.8)high80++;
      if(value>=A.limits[stat]*.95)high95++;
      if(value===A.limits[stat])max++;
    }
    if(high80)any80++;if(high95)any95++;if(high80===3)all80++;if(max)anyMax++;
  }
  let stats={};
  for(let stat of A.stats){
    let sorted=values[stat].sort((a,b)=>a-b);
    stats[stat]={mean:sorted.reduce((sum,value)=>sum+value,0)/samples,median:sorted[samples/2],p90:sorted[Math.floor(samples*.9)],
      atLeast80:sorted.filter(value=>value>=A.limits[stat]*.8).length/samples,
      atLeast95:sorted.filter(value=>value>=A.limits[stat]*.95).length/samples,
      minimum:sorted[0],maximum:sorted[samples-1]};
  }
  report.tiers[tier]={baseSuccess:A.processing.tiers[tier].baseSuccess,stats,anyDimensionAtLeast80:any80/samples,
    anyDimensionAtLeast95:any95/samples,allDimensionsAtLeast80:all80/samples,anyDimensionAtLimit:anyMax/samples};
  console.log(tier+': average size/purity/polish = '+A.stats.map(stat=>stats[stat].mean.toFixed(2)).join('/')
    +'; any natural dimension >=80% = '+(any80/samples*100).toFixed(3)+'%; >=95% = '+(any95/samples*100).toFixed(3)+'%');
}
assert(report.tiers.low.anyDimensionAtLeast80<.002);
assert(report.tiers.mid.anyDimensionAtLeast80>.01&&report.tiers.mid.anyDimensionAtLeast80<.04);
assert(report.tiers.high.anyDimensionAtLeast80>.06&&report.tiers.high.anyDimensionAtLeast80<.13);
assert(report.tiers.high.anyDimensionAtLeast95<.02,'the old near-cap mass must not return');
assert(report.tiers.low.stats.size.mean<report.tiers.mid.stats.size.mean);
assert(report.tiers.mid.stats.size.mean<report.tiers.high.stats.size.mean);
let output=path.join(root,'.cache/astral_gem_investigation/generation_v2.json');
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log('PASS: integer endpoints and bounds, independent dimensions, tier progression, bounded luck influence, and no near-cap probability spike. Report: '+output);
