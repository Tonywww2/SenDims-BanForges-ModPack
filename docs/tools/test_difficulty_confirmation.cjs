const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('kubejs/assets/apricityui/apricity/screens/difficulty.html');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const languages = Object.fromEntries(['zh_cn','en_us'].map(id => [id, JSON.parse(read('kubejs/assets/kubejs/lang/' + id + '.json'))]));
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };
const dataContext = vm.createContext({ global: {} });
vm.runInContext(read('kubejs/server_scripts/miscs/difficulty_data.js'), dataContext);
const raw = JSON.parse(JSON.stringify(dataContext.global.sdbfDifficultyData));
const translatedKeys = [];
const localize = (language, overrides = {}) => {
    const dictionary = { ...languages[language], ...overrides }, handlers = {};
    const context = vm.createContext({
        global: {}, console: { log() {} },
        NetworkEvents: { dataReceived: (channel, callback) => { handlers[channel] = callback; } },
        Text: { translatable: (key, ...args) => {
            translatedKeys.push(key);
            return { getString: () => {
                let index = 0;
                return (dictionary[key] || key).replace(/%(?:(\d+)\$)?s/g, (_, positional) => String(args[positional ? Number(positional) - 1 : index++]));
            } };
        } }
    });
    vm.runInContext(read('kubejs/client_scripts/difficulty_data.js'), context);
    handlers.sdbf_difficulty_data({ getData: () => ({ getString: () => JSON.stringify(raw), getClass: () => ({ getName: () => 'CompoundTag' }), getAllKeys: () => ['json'], getTagType: () => 8 }) });
    return JSON.parse(context.global.sdbfDifficultyDataJson);
};
for (const [language, dictionary] of Object.entries(languages)) {
    const localized = localize(language);
    for (const axis of localized.axes) {
        const key = 'kubejs.difficulty.n_' + axis.level;
        check(dictionary[key] && dictionary[key + '.desc'], language + ' has complete axis names/descriptions: ' + axis.level);
        check(axis.label === dictionary[key] && axis.description === dictionary[key + '.desc'], 'client uses lang for ' + language + '/' + axis.level);
        const source = raw.axes.find(item => item.level === axis.level);
        check(axis.health === source.health && axis.damageTaken === source.damageTaken && axis.armor === source.armor, 'localization preserves numeric difficulty');
    }
    for (const id of ['title','progress','continue','submit','cancel','input_hint','combat','duration','high','extreme','selection_changed'])
        check(localized.confirmationI18n[id] && !localized.confirmationI18n[id].startsWith('kubejs.'), 'localized modal text ' + language + '/' + id);
}
check(translatedKeys.includes('kubejs.difficulty.n_18') && translatedKeys.includes('kubejs.difficulty.n_18.desc'), 'highest difficulty is resolved via translation keys');

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const harness = (level, queued = {}, current = 0, scriptSource = script) => {
    const commands = [], documentEvents = new Map(), elements = new Map(), axisButtons = new Map(), modifierButtons = new Map();
    const document = { activeElement: null };
    class Element {
        constructor(id, attributes = {}) { this.id = id; this.attributes = attributes; this.listeners = new Map(); this.textContent = ''; this.value = ''; this.cursor = 0; this.selectionStart = 0; this.selectionEnd = 0; this.selectionAnchor = 0; this.undoStack = []; this.disabled = false; this.classes = new Set(); this.classList = { add: x => this.classes.add(x), remove: x => this.classes.delete(x), contains: x => this.classes.has(x) }; }
        addEventListener(type, callback) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(callback); }
        setAttribute(key, value) { this.attributes[key] = String(value); if (key === 'value') { this.cursor = Math.min(this.cursor, this.value.length); this.selectionAnchor = this.selectionStart = this.selectionEnd = this.cursor; this.undoStack.length = 0; } }
        setSelectionRange(start, end) { this.selectionStart = Math.max(0, Math.min(start, this.value.length)); this.selectionEnd = Math.max(0, Math.min(end, this.value.length)); this.cursor = this.selectionEnd; this.selectionAnchor = this.selectionStart; }
        insertText(text) { if (this.cursor < 0 || this.cursor > this.value.length || this.selectionStart < 0 || this.selectionEnd > this.value.length) throw new RangeError('AUI text cursor outside current value'); this.undoStack.push(this.value); this.value = this.value.slice(0, this.cursor) + text + this.value.slice(this.cursor); this.cursor += text.length; this.selectionAnchor = this.selectionStart = this.selectionEnd = this.cursor; this.emit('input'); }
        getAttribute(key) { return this.attributes[key] ?? null; }
        getBoundingClientRect() { if (this.id === 'axis-row') return { left:0,top:0,right:550,bottom:24,width:550,height:24 }; if (this.id === 'matrix-viewport') return { left:0,top:0,right:550,bottom:300,width:550,height:300 }; return { left:32,top:50,right:50,bottom:68,width:18,height:18 }; }
        focus() { document.activeElement = this; }
        emit(type) { for (const callback of this.listeners.get(type) || []) callback({ target:this, preventDefault() {}, stopPropagation() {} }); }
    }
    ids.forEach(id => elements.set(id, new Element(id)));
    elements.set('screen', new Element('screen')); elements.set('axis-row', new Element('axis-row'));
    const icon = new Element('native-item-slot');
    raw.axes.forEach(axis => axisButtons.set(axis.level, new Element('axis-' + axis.level, { 'data-axis-level':String(axis.level) })));
    raw.modifiers.forEach(modifier => modifierButtons.set(modifier.id, new Element(modifier.id, { 'data-modifier-id':modifier.id })));
    document.getElementById = id => { assert.ok(elements.has(id), 'element exists in real HTML: ' + id); return elements.get(id); };
    document.querySelector = selector => {
        if (selector === '.screen') return elements.get('screen');
        if (selector === '.axis-row') return elements.get('axis-row');
        if (selector.includes('data-axis-level')) return axisButtons.get(Number(selector.match(/="([^"]+)"/)[1]));
        if (selector.includes('data-modifier-id')) return modifierButtons.get(selector.match(/="([^"]+)"/)[1]);
        return null;
    };
    document.querySelectorAll = selector => selector === '[data-axis-level]' ? [...axisButtons.values()] : selector === '[data-modifier-id]' ? [...modifierButtons.values()] : selector === '.modifier-icon' ? [icon] : [];
    document.addEventListener = (type, callback) => { if (!documentEvents.has(type)) documentEvents.set(type, []); documentEvents.get(type).push(callback); };
    document.removeEventListener = (type, callback) => documentEvents.set(type, (documentEvents.get(type) || []).filter(value => value !== callback));
    document.requestStyleRecalc = () => {}; document.commitStyleRecalc = () => {};
    let closed = 0;
    const context = vm.createContext({
        document, console: { log() {} },
        window: { innerWidth:854,innerHeight:480,requestAnimationFrame:()=>1,cancelAnimationFrame() {},addEventListener() {} },
        Client: { player: { connection: { sendCommand: command => commands.push(command) } } },
        ApricityUI: { closeScreen: () => { closed++; } }
    });
    vm.runInContext(scriptSource, context);
    context.inputData = localize('zh_cn');
    vm.runInContext('applyDifficultyData(inputData); categories.forEach(category => category.modifiers.forEach(modifier => { modifierById[modifier.id] = modifier; })); initializeUiCache(); initializeConfirmationDialog(); installMatrixEvents();', context);
    const evaluate = code => vm.runInContext(code, context);
    evaluate('currentLevel=' + current + ';pendingLevel=' + level + ';queuedModifiers=' + JSON.stringify(queued) + ';matrixMetrics={columnWidth:32,axisHeight:24,axisFontSize:10,buttonSize:24,iconSize:18,modifierFontSize:7};updateState();');
    return {
        evaluate, commands, elements, document, icon, axisButtons, modifierButtons,
        closed: () => closed,
        start: () => evaluate('submitSelection()'),
        next: () => elements.get('confirmation-accept').emit('click'),
        type: text => { const input = elements.get('confirmation-input'); input.undoStack.push(input.value); input.value = text; input.selectionAnchor = input.selectionStart = input.selectionEnd = input.cursor = text.length; input.emit('input'); },
        append: text => { for (const character of text) elements.get('confirmation-input').insertText(character); },
        cancel: () => elements.get('confirmation-cancel').emit('click'),
        state: () => evaluate('confirmationState'),
        key: (key, extra = {}) => { let prevented=false; for (const callback of documentEvents.get('keydown') || []) callback({key,...extra,preventDefault(){prevented=true;},stopPropagation(){}});return prevented; },
        keyHandlers: () => (documentEvents.get('keydown') || []).length
    };
};
for (let level=-7; level<=18; level++) {
    const h=harness(level,level===0?{soul_tiny:true}:{});
    const steps=[['combat',6,''],['duration',10,''],['high',15,'Yes'],['extreme',18,'Confirmed']].filter(([,threshold])=>level>=threshold);
    h.start();
    if (!steps.length) check(h.commands.length===1,'no extra dialogs below N+6');
    for (let index=0;index<steps.length;index++) {
        const [message,,word]=steps[index];
        check(h.state().index===index&&h.state().steps.length===steps.length,'exact cumulative dialog count at N+'+level);
        check(h.elements.get('confirmation-message').textContent===languages.zh_cn['kubejs.difficulty.confirm.'+message],'warning order and lang text');
        check(h.commands.length===0,'nothing sent before final consent');
        check(h.icon.getAttribute('data-slot-visible')==='0','native item icons hidden behind modal');
        h.axisButtons.get(-7).emit('click');h.modifierButtons.get('enemy_health_1').emit('click');
        check(h.evaluate('pendingLevel')===level,'underlying axis cannot change during confirmation');
        check(!h.evaluate('queuedModifiers.enemy_health_1'),'underlying modifier cannot toggle during confirmation');
        if (word) {
            check(h.elements.get('confirmation-input').value===''&&h.elements.get('confirmation-accept').disabled,'new typed step starts empty and disabled');
            for (const wrong of ['',word+'!','not '+word,index===2?'Confirmed':'Yes']) {
                h.type(wrong);h.next();
                check(h.elements.get('confirmation-accept').disabled&&h.state().index===index&&h.commands.length===0,'wrong word cannot advance even through direct click event');
            }
            h.type(index===2?'  yEs  ':'  cOnFiRmEd  ');
            check(!h.elements.get('confirmation-accept').disabled,'case-insensitive exact word accepts surrounding whitespace');
        }
        h.next();
    }
    check(h.commands.length===1&&h.closed()===1,'one final command and close');
    check(h.commands[0]==='sdbf_difficulty_menu apply '+level+' '+(level===0?'soul_tiny':'none'),'submitted payload is unchanged');
    h.next();h.start();check(h.commands.length===1,'repeated clicks cannot duplicate submission');
}
for (let cancelAt=0;cancelAt<4;cancelAt++) {
    const h=harness(18,{enemy_health_1:true});h.start();
    for(let index=0;index<cancelAt;index++){if(index===2)h.type('YES');h.next();}
    if(cancelAt===3)check(h.elements.get('confirmation-input').value===''&&h.elements.get('confirmation-accept').disabled,'Yes does not authorize the Confirmed step');
    h.cancel();
    check(!h.state()&&h.commands.length===0,'cancel at every stage sends no command');
    check(h.evaluate('pendingLevel===18 && queuedModifiers.enemy_health_1'),'cancel retains pending choices');
    check(h.icon.getAttribute('data-slot-visible')==='1','cancel restores native item icons');
    h.start();check(h.state().index===0,'retry starts again from first warning');
}
for (const word of ['yes','YES','YeS',' yes ','confirmed','CONFIRMED','CoNfIrMeD']) {
    const h=harness(18);h.start();h.next();h.next();
    if(word.toLowerCase().trim()==='yes'){h.type(word);h.next();check(h.state().index===3,'all Yes casing variants');}
    else{h.type('yes');h.next();h.type(word);h.next();check(h.commands.length===1,'all Confirmed casing variants');}
}
{
    const h=harness(18);h.start();h.next();h.next();h.type('Yes');
    check(h.key('Tab')&&h.document.activeElement===h.elements.get('confirmation-cancel'),'Tab remains in modal');
    check(h.key('Escape')&&!h.state()&&h.commands.length===0,'Escape safely cancels');
    h.start();h.evaluate('pendingLevel=17');h.next();check(!h.state()&&h.commands.length===0,'changed axis invalidates snapshot');
}
{
    const h=harness(10);h.start();h.evaluate('queuedModifiers.enemy_health_1=true');h.next();check(!h.state()&&h.commands.length===0,'changed modifiers invalidate snapshot');
}
{
    const h=harness(18,{},18);h.start();check(!h.state()&&h.commands.length===0,'no-op submit does nothing');
    h.evaluate('queuedModifiers.enemy_health_1=true;difficultyLocked=true');h.start();check(!h.state()&&h.commands.length===0,'locked difficulty cannot open/submit');
}
{
    const h=harness(18,{enemy_health_1:true},18);h.start();check(h.state().steps.length===4,'modifier-only submission at high difficulty still requires consent');
    h.evaluate('pageDisposed=true;disposeUiCache()');check(!h.state()&&h.keyHandlers()===0,'unload clears modal state and keyboard listener');
    h.next();check(h.commands.length===0,'stale callbacks after unload cannot send commands');
}
{
    const h=harness(15,{enemy_health_2:true,enemy_health_1:true});h.start();h.next();h.next();h.type('yes');h.next();
    check(h.commands[0]==='sdbf_difficulty_menu apply 15 enemy_health_2 enemy_health_1','confirmation preserves original modifier application order');
}
{
    const h=harness(11);h.evaluate('applyDifficultyData('+JSON.stringify(localize('zh_cn',{'kubejs.difficulty.n_11':'本地化的第十一档'}))+')');
    check(h.evaluate('formatLevel(11)')==='本地化的第十一档','UI uses translated label rather than rebuilding N+11');
}

