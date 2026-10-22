"""Hand-authored 16 px workpieces: material and process continuity, not machines.

Every production pixel is plotted directly. The installed Menril texture was
inspected as a colour reference only; no source image is loaded or resized here.
"""
from pathlib import Path
from pixel import Sprite, targets


MAT = {
    'stone':['242b32','39434b','59626b','7b858d','a6b3ba','d9e8e8','6ebbd0','b79860'],
    'steel':['202c36','354955','607785','91abb7','c7d8dd','f0f4ec','70cbd8','966d43'],
    'cryo':['293442','41566a','678997','95c0c7','c7e7e6','f1fff3','73bdd8','a96e4a'],
    'copper':['392d29','644135','975b3d','c3814f','e8ad71','ffe3aa','4d9ca9','536c74'],
    'menril':['153c47','205d6b','30899a','48b5cb','8dd7e2','def6ef','b77a4f','5a7485'],
    'carbon':['24262c','3c3b41','595457','81736a','b2a18a','ded0ac','719385','b4884e'],
    'polymer':['425760','6a898a','92b3ae','bad1c4','dae5cb','f4f7de','5995ab','ba8b53'],
    'soul':['292937','41434c','6c7476','9da9a4','cbd9c9','eef8df','a46cce','55c5b8'],
}


def surface(material):
    s=Sprite('engineering')
    s.palette=dict(zip('odsmlhab',MAT[material]))
    return s


def dots(s, points, colour):
    for p in points: s.dot(p,colour)
    return s


def mineral(stage):
    s=surface('stone' if stage<4 else 'cryo')
    s.poly([(2,5),(5,3),(10,2),(13,5),(14,10),(11,13),(5,14),(1,11)],'o')
    s.poly([(3,5),(10,3),(12,5),(7,8),(2,8)],'m').poly([(2,9),(7,9),(7,13),(3,12)],'d')
    s.poly([(8,9),(13,6),(13,10),(10,12),(8,13)],'s')
    if stage==0:
        s.poly([(3,5),(5,4),(6,5),(5,7),(3,7)],'d').poly([(8,4),(10,3),(11,5),(9,6)],'a')
        s.line([(4,10),(5,11),(6,10)],'735b91').line([(10,8),(11,7)],'l')
        dots(s,[(8,7),(10,10),(4,8)],'b').dot((9,4),'h')
    elif stage==1:
        s.line([(5,4),(9,7),(9,12)],'c0c7c7',2).line([(3,7),(8,6),(12,5)],'a').dot((5,4),'h')
        s.rect((8,8,10,9),'455861').dot((8,8),'h'); dots(s,[(3,10),(11,9)],'d')
    elif stage==2:
        s.poly([(4,5),(6,4),(8,6),(6,8),(3,7)],'282830').poly([(9,8),(12,7),(12,10),(9,11)],'282830')
        s.line([(5,4),(9,7),(9,12)],'839399'); dots(s,[(4,10),(6,11),(9,4),(11,6)],'a')
    elif stage==3:
        s.poly([(3,6),(6,4),(11,4),(10,6),(6,8)],'879799').line([(4,6),(6,5),(8,5)],'c9d8cf')
        s.line([(4,10),(6,10),(8,8),(11,8)],'6da3aa'); dots(s,[(5,8),(10,5),(11,10)],'d')
    else:
        s.poly([(3,6),(10,3),(12,5),(7,8)],'l').line([(3,6),(6,7)],'h')
        s.line([(10,8),(12,7)],'a').line([(3,10),(6,11)],'897a72')
    return s


def cryo_strip(stage):
    s=surface('cryo')
    if stage==0:
        s.poly([(1,10),(8,2),(11,2),(14,5),(7,13),(4,14)],'o')
        s.poly([(2,10),(8,3),(11,3),(12,5),(6,12)],'m').poly([(6,12),(13,5),(13,7),(7,14),(4,14)],'s')
        s.line([(3,9),(9,3),(11,3)],'l').line([(4,11),(5,12)],'h')
        s.line([(7,7),(9,9)],'a').dot((10,4),'h')
    else:
        s.poly([(2,4),(5,2),(13,3),(14,10),(11,13),(2,12)],'o')
        s.poly([(3,4),(5,3),(12,4),(11,6),(4,6)],'l').poly([(3,6),(5,7),(5,10),(3,11)],'m')
        s.poly([(11,6),(13,4),(13,10),(10,12),(10,8)],'s').poly([(5,7),(10,7),(9,10),(6,10)],None)
        s.line([(3,4),(5,3),(10,4)],'h')
        if stage>=2:
            s.poly([(3,10),(5,10),(10,11),(12,10),(10,13),(3,12)],'d').line([(4,10),(10,11)],'l')
            s.dot((4,5),'o').dot((11,5),'o').dot((4,11),'h').dot((11,11),'m')
        else: s.rect((5,10,9,13),None).dot((4,9),'h').dot((11,10),'a')
        if stage==3:
            s.line([(6,4),(10,5)],'ad8066').line([(11,8),(11,10)],'8984a6').line([(4,7),(4,9)],'8dbabc')
    return s


