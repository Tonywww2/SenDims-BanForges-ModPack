from items_common import *
mat('tofu','ebe3c4'); mat('kelp','3c6a2e'); mat('ceram','dcddd2'); mat('culture','7fb85e'); mat('paste','b4ba8a')
mat('cook','c88a40'); mat('sear','6e4220'); mat('memb','7fb468'); mat('enz','e8a53a'); mat('wax','e9bd4e')
mat('honey','c47418'); mat('slime','74c254'); mat('glass','cfe8ee'); mat('seal','b4452a'); mat('steam','e6eae8')

@reg('item/omni_bio_03','豆腐锅构件')
def _():
    c=I('CUBE',['tofu'])
    # kelp ribbon: across top face through center, down the front edge, plus knot
    for y in range(1,8):
        for x in range(6,10):
            cell=c.get(x,y)
            if cell and cell[1]>0: c.set(x,y,'kelp',3 if x<8 else 2)
    for y in range(8,14):
        for x in (7,8):
            cell=c.get(x,y)
            if cell and cell[1]>0: c.set(x,y,'kelp',2 if x==7 else 1)
    g(c,["oo..oo",
         "o3oo3o",
         ".o44o."],{'o':('kelp',0),'3':('kelp',3),'4':('kelp',4)},ox=5,oy=0)
    Sx(c,[(3,6),(4,9),(11,6),(12,9)],'tofu',5)
    return fin(c)

@reg('item/omni_bio_assembly_1','陶瓷承压膜')
def _():
    c=I('DISC',['ceram'])
    S(c,[(4,5),(7,4),(10,5),(5,7),(8,6),(11,7),(6,8),(9,8),(3,7),(12,6)],'culture',2)
    S(c,[(7,5),(10,6),(5,6)],'ceram',5)
    return fin(c)

@reg('item/omni_bio_07','石臼研磨构件')
def _():
    c=I('MOUND',['paste'])
    Sx(c,[(6,9),(9,8),(4,11),(10,11),(7,12),(12,10)],'culture',2)
    Sx(c,[(5,8),(8,10),(11,9)],'culture',4)
    return fin(c)

@reg('item/omni_bio_08','砧板切制构件')
def _():
    c=I('SLICES',['paste'],extra={'x':('culture',2)})
    return fin(c)

@reg('item/omni_bio_09','烹饪构件')
def _():
    c=I('SLICES',['cook'],extra={'x':('sear',2)})
    for row,pts in ((0,[(9,0),(10,1)]),(1,[(12,0)])): pass
    H(c,[(1,4),(2,3),(1,2),(4,2),(5,1),(4,0)],'eef1ee')
    H(c,[(2,2),(5,0)],'c9cfcc')
    return fin(c)

@reg('item/omni_bio_assembly_2','代谢催化膜')
def _():
    c=I('DISC',['memb'])
    # veins
    S(c,[(3,6),(4,6),(5,5),(6,5),(7,5),(8,6),(9,6),(10,7),(11,7)],'memb',2)
    S(c,[(7,4),(7,6),(7,7)],'memb',2)
    # enzyme granules
    S(c,[(5,7),(10,5),(12,6),(4,4)],'enz',4); S(c,[(9,8),(3,8)],'enz',3)
    return fin(c)

@reg('item/omni_bio_14','蜜蜂物品转化构件')
def _():
    c=I('CUBE',['wax'])
    # hex cells on top face and sides
    for (x,y) in [(7,2),(5,3),(9,3),(3,4),(7,4),(11,4),(5,5),(9,5),(7,6)]:
        S(c,[(x,y),(x+1,y)],'honey',2)
    for (x,y) in [(3,7),(5,9),(3,11),(5,12),(10,8),(12,7),(10,11),(12,10)]:
        S(c,[(x,y)],'honey',1)
    return fin(c)

@reg('item/omni_bio_15_precursor','蜂蜜离心原料')
def _():
    c=I('MIX',['wax','slime'])
    S(c,[(3,12),(6,13),(9,12),(12,12),(7,11)],'honey',2)
    S(c,[(4,8),(10,7)],'slime',5)
    return fin(c)

@reg('item/omni_bio_15','蜂蜜离心构件')
def _():
    c=I('PUCK',['honey'])
    for y in range(16):
        for x in range(16):
            cell=c.get(x,y)
            if not cell or cell[1]==0: continue
            if y<=6: c.set(x,y,'wax',cell[1])
            elif y<=8: c.set(x,y,'wax',max(1,cell[1]-1))
    S(c,[(7,4),(8,4)],'honey',2)
    return fin(c)

@reg('item/omni_bio_16','蜂蜜灌装构件')
def _():
    c=I('VIAL',['glass','seal'],extra={'x':('honey',4),'y':('honey',5),'z':('honey',2)})
    return fin(c)
