from items_common import *
# ---------- THERMAL ----------
mat('basalt','6d6f78'); mat('cryo','8fb3cc'); mat('latex','e7dcc0'); mat('ironm','b8bcc4'); mat('coal','3a3a40')
mat('glow','f08a2a'); mat('steel','7e8794'); mat('slag','5b4f4a'); mat('nether','4e4048'); mat('redh','d84a2a')
mat('copper','d9884c'); mat('frostm','c4dce8'); mat('soot','4a3f38'); mat('ember','ff9a3a'); mat('bitumen','2e2a2c')
mat('kelp','3c6a2e'); mat('resin','e09a34'); mat('glass','cfe8ee'); mat('oil','d8a23a'); mat('char','2c2626')
mat('crys','e4f2f8'); mat('moss','5fa83c'); mat('blaze','f0a42a'); mat('tear','e8f0f2'); mat('brewc','4fc8c0'); mat('cork','8a5a32')
mat('wood','a0743e')

def brick(m='basalt'):
    return I('BRICK',[m])

@reg('item/omni_thermal_feed','冰晶矿质复合坯')
def _():
    c=brick()
    for (x,y) in [(4,5),(6,4),(8,5),(10,6),(3,8),(5,10),(7,9),(11,9),(13,8)]: c.set(x,y,'cryo',4)
    for (x,y) in [(6,7),(4,12),(12,11)]: c.set(x,y,'latex',3)
    return fin(c)

@reg('item/omni_thermal_01','有序工作台构件')
def _():
    c=brick()
    for (x,y) in [(4,5),(8,5),(3,8),(7,9),(13,8)]: c.set(x,y,'cryo',4)
    for y in range(4,15):            # iron strap across front-left face & top
        for x in (5,6):
            cell=c.get(x,y)
            if cell and cell[1]>0: c.set(x,y,'ironm',4 if x==5 else 3)
    for (x,y) in [(5,7),(5,11),(12,9)]: c.set(x,y,'ironm',5)
    return fin(c)

@reg('item/omni_thermal_02','无序工作台构件')
def _():
    c=brick()
    for (x,y) in [(4,5),(8,5),(13,8)]: c.set(x,y,'cryo',4)
    for (x,y) in [(5,4),(6,5),(9,4),(10,5),(3,9),(4,10),(7,11),(8,10),(11,10),(12,9),(6,13)]: c.set(x,y,'coal',3)
    return fin(c)

@reg('item/omni_thermal_03','熔炉构件')
def _():
    c=brick('slag')
    for (x,y) in [(3,7),(4,8),(5,8),(6,9),(9,10),(10,11),(12,8),(13,9),(7,4),(8,5)]: c.set(x,y,'glow',4)
    for (x,y) in [(5,8),(10,11)]: c.set(x,y,'glow',5)
    return fin(c)

@reg('item/omni_thermal_04','高炉构件')
def _():
    c=brick('steel')
    for (x,y) in [(6,4),(10,5),(4,9),(8,11),(12,10)]: c.set(x,y,'slag',2)
    for (x,y) in [(5,3),(7,3)]: c.set(x,y,'steel',5)
    return fin(c)

@reg('item/omni_thermal_07','切石机构件')
def _():
    c=brick('steel')
    # notch cut out of the right corner
    for (x,y) in [(13,6),(14,6),(14,7),(15,7),(14,8),(15,8),(15,9)]: c.clear(x,y)
    for (x,y) in [(12,6),(13,7),(14,9),(15,10),(13,8),(14,10)]:
        if c.get(x,y): c.set(x,y,'steel',0)
    for (x,y) in [(12,7),(13,9)]: c.set(x,y,'steel',5)
    return fin(c)

@reg('item/omni_thermal_08','锻造台构件')
def _():
    c=brick('nether')
    for (x,y) in region(c,'nether'):
        if c.get(x,y)[1]>0 and (x+y)==12: c.set(x,y,'cryo',5)
        elif c.get(x,y)[1]>0 and (x+y)==13: c.set(x,y,'cryo',3)
    return fin(c)

@reg('item/omni_thermal_assembly_1','锻制承压骨架')
def _():
    return fin(I('FRAME',['nether']))

@reg('item/omni_thermal_09','红石熔炉构件')
def _():
    c=I('FRAME',['nether'])
    for (x,y) in region(c,'nether'):
        l=c.get(x,y)[1]
        if l>=3: c.set(x,y,'redh',l)
    return fin(c)

@reg('item/omni_thermal_10','锯木机构件')
def _():
    c=I('FRAME',['steel'])
    for (x,y) in [(2,6),(2,8),(2,10),(13,6),(13,8),(13,10),(7,1),(8,13)]:
        if c.get(x,y): c.set(x,y,'steel',1)
    for (x,y) in [(3,5),(12,5),(3,11),(12,11)]:
        if c.get(x,y): c.set(x,y,'wood',4)
    return fin(c)