def sawed_liners():
    s=surface('cryo')
    for o in (3,0):
        s.poly([(1,7+o),(8,1+o),(11,2+o),(14,5+o),(7,11+o),(3,11+o)],'o')
        s.poly([(2,7+o),(8,2+o),(11,3+o),(12,5+o),(6,10+o)],'m')
        s.line([(2,7+o),(8,2+o)],'l').line([(6,9+o),(12,5+o)],'s')
    return s.line([(4,6),(6,7)],'h').line([(9,3),(10,4)],'a')


def powder(material, coarse=False, accent=None):
    s=surface(material)
    s.poly([(1,12),(4,9),(6,7),(10,6),(11,10),(14,12),(13,14),(4,14)],'o')
    s.poly([(2,12),(5,10),(7,8),(9,7),(11,11),(13,12),(12,13),(4,13)],'s')
    s.poly([(5,11),(7,9),(9,9),(10,11),(8,12)],'m'); dots(s,[(3,12),(7,10),(10,12),(9,8)],'l')
    s.dot((7,9),'h').dot((12,8),'s').dot((3,7),'m')
    if coarse:
        s.poly([(1,5),(3,3),(5,4),(4,7),(2,7)],'o').line([(2,5),(3,4),(4,5)],'l')
        s.poly([(10,3),(12,2),(14,4),(12,6),(10,5)],'o').line([(11,3),(12,3),(13,4)],'m')
    if accent: dots(s,[(5,12),(9,11),(6,8),(12,12)],accent)
    return s


def alloy_ingot(menril=False):
    s=surface('copper')
    s.poly([(1,8),(5,4),(12,3),(15,6),(13,11),(4,13),(1,11)],'o')
    s.poly([(2,8),(6,5),(12,4),(13,6),(5,10)],'m')
    s.poly([(2,9),(5,11),(12,8),(13,7),(12,10),(4,12),(2,10)],'s')
    s.line([(3,8),(6,5),(10,4)],'l').line([(4,9),(6,9)],'h').line([(6,11),(11,9)],'d')
    return s.poly([(8,5),(10,5),(11,6),(8,7)],'58b8ca' if menril else 'a')


def pressed_panel():
    s=surface('copper')
    s.poly([(1,7),(8,2),(14,5),(14,9),(7,14),(1,11)],'o')
    s.poly([(2,7),(8,3),(13,5),(7,10)],'m').poly([(2,8),(7,11),(13,6),(13,9),(7,13),(2,10)],'s')
    s.line([(3,7),(8,4),(11,5)],'l').poly([(5,7),(8,5),(10,6),(7,8)],'d')
    return s.line([(6,7),(8,6)],'a').line([(8,11),(12,8)],'a').dot((3,8),'h')


def phase_shell(stage):
    s=surface('cryo')
    s.poly([(2,4),(6,1),(12,3),(14,7),(13,12),(7,15),(2,12),(1,7)],'o')
    s.poly([(3,4),(6,2),(11,4),(12,6),(7,9),(2,7)],'m')
    s.poly([(2,8),(7,10),(7,14),(3,11)],'s').poly([(8,10),(13,7),(12,11),(8,13)],'d')
    s.poly([(4,5),(6,3),(10,4),(11,6),(7,8)],'o').poly([(5,5),(7,4),(9,5),(7,6)],'d')
    s.line([(3,4),(6,2),(9,3)],'l').dot((3,5),'h').line([(9,10),(11,9)],'a')
    if stage==0:
        s.line([(3,6),(4,8),(6,9)],'h').line([(11,5),(12,6),(11,7)],'h').dot((4,10),'l').dot((9,12),'a')
    if stage>=1:
        s.rect((2,7,3,8),'546571').dot((2,7),'h').rect((11,4,12,5),'546571').dot((11,4),'h')
        s.line([(3,10),(5,11)],'l')
    if stage>=2:
        s.poly([(5,5),(7,4),(10,5),(10,6),(7,8),(4,6)],'82745a').line([(5,5),(7,5),(8,6)],'b9a482').dot((6,6),'655c50')
    if stage>=3:
        s.poly([(5,5),(7,4),(10,5),(10,6),(7,8),(4,6)],'2f3038').line([(5,5),(7,5),(8,6)],'615956')
        s.dot((6,6),'3f4548').line([(3,9),(5,10)],'67594e')
    if stage>=4:
        s.line([(4,6),(7,8),(10,6)],'b5a47c').line([(4,7),(7,9),(11,6)],'544444').dot((7,7),'786c58').dot((3,11),'c3b48a')
    if stage>=5:
        s.poly([(5,5),(6,2),(8,3),(8,6),(7,7)],'76bdcf').line([(6,3),(6,5)],'e3f8ee').dot((8,6),'a')
        s.poly([(10,7),(11,5),(12,6),(11,9)],'8ccdd4').dot((11,6),'h')
    if stage==6:
        s.line([(4,8),(6,7),(8,8),(10,7)],'90aa73').dot((4,7),'bbcc9a').dot((7,8),'c2d8a2').dot((11,10),'9ab77e')
    return s


