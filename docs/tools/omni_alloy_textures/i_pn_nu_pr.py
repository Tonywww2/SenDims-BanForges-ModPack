from items_common import *
# ---------- PNEUMATIC ----------
mat('hyd','8aa6c0'); mat('ciron','6e7a88'); mat('brass','d8b04a'); mat('laser','ff3a3a'); mat('plast','e8eef2')
mat('gasket','4a8ad8'); mat('certus','a8d8f0'); mat('fluix','8a5ad0'); mat('gold','e8c040'); mat('heat','f0803a'); mat('cold','8ad0f0')
mat('spark','fff0a0')

@reg('item/omni_pneumatic_feed','氢压阀体毛坯')
def _():
    c=I('VALVE',['hyd','hyd'],extra={'x':('hyd',2)})
    for (x,y) in [(6,8),(9,11),(4,10)]: c.set(x,y,'hyd',2)
    return fin(c)

@reg('item/omni_pneumatic_02','压力室构件')
def _():
    return fin(I('VALVE',['ciron','ciron'],extra={'x':('ciron',2)}))

@reg('item/omni_pneumatic_03','装配钻床构件')
def _():
    c=I('VALVE',['ciron','ciron'],extra={'x':('ciron',0)})
    for (x,y) in [(7,9),(8,9),(1,9),(14,9)]: c.set(x,y,'ciron',0)
    return fin(c)

@reg('item/omni_pneumatic_04','装配激光构件')
def _():
    c=I('VALVE',['ciron','ciron'],extra={'x':('ciron',0)})
    for (x,y) in [(7,9),(8,9)]: c.set(x,y,'ciron',0)
    for (x,y) in [(5,8),(6,7),(9,7),(10,8),(4,10),(11,10),(6,12),(9,12)]: c.set(x,y,'laser',4)
    return fin(c)

@reg('item/omni_pneumatic_assembly_1','钻刻耐压阀体')
def _():
    c=I('VALVE',['ciron','brass'],extra={'x':('ciron',0)})
    for (x,y) in [(7,9),(8,9)]: c.set(x,y,'ciron',0)
    for (x,y) in [(5,8),(10,8),(6,12),(9,12)]: c.set(x,y,'laser',3)
    for (x,y) in [(1,8),(1,11),(14,8),(14,11)]: c.set(x,y,'brass',4)
    return fin(c)

@reg('item/omni_pneumatic_08','热处理架冷却构件')
def _():
    c=I('RING',['plast'])
    for (x,y) in region(c,'plast'):
        l=c.get(x,y)[1]
        if l in (1,2): c.set(x,y,'gasket',l+1)
    return fin(c)

@reg('item/omni_pneumatic_assembly_2','热控密封阀座')
def _():
    c=I('GEARPART',['ciron'])
    for (x,y) in [(6,5),(7,5),(8,5),(9,5),(5,6),(10,6),(5,8),(10,8),(6,9),(7,9),(8,9),(9,9)]:
        c.set(x,y,'gasket',4 if y<7 else 2)
    return fin(c)

def chip(base):
    return I('CHIP',[base],extra={'x':(base,2)})

@reg('item/omni_pneumatic_11','AE 充能构件')
def _():
    c=I('CHIP',['ciron'],extra={'x':('certus',5)})
    return fin(c)

@reg('item/omni_pneumatic_12','AE 压印构件')
def _():
    c=I('CHIP',['ciron'],extra={'x':('gold',4)})
    for (x,y) in [(6,5),(10,5),(5,8),(11,8)]: c.set(x,y,'gold',3)
    return fin(c)

@reg('item/omni_pneumatic_13','AE 水中转化构件')
def _():
    c=I('CHIP',['fluix'],extra={'x':('gold',4)})
    return fin(c)

@reg('item/omni_pneumatic_14','AE 爆炸转化构件')
def _():
    c=I('CHIP',['fluix'],extra={'x':('gold',4)})
    for (x,y) in [(4,6),(5,7),(5,8),(11,6),(12,7),(10,9),(11,10)]: c.set(x,y,'fluix',0)
    H(c,[(2,2),(14,3),(1,12),(15,13)],'fff0a0'); H(c,[(3,1),(13,2)],'ffd040')
    return fin(c)