// AUI 1.2.7 direct value writes retain the previous native caret and undo state.
{
    const legacy = script.replace(/resetConfirmationInput\(\);/g, "confirmationUi.input.value = '';");
    const h = harness(18, {}, 0, legacy);
    h.start(); h.next(); h.next(); h.append('Yes'); h.next();
    check(h.elements.get('confirmation-input').value === '' && h.elements.get('confirmation-input').cursor === 3, 'old reset reproduces empty value with caret at three');
    assert.throws(() => h.append('C'), RangeError); checks++;
}
{
    const h = harness(18); h.start(); h.next(); h.next(); h.append('Yes'); h.next();
    const input = h.elements.get('confirmation-input');
    check(input.value === '' && input.cursor === 0 && input.selectionStart === 0 && input.selectionEnd === 0 && input.selectionAnchor === 0, 'Yes to Confirmed clears every text index immediately');
    check(input.undoStack.length === 0, 'a new warning cannot undo into the previous warning');
    h.append('Confirmed'); h.next();
    check(h.commands.length === 1, 'native-style character typing completes N+18 without a stale-caret exception');
    check(input.value === '' && input.cursor === 0 && input.undoStack.length === 0, 'final close clears native editing state');
}
for (const close of ['cancel', 'escape']) {
    const h = harness(18); h.start(); h.next(); h.next(); h.append('Yes'); h.next(); h.append('Con');
    const input = h.elements.get('confirmation-input');
    input.setSelectionRange(0, 3);
    if (close === 'cancel') h.cancel(); else h.key('Escape');
    check(input.cursor === 0 && input.selectionStart === 0 && input.selectionEnd === 0 && input.selectionAnchor === 0 && input.undoStack.length === 0, close + ' clears selection, caret and undo history');
    h.start(); h.next(); h.next(); h.append('Yes'); h.next(); h.append('Confirmed'); h.next();
    check(h.commands.length === 1, close + ' then reopen remains editable and only submits once');
}

