from items_common import *
# ---------- AETHER ----------
mat('ice','bfe6f0'); mat('frost','eef8fb'); mat('cryo','8fb3cc'); mat('amb','e8b83a'); mat('star','b9a6e8')
mat('amber','d99a2b'); mat('biocr','49c2b0'); mat('poison','8a4fb0'); mat('spore','5fe0c8'); mat('veri','3fb59a')
mat('liner','ddd2b4'); mat('iron','a9adb2')

def lensify(c, glass, bezel):
    pass

@reg('item/omni_aether_feed','冰晶光学毛坯')
def _():
    c=I('CHUNK',['ice'])
    Sx(c,[(6,9),(9,7),(10,10)],'star',3); Sx(c,[(7,9)],'star',4)
    Sx(c,[(5,5),(4,6),(8,4)],'frost',4)
    return fin(c)

@reg('item/omni_aether_01','祭坛附魔加工构件')
def _():
    c=I('CHUNK',['ice'])
    Sx(c,[(4,6),(5,5),(6,4),(7,3)],'frost',5)
    for (x,y) in [(5,8),(6,7),(8,9),(9,8),(10,11),(11,10),(7,11)]: c.set(x,y,'amb',4)
    for (x,y) in [(6,8),(9,9),(11,11)]: c.set(x,y,'amb',5)
    return fin(c)

@reg('item/omni_aether_02','冰冻器加工构件')
def _():
    c=I('CHUNK',['ice'])
    for y in range(2,8):
        for x in range(16):
            cell=c.get(x,y)
            if cell and cell[1]>0: c.set(x,y,'frost',min(5,cell[1]+1))
    # icicles hanging below
    for (x,y0,l) in [(4,14,2),(7,15,1),(10,14,1),(12,13,2)]:
        for k in range(l): c.set(x,y0+k,'frost',3)
        c.set(x,y0+l,'frost',0)
    return fin(c)

def lens(glass, bezel, extra_pts=None):
    c=I('LENS',[glass,'frost',bezel])
    return c

@reg('item/omni_aether_assembly_1','极寒折射镜坯')
def _():
    c=I('LENS',['ice','ice','cryo'])
    Sx(c,[(6,8),(9,6),(10,10),(5,11)],'frost',5)
    return fin(c)

@reg('item/omni_aether_10','深天境组合构件')
def _():
    c=I('LENS',['ice','ice','amber'])
    for (x,y) in [(8,1),(1,8),(14,8),(8,14)]:
        c.set(x,y,'biocr',4); 
    for (x,y) in [(7,1),(9,1),(1,7),(1,9),(14,7),(14,9),(7,14),(9,14)]: c.set(x,y,'biocr',2)
    return fin(c)

@reg('item/omni_aether_11','毒液浸泡构件')
def _():
    c=I('LENS',['poison','poison','amber'])
    Sx(c,[(5,4),(6,4),(4,5),(4,6)],'frost',5)
    H(c,[(5,15),(10,15)],'6b3a8a')
    return fin(c)

@reg('item/omni_aether_assembly_2','孢光镀层镜片')
def _():
    c=I('LENS',['poison','poison','amber'])
    for (x,y) in [(4,7),(6,9),(8,5),(10,8),(11,11),(7,11),(9,12),(12,6),(5,10),(9,3)]:
        c.set(x,y,'spore',5)
    for (x,y) in [(5,7),(7,9),(9,5),(11,8),(12,11)]: c.set(x,y,'spore',3)
    return fin(c)

# ---------- MANA ----------
mat('lrock','e8e4d6'); mat('mana','5ec8f0'); mat('petal1','e86a9a'); mat('petal2','f2d04a'); mat('petal3','8ad86a')
mat('rune','8f6fe8'); mat('terra','4fbf4a'); mat('elem','f08ac8'); mat('ameth','a66ee0'); mat('lapis','3a5bc8')
mat('gemd','cfd3e0'); mat('brew','f0d040'); mat('diam','9fe8f4'); mat('ignem','e8683a'); mat('ore','7ad0c0')

def wall(base):
    return I('WALLSEG',[base])

@reg('item/omni_mana_assembly_1','四相活石腔壁')
def _():
    c=wall('lrock')
    phases=[('lrock',None),('ore',None),('ignem',None),('rune',None)]
    # color arch quadrants: left-bottom, left-top, right-top, right-bottom
    for (x,y) in region(c,'lrock'):
        l=c.get(x,y)[1]
        if l==0: continue
        if x<8 and y>=7: m='ore'
        elif x<8: m='lrock'
        elif y<7: m='ignem'
        else: m='rune'
        c.set(x,y,m,l)
    return fin(c)

