from items_common import *
mat('paper','eee4c8'); mat('ironb','b8bcc4')

def card(icon, cmap, ox=3, oy=3, clip=True):
    c=I('CARD',['paper'],extra={'k':('ironb',3)})
    for y,row in enumerate(icon):
        for x,ch in enumerate(row):
            if ch=='.': continue
            c.rgba(ox+x,oy+y,cmap[ch])
    if clip:
        for (x,y,col) in [(6,1,'5d6168'),(7,1,'5d6168'),(8,1,'5d6168'),(9,1,'5d6168'),(6,2,'c4c8ce'),(7,2,'e6e8ec'),(8,2,'c4c8ce'),(9,2,'8e939a')]:
            c.rgba(x,y,col)
    return fin(c)

O='2a2a30'
@reg('item/omni_aether_08','注入加工构件')
def _():
    return card([
"..ooo....",
".oTTTo...",
"oTtTTTo..",
"oTTttTTo.",
".oTTTTTo.",
"..oTTToh.",
"...ooohh.",
".....hh..",
"....hh...",
"...hh...."],{'o':'1c4a40','T':'3fb59a','t':'9af0d8','h':'7a5a34'},ox=3,oy=2)

@reg('item/omni_mana_10','植物酿造构件')
def _():
    return card([
"...ooo...",
"...oWo...",
"...ooo...",
"..oGGGo..",
".oGyyyGo.",
".oyYYYyo.",
".oyYYYyo.",
".oyyYyyo.",
"..oyyyo..",
"...ooo..."],{'o':'34424a','W':'e8e0d0','G':'d8eef0','y':'d8a830','Y':'f6dc58'},ox=3,oy=2)

@reg('item/omni_engineering_12','灵魂绑定构件')
def _():
    return card([
"..oooo...",
".oSSSSo..",
"oSdSdSSo.",
"oSSsSsSo.",
"oSdSdSSo.",
"oSSsSsSo.",
".oSSSSo..",
"..oooo..."],{'o':'153a3c','S':'4fd8d0','s':'b8fff6','d':'1f5a5e'},ox=3,oy=3)

def pcb(trace, glow=None):
    rows=[
"ooooooooo",
"oGGGGGGGo",
"oGtttGGGo",
"oGGGtGGGo",
"oGtGtttGo",
"oGtGGGtGo",
"oGtttGtGo",
"oGGGGGGGo",
"ooooooooo"]
    cm={'o':'1e3a24','G':'3a8a4a','t':trace}
    return rows,cm

@reg('item/omni_pneumatic_16','PCB 紫外曝光构件')
def _():
    rows,cm=pcb('c890ff'); cm['G']='4a6a8a'
    return card(rows,cm,ox=3,oy=3)

@reg('item/omni_pneumatic_17','PCB 蚀刻构件')
def _():
    rows,cm=pcb('e09a50')
    return card(rows,cm,ox=3,oy=3)

@reg('item/omni_nuclear_22','固体裂变构件')
def _():
    return card([
"...ooo...",
"..oRRRo..",
"..oRrRo..",
"..oRRRo..",
"..oGGGo..",
"..oGgGo..",
"..oGGGo..",
"..oGgGo..",
"..oGGGo..",
"...ooo..."],{'o':'2a2c30','R':'b05a4a','r':'f08a6a','G':'7a8a7a','g':'a8b8a0'},ox=3,oy=2)

@reg('item/omni_nuclear_23','熔盐反应堆构件')
def _():
    return card([
"..oooo...",
".oKKKKo..",
"oKkkkkKo.",
"oKkCCkKo.",
"oKkCCkKo.",
"oKkkkkKo.",
".oKKKKo..",
"..oooo..."],{'o':'101012','K':'3a3a42','k':'6a6a74','C':'f0903a'},ox=3,oy=3)

@reg('item/omni_precision_15','炼药锅淬火构件')
def _():
    return card([
"......w.o",
".....w.oB",
"......oBo",
".....oBo.",
"....oBo..",
"...oBo...",
"..oBo....",
".ohoo....",
"ohho.....",
".oo......"],{'o':'2a2c30','B':'c8ccd4','h':'7a5a34','w':'f0f2f0'},ox=3,oy=2)

@reg('item/omni_precision_08','胶卷显影构件')
def _():
    return card([
"ooooooooo",
"o.o.o.o.o",
"oFFoFFoFo",
"oFfoFfoFo",
"oFFoFFoFo",
"o.o.o.o.o",
"ooooooooo"],{'o':'18181c','.':'5a5a62','F':'d8d8d0','f':'8a8a84'},ox=3,oy=4)

def photo(sky, land, frame='f4f2ea', sun='f0e070'):
    return [
"ooooooooo",
"offffffo.",
"ofSSSsSfo",
"ofSSSSSfo",
"ofLLSSSfo",
"ofLLLLSfo",
"ofLLLLLfo",
"offffffo.",
"ooooooooo"],{'o':'3a3a40','f':frame,'S':sky,'s':sun,'L':land}

@reg('item/omni_precision_16','照片打印构件')
def _():
    rows,cm=photo('8ac8f0','5aa84a'); rows=[r.replace('.','f') if i in (1,7) else r for i,r in enumerate(rows)]
    return card(rows,cm,ox=3,oy=3)

@reg('item/omni_precision_10','照片老化构件')
def _():
    rows,cm=photo('d8b888','8a6a40',frame='e4d4b0',sun='f0d8a0'); rows=[r.replace('.','f') if i in (1,7) else r for i,r in enumerate(rows)]
    return card(rows,cm,ox=3,oy=3)

@reg('item/omni_precision_17','照片叠放构件')
def _():
    return card([
"..ooooooo",
"..offffo.",
".ooooooof",
".offffffo",
"oooooooo.",
"offffffo.",
"ofSSSsfo.",
"ofLLSSfo.",
"ofLLLLfo.",
"offffffo.",
"oooooooo."],{'o':'3a3a40','f':'f4f2ea','S':'8ac8f0','s':'f0e070','L':'5aa84a'},ox=3,oy=2,clip=False)

@reg('item/omni_precision_12','原版酿造构件')
def _():
    return card([
"...ooo...",
"...oWo...",
"...ooo...",
"..oGGGo..",
".oGbbbGo.",
"obbBBBbbo",
"obBBBBBbo",
"obbBBBbbo",
".obbbbbo.",
"..ooooo.."],{'o':'34424a','W':'c8a070','G':'d8eef0','b':'5ab8e8','B':'8ad8ff'},ox=3,oy=2)
