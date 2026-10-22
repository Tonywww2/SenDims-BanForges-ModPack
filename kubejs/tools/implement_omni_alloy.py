"""Compile the approved route into KubeJS registrations, native recipes and assets.

Run from the pack root. Generated files are listed in the implementation manifest;
the approved design remains the source of the graph and stable workflow IDs.
"""
from __future__ import annotations

import collections
import json
from pathlib import Path
from omni_alloy_sources import STARTUP, SERVER, read_catalog, write_catalog, write_recipes

ROOT = Path(__file__).resolve().parents[2]
K = ROOT / "kubejs"
PLAN = json.loads((K / "docs/recipe-research/omni-alloy-route.json").read_text(encoding="utf-8"))
NODES = {n["id"]: n for n in PLAN["nodes"]}
RECIPES = {}
REG = {"items": {}, "blocks": {}, "fluids": {}}
PACKS = []
WORKFLOWS = {}
FILES = []
FLUID_TAGS = {}
MANIFEST = K / "docs/recipe-research/omni-alloy-implementation.json"
PREVIOUS_FILES = json.loads(MANIFEST.read_text(encoding="utf-8"))["generated_files"] if MANIFEST.exists() else []
PREVIOUS_REG = read_catalog()["registrations"] if STARTUP.exists() else {}
PREFIX = "sdbf:omni_alloy/"
SHIM = "kubejs:omni_process_liner"
PALETTE = {"bio": "93be6c", "aether": "81d2ef", "mana": "e395e9", "thermal": "74cace",
           "engineering": "edb85d", "pneumatic": "7fb1e8", "nuclear": "b3ce63", "precision": "d1b3e7"}


def write(path, data):
    p = K / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n" if not isinstance(data, str) else data,
                 encoding="utf-8")
    FILES.append(p.relative_to(ROOT).as_posix())


def ingredient(item, count=1):
    result = {"tag": item[1:]} if item.startswith("#") else {"item": item}
    if count != 1:
        result["count"] = count
    return result


def stack(item, count=1):
    return {"item": item, "count": count}


def add(ident, data, workflow=None):
    assert ident not in RECIPES, ident
    RECIPES[ident] = data
    if workflow:
        WORKFLOWS.setdefault(workflow, {"recipes": [], "mode": "native_recipe"})["recipes"].append(PREFIX + ident)


def item(ident, name, branch="precision", texture=None):
    texture = texture or {"bio":"minecraft:item/slime_ball","aether":"minecraft:item/prismarine_crystals",
        "mana":"minecraft:item/ender_pearl","thermal":"minecraft:item/iron_ingot",
        "engineering":"minecraft:item/copper_ingot","pneumatic":"minecraft:item/iron_nugget",
        "nuclear":"minecraft:item/nautilus_shell","precision":"minecraft:item/amethyst_shard"}[branch]
    REG["items"][ident] = {"name": name, "branch": branch, "texture": texture}
    return ident


def block(ident, name, branch):
    REG["blocks"][ident] = {"name": name, "branch": branch}
    return ident


def fluid(ident, name, branch):
    REG["fluids"][ident] = {"name": name, "branch": branch, "color": PALETTE[branch]}
    return ident


def fluid_tag(ident):
    tag = ident if ident in REG["fluids"] else "kubejs:omni_external/" + ident.replace(":", "/")
    FLUID_TAGS[tag] = ident
    return tag


def shapeless(ident, output, inputs, count=1, workflow=None):
    # Vanilla ingredients occupy individual slots; a count field is not a stack requirement.
    expanded = []
    for value in inputs:
        if isinstance(value, str):
            expanded.append(ingredient(value))
        else:
            value = dict(value)
            amount = value.pop("count", 1)
            expanded.extend([value] * amount)
    assert 1 <= len(expanded) <= 9, (ident, expanded)
    add(ident, {"type": "minecraft:crafting_shapeless", "ingredients": expanded,
        "result": stack(output, count)}, workflow)


def output(n):
    return n["output_contract"]["id"]


def in_items(n):
    return [ingredient(output(NODES[d])) for d in n["dependencies"] if "fluid" not in NODES[d]["output_contract"]]


def in_fluids(n):
    return [NODES[d]["output_contract"]["fluid"] for d in n["dependencies"] if "fluid" in NODES[d]["output_contract"]]


def raw(n, base, block_input=False):
    """Distinct low-value precursor for an otherwise parallel auxiliary operation."""
    ident = f"kubejs:omni_{n['id']}_precursor"
    if block_input:
        block(ident, n["label"] + "前驱块", n["branch"])
    else:
        item(ident, n["label"] + "原料", n["branch"])
    shapeless(n["id"] + "_prepare", ident, base)
    WORKFLOWS.setdefault(n["id"], {"recipes": [], "mode": "native_recipe"})["preparation"] = PREFIX + n["id"] + "_prepare"
    return ident