// Execute all existing gameplay checks, then inspect translated server-side components.
const regression=vm.createContext({require,console});
vm.runInContext(read('docs/tools/test_difficulty.cjs'),regression,{filename:'test_difficulty.cjs'});
const fixtures=vm.runInContext('({context,globals,player,native})',regression);
class Component {
    constructor(key,args=[],text=''){this.key=key;this.args=args;this.text=text;this.children=[];}
    append(value){this.children.push(value);return this;}color(value){this.colorValue=value;return this;}font(){return this;}hover(){return this;}
}
fixtures.context.Text={of:value=>new Component(null,[],String(value)),translatable:(key,...args)=>new Component(key,args)};
fixtures.context.Color=new Proxy({},{get:(_,key)=>String(key)});
const find=(component,key)=>component?.key===key?component:(component?.children||[]).map(child=>find(child,key)).find(Boolean);
const nameEvent=fixtures.native.find(args=>args.length===2&&args[0]==='name')[1];
for(let level=-7;level<=18;level++){
    let displayed;const player=fixtures.player(level);
    nameEvent({entity:player,username:new Component(null,[],'Tester'),setDisplayname:value=>{displayed=value;}});
    const axis=find(displayed,'kubejs.difficulty.n_'+level);
    check(axis,'name prefix remains a translatable component at '+level);
    const expected=level<=-6?'LIGHT_PURPLE':level<=-2?'GREEN':level<=1?'WHITE':level<=5?'AQUA':level<=9?'YELLOW':level<=15?'RED':'DARK_RED';
    check(axis.colorValue===expected,'difficulty colors preserved');
}
{
    fixtures.context.testPlayer=fixtures.player(11);
    const hover=vm.runInContext('buildAxisHover(testPlayer,axisByLevel[18],getPlayerDifficulty(testPlayer))',fixtures.context);
    check(find(hover,'kubejs.difficulty.n_18')&&find(hover,'kubejs.difficulty.n_18.desc'),'server hover uses translated name and description');
    let broadcast;const player=fixtures.player(0);player.getAttribute=()=>null;player.server={players:[{tell:value=>{broadcast=value;}}]};player.displayName=new Component(null,[],'Tester');
    fixtures.context.$StringArgumentType={getString:c=>c.values.subIds};
    const command={source:{player,sendFailure:message=>{throw Error(message.key);}},values:{level:11,subIds:'none'}};
    const args={INTEGER:{getResult:(c,key)=>c.values[key]}};
    check(fixtures.globals.applyDifficultySelectionFromCmd(command,args)===1,'server apply remains valid');
    check(broadcast.key==='kubejs.difficulty.set_success'&&broadcast.args[1].key==='kubejs.difficulty.n_11','broadcast uses lang for newly added difficulties');
}
const out=path.join(root,'docs/archive/difficulty-confirmation-2026-11-02');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({checks,axisCount:raw.axes.length,languages:Object.keys(languages),confirmationCounts:{'6':1,'10':2,'15':3,'18':4},fullMinecraftLaunched:false},null,2)+'\n');
console.log('PASS:',checks,'localization, popup state-machine and server display checks.');
