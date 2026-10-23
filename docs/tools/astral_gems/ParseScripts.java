import dev.latvian.mods.rhino.Context;
import dev.latvian.mods.rhino.ScriptableObject;
import dev.latvian.mods.rhino.NativeJavaClass;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Collections;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.regex.Pattern;
import java.util.function.Supplier;

/** Minimal check against the instance's actual Rhino parser; no Minecraft is launched. */
class ParseScripts {
    public static class ContainerShape {
        final int width;
        final int height;
        final String[] rows;
        ContainerShape(int width, int height, String[] rows) {
            this.width = width; this.height = height; this.rows = rows;
        }
    }
    public static class ContainerFactory {
        public static ContainerShape create(int width, int height, String... rows) {
            if (rows.length != height) throw new IllegalArgumentException("Container row count");
            for (String row : rows) if (row.length() != width) throw new IllegalArgumentException("Container row width");
            return new ContainerShape(width, height, rows);
        }
    }
    public static class ContainerRegistry {
        final HashMap<String, Supplier<Object>> suppliers = new HashMap<>();
        public Object createCustom(String id, Supplier<Object> supplier) {
            if (suppliers.put(id, supplier) != null) throw new IllegalArgumentException("Duplicate container");
            return null;
        }
    }
    private static void verifyContainerRegistration(Context context, String source) {
        ScriptableObject scope = context.initStandardObjects();
        var registry = new ContainerRegistry();
        scope.put(context, "registry", scope, Context.javaToJS(context, registry, scope));
        scope.put(context, "AstralContainers", scope, new NativeJavaClass(context, scope, ContainerFactory.class));
        context.evaluateString(scope, "let global={sdbfAstral:{}};"
                + "let StartupEvents={registry:(type,callback)=>callback(registry)};", "container-fixture", 1, null);
        context.evaluateString(scope, source, "actual-container-registration", 1, null);
        if (registry.suppliers.size() != 2) throw new AssertionError("Two custom container registrations");
        var rune = (ContainerShape) registry.suppliers.get("kubejs:astral_rune").get();
        var frame = (ContainerShape) registry.suppliers.get("kubejs:astral_frame").get();
        if (rune.width != 6 || rune.height != 6 || frame.width != 10 || frame.height != 8)
            throw new AssertionError("Distinct deferred container layouts");
        for (var shape : List.of(rune, frame)) {
            int count = 0;
            for (String row : shape.rows) count += (int) row.chars().filter(c -> c == 'X').count();
            if (count != 36) throw new AssertionError("Container open count");
        }
        System.out.println("PASS: actual container script converts arrow callbacks to Java Supplier and layout arrays to String varargs in Rhino.");
    }
    public static class StackingTag {
        private final String key;
        public StackingTag(String key) { this.key = key; }
        public boolean contains(String name) { return key.equals(name); }
    }
    public static class StackingStack {
        private final StackingTag tag;
        public StackingStack(String key) { tag = key == null ? null : new StackingTag(key); }
        @dev.latvian.mods.rhino.util.RemapForJS("getNbt")
        public StackingTag getTag() { return tag; }
    }

    private static void verifyStackingNbt(Context context, ScriptableObject scope, String source) {
        var reader = Pattern.compile("(?m)^  A\\.hasGemData=.*;$").matcher(source);
        if (!reader.find()) throw new IllegalStateException("Missing gem data presence reader");
        scope.put(context, "rawStack", scope, Context.javaToJS(context, new StackingStack(null), scope));
        scope.put(context, "gemStack", scope, Context.javaToJS(context, new StackingStack("sdbf.astral_gem"), scope));
        scope.put(context, "badgeStack", scope, Context.javaToJS(context, new StackingStack("sdbf.astral_badge"), scope));
        scope.put(context, "otherStack", scope, Context.javaToJS(context, new StackingStack("other"), scope));
        context.evaluateString(scope, "{let system=global.sdbfAstral;"
                + "let oldFailed=false;try{rawStack.getTag();}catch(error){oldFailed=true;}"
                + "if(!oldFailed)throw new Error('missing getTag/getNbt remapping');"
                + "if(rawStack.getNbt()!==null)throw new Error('raw stack NBT');"
                + "let A=system;" + reader.group()
                + "if(system.hasGemData(rawStack)||system.hasGemData(otherStack))throw new Error('plain gem data presence');"
                + "if(!system.hasGemData(gemStack)||!system.hasGemData(badgeStack))throw new Error('processed gem data presence');}",
                "actual-remapped-stack-nbt", 1, null);
        System.out.println("PASS: reproduced hidden getTag method; actual data presence reader uses KubeJS-remapped getNbt in Rhino.");
    }

