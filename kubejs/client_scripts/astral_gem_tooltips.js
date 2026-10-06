// Compact gem values and the effects of the current primary modifier.
;(() => {
  let A=global.sdbfAstral;
  NetworkEvents.dataReceived('sdbf_astral_unlock',event=>{
    let data=event.getData();
    if(data.contains('overworldDayTime')){A.clientDayTime=Number(data.getLong('overworldDayTime'));A.clientClockTime=Client.level ? Number(Client.level.getTime()) : 0;}
  });
  ClientEvents.loggedOut(()=>{A.clientDayTime=null;cached=null;});
  let fmt=n=>Math.abs(n)>=1e7 ? n.toExponential(2) : n.toFixed(2).replace(/\.?0+$/,'');
  let cached=null,scoreErrorLogged=false;
  let HashMap=Java.loadClass('java.util.HashMap'),ArrayList=Java.loadClass('java.util.ArrayList');
  let Integer=Java.loadClass('java.lang.Integer');
  let Stack=Java.loadClass('net.minecraft.world.item.ItemStack');
  let AstralScreen=Java.loadClass('com.tonywww.deeprealm4th.screen.AstralScreen');
  let Engine=Java.loadClass('com.tonywww.deeprealm4th.astral.score.AstralScoreEngine');
  let scoreFmt=value=>{
    if(value.sign()===0)return '0';
    let exponent=Math.floor(value.abs().ln()/Math.log(10));
    if(exponent<7)return fmt(value.toFiniteDouble());
    let mantissa=value.divide(AstralNumber.parse('1e'+exponent)).toFiniteDouble();
    if(Math.abs(Number(mantissa.toFixed(2)))>=10){mantissa/=10;exponent++;}
    return mantissa.toFixed(2).replace(/\.?0+$/,'')+'e'+exponent;
  };
  let currentScores=(item,parsed)=>{
    if(!A.balance || !Client.player)return {scores:{},placed:false};
    let screen=Client.screen;
    if(screen instanceof AstralScreen){
      let menu=screen.getMenu(),slot=screen.getSlotUnderMouse(),index=slot ? menu.slots.indexOf(slot) : -1;
      if(index>=0 && index<menu.layout().size() && Stack.matches(slot.getItem(),item)){
        let contents=new ArrayList(),key=String(Client.level.getTime())+':'+menu.containerId;
        for(let i=0;i<menu.layout().size();i++){
          let stack=menu.slots.get(i).getItem();contents.add(stack);
          key+='|'+A.itemId(stack)+':'+(stack.getNbt() ? String(stack.getNbt()) : '');
        }
        if(!cached || cached.key!==key)cached={key:key,results:new HashMap(Engine.calculate(Client.player,menu.owner(),menu.layout(),contents).nodeResults())};
        let result=cached.results.get(Integer.valueOf(index)),scores={};
        if(result)Object.keys(A.scoreNames).forEach(s=>{scores[s]=result.finalScores().get(ScoreType[s]);});
        return {scores:scores,placed:true};
      }
    }
    return {scores:A.previewScores(parsed.rule,parsed.payload,Client.player),placed:false};
  };
  let statColors={size:0x87CEEB,purity:0x9ACD32,polish:0xFFFFFF},colorsByName={};
  A.stats.forEach(stat=>{colorsByName[A.statNames[stat]]=statColors[stat];});
  let ScoreColors=Java.loadClass('com.tonywww.deeprealm4th.astral.score.AstralScoreColors');
  Object.keys(A.scoreNames).forEach(score=>{colorsByName[A.scoreNames[score]]=ScoreColors.rgb(ScoreType[score]);});
  // A neutral parent retains the colored span; CLEAR (\u00a7r) restores formatting after it.
  let clear=text=>Text.of('').append(text).append(Text.of('\u00a7r'));
  let numeric=(value,state)=>{
    let result=Text.of(''),current=state ? state.current : null;
    String(value).split(/(大小|纯度|抛光|打磨|力量|敏捷|智力|体质|感知|魔力|[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?%?)/i).forEach(part=>{
      if(!part)return;
      if(colorsByName[part]!==undefined)current=colorsByName[part];
      if(part==='打磨')current=statColors.polish;
      if(/[，；→]/.test(part))current=null;
      result.append(clear(Text.of(part).color(current===null ? /\d/.test(part) ? Color.YELLOW : Color.GRAY : current)));
    });if(state)state.current=current;return result;
  };
  let wrap=(value,maximum)=>{
    let chunks=String(value).match(/大小|纯度|抛光|打磨|力量|敏捷|智力|体质|感知|魔力|[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?%?|./gi) || [],lines=[],line='';
    chunks.forEach(chunk=>{if(line.length+chunk.length>maximum){lines.push(line);line='';}line+=chunk;});
    if(line)lines.push(line);return lines;
  };
  let affix=a=>A.statNames[a.stat]+(a.value>=0?'＋':'－')+fmt(Math.abs(a.value)*(a.operation==='percent'?100:1))+(a.operation==='percent'?'%':'');
  let reinforced=data=>{
    let totals={};data.reinforcements.forEach(a=>{let key=a.stat+':'+a.operation;totals[key]=(totals[key]||0)+a.value;});
    return A.stats.reduce((out,stat)=>out.concat(['flat','percent'].map(operation=>({stat:stat,operation:operation,value:totals[stat+':'+operation]||0}))),[]).filter(a=>a.value!==0);
  };
  ItemEvents.tooltip(event=>event.addAdvanced(A.species.map(s=>s.item).concat([A.fillerId,A.badgeId]),(item,advanced,text)=>{
    let id=String(item.id),badge=id===A.badgeId,filler=id===A.fillerId;
    if(!A.apiReady){if(badge||filler)text.add(clear(Text.translatable('tooltip.sdbf_astral.api_unavailable').gray()));return;}
    let parsed=A.read(item);
    if(!parsed.payload){
      if(badge||filler)text.add(clear(Text.translatable(badge?'tooltip.sdbf_astral.empty_badge':'tooltip.sdbf_astral.invalid_gem').gray()));
      return;
    }
    let r=parsed.rule,data=parsed.payload,values=A.effective(data);
    let add=value=>{let state={current:null};wrap(value,28).forEach(line=>text.add(numeric(line,state)));};
    let list=(label,entries)=>entries.forEach((entry,index)=>add((index===0 ? label+'：' : '　　　')+affix(entry)));
    text.add(clear(Text.of(filler ? '原型：'+r.name+'·'+r.letter : '类型：'+r.letter).gold()));
    let affixes=data.affixes.filter(a=>a.value!==0);
    list('修饰',affixes);
    A.stats.forEach(stat=>{
      let base=event.shift&&values[stat]!==data.natural[stat] ? '（基础 '+fmt(data.natural[stat])+'）' : '';
      add(A.statNames[stat]+'：'+fmt(values[stat])+base);
    });
    add('强化：'+A.enhancementUses(data)+'/'+A.balance.enhancementMaxUses);
    if(event.shift)list('强化',reinforced(data));
    if(!badge && A.balance){
      try {
        let current=currentScores(item,parsed),lines=Object.keys(A.scoreNames).filter(s=>current.scores[s] && current.scores[s].sign()!==0)
          .map(s=>A.scoreNames[s]+' ＋'+scoreFmt(current.scores[s]));
        add((current.placed ? '分数：' : '产分：')+(lines.length ? lines.join('，') : '0'));
      } catch(error){
        add('分数：暂不可用');
        if(!scoreErrorLogged){console.warn('[Astral gems] Score tooltip: '+error);scoreErrorLogged=true;}
      }
    }
    if(!badge)add('填充物：'+Text.translatable('tooltip.sdbf_astral.effect.'+r.kind+'.'+r.primary).getString());
    if(!filler)r.badgeChannels.forEach(channel=>add('徽章：'+channel.scores.map(score=>A.scoreNames[score]).join('＋')+' → '+channel.label));
    if(!A.balance)text.add(clear(Text.translatable('tooltip.sdbf_astral.balance_pending').yellow()));
    if(!event.shift)text.add(clear(Text.translatable('tooltip.sdbf_astral.details_hint').darkGray()));
  }));
  ItemEvents.tooltip(event=>{
    Object.keys(A.processing.tiers).forEach(tier=>event.addAdvanced(A.processing.tiers[tier].id,(item,advanced,text)=>{
      text.add(clear(Text.translatable('tooltip.sdbf_astral.agent.'+tier).gray()));
      if(event.shift){
        let index=0,limits=Text.of('');
        Text.translatable('tooltip.sdbf_astral.agent.limits').getString().split(/(\d+)/).forEach(part=>{
          if(part)limits.append(clear(Text.of(part).color(/\d/.test(part) ? statColors[A.stats[index++]] : Color.GRAY)));
        });
        text.add(limits);text.add(clear(Text.translatable('tooltip.sdbf_astral.agent.affixes').gray()));
      }
    }));
    Object.keys(A.processing.enhancements).forEach(kind=>event.addAdvanced(A.processing.enhancements[kind].id,(item,advanced,text)=>{
      let rule=A.processing.enhancements[kind];
      text.add(kind==='cleanse' ? clear(Text.translatable('tooltip.sdbf_astral.enhancement.cleanse').gray()) : numeric(A.statNames[rule.stat]+' +'+fmt(rule.value)));
    }));
  });
  JEIEvents.hideItems(event=>{if(A.apiReady)['warrior_medal','wayfarer_medal','warden_medal'].forEach(id=>event.hide('deeprealm_4th:'+id));});
})();