@reg('item/omni_pneumatic_assembly_3','熵变信号阀片')
def _():
    c=I('PLATE',['ciron'])
    for (x,y) in region(c,'ciron'):
        l=c.get(x,y)[1]
        if l>0: c.set(x,y,'cold' if x<8 else 'heat',l)
    for (x,y) in [(7,5),(8,5),(7,6),(8,6),(7,7),(8,7)]: c.set(x,y,'gold',4)
    return fin(c)

# ---------- NUCLEAR ----------
mat('ncry','8fb3cc'); mat('helium','f08ab8'); mat('nsteel','9aa4b0'); mat('gravel','8a8a8a'); mat('boron','5a6070')
mat('dense','4a5260'); mat('track','5ae0f0'); mat('isoA','8ae05a'); mat('isoB','e8d05a'); mat('quartz','ece6e0'); mat('redst','d02a20')
mat('ironi','c8ccd2'); mat('chem','4ab8a0'); mat('salt','e4f4f8'); mat('mesh','8a9098'); mat('rad','7af04a'); mat('lead','6a6e78')
mat('fuel','8a9a6a'); mat('copper','d9884c'); mat('void','1a1424'); mat('bolt','d8c8ff'); mat('tgt','f0d050')

@reg('item/omni_nuclear_feed','氦封约束环胚')
def _():
    c=I('RING',['ncry'])
    for (x,y) in region(c,'ncry'):
        l=c.get(x,y)[1]
        if l>0 and y in (10,11): c.set(x,y,'helium',l+1)
    return fin(c)

@reg('item/omni_nuclear_01','核工制造构件')
def _():
    c=I('RING',['nsteel'])
    for (x,y) in [(3,4),(6,3),(10,3),(13,5)]: c.set(x,y,'nsteel',5)
    for (x,y) in [(2,10),(5,11),(9,11),(12,11)]: c.set(x,y,'nsteel',1)
    return fin(c)

@reg('item/omni_nuclear_02','核工碎岩构件')
def _():
    c=I('MOUND',['gravel'])
    for (x,y) in [(5,8),(8,7),(10,10),(4,11),(7,12),(12,9)]: c.set(x,y,'nsteel',5)
    for (x,y) in [(6,10),(9,9),(11,12)]: c.set(x,y,'gravel',1)
    return fin(c)

@reg('item/omni_nuclear_03','核工合金熔炼构件')
def _():
    c=I('CHUNK',['boron'])
    for (x,y) in [(5,5),(7,4),(9,7),(6,9)]: c.set(x,y,'ncry',4)
    return fin(c)

@reg('item/omni_nuclear_04','核工加压构件')
def _():
    c=I('PUCK',['dense'])
    for (x,y) in [(5,4),(6,4),(9,4)]: c.set(x,y,'dense',5)
    return fin(c)

@reg('item/omni_nuclear_06','核工铸锭构件')
def _():
    c=I('INGOT',['boron'])
    for (x,y) in [(5,5),(6,5),(10,6)]: c.set(x,y,'ncry',5)
    return fin(c)

@reg('item/omni_nuclear_assembly_1','致密承束环')
def _():
    c=I('RING',['dense'])
    for (x,y) in [(4,6),(11,6),(5,8),(10,8)]: c.set(x,y,'track',5)
    for (x,y) in [(5,5),(10,5),(4,8),(11,8)]: c.set(x,y,'track',3)
    return fin(c)

@reg('item/omni_nuclear_09','同位素分离构件')
def _():
    c=I('RING',['dense'])
    for (x,y) in region(c,'dense'):
        l=c.get(x,y)[1]
        if l>0: c.set(x,y,'isoA' if x<8 else 'isoB',l)
    return fin(c)

@reg('item/omni_nuclear_07_precursor','核工提取原料')
def _():
    return fin(I('MIX',['boron','quartz']))

