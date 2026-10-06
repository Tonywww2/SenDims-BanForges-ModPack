// Recover maxima for the existing paired samples by replaying their saved seeds.
let fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let root=path.resolve(__dirname,'../../..'),scope={global:{},console};vm.createContext(scope);
for(let file of ['00_catalog.js','10_rules.js','12_balance.js','13_processing_config.js','16_processing.js']){
  vm.runInContext(fs.readFileSync(path.join(root,'kubejs/startup_scripts/astral_gems',file),'utf8'),scope,{filename:file});
}
let A=scope.global.sdbfAstral,output=path.join(root,'.cache/astral_gem_investigation/generation_v2_luck.json');
let report=JSON.parse(fs.readFileSync(output,'utf8'));
assert.equal(report.generationVersion,A.processing.generationVersion);
assert.deepEqual(report.dimensionRoll,JSON.parse(JSON.stringify(A.processing.dimensionRoll)));
for(let tier of ['low','mid','high']){
  assert.equal(report.baseSuccess[tier],A.processing.tiers[tier].baseSuccess);
  let seed=report.seeds[tier],draw=0,minDraw={size:1,purity:1,polish:1};
  let random=()=>{
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    let u=seed/4294967296,stat=A.stats[draw++-1];
    if(stat)minDraw[stat]=Math.min(minDraw[stat],u);
    return u;
  };
  let sum={size:0,purity:0,polish:0},observedMaximum={size:0,purity:0,polish:0};
  for(let i=0;i<report.samplesPerCombination;i++){
    draw=0;
    let data=A.rollGem(report.item,tier,random,0);
    for(let stat of A.stats){
      sum[stat]+=data.natural[stat];observedMaximum[stat]=Math.max(observedMaximum[stat],data.natural[stat]);
    }
  }
  let baseline=report.rows.find(row=>row.tier===tier&&row.luck===0);
  for(let stat of A.stats)assert.equal(sum[stat]/report.samplesPerCombination,baseline.mean[stat],'replay must match the original sample exactly');
  // Luck changes only the monotone dimension mapping, never the sequence of random draws.
  for(let row of report.rows.filter(row=>row.tier===tier)){
    let index=0,extremeRandom=()=>{let stat=A.stats[index++-1];return stat ? minDraw[stat] : .5;};
    let data=A.rollGem(report.item,tier,extremeRandom,row.luck);
    row.maximum=JSON.parse(JSON.stringify(data.natural));
    if(row.luck===0)assert.deepEqual(row.maximum,observedMaximum,'mapped maxima must match observed maxima');
  }
  console.log('Recovered '+tier+' maxima; original '+report.samplesPerCombination+'-sample means reproduced exactly.');
}
report.maximumSampling='Original saved seeds replayed; extrema of each independent dimension draw mapped through the actual generator for each luck. Luck does not change the random draw sequence. Individual maxima need not belong to one gem.';
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log('| Luck | Low: size / purity / polish | Mid: size / purity / polish | High: size / purity / polish |');
console.log('| ---: | --- | --- | --- |');
for(let luck of report.luckValues){
  let cells=['low','mid','high'].map(tier=>{
    let row=report.rows.find(row=>row.luck===luck&&row.tier===tier);
    return A.stats.map(stat=>row.maximum[stat]).join(' / ');
  });
  console.log('| '+luck+' | '+cells.join(' | ')+' |');
}
console.log('Saved: '+output);
