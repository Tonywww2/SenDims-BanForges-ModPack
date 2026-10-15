"""Validate emitted route resources, real material edges and stage-five gates.

This is static validation, not a replacement for loading Forge and running machines.
"""
from __future__ import annotations

import collections
import json
import re
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
K=ROOT/"kubejs"


def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def main():
    plan=read(K/"docs/recipe-research/omni-alloy-route.json")
    data=read(K/"config/omni_alloy.json")
    reg=data["registrations"]
    records={r["id"] for r in read(K/"docs/recipe-research/recipe-types.json")["records"]}
    recipes={p.stem:read(p) for p in (K/"data/sdbf/recipes/omni_alloy").glob("*.json")}
    native_ids={x["step"] for x in data["packaging"]}
    nodes={n["id"]:n for n in plan["nodes"]}
    planned={n["id"] for n in nodes.values() if n.get("phase") in {"processing","early_supply"}}
    planned|={"omni_seed","omni_billet","omni_alloy_ingot"}
    assert planned==set(data["workflows"]), "workflow omitted or added"
    removed={x["step"] for x in plan["removed_workflow_steps"]}
    assert not removed & data["workflows"].keys(), "cancelled workflow restored"

    text=(K/"probe/generated/globals.d.ts").read_text(encoding="utf-8-sig")
    known={}
    for kind in ("Item","Fluid","Block","ItemTag","FluidTag","BlockTag"):
        match=re.search(r"^\s*type "+kind+r" = (.+);$",text,re.M)
        known[kind]=set(re.findall(r'"([^\"]+)"',match[1])) if match else set()
    # Current dimension mods were installed after the snapshot.
    for jar in (ROOT/"mods").glob("*.jar"):
        with zipfile.ZipFile(jar) as z:
            for name in z.namelist():
                match=re.fullmatch(r"assets/([^/]+)/models/item/(.+)\.json",name)
                if match:known["Item"].add(match[1]+":"+match[2])
    for script in (K/"startup_scripts").rglob("*.js"):
        for value in re.findall(r"event\.create\(['\"]([^'\"]+)['\"]",script.read_text(encoding="utf-8-sig")):
            known["Item"].add(value if ":" in value else "kubejs:"+value)
    custom_items=set(reg["items"])|set(reg["blocks"])|{f+"_bucket" for f in reg["fluids"]}
    known["Item"]|=custom_items
    known["Fluid"]|=set(reg["fluids"])
    known["Block"]|=set(reg["blocks"])|set(reg["fluids"])
    tags={}
    for path in (K/"data/kubejs/tags/fluids").rglob("*.json"):
        ident="kubejs:"+path.relative_to(K/"data/kubejs/tags/fluids").as_posix()[:-5]
        tags[ident]=read(path)["values"]
        known["FluidTag"].add(ident)
    output_keys={"result","results","output","outputs","outputFluids","result_fluid","output_fluid","fluid_output","item_output","to","outputBlock"}

    def refs(obj, default=None):
        found=set()
        if isinstance(obj,str):
            if ":" in obj and not obj.startswith("#"):found.add(obj)
        elif isinstance(obj,list):
            for x in obj:found|=refs(x,default)
        elif isinstance(obj,dict):
            for key,value in obj.items():
                if key in {"item","fluid","block","id","Name","name","from","inputBlock","outputBlock","to","result"} and isinstance(value,str):
                    found.add(value)
                elif key in {"tag","fluid_tag","fluidTag"}:
                    found.update(tags.get(value,[]))
                elif isinstance(value,(list,dict)):
                    found|=refs(value,default)
        return {f[:-7] if f.endswith("_bucket") and f[:-7] in known["Fluid"] else f for f in found}

    def verify_ids(obj, recipe):
        if isinstance(obj,dict):
            for key,value in obj.items():
                kind={"item":"Item","fluid":"Fluid","block":"Block"}.get(key)
                if kind and isinstance(value,str):assert value in known[kind], (recipe,kind,value)
                verify_ids(value,recipe)
        elif isinstance(obj,list):
            for value in obj:verify_ids(value,recipe)

    io={}
    for ident,r in recipes.items():
        assert r["type"] in records, (ident,"unknown serializer",r["type"])
        verify_ids(r,ident)
        inp={key:value for key,value in r.items() if key not in output_keys}
        out={key:value for key,value in r.items() if key in output_keys}
        io[ident]=(refs(inp),refs(out))
        if r["type"]=="minecraft:crafting_shaped":
            pattern=r["pattern"];assert 1<=len(pattern)<=3 and all(1<=len(x)<=3 for x in pattern)
            assert set("".join(pattern))-{ " " }==set(r["key"]),ident
        if r["type"]=="minecraft:crafting_shapeless":assert 1<=len(r["ingredients"])<=9,ident
        if r["type"]=="deeprealm_4th:projection_combining":assert len(r["steps"])<=9,ident
        if r["type"]=="enderio:alloy_smelting":assert "result" in r and all("ingredient" in x and x["count"]>0 for x in r["inputs"])
        if r["type"]=="enderio:slicing":assert len(r["inputs"])==6
        if r["type"]=="dustandash:centrifuge":assert len(r["outputs"])==8 and len(r["ingredients"])==2
        if r["type"]=="nuclearcraft:subatomic_liquifier":assert r.get("inputFluids") and not r.get("input")
        if r["type"].startswith("nuclearcraft:"):
            for key in ("inputFluids","outputFluids"):
                for f in r.get(key,[]):assert f["tag"] in known["FluidTag"] and f["amount"]>0,(ident,key,f)
    for entry in data["packaging"]:
        assert entry["carrier"] in known["Item"],entry
        ident=entry["recipe"].split("/")[-1]
        io[ident]=({entry["carrier"],"kubejs:omni_process_liner"},{entry["output"]})

    def token(node):
        out=node["output_contract"]
        return out.get("fluid",out["id"])

    # Test the actual emitted consumers, including the extra liquid bridge.
    for n in nodes.values():
        if n.get("phase")=="early_supply":continue
        if n["id"] in data["workflows"]:
            names=[r.split("/")[-1] for r in data["workflows"][n["id"]]["recipes"]]
        else:names=[n["id"]]
        consumed=set().union(*(io[name][0] for name in names))
        produced=set().union(*(io[name][1] for name in names))
        assert token(n) in produced,(n["id"],"missing producer",token(n),produced)
        for d in n["dependencies"]:
            assert token(nodes[d]) in consumed,(n["id"],"broken material edge",d)

    # Flood the graph with all non-route auxiliaries, but withhold S5 entrance
    # materials. Free generators must not yield any finished branch component.
    all_tokens=set().union(*(a|b for a,b in io.values()))
    custom=set(reg["items"])|set(reg["blocks"])|set(reg["fluids"])
    stage5=set(plan["stage5_entry_totals_per_ingot"])
    available=all_tokens-custom-stage5
    changed=True
    while changed:
        changed=False
        for inp,out in io.values():
            if inp<=available and not out<=available:
                available|=out;changed=True
    for b in plan["branches"]:assert b["component_item"] not in available,(b["id"],"S5 bypass")
    assert "kubejs:omni_alloy_ingot" not in available
    lang=read(K/"assets/kubejs/lang/zh_cn.json")
    for ident in custom_items:
        key=("block." if ident in reg["blocks"] else "item.")+ident.replace(":",".")
        assert key in lang,(ident,"missing Chinese name")
    for ident,spec in reg["blocks"].items():
        ns,path=ident.split(":")
        assert (K/f"data/{ns}/loot_tables/blocks/{path}.json").exists()
    assert "kubejs:omni_bio_02_block" not in reg["blocks"]
    assert "kubejs:omni_nuclear_33" not in reg["items"]
    assert not any(r["type"] in {"tofucraft:harder","tofucraft:harden","nuclearcraft:analyzer"} for r in recipes.values())
    print(f"PASS: {len(recipes)} data recipes + {len(data['packaging'])} checked carrier recipes; {len(planned)} workflows")
    print("PASS: item/fluid references, serializer IDs, slot capacities, actual material edges, Chinese names, block drops, S5 gate")
    print("Runtime machines, native state APIs and world interactions still require a full Forge restart and in-game validation.")


if __name__=="__main__":main()