def tar_fibre(clean=False):
    s=surface('carbon')
    s.poly([(2,6),(5,3),(8,4),(11,3),(13,7),(12,12),(6,14),(2,11)],'o')
    s.poly([(3,6),(6,4),(8,5),(11,4),(12,7),(9,11),(4,11)],'d')
    s.line([(3,7),(6,5),(9,6),(11,5)],'m').line([(3,10),(6,8),(10,9),(12,7)],'s').line([(5,12),(8,10),(11,11)],'s')
    if clean:
        s.line([(4,6),(7,4),(10,5)],'l').line([(5,9),(8,7),(11,7)],'m').line([(7,12),(10,10)],'m').dot((6,5),'h')
    else:
        s.line([(3,6),(5,7),(5,9),(8,10)],'55745d',2).line([(9,4),(9,7),(11,8)],'79906b').dot((5,6),'9dba81').dot((8,12),'9b794a')
    return s


def vial(kind):
    s=surface('soul')
    s.rect((6,1,9,2),'o').rect((6,1,9,1),'9a7654').rect((6,3,9,5),'o').rect((7,3,8,5),'m')
    s.poly([(5,5),(10,5),(12,8),(12,12),(10,14),(5,14),(3,12),(3,8)],'o')
    s.poly([(5,6),(10,6),(11,8),(11,12),(9,13),(5,13),(4,11),(4,8)],'m')
    dark,light={'tar':('8a522e','cf974c'),'brew':('8cb8cc','d0ebdf'),'xp':('64983e','c3d95e'),'redstone':('73332f','c35b3b')}[kind]
    s.poly([(4,9),(11,9),(11,12),(9,13),(5,13),(4,11)],dark).line([(5,9),(10,9)],light).dot((9,11),light)
    s.line([(5,7),(5,10)],'h').dot((6,6),'l').dot((10,7),'l')
    if kind=='tar': s.line([(7,11),(8,11)],'d7b16c')
    if kind=='brew': s.dot((8,7),'e0ca89').dot((8,11),'f5f5cc')
    if kind=='redstone': s.rect((5,7,10,8),'d').line([(6,7),(9,7)],'b4654e')
    return s


def brew_reagent():
    s=surface('copper')
    s.poly([(2,11),(5,8),(8,8),(11,10),(13,13),(5,14)],'d').poly([(3,11),(6,9),(9,10),(11,12),(5,13)],'e2a442')
    dots(s,[(4,11),(7,10),(9,12)],'ffdb76')
    s.poly([(9,1),(10,4),(13,7),(13,9),(11,11),(8,10),(7,7),(8,4)],'4e6575')
    s.poly([(9,3),(10,5),(12,7),(12,9),(10,10),(8,8)],'c9e3e1')
    return s.line([(9,5),(9,8),(10,9)],'f4fff0').dot((11,8),'94b8c6')


def conductive_feed(dried=False):
    s=surface('steel')
    s.poly([(1,7),(7,2),(13,4),(14,8),(9,13),(4,14),(1,11)],'o')
    s.poly([(2,7),(7,3),(12,5),(8,9),(3,9)],'m').poly([(2,10),(7,11),(13,6),(13,9),(8,13),(4,13)],'s')
    s.line([(3,7),(7,4),(10,5)],'l')
    if dried:
        s.line([(4,7),(7,5),(10,6)],'68b0ad').line([(4,9),(7,7),(10,8)],'6b97ba').dot((6,6),'d8e8dc').dot((3,10),'3c5272')
    else:
        s.rect((4,6,5,7),'d').dot((4,6),'dcc49a').poly([(8,5),(10,5),(10,7),(8,8)],'9071a3')
        s.dot((9,5),'c5b1d5').dot((8,8),'65bab9'); dots(s,[(3,10),(6,9),(10,10)],'313340')
    return s