def pack(n, carrier, check=None, note="沿用原生加工产物，装配时消耗实物。", original=None):
    entry = {"step": n["id"], "output": output(n), "carrier": carrier,
             "check": check or "none", "note": note, "recipe": PREFIX + n["id"] + "_pack"}
    PACKS.append(entry)
    WORKFLOWS[n["id"]] = {"mode": "native_carrier", "recipes": [entry["recipe"]],
        "carrier": carrier, "check": entry["check"], "note": note}
    if original:
        WORKFLOWS[n["id"]]["original_recipe"] = original


def init_registrations():
    for n in NODES.values():
        if n.get("phase") == "early_supply":
            WORKFLOWS[n["id"]] = {"mode": "original_supply", "output": output(n)}
            continue
        out = n["output_contract"]
        name = out.get("label", n["label"] + ("构件" if n.get("phase") == "processing" else ""))
        branch = n.get("branch", "precision")
        if "fluid" in out:
            fluid(out["fluid"], name + "液", branch)
        elif "block" in out:
            block(out["block"], name, branch)
        else:
            item(out["id"], name, branch)
    item(SHIM, "工艺衬片", "precision", "minecraft:item/paper")
    shapeless("process_liner", SHIM, [ingredient("minecraft:iron_nugget", 4), "minecraft:paper"], 4)


def entries_and_assemblies():
    for n in NODES.values():
        if n.get("phase") == "stage5_entry":
            inputs = [ingredient(x["item"], x["count"]) for x in n["ingredients"]]
            inputs.extend(ingredient(output(NODES[x["source_node"]]), x["count"]) for x in n["consumed_inputs"])
            shapeless(n["id"], output(n), inputs)
        elif n.get("phase") == "assembly":
            inputs = [output(NODES[d]) for d in n["dependencies"]]
            assert len(inputs) <= 9
            alphabet = "ABCDEFGHI"
            cells = "".join(alphabet[:len(inputs)]).ljust(9)
            add(n["id"], {"type": "minecraft:crafting_shaped", "pattern": [cells[i:i+3] for i in range(0,9,3)],
                "key": {alphabet[i]: ingredient(value) for i, value in enumerate(inputs)}, "result": stack(output(n))})


def bio(n):
    ident=n["id"]; out=output(n); kind=n["recipe_identifier"]; items=in_items(n); fluids=in_fluids(n)
    if ident == "bio_01":
        data={"process":{"fluid":fluids[0]},"ingredient":ingredient("tofucraft:bittern_bottle"),"result":stack(out)}
    elif ident == "bio_03":
        data={"category":"misc","cook_time":200,"exp":0.1,"fluid":{"fluid":"minecraft:water"},
              "ingredients":[ingredient("tofucraft:blocktofukinu"),ingredient("minecraft:kelp")],"result":stack(out)}
    elif ident == "bio_07":
        data={"experience":0.1,"ingredients":items,"recipeTime":200,"results":[stack(out)]}
    elif ident == "bio_08":
        data={"experience":0.1,"ingredient":items[0],"recipeTime":40,"result":stack(out),
              "tool":{"tag":"sakura:tools/knives/fish"},"byproducts":[]}
    elif ident == "bio_09":
        data={"experience":0.1,"fluid":{"null_fluid":True},"ingredients":items,"recipeTime":200,"result":stack(out)}
    elif ident in {"bio_10","bio_11"}:
        inputs=[ingredient("minecraft:wheat"),ingredient("minecraft:sugar")]
        data={"experience":0.1,"fluid":{"fluidTag": fluid_tag(fluids[0] if fluids else "minecraft:water"), "amount":1000},
              "ingredients":inputs,"recipeTime":600,"results":[],
              "result_fluid":{"fluid":n["output_contract"]["fluid"],"amount":1000}}
    elif ident == "bio_13":
        src=raw(n,["tofucraft:blocktofukinu","minecraft:honeycomb"],True)
        data={"bee":"productivebees:water","from":{"Name":src},"to":{"Name":out}}
    elif ident == "bio_14":
        data={"bee":"productivebees:rancher_bee","ingredients":items,"result":stack(out)}
    elif ident == "bio_15":
        src=raw(n,["minecraft:honeycomb","minecraft:slime_ball"])
        data={"ingredient":ingredient(src),"outputs":[{"item":stack(out),"chance":1.0}]}
    elif ident == "bio_16":
        data={"fluid":{"tag":"forge:honey","amount":250},"input":items[0],"output":stack(out)}
    else:
        raise ValueError(ident)
    add(ident,{"type":kind,**data},ident)