@reg('item/omni_thermal_11','磨粉机构件')
def _():
    c=I('DUST',['steel'])
    Sx(c,[(7,8),(5,11),(10,12),(12,12),(8,10)],'cryo',4)
    return fin(c)

@reg('item/omni_thermal_12','感应炉构件')
def _():
    c=I('INGOT',['copper'])
    for (x,y) in [(4,5),(5,5),(9,6),(10,6),(3,7),(12,7)]: c.set(x,y,'cryo',5)
    return fin(c)

@reg('item/omni_thermal_13','冲压机构件')
def _():
    c=I('PLATE',['copper'])
    for (x,y) in [(5,6),(6,6),(7,5),(8,5),(9,6),(10,6),(7,7),(8,7)]: c.set(x,y,'copper',2)
    for (x,y) in [(7,6),(8,6)]: c.set(x,y,'cryo',4)
    return fin(c)

@reg('item/omni_thermal_15','急速冷冻机构件')
def _():
    c=I('LINER',['frostm'])
    for (x,y) in [(4,8),(6,6),(9,4),(11,6),(8,9),(5,10)]: c.set(x,y,'crys',5)
    return fin(c)

@reg('item/omni_thermal_assembly_2','相变金属外壳')
def _():
    c=I('SHELL',['cryo'])
    for (x,y) in region(c,'cryo'):
        l=c.get(x,y)[1]
        if l>0 and y>=9: c.set(x,y,'copper',l)
    return fin(c)

@reg('item/omni_thermal_05','烟熏炉构件')
def _():
    c=I('SHELL',['cryo'])
    for (x,y) in region(c,'cryo'):
        l=c.get(x,y)[1]
        if l>0: c.set(x,y,'soot' if y<9 else 'copper',max(1,l-1) if y>=9 else l)
    for (x,y) in [(5,4),(6,4),(4,5)]: c.set(x,y,'soot',5)
    for (x,y) in [(3,10),(6,11),(10,10),(12,11)]: c.set(x,y,'soot',2)
    H(c,[(10,0),(11,1),(12,0)],'7a7a7a')
    return fin(c)

@reg('item/omni_thermal_06','营火构件')
def _():
    c=I('SHELL',['soot'])
    for (x,y) in [(3,12),(6,13),(9,13),(12,12),(4,11),(11,11)]: c.set(x,y,'ember',4)
    for (x,y) in [(6,12),(9,12)]: c.set(x,y,'ember',5)
    H(c,[(7,0),(9,1),(6,2)],'8c8c8c')
    return fin(c)

@reg('item/omni_thermal_16_precursor','离心分离机原料')
def _():
    return fin(I('MIX',['bitumen','kelp']))

@reg('item/omni_thermal_16','离心分离机构件')
def _():
    return fin(I('PELLETS',['resin']))

@reg('item/omni_thermal_19','流体灌装机构件')
def _():
    c=I('BOTTLE',['glass','cork'],extra={'x':('oil',4),'y':('oil',5),'z':('oil',2)})
    return fin(c)

@reg('item/omni_thermal_assembly_3','热解隔热夹层')
def _():
    return fin(I('SANDWICH',['steel','char']))

@reg('item/omni_thermal_21','结晶器构件')
def _():
    c=I('SANDWICH',['steel','char'])
    g(c,["..o..o..",
         ".o5oo5o.",
         "o54oo43o"],{'o':('crys',0),'5':('crys',5),'4':('crys',4),'3':('crys',3)},ox=4,oy=0)
    return fin(c)

@reg('item/omni_thermal_22','有机灌注机构件')
def _():
    c=I('SANDWICH',['steel','char'])
    for (x,y) in [(4,5),(5,4),(6,5),(7,4),(9,3),(10,4),(11,5),(8,6),(12,4),(3,6)]: c.set(x,y,'moss',4 if x%2 else 3)
    for (x,y) in [(1,8),(1,9),(15,7),(15,8)]: c.set(x,y,'moss',3)
    return fin(c)

@reg('item/omni_thermal_20_precursor','药水酿造机原料')
def _():
    return fin(I('MIX',['blaze','tear']))

@reg('item/omni_thermal_20','药水酿造机构件')
def _():
    c=I('BOTTLE',['glass','cork'],extra={'x':('brewc',4),'y':('brewc',5),'z':('brewc',2)})
    H(c,[(7,9),(9,10)],'f0e8ff')
    return fin(c)