def menril(variant):
    s=surface('menril')
    if variant=='integrated':
        s.poly([(3,5),(7,1),(12,3),(14,8),(10,13),(4,14),(1,9)],'o')
        s.poly([(4,5),(7,2),(10,3),(8,8),(2,8)],'m').poly([(11,4),(13,8),(10,12),(8,10),(9,7)],'s')
        s.poly([(3,9),(7,9),(9,12),(5,13)],'d').line([(4,5),(7,3)],'l').dot((5,5),'h')
        s.line([(4,10),(6,11),(8,10),(10,11)],'a').dot((11,6),'l')
    elif variant=='foil':
        s.poly([(1,6),(4,2),(11,2),(14,5),(13,10),(9,14),(3,13)],'o')
        s.poly([(2,6),(5,3),(11,3),(12,5),(7,8),(3,8)],'l').poly([(3,9),(7,9),(12,6),(12,10),(8,13),(4,12)],'m')
        s.poly([(7,10),(8,9),(8,13),(4,12),(3,10)],'d').line([(3,5),(5,3),(9,3)],'h').line([(8,10),(11,8)],'l')
    elif variant=='lattice':
        for y in (5,8,11):
            s.line([(2,y),(9,y-4),(13,y-2)],'o',3).line([(2,y),(9,y-4),(13,y-2)],'m')
        for x in (3,6,9):
            s.line([(x,4),(x+3,6),(x+3,12)],'o',3).line([(x,4),(x+3,6),(x+3,12)],'s')
        s.line([(3,4),(6,6)],'h').line([(6,4),(9,6)],'l').dot((10,10),'a')
    else:
        s.poly([(3,2),(12,2),(13,11),(10,14),(5,14),(2,11)],'o')
        s.poly([(4,3),(11,3),(11,10),(9,12),(5,12),(3,10)],'b')
        s.poly([(4,7),(7,9),(11,7),(11,11),(9,13),(5,13),(3,11)],'d')
        s.line([(4,8),(7,10),(10,8)],'m').line([(5,10),(7,12),(10,10)],'l')
        s.line([(4,3),(4,6)],'h').line([(5,3),(10,3)],'l').dot((10,5),'m')
    return s


def conductive_frame():
    s=surface('steel')
    s.poly([(3,2),(12,2),(14,5),(13,13),(3,14),(1,11),(1,5)],'o')
    s.line([(3,3),(11,3),(12,5),(12,12),(4,12),(3,10),(3,3)],'m',2).poly([(5,5),(10,5),(10,10),(5,10)],None)
    s.line([(3,4),(5,3),(10,3)],'h').line([(4,11),(11,11)],'3298ac')
    s.rect((2,6,4,8),'3d7580').line([(2,6),(3,6)],'8fdbdc').rect((11,6,13,8),'3d7580').line([(11,6),(12,6)],'8fdbdc')
    return s.line([(5,12),(10,12)],'be784b').dot((5,12),'f0c38d')


def dielectric_strips():
    s=surface('copper')
    for y,col in ((8,'497c8e'),(5,'b67a50'),(2,'c7d5c5')):
        s.poly([(1,y+3),(9,y),(14,y+2),(7,y+5),(2,y+5)],'o').poly([(2,y+3),(9,y+1),(12,y+2),(7,y+4)],col)
        s.line([(3,y+3),(8,y+1)],'e7e5bf' if y==2 else 'e2aa75')
    return s.dot((11,5),'7c5c9b').dot((5,10),'8d638d')


def soul_filter():
    s=surface('soul')
    s.poly([(2,3),(11,1),(14,4),(14,11),(5,14),(1,11)],'o')
    s.poly([(3,4),(11,2),(13,4),(5,7)],'s').poly([(2,6),(5,8),(5,12),(2,10)],'d').poly([(6,8),(13,5),(13,10),(6,12)],'m')
    s.poly([(4,4),(10,3),(12,4),(5,6)],'42344f').line([(5,4),(9,4)],'a').dot((7,5),'b')
    s.line([(7,8),(11,6),(11,9),(7,11),(7,8)],'41394d').line([(9,7),(9,10)],'a').dot((8,8),'b').dot((10,9),'b')
    return s.line([(3,4),(8,3)],'h').dot((6,11),'h')


def winding():
    s=surface('copper')
    s.poly([(3,2),(8,1),(13,4),(13,11),(8,14),(3,12),(1,8)],'o')
    s.poly([(4,3),(8,2),(12,4),(8,6)],'819397').poly([(3,5),(7,7),(7,12),(4,11),(2,8)],'343641')
    s.poly([(8,7),(12,5),(12,10),(8,13)],'50505b')
    for y in (5,7,9):
        s.line([(3,y),(7,y+2),(11,y)],'d',2).line([(3,y),(7,y+2),(11,y)],'m').dot((4,y),'l')
    s.rect((6,3,8,4),'3e4255').dot((7,3),'ad82d0').line([(11,5),(13,5),(14,7)],'6ebbb1')
    return s.dot((13,5),'b7ead2').dot((4,10),'d9cb93').dot((10,10),'9570a9')