def aether(n):
    ident=n["id"]; out=output(n); kind=n["recipe_identifier"]; items=in_items(n)
    if ident in {"aether_01","aether_02"}:
        data={"category":"enchanting_misc" if ident.endswith("01") else "freezable_blocks",
              "ingredient":items[0],"result":out,"cookingtime":400,"experience":0.1}
    elif ident == "aether_08":
        pack(n,"aether_redux:infused_veridium_axe",note="消耗原生注入后的维瑞迪姆斧；沿用 Redux 注入配方。")
        return
    elif ident == "aether_10":
        data={"category":"combinable_misc","experience":0.1,"ingredients":items+[
            ingredient("deep_aether:bio_crystal"),ingredient("aether:golden_amber")],"output":stack(out),"processing_time":200}
    elif ident == "aether_11":
        data={"ingredient":items[0],"result":stack(out)}
    elif ident == "aether_14":
        data={"from":items[0]["item"],"to":out}
    else:
        src=items[0]["item"] if items else raw(n,["aether:holystone","minecraft:amethyst_shard"],True)
        data={"ingredient":{"block":src},"result":{"block":out}}
        if ident == "aether_07": data["biome"]="#aether:ultracold"
    add(ident,{"type":kind,**data},ident)


def mana(n):
    ident=n["id"]; out=output(n); kind=n["recipe_identifier"]; items=in_items(n)
    if ident == "mana_01":
        data={"input":{"type":"block","block":items[0]["item"]},"output":{"name":out},"time":200}
    elif ident in {"mana_02","mana_03","mana_04"}:
        data={"input":{"type":"block","block":items[0]["item"]},"output":{"type":"block","block":out},"weight":1}
        if ident=="mana_04": data.update(biome_bonus=0,biome_bonus_tag="botania:marimorphosis_desert_bonus")
    elif ident in {"mana_05","mana_07","mana_08"}:
        data={"ingredients":items+[ingredient("botania:mana_diamond")],
              "result" if ident=="mana_08" else "output":stack(out)}
        if ident=="mana_05":data["reagent"]={"tag":"botania:seed_apothecary_reagent"}
        else:data["mana"]=500000 if ident=="mana_08" else 20000
    elif ident=="mana_06": data={"input":items[0],"output":stack(out),"mana":20000}
    elif ident=="mana_09": data={"ingredients":items,"output":[stack(out)]}
    elif ident=="mana_10":
        pack(n,"botania:brew_vial","brew_absorption",note="吸收效果的完整植物酿造药水瓶，至少四口剩余次数。")
        return
    elif ident=="mana_11":
        src=raw(n,["minecraft:lapis_lazuli","minecraft:amethyst_shard"])
        data={"input":ingredient(src),"requirements":{"eterna":30,"quanta":0,"arcana":0},
              "max_requirements":{"eterna":-1,"quanta":-1,"arcana":-1},"display_level":30,"result":stack(out)}
    elif ident=="mana_12":
        src=raw(n,["apotheosis:gem_dust","minecraft:amethyst_shard"])
        data={"input":ingredient(src),"outputs":[{"min_count":1,"max_count":1,"stack":stack(out)}]}
    elif ident=="mana_14":data={"base":items[0],"addition":ingredient("botania:terrasteel_ingot"),"result":stack(out)}
    elif ident=="mana_15":data={"ingredients":items[0],"result":stack(out),"time":200}
    else:raise ValueError(ident)
    add(ident,{"type":kind,**data},ident)


def thermal(n):
    ident=n["id"]; out=output(n); kind=n["recipe_identifier"]; items=in_items(n); fluids=in_fluids(n)
    if ident=="thermal_01":
        data={"pattern":[" A ","ABA"," A "],"key":{"A":ingredient("minecraft:iron_nugget"),"B":items[0]},"result":stack(out)}
    elif ident=="thermal_02":data={"ingredients":items+[ingredient("minecraft:coal")],"result":stack(out)}
    elif kind in {"minecraft:smelting","minecraft:blasting","minecraft:smoking","minecraft:campfire_cooking"}:
        data={"ingredient":items[0],"result":out,"experience":0.1,"cookingtime":600 if ident=="thermal_06" else 200}
    elif ident=="thermal_07":data={"ingredient":items[0],"result":out,"count":1}
    elif ident=="thermal_08":data={"template":ingredient("minecraft:netherite_upgrade_smithing_template"),
        "base":items[0],"addition":ingredient("titan_moon:cryo_alloy_ingot"),"result":stack(out)}
    elif ident in {"thermal_09","thermal_10","thermal_11"}:
        data={"ingredient":items[0],"result":[stack(out)],"energy":8000}
    elif ident=="thermal_12":data={"ingredients":items+[ingredient("minecraft:copper_ingot")],"result":[stack(out)],"energy":16000}
    elif ident=="thermal_13":data={"ingredients":items,"result":[stack(out)],"energy":8000}
    elif ident=="thermal_14":data={"ingredient":items[0],"result":[{"fluid":n["output_contract"]["fluid"],"amount":1000}],"energy":20000}
    elif ident=="thermal_15":data={"ingredients":[{"fluid":fluids[0],"amount":1000}],"result":[stack(out)],"energy":12000}
    elif ident=="thermal_16":
        src=raw(n,["thermal:bitumen","minecraft:kelp"])
        data={"ingredient":ingredient(src),"result":[stack(out)],"energy":8000}
    elif ident=="thermal_17":data={"ingredient":items[0],"result":[{"fluid":n["output_contract"]["fluid"],"amount":1000}],"energy":16000}
    elif ident=="thermal_18":data={"ingredient":{"fluid":fluids[0],"amount":1000},"result":[{"fluid":n["output_contract"]["fluid"],"amount":1000}],"energy":12000}
    elif ident=="thermal_19":data={"ingredients":[ingredient("minecraft:glass_bottle"),{"fluid":fluids[0],"amount":1000}],"result":[stack(out)],"energy":8000}
    elif ident=="thermal_20":
        # BrewerRecipeManager supports one item + one fluid and arbitrary fluid output.
        brewed=fluid("kubejs:omni_thermal_20_brew","相变抑制酿液","thermal")
        reagent=raw(n,["minecraft:blaze_powder","minecraft:ghast_tear"])
        add(ident,{"type":kind,"ingredients":[ingredient(reagent),{"fluid":"minecraft:water","amount":1000}],
            "result":[{"fluid":brewed,"amount":1000}],"energy":16000},ident)
        add(ident+"_bottle",{"type":"thermal:bottler","ingredients":[ingredient("minecraft:glass_bottle"),{"fluid":brewed,"amount":1000}],
            "result":[stack(out)],"energy":4000},ident)
        return
    elif ident=="thermal_21":data={"ingredients":items+[{"fluid":"minecraft:water","amount":1000}],"result":[stack(out)],"energy":16000}
    elif ident=="thermal_22":data={"ingredient":items[0],"result":[stack(out)],"energy":16000,"water_mod":1.0}
    else:raise ValueError(ident)
    add(ident,{"type":kind,**data},ident)