@reg('item/omni_mana_05','花瓣药剂台构件')
def _():
    c=wall('lrock')
    for i,(x,y) in enumerate([(2,6),(3,3),(6,2),(10,2),(13,4),(13,8),(2,10),(14,11)]):
        c.set(x,y,['petal1','petal2','petal3'][i%3],4)
    c.set(7,1,'diam',5); c.set(8,1,'diam',4)
    return fin(c)

@reg('item/omni_mana_06','魔力池注入构件')
def _():
    c=wall('lrock')
    for (x,y) in region(c,'lrock'):
        l=c.get(x,y)[1]
        if l and (x+y)%3==0: c.set(x,y,'mana',min(5,l+1))
    for (x,y) in [(2,8),(3,5),(5,3),(8,2),(11,3),(13,6),(13,10)]: c.set(x,y,'mana',5)
    return fin(c)

@reg('item/omni_mana_07','符文祭坛构件')
def _():
    c=wall('lrock')
    for (x,y) in region(c,'lrock'):
        l=c.get(x,y)[1]
        if l: c.set(x,y,'lrock',max(2,l-1))
    for (x,y) in [(2,9),(2,11),(3,5),(5,3),(7,2),(9,2),(11,3),(13,6),(13,9),(13,11)]: c.set(x,y,'rune',5)
    return fin(c)

@reg('item/omni_mana_08','泰拉凝聚板构件')
def _():
    c=wall('terra')
    for (x,y) in [(3,4),(5,2),(10,2),(12,4)]: c.set(x,y,'terra',5)
    return fin(c)

@reg('item/omni_mana_09','精灵门交易构件')
def _():
    c=wall('elem')
    for (x,y) in [(3,4),(5,2),(10,2),(12,4),(2,9)]: c.set(x,y,'elem',5)
    return fin(c)

@reg('item/omni_mana_assembly_2','符文谐振内衬')
def _():
    c=I('LINER',['rune'])
    for (x,y) in [(4,8),(5,7),(6,6),(7,5),(8,4),(9,3),(7,9),(8,8),(9,7),(10,6),(11,5),(12,4)]:
        if c.get(x,y): c.set(x,y,'mana',5 if (x%2) else 4)
    return fin(c)

@reg('item/omni_mana_14','武器融合构件')
def _():
    c=I('LINER',['rune'])
    for (x,y) in region(c,'rune'):
        l=c.get(x,y)[1]
        if l and (x+y) in (12,13,17,18): c.set(x,y,'terra',4 if (x+y) in (12,17) else 2)
    for (x,y) in [(5,5),(10,4)]: c.set(x,y,'terra',5)
    return fin(c)

@reg('item/omni_mana_15','紫晶祝福构件')
def _():
    c=I('LINER',['rune'])
    g(c,["..o...",
         ".o5o.o",
         ".o4oo5o",
         "o54o43o"],{'o':('ameth',0),'5':('ameth',5),'4':('ameth',4),'3':('ameth',3)},ox=4,oy=2)
    g(c,[".o.",
         "o5o",
         "o3o"],{'o':('ameth',0),'5':('ameth',5),'3':('ameth',3)},ox=11,oy=4)
    return fin(c)

@reg('item/omni_mana_11_precursor','神化附魔原料')
def _():
    c=I('MIX',['ameth','lapis'])
    return fin(c)

@reg('item/omni_mana_11','神化附魔构件')
def _():
    c=I('GEM',['ameth'])
    H(c,[(13,1),(2,12),(14,10)],'ffffff'); H(c,[(12,1),(13,0),(14,1),(13,2)],'d8b8ff')
    return fin(c)

@reg('item/omni_mana_12_precursor','神化分解原料')
def _():
    c=I('MIX',['gemd','ameth'])
    return fin(c)

@reg('item/omni_mana_12','神化分解构件')
def _():
    c=I('SHARDS',['ameth'])
    for (x,y) in region(c,'ameth'):
        l=c.get(x,y)[1]
        if y>=10 and x<6: c.set(x,y,'mana',l)
        elif x>=11: c.set(x,y,'terra',l)
    return fin(c)
