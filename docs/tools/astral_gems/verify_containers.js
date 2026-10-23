// Focused checks for container registration, geometry, Curios tags and the admin entry.
let fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let root=path.resolve(__dirname,'../../..'),suppliers=new Map(),calls=[];
let read=file=>fs.readFileSync(path.join(root,file),'utf8');
let scope={global:{sdbfAstral:{apiReady:true}},console,
  StartupEvents:{registry:(type,callback)=>{assert.equal(type,'item');callback({createCustom:(id,supplier)=>{assert(!suppliers.has(id));suppliers.set(id,supplier);}});}},
  AstralContainers:{create:(width,height,rows)=>{let layout={width,height,rows:Array.from(rows)};calls.push(layout);return layout;}}
};
vm.createContext(scope);
vm.runInContext(read('kubejs/startup_scripts/astral_gems/17_containers.js'),scope);
let A=scope.global.sdbfAstral;
assert.equal(suppliers.size,2);assert.equal(calls.length,0,'KubeJS creates native items through deferred suppliers');
let metrics=layout=>{
  let {width:w,height:h,rows}=layout;
  assert.equal(rows.length,h);rows.forEach(row=>{assert.equal(row.length,w);assert(/^[X.]+$/.test(row));});
  let open=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&rows[y][x]==='X';
  let cells=[],fullNeighbors=0,squares=0,boundary=0,line=0;
  rows.forEach((row,y)=>Array.from(row).forEach((value,x)=>{
    if(value!=='X')return;cells.push([x,y]);
    assert(open(w-1-x,h-1-y),'every center-mirror counterpart remains open');
    if([[0,-1],[1,0],[0,1],[-1,0]].every(([dx,dy])=>open(x+dx,y+dy)))fullNeighbors++;
    if(open(x+1,y)&&open(x,y+1)&&open(x+1,y+1))squares++;
    if(x===0||y===0||x===w-1||y===h-1)boundary++;
    for(let [dx,dy] of [[1,0],[0,1]]){let n=0;while(open(x+n*dx,y+n*dy))n++;line=Math.max(line,n);}
  }));
  let seen=new Set(),queue=[cells[0]];
  while(queue.length){let [x,y]=queue.shift(),key=x+','+y;if(seen.has(key))continue;seen.add(key);
    for(let [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]])if(open(x+dx,y+dy))queue.push([x+dx,y+dy]);}
  assert.equal(seen.size,cells.length,'all open cells belong to one orthogonal component');
  return {count:cells.length,fullNeighbors,squares,boundary,line};
};
assert.deepEqual(metrics(A.containers.base),{count:20,fullNeighbors:6,squares:12,boundary:14,line:5});
assert.deepEqual(metrics(A.containers.rune),{count:36,fullNeighbors:16,squares:25,boundary:20,line:6});
assert.deepEqual(metrics(A.containers.frame),{count:36,fullNeighbors:8,squares:13,boundary:8,line:10});
let config=read('config/serverconfigs/deeprealm_4th-server.toml');
let baseRows=JSON.parse(config.match(/^\s*layout\s*=\s*(\[[^\r\n]+\])/m)[1]);
assert.deepEqual(baseRows,Array.from(A.containers.base.rows),'the actual base layout matches the approved shape');
assert.equal(Number(config.match(/^\s*width\s*=\s*(\d+)/m)[1]),A.containers.base.width);
assert.equal(Number(config.match(/^\s*height\s*=\s*(\d+)/m)[1]),A.containers.base.height);
assert(config.includes('void_entry_dimensions = ["minecraft:the_end"]'),'unrelated travel setting is preserved');
let lang=JSON.parse(read('kubejs/assets/kubejs/lang/zh_cn.json'));
let expectedNames={rune:'星界卢恩',frame:'星界框架'};
for(let kind of ['rune','frame']){
  let layout=A.containers[kind],native=suppliers.get(layout.id)();
  assert.deepEqual(native,{width:layout.width,height:layout.height,rows:Array.from(layout.rows)},'deferred suppliers retain distinct layouts');
  assert.equal(lang['item.'+layout.id.replace(':','.')],expectedNames[kind]);
  let model=JSON.parse(read('kubejs/assets/kubejs/models/item/'+layout.id.split(':')[1]+'.json'));
  assert.equal(model.parent,'minecraft:item/generated');
  assert.equal(model.textures.layer0,'kubejs:item/'+layout.id.split(':')[1]);
}
for(let file of ['kubejs/data/curios/tags/items/base_container.json','kubejs/data/deeprealm_4th/tags/items/astral/containers.json']){
  let tag=JSON.parse(read(file));assert.equal(tag.replace,false,'preserve the original base container');
  assert.deepEqual(new Set(tag.values),new Set([A.containers.rune.id,A.containers.frame.id]));
}
class Command {
  constructor(name){this.name=name;this.children=[];}
  then(child){this.children.push(child);return this;}
  requires(predicate){this.permission=predicate;return this;}
  executes(callback){this.execute=callback;return this;}
}
let commandRoot,given=[];
let args={integer:()=>({}),doubleArg:()=>({}),word:()=>({})};
Object.assign(scope,{
  Java:{loadClass:()=>args},Item:{of:id=>({id})},
  PlayerEvents:{loggedIn:()=>{},respawned:()=>{},tick:()=>{}},
  ServerEvents:{commandRegistry:callback=>callback({commands:{literal:name=>new Command(name),argument:name=>new Command(name)},register:node=>commandRoot=node})}
});
vm.runInContext(read('kubejs/server_scripts/gems/astral_gem_admin.js'),scope);
assert.equal(commandRoot.name,'astralgem');assert(commandRoot.permission({hasPermission:level=>level===2}));
assert(!commandRoot.permission({hasPermission:()=>false}));
let command=commandRoot.children.find(node=>node.name==='containers');assert(command);
assert.equal(command.execute({source:{player:{give:stack=>given.push(stack.id)}}}),1);
assert.deepEqual(given,['deeprealm_4th:base_container','kubejs:astral_rune','kubejs:astral_frame']);
console.log('PASS: native container suppliers, approved 20/36/36 masks, connectivity, mirror/neighbor/square/ray/boundary geometry, base config, models, approved names, Curios tags and admin grants.');