def engineering(n):
    ident=n["id"]; out=output(n); kind=n["recipe_identifier"]; items=in_items(n); fluids=in_fluids(n)
    if ident=="engineering_03":data={"item":items[0],"result":{"fluid":{"fluid":n["output_contract"]["fluid"],"amount":1000},"items":[]},"duration":100}
    elif ident=="engineering_04":data={"fluid":{"fluid":fluids[0],"amount":1000},"result":stack(out),"duration":100}
    elif ident=="engineering_05":data={"ingredients":[ingredient("integrateddynamics:crystalized_menril_chunk"),ingredient("dustandash:order_dust")],"level":1,"output":stack(out)}
    elif ident=="engineering_06":
        sheet=item("kubejs:omni_menril_foil","门瑞欧导电箔","engineering")
        add(ident+"_sheet",{"type":kind,"ingredients":items,"output":stack(sheet,25),"step1":True},ident)
        data={"key":{"A":ingredient(sheet),"catalyst":ingredient("dustandash:seep_dust")},
              "pattern":["AAAAA"]*5,"output":stack(out),"step1":False}
    elif ident=="engineering_07":data={"ingredients":items+[ingredient("dustandash:glass_container")],"outputs":[stack(out)]+[ingredient("dustandash:empty")]*7,"tick":200}
    elif ident=="engineering_08":
        src=raw(n,["minecraft:copper_ingot","minecraft:quartz"],True)
        data={"cost":1,"costElectrodes":True,"ingredients":[ingredient("dustandash:mantle_mixture"),ingredient("dustandash:oxygen"),
            ingredient("dustandash:earth_dust"),ingredient("minecraft:copper_ingot"),ingredient("dustandash:graphite_electrode")],
            "inputBlock":src,"outputBlock":out,"outputs":[ingredient("dustandash:empty")]*4,"tick":200}
    elif ident=="engineering_09":data={"inputs":[{"ingredient":x,"count":1} for x in items+[ingredient("enderio:conductive_alloy_ingot")]],"result":stack(out),"energy":16000,"experience":0.1}
    elif ident=="engineering_10":data={"input":items[0],"outputs":[{"item":stack(out),"chance":1.0,"optional":False}],"energy":8000}
    elif ident=="engineering_11":data={"inputs":items+[ingredient(x) for x in ["minecraft:slime_ball","minecraft:quartz","minecraft:copper_ingot","minecraft:redstone","minecraft:amethyst_shard"]],"output":stack(out),"energy":16000}
    elif ident=="engineering_12":
        # Existing enderman soul-binding recipe already provides the native carrier.
        pack(n,"kubejs:charged_soul_filter",original="sdbf:charged_soul_filter")
        return
    elif ident=="engineering_14":
        src=raw(n,["minecraft:glass_bottle","minecraft:redstone"])
        data={"fluid":{"fluid":"enderio:xp_juice","amount":250},"input":ingredient(src),"output":stack(out),"is_emptying":False}
    elif ident=="engineering_19":data={"input":{"ingredient":{"tag":"ad_astra:oil"},"millibuckets":1000},"result":{"fluid":n["output_contract"]["fluid"],"millibuckets":1000},"cookingtime":100,"energy":80}
    elif ident=="engineering_20":data={"ingredient":ingredient("minecraft:blue_ice"),"result":{"fluid":n["output_contract"]["fluid"],"millibuckets":1000},"cookingtime":200,"energy":80}
    elif ident=="engineering_22":
        materials=["minecraft:copper_ingot"]*14
        materials[0]=items[0]["item"];materials[8]="ad_astra:steel_tank";materials[9]="ad_astra:steel_tank";materials[12]="titan_moon:precision_components"
        data={"ingredients":[ingredient(x) for x in materials],"result":{"id":out,"count":1}}
    elif ident=="engineering_26":data={"ingredient":ingredient("sgjourney:pure_naquadah"),"input_fluid":{"id":fluids[0],"amount":1000},"output_fluid":{"id":n["output_contract"]["fluid"],"amount":1000},"progress":200}
    elif ident=="engineering_24":data={"crystal_base":{**items[0],"amount":1},"primary_ingredient":{"item":"minecraft:quartz","amount":1},
        "secondary_ingredient":{"item":"minecraft:amethyst_shard","amount":1},"deplete_primary":True,"deplete_secondary":True,
        "input_fluid":{"id":fluids[0],"amount":1000},"output":stack(out),"progress":200}
    else:raise ValueError(ident)
    add(ident,{"type":kind,**data},ident)


