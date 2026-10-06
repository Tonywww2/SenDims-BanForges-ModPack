// Sample the actual generator across processing tiers and player luck values.
let fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
let root=path.resolve(__dirname,'../../..'),scope={global:{},console};vm.createContext(scope);
for(let file of ['00_catalog.js','10_rules.js','12_balance.js','13_processing_config.js','16_processing.js']){
  vm.runInContext(fs.readFileSync(path.join(root,'kubejs/startup_scripts/astral_gems',file),'utf8'),scope,{filename:file});
}
let A=scope.global.sdbfAstral;
let samples=Number(process.argv[2]||500000),luckValues=[-100,-10,0,1,5,10,50,100,500,1000,10000];
if(!Number.isInteger(samples)||samples<1)throw new Error('samples must be a positive integer');
let createRandom=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
let seeds={low:381971,mid:831167,high:671993};
let report={generationVersion:A.processing.generationVersion,item:'thermal:ruby',samplesPerCombination:samples,
  luckValues,limits:A.limits,dimensionRoll:A.processing.dimensionRoll,baseSuccess:{},seeds,
  sampling:'Independent full gem rolls; the random seed is reused within each tier across luck values to reduce noise in comparisons.',rows:[]};
for(let tier of ['low','mid','high']){
  report.baseSuccess[tier]=A.processing.tiers[tier].baseSuccess;
  for(let luck of luckValues){
    let random=createRandom(seeds[tier]),sum={size:0,purity:0,polish:0},squares={size:0,purity:0,polish:0},maximum={size:0,purity:0,polish:0};
    for(let i=0;i<samples;i++){
      let data=A.rollGem('thermal:ruby',tier,random,luck);
      for(let stat of A.stats){
        let value=data.natural[stat];sum[stat]+=value;squares[stat]+=value*value;
        maximum[stat]=Math.max(maximum[stat],value);
      }
    }
    let mean={},standardError={};
    for(let stat of A.stats){
      mean[stat]=sum[stat]/samples;
      let variance=Math.max(0,(squares[stat]-sum[stat]*sum[stat]/samples)/Math.max(1,samples-1));
      standardError[stat]=Math.sqrt(variance/samples);
    }
    report.rows.push({tier,luck,success:A.dimensionSuccess(A.processing.tiers[tier],luck),mean,standardError,maximum});
  }
  console.log('Sampled '+tier+': '+luckValues.length+' luck values x '+samples+' gems.');
}
let output=path.join(root,'.cache/astral_gem_investigation/generation_v2_luck.json');
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log('| Luck | Low: size / purity / polish | Mid: size / purity / polish | High: size / purity / polish |');
console.log('| ---: | --- | --- | --- |');
for(let luck of luckValues){
  let cells=['low','mid','high'].map(tier=>{
    let row=report.rows.find(row=>row.luck===luck&&row.tier===tier);
    return A.stats.map(stat=>row.mean[stat].toFixed(2)).join(' / ');
  });
  console.log('| '+luck+' | '+cells.join(' | ')+' |');
}
console.log('Saved: '+output);