def flight_harness(cold=False, crystal=False):
    s=surface('copper')
    s.line([(4,4),(4,10),(7,13),(12,11),(12,6)],'o',3).line([(4,4),(4,10),(7,13),(12,11),(12,6)],'m')
    s.line([(5,4),(6,9),(9,10),(11,8)],'d',3).line([(5,4),(6,9),(9,10),(11,8)],'l')
    for x,y in ((1,2),(9,1)):
        s.rect((x+1,y,x+4,y+1),'202e3c')
        s.poly([(x,y+2),(x+1,y+1),(x+4,y+1),(x+5,y+3),(x+5,y+6),(x+4,y+7),(x+1,y+7),(x,y+5)],'354b56')
        s.rect((x+1,y+2,x+4,y+5),'9cafaf' if not cold else 'b6d5d5').line([(x+1,y+2),(x+1,y+4)],'eef3dc')
        s.rect((x,y+5,x+4,y+6),'556f7b' if not cold else '7caabc')
    s.rect((7,11,10,14),'293641').rect((8,11,9,13),'789197').dot((8,11),'ced8c9')
    if cold:
        s.line([(4,9),(5,10),(7,11)],'ccdfd9',2).line([(10,9),(12,8)],'9ac8d2',2).dot((6,11),'79a9b6')
    if crystal:
        s.poly([(5,6),(6,2),(8,1),(10,4),(8,9),(6,9)],'363546')
        s.poly([(6,6),(7,3),(8,2),(9,4),(7,8)],'a58bc8').line([(7,4),(8,3)],'e6d9f0').dot((8,6),'816ba8')
        s.line([(5,9),(7,10),(10,8)],'5aa8a3')
    return s


def valve(stage):
    s=surface('steel')
    s.poly([(2,5),(5,2),(11,2),(14,5),(13,11),(10,14),(3,13),(1,10)],'o')
    s.poly([(3,5),(5,3),(10,3),(12,5),(7,8),(2,7)],'m')
    s.poly([(2,8),(7,9),(7,13),(3,12)],'s').poly([(8,9),(13,6),(12,10),(10,12),(8,13)],'d')
    s.line([(3,5),(5,3),(9,3)],'l').dot((3,6),'h')
    if stage==0:
        s.poly([(6,4),(8,4),(9,6),(7,7),(5,6)],'4c92ab').dot((7,4),'b1e2e0').dot((4,10),'566f7a')
    if stage>=1:
        s.line([(5,5),(8,5),(9,6)],'b56b55').dot((8,5),'e49b71').line([(4,10),(6,11)],'8ca6ab')
    if stage>=2:
        s.ellipse((4,4,9,8),'252d39').ellipse((5,5,8,7),'071b27').line([(5,4),(7,4)],'c5d7d7')
        s.ellipse((9,8,12,11),'182632').dot((10,9),'071b27').dot((10,8),'97b8c1')
    if stage>=3:
        s.line([(3,7),(3,9),(5,10)],'253849').line([(8,9),(8,11),(10,12)],'7197a5')
        s.line([(9,5),(11,5),(11,7)],'b47450').dot((10,5),'e5b68a')
    if stage>=4:
        s.rect((0,8,3,10),'233342').rect((0,8,2,9),'8ba5ac').line([(1,8),(1,10)],'516975')
        s.rect((12,5,15,7),'233342').rect((13,5,15,6),'8ba5ac').line([(14,5),(14,7)],'516975')
    if stage>=5:
        s.ellipse((3,3,10,9),'6a898a').ellipse((4,4,9,8),'bad1c4').ellipse((5,5,8,7),'071b27')
        s.line([(4,4),(6,3),(8,4)],'e2ead0').dot((4,7),'92b3ae')
    if stage>=6:
        s.line([(2,10),(4,11),(5,11)],'bd9654').dot((3,10),'efe5ab')
        s.rect((9,4,11,5),'8a793f').dot((9,4),'f4efbf').dot((7,4),'afede5').dot((11,10),'b6eced')
    if stage>=7:
        s.line([(3,7),(4,8),(6,8),(6,10)],'c79554').line([(8,9),(10,9),(10,11)],'bf7656').dot((6,9),'e5c28c')
    if stage>=8:
        s.poly([(4,5),(5,3),(7,3),(8,5),(6,7)],'72c1d9').line([(5,4),(6,3)],'e4f8ec').dot((11,8),'6bbbd6').dot((11,9),'b5e7e5')
    if stage>=9:
        s.poly([(4,5),(5,3),(7,3),(8,5),(6,7)],'9274bd').line([(5,4),(6,3)],'d5c7e4')
        s.line([(7,7),(8,9),(7,10),(9,12)],'302e45').dot((10,8),'8c6bb6')
    return s


def seal():
    s=surface('polymer')
    s.ellipse((1,5,14,13),'o').ellipse((2,5,13,12),'d').ellipse((1,3,14,11),'o').ellipse((2,3,13,10),'s')
    s.ellipse((4,4,11,9),'d').ellipse((5,5,10,8),None).line([(3,5),(5,3),(9,3)],'l')
    return s.line([(3,8),(5,9)],'m').dot((3,4),'h').line([(10,10),(12,8)],'d').line([(5,12),(9,12)],'s')