def pneumatic(n):
    ident=n["id"]; out=output(n); kind=n["recipe_identifier"]; items=in_items(n); fluids=in_fluids(n)
    if ident=="pneumatic_02":data={"inputs":items+[ingredient("minecraft:redstone")],"pressure":4.0,"results":[stack(out)]}
    elif ident in {"pneumatic_03","pneumatic_04"}:data={"input":items[0],"program":"drill" if ident.endswith("03") else "laser","result":stack(out)}
    elif ident=="pneumatic_05":data={"input":{"type":"pneumaticcraft:fluid","tag":"forge:crude_oil","amount":1000},"results":[{"fluid":n["output_contract"]["fluid"],"amount":1000}],"temperature":{"min_temp":373}}
    elif ident=="pneumatic_06":data={"fluid_input":{"type":"pneumaticcraft:fluid","fluid":fluids[0],"amount":1000},"item_input":ingredient("minecraft:slime_ball"),
        "fluid_output":{"fluid":n["output_contract"]["fluid"],"amount":1000},"pressure":3.0,"temperature":{"min_temp":423},"speed":0.2,"exothermic":False}
    elif ident=="pneumatic_07":data={"input1":{"type":"pneumaticcraft:fluid","fluid":fluids[0],"amount":1000},
        "input2":{"type":"pneumaticcraft:fluid","fluid":"minecraft:water","amount":250},"fluid_output":{"fluid":n["output_contract"]["fluid"],"amount":1000},"pressure":3.0,"time":200}
    elif ident=="pneumatic_08":data={"input":{"type":"pneumaticcraft:fluid","fluid":fluids[0],"amount":1000},"result":stack(out),"max_temp":273}
    elif ident=="pneumatic_11":data={"ingredient":items[0],"result":stack(out)}
    elif ident=="pneumatic_12":data={"ingredients":{"middle":items[0],"top":ingredient("ae2:calculation_processor_press")},"mode":"inscribe","result":stack(out)}
    elif ident in {"pneumatic_13","pneumatic_14"}:data={"ingredients":items+[ingredient("minecraft:redstone")],"result":stack(out),
        "circumstance":{"type":"explosion"} if ident.endswith("14") else {"type":"fluid","tag":"minecraft:water"}}
    elif ident=="pneumatic_15":
        src=raw(n,["minecraft:blue_ice","ae2:certus_quartz_crystal"],True)
        data={"input":{"block":{"id":src}},"output":{"block":{"id":out}},"mode":"heat"}
    elif ident=="pneumatic_16":
        pack(n,"pneumaticcraft:unassembled_pcb","uv_full",note="必须在紫外灯箱曝光至 100%，未曝光或部分曝光板不能封装。")
        return
    elif ident=="pneumatic_17":
        pack(n,"pneumaticcraft:empty_pcb",note="消耗原生蚀刻成功的空白 PCB；完全曝光后蚀刻避免失败。")
        return
    else:raise ValueError(ident)
    add(ident,{"type":kind,**data},ident)


