// priority: 0
// Permission-level-2 test tools; survival mechanics are registered separately.
;(() => {
  let A=global.sdbfAstral;
  let DoubleArg=Java.loadClass('com.mojang.brigadier.arguments.DoubleArgumentType');
  let IntArg=Java.loadClass('com.mojang.brigadier.arguments.IntegerArgumentType');
  let WordArg=Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType');
  let Compound=Java.loadClass('net.minecraft.nbt.CompoundTag');
  let sync=player=>{let packet=new Compound();packet.putLong('overworldDayTime',player.getServer().overworld().getDayTime());player.sendData('sdbf_astral_unlock',packet);};
  let mark=player=>{
    sync(player);
    if(A.apiReady)AstralRuntime.invalidate(player);
  };
  PlayerEvents.loggedIn(event=>sync(event.player));
  PlayerEvents.respawned(event=>sync(event.player));
  PlayerEvents.tick(event=>{if(event.player.age%20===0)sync(event.player);});
  ServerEvents.commandRegistry(event=>{
    let C=event.commands;
    let root=C.literal('astralgem').requires(source=>source.hasPermission(2));
    let run=fn=>context=>{
      try {
        let player=context.source.player;
        if(!player)throw new Error('请在游戏内执行此命令。');
        fn(player,context);return 1;
      } catch(error) {context.source.sendFailure(Text.of(String(error.message || error)));return 0;}
    };
    let ready=()=>{if(!A.apiReady)throw new Error('深四模组尚未包含宝石节点 API，请更新模组并重启。');};
    let one=stack=>{if(stack.isEmpty() || stack.count!==1)throw new Error('测试操作要求物品数量为1。');};
    let commit=(player,stack)=>{player.setMainHandItem(stack);AstralRuntime.invalidate(player);};
    let edit=(player,fn)=>{
      ready();let stack=player.mainHandItem;one(stack);
      let parsed=A.read(stack);if(!parsed.payload)throw new Error(parsed.error);
      let data=parsed.payload;fn(data);let error=A.validate(data);if(error)throw new Error(error);
      commit(player,A.write(stack,data));player.tell(Text.of('宝石数据已更新。'));
    };
    root.executes(run(player=>player.tell(Text.of('管理员测试：/astralgem list、status、create、badge、containers、process、embed、inspect、affix、reinforce、cleanse、unlock、cell。'))));
    root.then(C.literal('status').executes(run(player=>player.tell(Text.of('API：'+(A.apiReady?'可用':'需要更新模组')+'；数值：'+(A.balance?'首轮配置已启用':'尚未启用')+'。')))));
    root.then(C.literal('list').executes(run(player=>{
      A.species.forEach(s=>player.tell(Text.of(s.number+'．'+s.name+'：'+A.byItem[s.item].map(r=>r.letter+'（'+r.primary+'）').join('、'))));
    })));
    root.then(C.literal('unlock').executes(run(player=>{mark(player);player.tell(Text.of('已解锁星界宝石测试。'));})));
    root.then(C.literal('badge').executes(run(player=>player.give(Item.of(A.badgeId)))));
    root.then(C.literal('containers').executes(run(player=>{
      ready();Object.keys(A.containers).forEach(kind=>player.give(Item.of(A.containers[kind].id)));
    })));
    root.then(C.literal('agents').executes(run(player=>{
      ready();Object.keys(A.agentTiers).concat(Object.keys(A.enhancementKinds)).forEach(id=>player.give(Item.of(id,64)));
    })));
    root.then(C.literal('roll').then(C.argument('kind',IntArg.integer(1,34)).then(C.argument('tier',WordArg.word()).executes(run((player,c)=>{
      ready();let species=A.species[IntArg.getInteger(c,'kind')-1],tier=String(WordArg.getString(c,'tier'));
      if(!A.canProcess(species.item,tier))throw new Error(A.processingMessage('inapplicable_agent'));
      player.give(A.write(Item.of(species.item),A.generateProcessed(species.item,tier,Math.random,player.getLuck())));
    })))));
    root.then(C.literal('apply').then(C.argument('kind',WordArg.word()).executes(run((player,c)=>{
      ready();let stack=player.mainHandItem;one(stack);
      try{commit(player,A.enhanceStack(stack,String(WordArg.getString(c,'kind'))));}
      catch(error){throw new Error(A.processingMessage(error));}
    }))));
    root.then(C.literal('extract').executes(run(player=>{
      ready();let stack=player.mainHandItem;one(stack);let result=A.extractBadge(stack);
      commit(player,result.badge);player.give(result.gem);
    })));
    let create=run((player,c)=>{
      ready();let number=IntArg.getInteger(c,'kind'),primary=String(WordArg.getString(c,'primary'));
      let species=A.species[number-1];if(!species || !A.byIdentity[species.item+'#'+primary])throw new Error('无此宝石或字母组合，请用 list 查看。');
      let data={schema:1,source_item:species.item,primary:primary,natural:{size:DoubleArg.getDouble(c,'size'),purity:DoubleArg.getDouble(c,'purity'),polish:DoubleArg.getDouble(c,'polish')},
        affixes:[{stat:'size',operation:'flat',value:0}],reinforcements:[],extensions:new Compound()};
      data.extensions.putBoolean('admin_fixture',true);
      data.extensions.putInt('enhancement_uses',0);
      player.give(A.write(Item.of(species.item),data));
      player.tell(Text.of('已创建指定数值测试宝石；首条为零值测试修饰，添加首条正式修饰时自动替换。'));
    });
    root.then(C.literal('create').then(C.argument('kind',IntArg.integer(1,34)).then(C.argument('primary',WordArg.word())
      .then(C.argument('size',DoubleArg.doubleArg(1,500)).then(C.argument('purity',DoubleArg.doubleArg(1,200))
        .then(C.argument('polish',DoubleArg.doubleArg(1,100)).executes(create)))))));
    root.then(C.literal('process').executes(run(player=>{
      ready();let stack=player.mainHandItem;one(stack);let parsed=A.read(stack);
      if(!parsed.payload || String(stack.id)!==parsed.rule.item)throw new Error('主手需要带有有效数据的原宝石。');
      let result=GemPayloadTransfer.toFiller(stack,A.gemKey,Item.of(A.fillerId),A.gemKey);
      if(!result.ok())throw new Error(result.error());commit(player,result.stack());
      player.tell(Text.of('已转为填充物，原有三维与修饰保持原值。'));
    })));
    root.then(C.literal('embed').executes(run(player=>{
      ready();let badge=player.mainHandItem,gem=player.offHandItem;one(badge);one(gem);
      let parsed=A.read(gem);
      if(String(badge.id)!==A.badgeId || !parsed.payload || String(gem.id)!==parsed.rule.item)throw new Error('主手需为空槽专属徽章，副手需为有效原宝石。');
      let result=GemPayloadTransfer.embed(gem,A.gemKey,badge,A.badgeKey);
      if(!result.ok())throw new Error(result.error());commit(player,result.stack());player.setOffHandItem(Item.of('minecraft:air'));
      player.tell(Text.of('已镶嵌一颗宝石。'));
    })));
    root.then(C.literal('inspect').executes(run(player=>{
      ready();let parsed=A.read(player.mainHandItem);if(!parsed.payload)throw new Error(parsed.error);
      let data=parsed.payload,values=A.effective(data);
      player.tell(Text.of(parsed.rule.name+' '+parsed.rule.letter+'；天然总体品质 '+(A.quality(data,parsed.rule)*100).toFixed(2)+'%。'));
      A.stats.forEach(s=>player.tell(Text.of(A.statNames[s]+'：天然 '+data.natural[s]+' → 修正后 '+values[s].toFixed(2)+'。')));
      player.tell(Text.of('自然修饰 '+data.affixes.length+' 条；强化记录 '+data.reinforcements.length+' 条。'));
    })));
    ['affix','reinforce'].forEach(mode=>root.then(C.literal(mode).then(C.argument('stat',WordArg.word())
      .then(C.argument('operation',WordArg.word()).then(C.argument('value',DoubleArg.doubleArg()).executes(run((player,c)=>edit(player,data=>{
        let affix={stat:String(WordArg.getString(c,'stat')),operation:String(WordArg.getString(c,'operation')),value:DoubleArg.getDouble(c,'value')};
        if(mode==='affix' && data.extensions.getBoolean('admin_fixture') && data.affixes.length===1 && data.affixes[0].value===0)data.affixes=[];
        data[mode==='affix' ? 'affixes':'reinforcements'].push(affix);
      }))))))));
    root.then(C.literal('cleanse').executes(run(player=>edit(player,data=>{
      let cleaned=data.affixes.filter(a=>a.value>=0);
      data.affixes=cleaned;
    }))));
    root.then(C.literal('cell').then(C.argument('index',IntArg.integer(0)).executes(run((player,c)=>{
      ready();let container=player.mainHandItem,filler=player.offHandItem;one(filler);
      if([A.fillerId,A.badgeId].indexOf(String(filler.id))<0)throw new Error('副手需为宝石填充物或专属徽章。');
      AstralRuntime.updateCell(player,container,IntArg.getInteger(c,'index'),old=>{
        if(!old.isEmpty())throw new Error('目标格子已有物品。');return filler.copy();
      });player.setOffHandItem(Item.of('minecraft:air'));player.tell(Text.of('已放入指定格子。'));
    }))));
    event.register(root);
  });
})();
