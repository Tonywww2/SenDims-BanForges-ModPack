// Native 16x16 artwork: every character below is one final game-texture pixel.
// Large images are previews only; the game PNGs are never resized or sampled.
let fs = require('node:fs');
let path = require('node:path');
let assert = require('node:assert/strict');
let sharp = require('C:/Users/Tony/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
let root = path.resolve(__dirname, '../../..');
let textures = path.join(root, 'kubejs/assets/kubejs/textures/item');
let previews = path.join(root, 'docs/development/assets/astral_gems');
let backup = path.join(root, 'docs/archive/cache/astral_gems/before_native_pixel_redraw');
let lang = JSON.parse(fs.readFileSync(path.join(root, 'kubejs/assets/kubejs/lang/zh_cn.json'), 'utf8'));
let glass = {o:'#28313f',c:'#805738',C:'#bb8e55',g:'#627e8a',G:'#abc9ce',H:'#edf7f2'};
let bottle = [
  '................',
  '......oooo......',
  '......ocCo......',
  '.....ogHHgo.....',
  '......oggo......',
  '.....ogHGgo.....',
  '....ogHGGGgo....',
  '...ogHGGGGGgo...',
  '...oHhlllssgo...',
  '...oHhllmssgo...',
  '...ogllmmssgo...',
  '...ogllmmssgo...',
  '....ogmsssgo....',
  '....oggggggo....',
  '.....oooooo.....',
  '................'
];
let assets = [
  {name:'astral_gem_agent_low',group:'processing',rows:bottle,
    palette:{...glass,h:'#ffd3a0',l:'#ed9861',m:'#c65d3a',s:'#873c30'}},
  {name:'astral_gem_agent_mid',group:'processing',rows:bottle,
    palette:{...glass,h:'#d4f4e5',l:'#79d9cf',m:'#31aaa9',s:'#216674'}},
  {name:'astral_gem_agent_high',group:'processing',rows:bottle,
    palette:{...glass,h:'#fff0b8',l:'#f6d46b',m:'#dfaa3c',s:'#946026'}},
  {name:'astral_gem_cleanser',group:'enhancement',
    palette:{...glass,h:'#ead8f5',l:'#bd9bdf',m:'#8c63b5',s:'#563b7a'},
    rows:[
      '................',
      '......oooo......',
      '......ocCo......',
      '.....ogHHgo.....',
      '......oggo......',
      '.....ogGGgo.....',
      '....ogHGGGgo....',
      '...ogHllllsgo...',
      '..ogHllllmssgo..',
      '..oHhlllmmssgo..',
      '..oglllmmmssgo..',
      '...ogmmmsssgo...',
      '....ogmsssgo....',
      '.....oggggo.....',
      '......oooo......',
      '................'
    ]},
  {name:'astral_gem_shaper',group:'enhancement',
    palette:{...glass,h:'#e4f5fa',l:'#a8dcee',m:'#63accc',s:'#386783'},
    rows:[
      '................',
      '......oooo......',
      '......ocCo......',
      '.....ogHHgo.....',
      '......oggo......',
      '......oggo......',
      '.....ogHGgo.....',
      '....ogHlmsgo....',
      '...ogHllmssgo...',
      '..ogHllmmmssgo..',
      '..oHhllmmmssgo..',
      '..oglllmmmssgo..',
      '..ogmmmmssssgo..',
      '..oggggggggggo..',
      '...oooooooooo...',
      '................'
    ]},
  {name:'astral_gem_purifier',group:'enhancement',
    palette:{...glass,h:'#f3edba',l:'#d5de82',m:'#a8ba50',s:'#677c39'},
    rows:[
      '................',
      '......oooo......',
      '......ocCo......',
      '.....ogHHgo.....',
      '......oggo......',
      '.....ogGGgo.....',
      '.....oHGggo.....',
      '.....oHhlso.....',
      '.....oHlmso.....',
      '.....oglmso.....',
      '.....oglmso.....',
      '.....ogmmso.....',
      '.....ogmsso.....',
      '.....oggggo.....',
      '......oooo......',
      '................'
    ]},
  {name:'astral_gem_polisher',group:'enhancement',
    palette:{...glass,h:'#fffdf3',l:'#e6edf0',m:'#c0cfd6',s:'#879eae'},
    rows:[
      '................',
      '................',
      '................',
      '................',
      '....oooooooo....',
      '....occCCcco....',
      '...ogHHHHGGgo...',
      '...oHGGGGGGgo...',
      '...oHhllllsgo...',
      '...ogllllmsgo...',
      '...ogllmmssgo...',
      '...ogllmmssgo...',
      '....ogmsssgo....',
      '....oggggggo....',
      '.....oooooo.....',
      '................'
    ]},
  {name:'astral_rune',group:'container',
    palette:{o:'#201e35',s:'#3b3556',m:'#605578',l:'#9988b4',v:'#9566bd',H:'#decaee'},
    rows:[
      '................',
      '......oooo......',
      '.....ossmmo.....',
      '....osmllmso....',
      '...osmHllmmso...',
      '..osmlvHHvlmso..',
      '..osmlvHvvlmso..',
      '..osmvvHHvvmso..',
      '..osmvHHHHvmso..',
      '..osmvvHHvvmso..',
      '..osmlvHvvlmso..',
      '...osmlvvlmso...',
      '....osmmmmso....',
      '.....ossmmo.....',
      '......oooo......',
      '................'
    ]},
  {name:'astral_frame',group:'container',
    palette:{o:'#201e35',s:'#3b3556',m:'#605578',l:'#9988b4',v:'#9566bd',H:'#decaee'},
    rows:[
      '................',
      '................',
      '......oooo......',
      '.ooooovHHvooooo.',
      '.oHlllHvvHlllso.',
      '.olmssssssssmso.',
      '.olm........mso.',
      '.oHm........mso.',
      '.ovm........mvo.',
      '.olm........mso.',
      '.olm........mso.',
      '.olmssssssssmso.',
      '.olllllllllllso.',
      '.oooooooooooooo.',
      '................',
      '................'
    ]}
];
let pixels = asset => {
  assert.equal(asset.rows.length,16,asset.name+' height');
  let data=Buffer.alloc(16*16*4);
  asset.rows.forEach((row,y)=>{
    assert.equal(row.length,16,asset.name+' row '+y+' width');
    Array.from(row).forEach((symbol,x)=>{
      if(symbol==='.')return;
      assert(x>0&&x<15&&y>0&&y<15,asset.name+' transparent margin');
      let hex=asset.palette[symbol];assert(/^#[0-9a-f]{6}$/i.test(hex),asset.name+' palette '+symbol);
      let index=(y*16+x)*4;
      data[index]=parseInt(hex.slice(1,3),16);data[index+1]=parseInt(hex.slice(3,5),16);
      data[index+2]=parseInt(hex.slice(5,7),16);data[index+3]=255;
    });
  });
  return data;
};
let xml = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
let makePreview = async (selected,columns,rows,file,positions) => {
  let width=columns*176+48,height=rows*208+40;
  let svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'"><rect width="100%" height="100%" fill="#252a32"/>';
  let tiles=[];
  for(let [index,asset] of selected.entries()){
    let position=positions?positions[index]:[index%columns,Math.floor(index/columns)];
    let left=24+position[0]*176,top=20+position[1]*208;
    svg+='<rect x="'+left+'" y="'+top+'" width="168" height="196" rx="6" fill="#303640"/>';
    for(let y=0;y<8;y++)for(let x=0;x<8;x++)svg+='<rect x="'+(left+20+x*16)+'" y="'+(top+16+y*16)+'" width="16" height="16" fill="'+((x+y)%2?'#39404a':'#343b45')+'"/>';
    let label=lang['item.kubejs.'+asset.name];
    svg+='<text x="'+(left+84)+'" y="'+(top+176)+'" text-anchor="middle" font-family="Microsoft YaHei" font-size="15" fill="#e0e5ed">'+xml(label)+'</text>';
    // Enlargement is used only in these documentation previews.
    tiles.push({input:await sharp(path.join(textures,asset.name+'.png')).resize(128,128,{kernel:'nearest'}).png().toBuffer(),left:left+20,top:top+16});
  }
  svg+='</svg>';
  await sharp(Buffer.from(svg)).composite(tiles).png().toFile(path.join(previews,file));
};
let drawNativeTextures = async (group='all') => {
  assert(['all','processing','enhancement','container'].includes(group),'unknown sprite group');
  fs.mkdirSync(backup,{recursive:true});fs.mkdirSync(previews,{recursive:true});
  let selected=assets.filter(asset=>group==='all'||asset.group===group),records=[];
  for(let asset of selected){
    let output=path.join(textures,asset.name+'.png'),saved=path.join(backup,asset.name+'.png');
    if(fs.existsSync(output)&&!fs.existsSync(saved))fs.copyFileSync(output,saved,fs.constants.COPYFILE_EXCL);
    let data=pixels(asset);
    await sharp(data,{raw:{width:16,height:16,channels:4}}).png({palette:false,compressionLevel:9}).toFile(output);
    let decoded=await sharp(output).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    assert.equal(decoded.info.width,16);assert.equal(decoded.info.height,16);
    assert.deepEqual(decoded.data,data,'PNG must exactly preserve hand-authored pixels');
    let alpha=new Set(),colours=new Set(),visible=0;
    for(let index=0;index<data.length;index+=4){alpha.add(data[index+3]);if(data[index+3]){visible++;colours.add(data.subarray(index,index+3).join(','));}}
    assert.deepEqual(alpha,new Set([0,255]));assert(colours.size<=12);
    if(asset.name==='astral_frame')assert.equal(data[(8*16+8)*4+3],0,'hollow frame center');
    records.push({name:asset.name,width:16,height:16,visiblePixels:visible,colours:colours.size,alpha:[0,255]});
    console.log(asset.name+': native 16x16, '+colours.size+' authored colours, '+visible+' opaque pixels');
  }
  for(let [kind,file] of [['processing','processing_textures_preview.png'],['enhancement','enhancement_textures_preview.png'],['container','container_textures_preview.png']]){
    let subset=selected.filter(asset=>asset.group===kind);
    if(subset.length)await makePreview(subset,subset.length,1,file);
  }
  if(group==='all'){
    await makePreview(assets,4,3,'native_16x_textures_preview.png',[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[3,1],[1,2],[2,2]]);
    fs.writeFileSync(path.join(previews,'native_16x_textures.json'),JSON.stringify({mode:'manual native pixel art',source:'docs/tools/astral_gems/draw_native_textures.cjs',gameTextureConstruction:'256 directly authored RGBA pixels; no resize, sampling or palette conversion',assets:records},null,2)+'\n');
  }
};
module.exports=drawNativeTextures;
if(require.main===module)drawNativeTextures().catch(error=>{console.error(error);process.exitCode=1;});