def nuclear(n):
    ident=n["id"]; out=output(n); kind=n["recipe_identifier"]; items=in_items(n); fluids=in_fluids(n)
    data={"powerModifier":2.0,"timeModifier":2.0,"radiation":0.0}
    if ident=="nuclear_22":
        pack(n,"nuclearcraft:depleted_fuel_americium_hea_242",note="消耗固体裂变的原生乏燃料，后续在燃料后处理机继续处理。",
             original="nuclearcraft:fission_reactor_controller/americium_hea_242")
        return
    if ident=="nuclear_23":
        pack(n,"nuclearcraft:depleted_fuel_americium_hea_242_tr",note="消耗熔盐反应堆的原生乏燃料载体。",
             original="nuclearcraft:msr_controller/americium_hea_242_tr")
        return
    if ident=="nuclear_19":
        # This processor is FLUID -> FLUID, unlike the preceding solid decay step.
        bridge=fluid("kubejs:omni_nuclear_20_melt","稳定同位素熔体","nuclear")
        add(ident+"_melt",{"type":"nuclearcraft:melter","input":items,
            "outputFluids":[{"tag":fluid_tag(bridge),"amount":1000}],"powerModifier":2.0,"timeModifier":2.0,"radiation":0.0},ident)
        items=[];fluids=[bridge]
    if not items and not fluids:
        raw_items={"nuclear_07":"nuclearcraft:boron_ingot","nuclear_10":None,"nuclear_12":"minecraft:redstone",
                   "nuclear_17":None,"nuclear_24":None,"nuclear_26":None}
        base=raw_items[ident]
        if base:items=[ingredient(raw(n,[base,"minecraft:quartz"]))]
    if ident=="nuclear_10": fluids=["nuclearcraft:hydrochloric_acid","nuclearcraft:sodium_hydroxide_solution"]
    if ident=="nuclear_12": fluids=["minecraft:water"]
    if ident=="nuclear_17": fluids=["nuclearcraft:borax_solution"]
    if ident=="nuclear_24":
        charged=fluid("kubejs:omni_fusion_feed","聚变氘载液","nuclear")
        shapeless(ident+"_prepare",charged+"_bucket",["nuclearcraft:deuterium_bucket","minecraft:amethyst_shard"])
        fluids=[charged,"nuclearcraft:helium_3"]
        data.update(powerModifier=50000.0,timeModifier=20.0,temperature=1200.0,radiation=1.0)
    if ident=="nuclear_26":fluids=["nuclearcraft:high_pressure_steam"];data.update(heat=100.0)
    if ident=="nuclear_27":data={"heatRequired":400.0}
    if ident in {"nuclear_03"}:items.append(ingredient("nuclearcraft:boron_ingot"))
    if ident=="nuclear_11":items.append(ingredient("minecraft:iron_ingot"))
    if ident=="nuclear_14":items.append(ingredient("minecraft:quartz"))
    if ident=="nuclear_16":items.append(ingredient("minecraft:redstone"))
    if items:data["input"]=items
    if fluids:data["inputFluids"]=[{"tag":fluid_tag(f),"amount":1000} for f in fluids]
    if "fluid" in n["output_contract"]:data["outputFluids"]=[{"tag":fluid_tag(n["output_contract"]["fluid"]),"amount":1000}]
    else:data["output"]=[stack(out)]
    if ident=="nuclear_07":data["output"]=[ingredient("minecraft:iron_nugget")]
    if ident=="nuclear_31":data.update(crossSection=0.064,energyReleased=-20500,maxEnergy=145000,
        inputParticles=[{"amount":15625000,"focus":1.0,"meanEnergy":100000,"particle":"alpha"}],
        outputParticles=[{"amount":1,"focus":1.0,"meanEnergy":1,"particle":"neutron"}])
    add(ident,{"type":kind,**data},ident)


def precision(n):
    ident=n["id"]; out=output(n); kind=n["recipe_identifier"]
    if ident=="precision_01":
        # The native proudsoul serializer supports arbitrary ItemStack results
        # and merges enchantments; an exclusive output prevents loot bypasses.
        add(ident,{"type":kind,"ingredients":[ingredient("slashblade:proudsoul"),
            ingredient("slashblade:proudsoul"),ingredient("minecraft:iron_ingot"),ingredient(SHIM)],
            "result":stack(out)},ident)
    elif ident=="precision_04":
        add(ident,{"type":kind,"blade":ingredient("slashblade:slashblade_wood"),"ink":ingredient("minecraft:ink_sac"),
            "paper":ingredient("minecraft:paper"),"output":stack(out)},ident)
    elif ident=="precision_05":
        src=raw(n,["terra_curio:lucky_horseshoe","minecraft:amethyst_shard"])
        add(ident,{"type":kind,"ingredients":[ingredient(src),ingredient("terra_curio:honey_balloon")],"result":stack(out)},ident)
    elif ident=="precision_15":pack(n,"last_smith:blade_unfinished_4",note="单件刀胚在有水炼药锅中淬火，消耗一层水后封装。")
    elif ident=="precision_08":pack(n,"exposure:developed_black_and_white_film","developed_film",note="显影胶卷至少保留一帧真实拍摄数据，空胶卷不能封装。")
    elif ident=="precision_16":pack(n,"exposure:photograph","photograph",note="打印的照片必须具有有效拍摄标识，空白照片不能封装。")
    elif ident=="precision_10":pack(n,"exposure:aged_photograph","photograph",note="老化照片必须保留有效拍摄数据。")
    elif ident=="precision_17":pack(n,"exposure:stacked_photographs","photo_stack",note="照片叠至少包含两张具有有效拍摄标识的照片，整叠消耗。")
    elif ident=="precision_12":pack(n,"minecraft:potion","strong_swiftness",note="使用原生酿造的迅捷 II 药水，按 Potion 字段检查。")
    else:raise ValueError(ident)