def signal_diaphragm():
    s=surface('steel')
    s.ellipse((1,2,14,14),'o').ellipse((2,3,13,13),'s').ellipse((3,4,12,12),'m').ellipse((5,5,10,10),'d')
    s.ellipse((6,6,9,9),'927cbb').dot((7,6),'dacdec').line([(3,5),(5,3),(9,3)],'l').dot((4,4),'h')
    dots(s,[(4,7),(7,11),(11,7)],'213d4a')
    s.line([(4,8),(5,9),(9,10),(11,8)],'a').line([(6,4),(7,5),(9,4)],'b59762')
    return s.poly([(1,10),(3,10),(4,12),(2,13)],'596f77').dot((2,11),'a')


def pcb(etched):
    s=surface('copper')
    s.poly([(2,2),(11,1),(14,4),(14,12),(5,14),(1,11),(1,4)],'24392f')
    s.poly([(3,3),(11,2),(13,4),(13,11),(5,13),(2,10),(2,4)],'315d3e' if etched else '7e7744')
    s.line([(3,3),(10,2)],'78a66a' if etched else 'b9a866').line([(2,5),(2,9)],'517b45' if etched else '9b975e')
    dots(s,[(3,4),(11,4),(4,11),(11,10)],'1a3028')
    for pts in [[(4,5),(7,5),(7,3),(10,3)],[(3,8),(5,8),(5,10),(8,10),(8,12)],[(10,6),(10,8),(12,8)]]:
        s.line(pts,'d39a52' if etched else '314f37')
    s.rect((7,6,9,8),'315038' if etched else 'b4a259').dot((7,5),'f0cc80' if etched else '455d37')
    if etched:
        for y in (5,7,9): s.dot((13,y),'e8bb68')
        s.dot((10,6),'f6d98b').dot((5,10),'edc582')
    else: s.line([(4,6),(5,6)],'d0b774').dot((10,10),'b2a56d')
    return s


def electrode_block(refined):
    s=surface('copper').rect((0,0,15,15),'765244' if not refined else 'a36a4c')
    if refined:
        for x in (2,7,12):
            s.poly([(x,1),(x+2,1),(x+1,7),(x+2,14),(x,14),(x-1,8)],'664638')
            s.line([(x+1,2),(x+1,5),(x,8),(x+1,13)],'dca36d')
        for x,y in ((3,3),(9,6),(4,11),(11,12)): s.line([(x,y),(x+1,y)],'e6d4b0').dot((x,y+1),'b6bcab')
        s.line([(4,7),(5,6),(6,7)],'be8455')
    else:
        for pts in [[(2,2),(5,2),(6,5),(3,6),(1,4)],[(9,2),(12,1),(14,4),(12,7),(9,6)],[(3,9),(6,8),(8,11),(6,14),(2,13)],[(10,10),(13,8),(14,12),(11,14)]]:
            s.poly(pts,'a0694b')
        for x,y in ((3,3),(10,4),(4,11),(11,12)):
            s.poly([(x,y),(x+1,y-1),(x+2,y+1),(x+1,y+2)],'c4c7b6').dot((x+1,y),'e8e7d3')
        dots(s,[(7,3),(8,7),(2,7),(9,13)],'493e37')
    return s


def entropy_block(heated):
    s=surface('cryo').rect((0,0,15,15),'6b8eac' if not heated else '849da5')
    if heated:
        for pts,c in [([(1,3),(4,1),(6,3),(5,6),(2,7)],'c1d8dc'), ([(8,2),(12,1),(14,5),(11,7),(8,5)],'a0c5cf'), ([(2,10),(5,7),(8,10),(6,14),(2,13)],'b7d2db'), ([(9,9),(12,7),(14,11),(12,14),(9,13)],'91bacb')]: s.poly(pts,c)
        s.line([(3,3),(4,2),(5,3)],'f0f4e7').line([(9,3),(11,2)],'d3e7e4').line([(3,10),(5,9),(6,11)],'e0ece4')
        dots(s,[(7,4),(7,7),(8,12),(12,9)],'556d85')
    else:
        s.poly([(1,1),(7,2),(6,7),(2,9)],'82b0cc').poly([(9,3),(14,1),(14,9),(10,7)],'95c0d4')
        s.poly([(2,11),(7,8),(13,11),(11,14),(4,14)],'7cacc9')
        s.line([(2,4),(4,6),(5,10),(7,12)],'accfdd').line([(9,2),(8,6),(10,8),(11,12)],'557fa4')
        for x,y in ((4,3),(10,5),(6,11)):
            s.poly([(x,y),(x+1,y-1),(x+2,y+1),(x+1,y+3),(x,y+2)],'a7d7e6').dot((x+1,y),'e2f7ef')
    return s