# ---------- ENGINEERING ----------
mat('slate','4a4f5c'); mat('rainbow','c06ae0'); mat('menril','8fc4e8'); mat('orderd','e8c84a'); mat('seep','5a4a6a')
mat('calloy','e08a7a'); mat('soul','4fd8d0'); mat('soulb','2a3a44'); mat('xp','a8f04a'); mat('redst','d02a20')
mat('quartz','ece6e0'); mat('ameth','a66ee0'); mat('steelw','d4d8dc'); mat('naq','4ad08a'); mat('wire1','d84a3a'); mat('wire2','3a7ad8'); mat('wire3','e8c03a')
mat('dglass','dde8e4'); mat('dust1','c8b48a'); mat('dust2','8a6a5a')

@reg('item/omni_engineering_feed','星浆导电基材')
def _():
    c=I('PLATE',['slate'])
    for (x,y) in [(4,6),(5,6),(6,5),(7,5),(8,5),(9,6),(10,6),(11,7)]: c.set(x,y,'rainbow',4)
    for (x,y) in [(6,7),(9,4),(12,6),(3,7)]: c.set(x,y,'quartz',5)
    return fin(c)

@reg('item/omni_engineering_04','机械烘干构件')
def _():
    c=I('CHUNK',['menril'])
    for (x,y) in [(4,6),(6,5),(9,8),(11,9),(7,11),(5,10)]: c.set(x,y,'menril',2)
    return fin(c)

@reg('item/omni_engineering_05','尘烬整合构件')
def _():
    c=I('CHUNK',['menril'])
    for (x,y) in [(4,7),(6,5),(8,9),(10,7),(12,10),(6,12),(9,4)]: c.set(x,y,'orderd',4)
    for (x,y) in [(5,7),(10,8)]: c.set(x,y,'orderd',5)
    return fin(c)

@reg('item/omni_menril_foil','门瑞欧导电箔')
def _():
    return fin(I('FOILROLL',['menril']))

@reg('item/omni_engineering_06','铣床装配构件')
def _():
    c=I('GEARPART',['menril'])
    for (x,y) in [(3,6),(12,6),(3,9),(12,9)]: c.set(x,y,'seep',3)
    return fin(c)

@reg('item/omni_engineering_07','尘烬离心构件')
def _():
    c=I('BOTTLE',['dglass','cork'],extra={'x':('dust1',4),'y':('dust1',5),'z':('dust2',3)})
    for (x,y) in [(4,9),(5,9),(6,9),(7,9),(8,9),(9,9),(10,9),(11,9),(12,9)]:
        cell=c.get(x,y)
        if cell and cell[0]=='dust1': c.set(x,y,'menril',4)
    return fin(c)

@reg('item/omni_engineering_assembly_1','门瑞欧导电骨架')
def _():
    return fin(I('FRAME',['menril']))

@reg('item/omni_engineering_09','合金炉构件')
def _():
    c=I('FRAME',['menril'])
    for (x,y) in region(c,'menril'):
        l=c.get(x,y)[1]
        if l in (3,4): c.set(x,y,'calloy',l)
    return fin(c)

@reg('item/omni_engineering_10','SAG 磨粉构件')
def _():
    c=I('DUST',['calloy'])
    Sx(c,[(7,8),(9,10),(5,12),(11,12)],'menril',4)
    return fin(c)

@reg('item/omni_engineering_11','切片加工构件')
def _():
    c=I('WAFERS',['calloy'])
    for (x,y,m) in [(6,3,'ameth'),(9,4,'quartz'),(5,7,'redst'),(10,7,'ameth'),(7,11,'quartz'),(9,12,'redst')]: c.set(x,y,m,4)
    return fin(c)

@reg('item/omni_engineering_14_precursor','流体罐加工原料')
def _():
    return fin(I('VIAL',['dglass','cork'],extra={'x':('redst',3),'y':('redst',4),'z':('redst',2)}))

@reg('item/omni_engineering_14','流体罐加工构件')
def _():
    c=I('VIAL',['dglass','cork'],extra={'x':('xp',4),'y':('xp',5),'z':('xp',2)})
    H(c,[(7,8),(9,10)],'f6ffd0')
    return fin(c)

@reg('item/omni_engineering_assembly_2','灵魂绝缘绕组')
def _():
    return fin(I('COIL',['soulb','soulb','soul']))

@reg('item/omni_engineering_22','NASA 工作台构件')
def _():
    c=I('COIL',['steelw','steelw','soul'])
    H(c,[(1,6),(0,7),(1,9),(0,10)],'d9884c'); H(c,[(14,6),(15,7),(14,9),(15,10)],'d9884c')
    return fin(c)

@reg('item/omni_engineering_assembly_3','航天供能线组')
def _():
    return fin(I('HARNESS',['steelw','wire1','wire2','wire3']))

@reg('item/omni_engineering_24','星门高级结晶构件')
def _():
    return fin(I('CRYSTAL',['naq','soulb']))