@reg('item/omni_nuclear_11','核工流体灌注构件')
def _():
    c=I('INGOT',['ironi'])
    for (x,y) in [(4,6),(5,6),(6,7),(9,7),(10,6),(11,8),(7,9),(8,9),(12,9)]: c.set(x,y,'chem',3)
    return fin(c)

@reg('item/omni_nuclear_12_precursor','核工流体富集原料')
def _():
    return fin(I('MIX',['quartz','redst']))

@reg('item/omni_nuclear_15','核工结晶构件')
def _():
    return fin(I('CRYSTAL',['salt','lead']))

@reg('item/omni_nuclear_16','核工组装构件')
def _():
    c=I('GEARPART',['nsteel'])
    g(c,["oooo",
         "o54o",
         "o43o",
         "oooo"],{'o':('salt',0),'5':('salt',5),'4':('salt',4),'3':('salt',3)},ox=6,oy=6)
    for (x,y) in [(3,6),(12,6),(3,9),(12,9)]: c.set(x,y,'redst',3)
    return fin(c)

def filt(base):
    c=I('DISC',[base])
    for (x,y) in region(c,base):
        l=c.get(x,y)[1]
        if l in (4,5) and (x%2==0 or y%2==0): c.set(x,y,base,2)
    return c

@reg('item/omni_nuclear_assembly_2','同位素过滤层')
def _():
    c=filt('mesh')
    for (x,y) in [(5,5),(9,4),(11,6),(6,7),(8,6)]: c.set(x,y,'isoA',4)
    return fin(c)

@reg('item/omni_nuclear_20','衰变加速构件')
def _():
    c=filt('mesh')
    for (x,y) in region(c,'mesh'):
        l=c.get(x,y)[1]
        if l>=3 and y<=8: c.set(x,y,'rad',l)
    return fin(c)

@reg('item/omni_nuclear_assembly_3','辐照吸收层')
def _():
    c=I('SANDWICH',['lead','boron'])
    for (x,y) in [(1,7),(1,8),(15,6),(15,7)]: c.set(x,y,'track',5)
    return fin(c)

@reg('item/omni_nuclear_25','燃料后处理构件')
def _():
    return fin(I('PELLETS',['fuel']))

@reg('item/omni_nuclear_assembly_4','燃料闭锁环')
def _():
    c=I('RING',['nsteel'])
    for (x,y) in [(3,4),(7,3),(11,4),(2,8),(13,8),(5,11),(10,11)]: c.set(x,y,'fuel',4); 
    for (x,y) in [(4,4),(8,3),(12,4)]: c.set(x,y,'rad',4)
    return fin(c)

@reg('item/omni_nuclear_assembly_5','多级换热环套')
def _():
    c=I('RING',['nsteel'])
    for (x,y) in region(c,'nsteel'):
        l=c.get(x,y)[1]
        if l>0 and y>=9 and x%3==0: c.set(x,y,'copper',l)
        if l>0 and y<9 and (x+y)%4==0: c.set(x,y,'copper',l)
    return fin(c)

@reg('item/omni_nuclear_30','球状闪电加工构件')
def _():
    c=I('RING',['dense'])
    g(c,["oooooo",
         "o1v11o",
         "oooooo"],{'o':('void',0),'1':('void',2),'v':('bolt',5)},ox=5,oy=6)
    H(c,[(1,2),(2,1),(14,2),(15,1),(0,13),(14,14)],'d8c8ff')
    return fin(c)

@reg('item/omni_nuclear_31','靶室构件')
def _():
    c=I('RING',['dense'])
    for (x,y) in [(3,4),(12,4),(2,9),(13,10),(7,12)]: c.set(x,y,'dense',1)
    H(c,[(0,1),(1,2),(2,3)],'f0d050'); H(c,[(15,0),(14,1),(13,2)],'f0d050')
    c.set(3,4,'tgt',5); c.set(12,4,'tgt',5)
    return fin(c)