def final_recipes():
    n=NODES["omni_seed"]
    add("omni_seed",{"type":n["recipe_identifier"],"result":stack(output(n)),
        "steps":[{"stack":stack(output(NODES[x["source_node"]])),"direction":x["direction"]} for x in n["steps"]]},"omni_seed")
    n=NODES["omni_billet"]
    add("omni_billet",{"type":n["recipe_identifier"],"result":stack(output(n)),"catalyst":ingredient("kubejs:omni_seed"),
        "ingredients":[ingredient(x["item"]) for x in n["ingredients"][1:]],
        "tier":n["tier"],"total_energy":n["total_energy"]},"omni_billet")
    n=NODES["omni_alloy_ingot"]
    add("omni_alloy_ingot",{"type":n["recipe_identifier"],"result":stack(output(n)),
        "ingredients":[{"stack":stack(x["item"],x["count"])} for x in n["ingredients"]],
        "clicks":n["clicks"],"cooldown":n["cooldown"],"levels":n["levels"]},"omni_alloy_ingot")


def build():
    init_registrations()
    entries_and_assemblies()
    adapters={"bio":bio,"aether":aether,"mana":mana,"thermal":thermal,"engineering":engineering,
              "pneumatic":pneumatic,"nuclear":nuclear,"precision":precision}
    for n in NODES.values():
        if n.get("phase")=="processing":adapters[n["branch"]](n)
    final_recipes()
    emit()


def emit():
    # Registration and presentation are emitted after every auxiliary is known.
    for ident,spec in REG["fluids"].items():
        fluid_tag(ident)
    for tag,ident in FLUID_TAGS.items():
        ns,path=tag.split(":",1)
        write(f"data/{ns}/tags/fluids/{path}.json",{"replace":False,"values":[ident]})
    emit_assets()
    catalog={"registrations":REG,"packaging":PACKS,
        "expected_recipe_ids":[PREFIX+x for x in RECIPES]+[x["recipe"] for x in PACKS],
        "workflows":WORKFLOWS,"design_revision":PLAN["revision"]}
    write_catalog(catalog)
    write_recipes({PREFIX+ident:recipe for ident,recipe in RECIPES.items()},catalog,
                 {ident:node["label"] for ident,node in NODES.items()})
    FILES.extend(path.relative_to(ROOT).as_posix() for path in (STARTUP,SERVER))
    write("docs/recipe-research/omni-alloy-implementation.json",{
        "status":"implemented_pending_game_restart_validation","design_revision":PLAN["revision"],
        "recipe_storage":"inline_kubejs_scripts",
        "workflows":WORKFLOWS,"recipes":list(RECIPES),"registrations":{k:len(v) for k,v in REG.items()},
        "generated_files":FILES,
        "interface_adjustments":["亚原子液化前增加核工熔化桥接。","热力药水酿造机使用已核对支持的专用流体输出，再灌装。",
            "固体裂变与熔盐反应堆沿用原生燃料／乏燃料，封装后参与本路线。"]})
    # Only obsolete files owned by the previous generated manifest are removed.
    for old in set(PREVIOUS_FILES)-set(FILES):
        target=(ROOT/old).resolve()
        assert target.is_relative_to(K.resolve()), old
        if target.is_file():target.unlink()
    print(f"Generated {len(RECIPES)} inline custom recipes; {len(PACKS)} native-carrier packaging recipes; {len(WORKFLOWS)} workflows")


def emit_assets():
    lang={}
    component_textures=emit_component_textures()
    from omni_textures.build import draw_catalog
    texture_files=draw_catalog(REG,K/"assets")
    FILES.extend(p.relative_to(ROOT).as_posix() for p in texture_files
                 if p.relative_to(ROOT).as_posix() not in FILES)
    for ident,spec in REG["items"].items():
        ns,path=ident.split(":",1)
        lang[f"item.{ns}.{path}"]=spec["name"]
        write(f"assets/{ns}/models/item/{path}.json",{"parent":"minecraft:item/generated","textures":{"layer0":component_textures.get(ident,spec["texture"])}})
    for ident,spec in REG["blocks"].items():
        ns,path=ident.split(":",1)
        lang[f"block.{ns}.{path}"]=spec["name"]
        write(f"assets/{ns}/blockstates/{path}.json",{"variants":{"":{"model":f"{ns}:block/{path}"}}})
        write(f"assets/{ns}/models/block/{path}.json",{"parent":"minecraft:block/cube_all","textures":{"all":spec["texture"]}})
        write(f"assets/{ns}/models/item/{path}.json",{"parent":f"{ns}:block/{path}"})
        write(f"data/{ns}/loot_tables/blocks/{path}.json",{"type":"minecraft:block","pools":[{"rolls":1,
            "entries":[{"type":"minecraft:item","name":ident}],"conditions":[{"condition":"minecraft:survives_explosion"}]}]})
    for ident,spec in REG["fluids"].items():
        ns,path=ident.split(":",1)
        lang[f"fluid.{ns}.{path}"]=spec["name"]
        lang[f"block.{ns}.{path}"]=spec["name"]
        lang[f"item.{ns}.{path}_bucket"]=spec["name"]+"桶"
        write(f"assets/{ns}/models/item/{path}_bucket.json",{"parent":"minecraft:item/generated",
            "textures":{"layer0":spec["bucket_texture"]}})
    existing_path=K/"assets/kubejs/lang/zh_cn.json"
    existing=json.loads(existing_path.read_text(encoding="utf-8-sig"))
    for group,entries in PREVIOUS_REG.items():
        for ident in entries:
            ns,path=ident.split(":",1)
            keys=([f"fluid.{ns}.{path}",f"block.{ns}.{path}",f"item.{ns}.{path}_bucket"] if group=="fluids"
                else [f"{'block' if group=='blocks' else 'item'}.{ns}.{path}"])
            for key in keys:
                if key not in lang:existing.pop(key,None)
    existing.update(lang)
    write("assets/kubejs/lang/zh_cn.json",existing)