    public static class StackingLevel {
        public boolean isClientSide() { return true; }
    }
    public static class StackingInventory {
        public int getFreeSlot() { return 0; }
    }
    public static class StackingCooldowns {
        private final HashMap<String, Integer> expires = new HashMap<>();
        private int ticks;
        public void addCooldown(String item, int duration) { expires.put(item, ticks + duration); }
        public boolean isOnCooldown(String item) { return expires.getOrDefault(item, 0) > ticks; }
        public void advance(int duration) { ticks += duration; }
    }
    public static class StackingPlayer {
        private final StackingLevel level = new StackingLevel();
        private final StackingCooldowns cooldowns = new StackingCooldowns();
        public StackingCooldowns getCooldowns() { return cooldowns; }
        public void advance(int duration) { cooldowns.advance(duration); }
        public StackingLevel getLevel() { return level; }
        public StackingInventory getInventory() { return new StackingInventory(); }
    }

    private static void verifyStackingProperties(Context context, String source) {
        ScriptableObject scope = context.initStandardObjects();
        scope.put(context, "player", scope, Context.javaToJS(context, new StackingPlayer(), scope));
        context.evaluateString(scope, "let oldFailed=false;try{player.level();}catch(error){oldFailed=true;}"
                + "if(!oldFailed)throw new Error('missing Java bean property collision');"
                + "if(player.level.clientSide!==true)throw new Error('level/clientSide property');"
                + "let global={sdbfAstral:{apiReady:true,"
                + "byItem:{'test:gem':true},itemId:stack=>stack.id,badgeId:'test:badge',fillerId:'test:filler',"
                + "processing:{generationEnabled:true,interaction:{cooldownTicks:5}},agentTiers:{'test:agent':'mid'},enhancementKinds:{},"
                + "canProcess:()=>true,hasGemData:()=>false}};"
                + "let dispatcher;let NativeEvents={onEvent:(priority,receiveCanceled,type,callback)=>{dispatcher=callback;}};"
                + "let Item={of:id=>({getItem:()=>id})};"
                + "let Java={loadClass:name=>name==='net.minecraftforge.eventbus.api.EventPriority'?{HIGHEST:'HIGHEST'}:name};",
                "stacking-bean-fixture", 1, null);
        context.evaluateString(scope, source, "actual-stacking-script", 1, null);
        context.evaluateString(scope, "let system=global.sdbfAstral;"
                + "system.meonother('test:agent',(event,reversed)=>system.stackInteraction(event,'generate',reversed));"
                + "let slot={isActive:()=>true,allowModification:()=>true,mayPlace:()=>true,getItem:()=>gem};"
                + "let cursor={id:'test:agent',isEmpty:()=>false};"
                + "let gem={id:'test:gem',isEmpty:()=>false,getCount:()=>1};"
                + "let handled=false;let forwardResult=dispatcher({getPlayer:()=>player,getCarriedItem:()=>gem,"
                + "getStackedOnItem:()=>cursor,getSlot:()=>slot,getCarriedSlotAccess:()=>({get:()=>cursor}),"
                + "getClickAction:()=>({name:()=>'SECONDARY'}),"
                + "isCanceled:()=>handled,"
                + "setCanceled:value=>{handled=value;}});"
                + "if(!handled)throw new Error('actual stacking callback did not complete client prediction');"
                + "if(forwardResult!==true)throw new Error('forward interaction must return true');"
                + "if(!player.cooldowns.isOnCooldown('test:badge'))throw new Error('native cooldown missing');"
                + "player.advance(4);let blocked=system.stackInteraction({getPlayer:()=>player,getCarriedItem:()=>cursor,"
                + "getStackedOnItem:()=>gem,getSlot:()=>slot,getCarriedSlotAccess:()=>({get:()=>cursor})},'generate',false);"
                + "if(blocked!==true)throw new Error('cooldown interaction must return true');"
                + "if(!player.cooldowns.isOnCooldown('test:badge'))throw new Error('cooldown must remain active at tick four');"
                + "player.advance(1);if(player.cooldowns.isOnCooldown('test:badge'))throw new Error('cooldown must end at tick five');"
                + "let reverseHandled=false;let reverseSlot={isActive:()=>true,allowModification:()=>true,mayPlace:()=>true,getItem:()=>cursor};"
                + "let reverseResult=dispatcher({getPlayer:()=>player,getCarriedItem:()=>cursor,"
                + "getStackedOnItem:()=>gem,getSlot:()=>reverseSlot,getCarriedSlotAccess:()=>({get:()=>gem}),"
                + "getClickAction:()=>({name:()=>'SECONDARY'}),"
                + "isCanceled:()=>reverseHandled,setCanceled:value=>{reverseHandled=value;}});"
                + "if(!reverseHandled)throw new Error('actual reverse stacking callback did not complete client prediction');"
                + "if(reverseResult!==true)throw new Error('reverse interaction must return true');",
                "stacking-bean-callback", 1, null);
        System.out.println("PASS: actual stacking script returns boolean true and applies native cancellation; native cooldown bean access and 5-tick expiry work in Rhino.");
    }