# ---------- PRECISION ----------
mat('slurry','c8b8f0'); mat('proud','e0c8ff'); mat('ironb','b8bcc4'); mat('handle','6a4a2e'); mat('paper','eee4c8')
mat('ink','3a3448'); mat('horse','d8b040'); mat('balloon','f0c838'); mat('brassg','c8963a'); mat('knife','d0d4da')
mat('ksheath','8a5a34'); mat('l1','e86a6a'); mat('l2','6ab0e8'); mat('l3','e8d06a'); mat('core','f0f0ff')
mat('ameth','a66ee0')

@reg('item/omni_precision_feed','星浆光栅基板')
def _():
    c=I('PLATE',['slurry'])
    for (x,y) in region(c,'slurry'):
        l=c.get(x,y)[1]
        if l==4 and x%2==0: c.set(x,y,'slurry',3)
    for (x,y) in [(4,6),(11,6)]: c.set(x,y,'slurry',5)
    return fin(c)

@reg('item/omni_precision_01','耀魂加工构件')
def _():
    c=I('BLADEBLANK',['ironb','handle'])
    for (x,y) in [(13,2),(12,3),(11,4),(10,5),(9,6),(8,7),(7,8),(6,9)]: c.set(x,y,'proud',5)
    H(c,[(15,0),(9,3),(4,7)],'f0e0ff')
    return fin(c)

@reg('item/omni_precision_04','刀卷研究构件')
def _():
    c=I('SCROLL',['paper','handle'],extra={'x':('ink',3)})
    return fin(c)

@reg('item/omni_precision_05_precursor','泰拉工坊原料')
def _():
    return fin(I('MIX',['horse','ameth']))

@reg('item/omni_precision_05','泰拉工坊构件')
def _():
    c=I('GADGET',['brassg','balloon'],extra={'x':('ink',2)})
    return fin(c)

@reg('item/omni_precision_assembly_1','定向刻线刀组')
def _():
    return fin(I('KNIVES',['knife','ksheath']))

@reg('item/omni_precision_assembly_2','多层成像标尺')
def _():
    c=I('RULER',['paper'],extra={'x':('ink',2)})
    for (x,y) in region(c,'paper'):
        l=c.get(x,y)[1]
        if l in (2,3): c.set(x,y,'l2' if (x+y)%2 else 'l1',l+1)
    return fin(c)

@reg('item/omni_process_liner','工艺衬片')
def _():
    c=I('CARD',['paper'],extra={'k':('ironb',3)})
    for (x,y) in [(4,6),(5,6),(6,6),(7,6),(8,6),(9,6),(10,6),(4,9),(5,9),(6,9),(7,9),(8,9)]: c.set(x,y,'paper',3)
    return fin(c)

@reg('item/omni_seed','万象原核')
def _():
    mat('n1','7fb85e'); mat('n2','8fd8f0'); mat('n3','a66ee0'); mat('n4','e8783a'); mat('n5','4fd8d0'); mat('n6','e8c040'); mat('n7','7af04a'); mat('n8','f08ab8')
    c=I('ORB',['core'],extra={'x':('core',0)})
    # iridescent bands
    for (x,y) in region(c,'core'):
        l=c.get(x,y)[1]
        if l>0 and (x+y)%5==0: c.set(x,y,'n3',min(5,l+1))
        elif l>0 and (x+y)%5==2: c.set(x,y,'n2',l)
    nodes=[(7,1),(8,1),(13,3),(15,7),(15,8),(13,12),(7,14),(8,14),(2,12),(0,7),(0,8),(2,3)]
    pal=['n1','n1','n2','n3','n3','n4','n5','n5','n6','n7','n7','n8']
    for (x,y),m in zip(nodes,pal): c.set(x,y,m,5)
    return fin(c)

@reg('item/omni_billet','万象锻坯')
def _():
    mat('hot','f0a050'); mat('iri','b88af0'); mat('n2','8fd8f0')
    c=I('BILLET',['hot'])
    for (x,y) in region(c,'hot'):
        l=c.get(x,y)[1]
        if l>0 and (x-y)%4==0: c.set(x,y,'iri',min(5,l+1))
        elif l>0 and (x-y)%4==1: c.set(x,y,'n2',l)
    return fin(c)