def emit_component_textures():
    """Small original pixel sprites for the eight physical components and ingot."""
    from PIL import Image,ImageDraw
    result={}
    for branch in PLAN["branches"]:
        ident=branch["component_item"];kind=branch["id"]
        color=tuple(bytes.fromhex(PALETTE[kind]));dark=tuple(max(0,x//3) for x in color)
        light=tuple(min(255,x+55) for x in color)
        im=Image.new("RGBA",(16,16));d=ImageDraw.Draw(im)
        if kind=="bio":
            d.ellipse((1,2,14,13),fill=dark);d.ellipse((2,3,13,12),fill=color)
            for x,y in [(5,5),(9,5),(4,8),(8,8),(11,9)]:d.rectangle((x,y,x+1,y+1),fill=light)
        elif kind=="aether":
            d.ellipse((1,1,14,14),fill=dark);d.ellipse((3,3,12,12),fill=color)
            d.line((4,9,9,4),fill=light,width=2);d.rectangle((6,3,9,4),fill=(225,250,255))
        elif kind=="mana":
            d.polygon([(3,2),(12,2),(14,5),(14,11),(11,14),(4,14),(1,11),(1,5)],fill=dark)
            d.rectangle((4,4,11,11),fill=color);d.rectangle((6,6,9,9),fill=dark)
            d.line((3,5,3,10),fill=light);d.line((5,3,10,3),fill=light)
        elif kind=="thermal":
            d.polygon([(2,5),(7,1),(14,4),(14,12),(9,15),(2,12)],fill=dark)
            d.polygon([(3,6),(8,3),(13,5),(8,8)],fill=light)
            d.polygon([(3,7),(7,10),(7,13),(3,11)],fill=color)
            d.polygon([(9,9),(13,6),(13,11),(9,13)],fill=color)
        elif kind=="engineering":
            d.rectangle((3,2,12,13),fill=dark);d.rectangle((5,1,10,14),fill=dark)
            for y in (3,6,9,12):d.line((2,y,13,y),fill=color,width=2);d.point((3,y),fill=light)
            d.rectangle((6,3,9,12),fill=(45,52,63))
        elif kind=="pneumatic":
            d.rectangle((2,5,13,13),fill=dark);d.rectangle((3,6,12,12),fill=color)
            for x in (4,8,12):d.line((x,2,x,7),fill=light,width=2);d.line((x-1,2,x+1,2),fill=dark)
            d.rectangle((6,9,9,10),fill=dark)
        elif kind=="nuclear":
            d.ellipse((1,1,14,14),fill=dark);d.ellipse((2,2,13,13),fill=color)
            d.ellipse((5,5,10,10),fill=(0,0,0,0));d.line((3,4,5,2),fill=light,width=2)
            for box in [(0,6,3,9),(12,6,15,9),(6,0,9,3),(6,12,9,15)]:d.rectangle(box,fill=dark)
        else:
            d.rectangle((1,3,14,12),fill=dark);d.rectangle((2,4,13,11),fill=color)
            for x in range(3,13,2):d.line((x,4,x,11),fill=light)
        ns,path=ident.split(":");dest=K/f"assets/{ns}/textures/item/{path}.png"
        dest.parent.mkdir(parents=True,exist_ok=True);im.save(dest);FILES.append(dest.relative_to(ROOT).as_posix())
        result[ident]=f"{ns}:item/{path}"
    im=Image.new("RGBA",(16,16));d=ImageDraw.Draw(im)
    d.polygon([(1,8),(5,4),(12,4),(15,7),(12,12),(4,12),(1,10)],fill=(42,32,61))
    d.polygon([(2,8),(6,5),(12,5),(14,7),(10,10),(3,10)],fill=(222,222,248))
    for x,c in [(4,(134,214,236)),(6,(155,219,173)),(8,(224,214,134)),(10,(228,165,212))]:d.line((x,7,x+1,6),fill=c,width=2)
    d.line((3,11,11,11),fill=(126,101,165))
    dest=K/"assets/kubejs/textures/item/omni_alloy_ingot.png";im.save(dest);FILES.append(dest.relative_to(ROOT).as_posix())
    result["kubejs:omni_alloy_ingot"]="kubejs:item/omni_alloy_ingot"
    return result


if __name__=="__main__":
    build()