DESIGNS={
    'omni_thermal_feed':'玄武岩骨料、冰晶合金与胶乳黏结的粗坯，保留青蓝矿粒与紫色星浆。',
    'omni_thermal_01':'复合坯加铁粒后的铁箍固定坯。', 'omni_thermal_02':'加入煤粉后的碳质复合坯。',
    'omni_thermal_03':'熔炉烧结的致密矿质坯。', 'omni_thermal_04':'高炉致密化的冰晶金属坯。',
    'omni_thermal_07':'切石机锯出的长衬条。', 'omni_thermal_08':'冰晶合金锻接的开口承压型材。',
    'omni_thermal_assembly_1':'闭合铆接承压骨架。', 'omni_thermal_09':'退火后的同一骨架，带少量氧化色。',
    'omni_thermal_10':'分切的两条薄衬板。', 'omni_thermal_11':'衬板粉碎得到冷灰蓝晶细粉。',
    'omni_thermal_12':'加铜熔炼的相变合金锭。', 'omni_thermal_13':'冲压的相变合金薄板。',
    'omni_thermal_15':'熔体冷铸壳体，边缘覆霜晶。', 'omni_thermal_assembly_2':'清理铸边并加固定点的金属壳体。',
    'omni_thermal_05':'烟熏熟化壳体中的棕褐生物衬层。', 'omni_thermal_06':'营火熟化壳体中的焦化衬层。',
    'omni_thermal_16_precursor':'实际沥青、海带原料组成的纤维沥青团。', 'omni_thermal_16':'离心整理后的纤维沥青，不是转子。',
    'omni_thermal_19':'玻璃瓶盛装琥珀色热解重馏分。', 'omni_thermal_assembly_3':'焦化壳体加重馏分的多层隔热衬层。',
    'omni_thermal_21':'同一壳体上长出的冰蓝晶层。', 'omni_thermal_22':'灌注后壳体出现绿色有机结合层。',
    'omni_thermal_20_precursor':'烈焰粉和恶魂之泪试剂。', 'omni_thermal_20':'玻璃瓶灌装的浅蓝相变抑制酿液。',
    'omni_engineering_feed':'冰晶载板上精密元件、虹移晶相和黑色基岩火焰粉。', 'omni_engineering_04':'干燥所得冷色导电薄膜。',
    'omni_engineering_05':'青蓝门瑞欧整合晶材。', 'omni_menril_foil':'青蓝门瑞欧导电箔。',
    'omni_engineering_06':'门瑞欧箔层铣制装配的栅架。', 'omni_engineering_07':'玻璃容器中分离的门瑞欧片层。',
    'omni_engineering_08_precursor':'铜基体中嵌石英颗粒。', 'omni_engineering_08_block':'电解后的连续铜层和净化石英。',
    'omni_engineering_assembly_1':'钢灰骨架、青蓝门瑞欧座和铜连接。', 'omni_engineering_09':'重熔的铜基门瑞欧合金锭。',
    'omni_engineering_10':'SAG 粉碎的铜青混合颗粒。', 'omni_engineering_11':'石英、铜、黏液与紫晶的多层绝缘薄带。',
    'omni_engineering_12':'charged_soul_filter 对应的紫色灵魂过滤介质。', 'omni_engineering_14_precursor':'玻璃瓶中的红石介质。',
    'omni_engineering_14':'灌入绿色经验液的灵魂媒介瓶。', 'omni_engineering_assembly_2':'铜绕线、深色绝缘骨架和灵魂过滤介质。',
    'omni_engineering_22':'铜供电线束、双钢制储罐与精密连接器。', 'omni_engineering_assembly_3':'加装低温隔热套的供能线组。',
    'omni_engineering_24':'低温线组上生长紫晶、石英及 Naquadah 耦合晶体。',
    'omni_pneumatic_feed':'含风暴氢晶的深灰金属阀坯。', 'omni_pneumatic_02':'压力致密化阀坯，带红石触点。',
    'omni_pneumatic_03':'同一阀坯钻出主孔和旁通孔。', 'omni_pneumatic_04':'钻孔阀坯增加激光精刻流道。',
    'omni_pneumatic_assembly_1':'钻刻阀体安装螺纹管口。', 'omni_pneumatic_08':'乳白浅青聚合物密封环。',
    'omni_pneumatic_assembly_2':'同一阀体加入聚合物密封环。', 'omni_pneumatic_11':'阀座充能电极与亮蓝晶触点。',
    'omni_pneumatic_12':'阀座上压印计算逻辑线路。', 'omni_pneumatic_13':'水中转化后的青蓝晶相阀座。',
    'omni_pneumatic_14':'爆炸转化后的紫晶相和受控裂纹。', 'omni_pneumatic_15_precursor':'蓝冰包裹赛特斯石英晶粒。',
    'omni_pneumatic_15_block':'熵变加热后暴露的赛特斯石英晶粒。', 'omni_pneumatic_assembly_3':'金属弹性膜、紫晶介质与熵变晶粒的阀片。',
    'omni_pneumatic_16':'完全曝光后的棕黄光阻覆铜板。', 'omni_pneumatic_17':'蚀刻后的绿底铜线 PCB。',
}