    public static void main(String[] args) throws Exception {
        Context context = Context.enter();
        ScriptableObject scope = context.initStandardObjects();
        context.evaluateString(scope, "let global = {};", "bootstrap", 1, null);
        String stackingSource = null;
        for (String file : args) {
            String source = Files.readString(Path.of(file));
            context.compileString(source, file, 1, null);
            if (file.endsWith("17_containers.js")) verifyContainerRegistration(context, source);
            if (file.endsWith("25_inventory_stacking.js")) stackingSource = source;
            if (file.endsWith("30_processing_bridge.js")) verifyStackingNbt(context, scope, source);
            if (file.endsWith("00_catalog.js") || file.endsWith("10_rules.js") || file.endsWith("12_balance.js") || file.endsWith("13_processing_config.js") || file.endsWith("15_descriptions.js") || file.endsWith("16_processing.js") || file.endsWith("rhino_smoke.js")) {
                context.evaluateString(scope, source, file, 1, null);
            }
            if (file.endsWith("20_bridge.js")) {
                var converter = Pattern.compile("(?m)^  A\\.list=.*;$").matcher(source);
                if (!converter.find()) throw new IllegalStateException("Missing API list converter");
                scope.put(context, "ArrayList", scope, new NativeJavaClass(context, scope, ArrayList.class));
                context.evaluateString(scope, "let A=global.sdbfAstral;"
                        + converter.group(), "list-converter", 1, null);
                for (List<String> fixture : List.of(List.<String>of(), List.of("size"), List.of("size", "purity"),
                        List.of("size", "purity", "polish"), Collections.unmodifiableList(new ArrayList<>(List.of("purity"))))) {
                    scope.put(context, "apiList", scope, Context.javaToJS(context, fixture, scope));
                    scope.put(context, "expectedCount", scope, fixture.size());
                    context.evaluateString(scope, "{let converted=A.list(apiList);"
                            + "if(converted.length!==expectedCount)throw new Error('API list length');"
                            + "if(expectedCount && String(converted[0])!=='size' && String(converted[0])!=='purity')throw new Error('API list value');}",
                            "immutable-api-list", 1, null);
                }
                System.out.println("PASS: actual bridge converter handles empty, singleton, pair and larger immutable Java API lists.");
                scope.put(context, "HashMap", scope, new NativeJavaClass(context, scope, HashMap.class));
                scope.put(context, "Integer", scope, new NativeJavaClass(context, scope, Integer.class));
                scope.put(context, "apiMap", scope, Context.javaToJS(context, java.util.Map.of(0, "left", 1, "right"), scope));
                context.evaluateString(scope, "if(String(new HashMap(apiMap).get(Integer.valueOf(1)))!=='right')throw new Error('cell result map');",
                        "immutable-cell-map", 1, null);
                System.out.println("PASS: per-cell result map copy and Integer slot lookup in actual Rhino.");
            }
        }
        if (stackingSource != null) verifyStackingProperties(context, stackingSource);
        context.evaluateString(scope, "if(global.sdbfAstral.rules.length !== 84) throw new Error('catalog');"
                + "let fixture={schema:1,source_item:'thermal:ruby',primary:'alpha',natural:{size:200,purity:80,polish:40},"
                + "affixes:[{stat:'size',operation:'flat',value:20}],reinforcements:[],extensions:{}};"
                + "if(global.sdbfAstral.validate(fixture)!==null)throw new Error('payload');"
                + "if(global.sdbfAstral.effective(fixture).size!==220)throw new Error('dimensions');", "smoke", 1, null);
        System.out.println("PASS: actual Rhino syntax, catalogue initialization, payload validation, effective dimensions and supplied rule fixtures.");
    }
}