def draw(catalog, assets_root):
    item_art={
        'omni_thermal_feed':lambda:mineral(0),'omni_thermal_01':lambda:mineral(1),'omni_thermal_02':lambda:mineral(2),
        'omni_thermal_03':lambda:mineral(3),'omni_thermal_04':lambda:mineral(4),'omni_thermal_07':lambda:cryo_strip(0),
        'omni_thermal_08':lambda:cryo_strip(1),'omni_thermal_assembly_1':lambda:cryo_strip(2),'omni_thermal_09':lambda:cryo_strip(3),
        'omni_thermal_10':sawed_liners,'omni_thermal_11':lambda:powder('cryo',accent='80c9d4'),
        'omni_thermal_12':alloy_ingot,'omni_thermal_13':pressed_panel,'omni_thermal_15':lambda:phase_shell(0),
        'omni_thermal_assembly_2':lambda:phase_shell(1),'omni_thermal_05':lambda:phase_shell(2),'omni_thermal_06':lambda:phase_shell(3),
        'omni_thermal_16_precursor':lambda:tar_fibre(False),'omni_thermal_16':lambda:tar_fibre(True),
        'omni_thermal_19':lambda:vial('tar'),'omni_thermal_assembly_3':lambda:phase_shell(4),'omni_thermal_21':lambda:phase_shell(5),
        'omni_thermal_22':lambda:phase_shell(6),'omni_thermal_20_precursor':brew_reagent,'omni_thermal_20':lambda:vial('brew'),
        'omni_engineering_feed':lambda:conductive_feed(False),'omni_engineering_04':lambda:conductive_feed(True),
        'omni_engineering_05':lambda:menril('integrated'),'omni_menril_foil':lambda:menril('foil'),
        'omni_engineering_06':lambda:menril('lattice'),'omni_engineering_07':lambda:menril('separated'),
        'omni_engineering_assembly_1':conductive_frame,'omni_engineering_09':lambda:alloy_ingot(True),
        'omni_engineering_10':lambda:powder('copper',True,'4da6b8'),'omni_engineering_11':dielectric_strips,
        'omni_engineering_12':soul_filter,'omni_engineering_14_precursor':lambda:vial('redstone'),
        'omni_engineering_14':lambda:vial('xp'),'omni_engineering_assembly_2':winding,
        'omni_engineering_22':lambda:flight_harness(),'omni_engineering_assembly_3':lambda:flight_harness(True),
        'omni_engineering_24':lambda:flight_harness(True,True),
        'omni_pneumatic_feed':lambda:valve(0),'omni_pneumatic_02':lambda:valve(1),'omni_pneumatic_03':lambda:valve(2),
        'omni_pneumatic_04':lambda:valve(3),'omni_pneumatic_assembly_1':lambda:valve(4),'omni_pneumatic_08':seal,
        'omni_pneumatic_assembly_2':lambda:valve(5),'omni_pneumatic_11':lambda:valve(6),'omni_pneumatic_12':lambda:valve(7),
        'omni_pneumatic_13':lambda:valve(8),'omni_pneumatic_14':lambda:valve(9),'omni_pneumatic_assembly_3':signal_diaphragm,
        'omni_pneumatic_16':lambda:pcb(False),'omni_pneumatic_17':lambda:pcb(True),
    }
    block_art={'omni_engineering_08_precursor':lambda:electrode_block(False),'omni_engineering_08_block':lambda:electrode_block(True),
        'omni_pneumatic_15_precursor':lambda:entropy_block(False),'omni_pneumatic_15_block':lambda:entropy_block(True)}
    result={'items':{},'blocks':{}}
    assert set(DESIGNS)==set(item_art)|set(block_art)
    for group,drawings in [('items',item_art),('blocks',block_art)]:
        expected=targets(catalog,{'thermal','engineering','pneumatic'},group)
        assert {i.split(':',1)[1] for i in expected}==set(drawings),(group,set(expected),set(drawings))
        for ident in expected:
            result[group][ident]=drawings[ident.split(':',1)[1]]().save(assets_root,ident,'item' if group=='items' else 'block')
    return result


if __name__=='__main__':
    import json
    root=Path(__file__).resolve().parents[3]
    import sys
    sys.path.insert(0,str(root/'kubejs/tools'))
    from omni_alloy_sources import read_catalog
    catalog=read_catalog()['registrations']
    print({k:len(v) for k,v in draw(catalog,root/'kubejs/assets').items()})
