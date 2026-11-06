from tpl import *
from gb import GB
def done(name,b): TPL[name]=b.outline().rows(); return TPL[name]

# VALVE: globe valve body with flanges, stem, handwheel (slot1 = handwheel/stem accents)
b=GB()
b.add(GB.rect(0,7,2,12),0,'cylv',3,edge=True)          # left flange
b.add(GB.rect(13,7,15,12),0,'cylv',3,edge=True)        # right flange
b.add(GB.rect(2,8,13,11),0,'cylh',3)                   # pipe
b.add(GB.ell(7.5,9.5,4.5,3.6),0,'sphere',3,edge=True)  # globe
b.add(GB.rect(6,4,9,6),0,'cylv',3,edge=True)           # bonnet
b.add(GB.rect(7,2,8,4),1,'cylv',3)                     # stem
b.add(GB.ell(7.5,1.5,4.2,1.4),1,'cylh',4,edge=True)    # handwheel
b.put([(5,9),(10,9)],'x')                               # port marks (accent)
done('VALVE',b)

# SHEET: soft membrane sheet with curled corner (front 3/4)
b=GB()
b.add(GB.poly([(1,5),(11,2),(15,9),(5,13)]),0,'diag',4)
b.add(GB.poly([(11,2),(15,9),(13,9),(10,4)]),0,'flat',2)            # curled edge shadow
b.add(GB.poly([(12,6),(15,9),(12,10)]),0,'flat',5)                    # curl highlight
done('SHEET',b)

# SLICES: three fanned slabs (thick), front faces show cut
b=GB()
for i,(x,y) in enumerate([(7,1),(4,5),(1,9)]):
    top=b.add(GB.poly([(x,y+2),(x+6,y),(x+10,y+2),(x+4,y+4)]),0,'flat',4,edge=False)
    b.add(GB.poly([(x,y+2),(x+4,y+4),(x+4,y+6),(x,y+4)]),0,'flat',3)
    b.add(GB.poly([(x+4,y+4),(x+10,y+2),(x+10,y+4),(x+4,y+6)]),0,'flat',2)
done('SLICES',b)

# SCROLL: rolled parchment diagonal with end caps (slot1 = rods)
b=GB()
b.add(GB.poly([(3,11),(11,3),(13,5),(5,13)]),0,'diag',4)
b.add(GB.line(2,10,5,13,2),1,'flat',3,edge=True)
b.add(GB.line(11,2,14,5,2),1,'flat',4,edge=True)
b.put([(6,9),(7,8),(8,7),(9,6)],'x'); b.put([(7,10),(9,8)],'y')
done('SCROLL',b)

# FRAME: open cube frame (iso) - bars
b=GB()
outer=GB.poly([(8,1),(15,4.5),(15,11.5),(8,15),(1,11.5),(1,4.5)])
b.add(outer,0,'flat',3)
top=GB.poly([(8,1),(15,4.5),(8,8),(1,4.5)]); left=GB.poly([(1,4.5),(8,8),(8,15),(1,11.5)]); right=GB.poly([(8,8),(15,4.5),(15,11.5),(8,15)])
b.add(top,0,'flat',4); b.add(left,0,'flat',3); b.add(right,0,'flat',2)
# windows (holes) in each face
b.clear(GB.poly([(8,2.9),(12.2,4.6),(8,6.3),(3.8,4.6)]))
b.clear(GB.poly([(2.6,6.6),(6.6,8.6),(6.6,12.6),(2.6,10.6)]))
b.clear(GB.poly([(9.4,8.6),(13.4,6.6),(13.4,10.6),(9.4,12.6)]))
done('FRAME',b)

# SHELL: hemispherical housing (dome) with flange base
b=GB()
b.add(GB.ell(8,13,7.5,2.3),0,'flat',2)
b.add(GB.ell(8,9.5,6.4,6.6)&GB.rect(0,0,15,12),0,'sphere',3)
b.add(GB.ell(8,12.6,7.2,1.6),0,'cylh',3,edge=True)
b.put([(5,5),(6,4)],'5')
done('SHELL',b)

# SANDWICH: layered panel (iso plate with 3 layers on sides). slot0 top/bottom sheets, slot1 core layer
b=GB()
b.add(GB.poly([(1,6),(9,2),(15,5),(7,9)]),0,'flat',4)
b.add(GB.poly([(1,6),(7,9),(7,13),(1,10)]),0,'flat',3)
b.add(GB.poly([(7,9),(15,5),(15,9),(7,13)]),0,'flat',2)
b.add(GB.poly([(1,7.4),(7,10.4),(7,11.6),(1,8.6)]),1,'flat',3)
b.add(GB.poly([(7,10.4),(15,6.4),(15,7.6),(7,11.6)]),1,'flat',2)
done('SANDWICH',b)

# FOILROLL: rolled foil cylinder lying diagonal with loose end
b=GB()
b.add(GB.poly([(1,9),(10,4),(14,8),(5,13)]),0,'diag',4)
b.add(GB.ell(12,6,3,3.3),0,'flat',3,edge=True)
b.add(GB.ell(12,6,1.6,1.7),0,'flat',1)
b.add(GB.poly([(1,9),(5,13),(3,15),(0,12)]),0,'flat',5)
done('FOILROLL',b)

# HARNESS: bundle of 3 cables with connector block (slots: 0 connector, 1/2/3 cable colors)
b=GB()
for i,sl in enumerate((1,2,3)):
    b.add(GB.line(2+i,13-i,10+i,5-i,2),sl,'flat',3)
b.add(GB.poly([(10,1),(15,4),(13,8),(8,5)]),0,'diag',4,edge=True)
b.add(GB.rect(1,12,4,15),0,'box',3,edge=True)
done('HARNESS',b)

# GASKET: thin flat ring (O-ring)
b=GB()
b.add(GB.ell(8,8,7.4,5.2)-GB.ell(8,8,4.6,2.6),0,lambda x,y: 4 if (x+y)<14 else (3 if (x+y)<18 else 2))
b.add(GB.ell(8,9.2,4.6,2.6)&GB.ell(8,8,7.4,5.2)-GB.ell(8,8,4.6,2.6),0,'flat',2)
done('GASKET',b)

# CRYSTAL: cluster of 3 prism crystals on a base
b=GB()
b.add(GB.poly([(2,14),(14,14),(13,12),(3,12)]),1,'flat',2,edge=True)
b.add(GB.poly([(3,13),(5,6),(7,4),(8,13)]),0,lambda x,y: 4 if x<6 else 3)
b.add(GB.poly([(6,13),(8,3),(10,1),(12,13)]),0,lambda x,y: 5 if x<9 else (4 if x<10 else 2))
b.add(GB.poly([(10,13),(12,7),(14,6),(14,13)]),0,lambda x,y: 3 if x<13 else 2)
done('CRYSTAL',b)

# BLADEBLANK: diagonal unfinished blade blank (tang lower-left)
b=GB()
b.add(GB.poly([(4,10),(12,2),(15,1),(14,4),(6,12)]),0,lambda x,y: 5 if (x+y)<14 and (x-y)>2 else 4 if (x-y)>0 else 3)
b.add(GB.poly([(1,13),(4,10),(6,12),(3,15)]),1,'flat',3,edge=True)
done('BLADEBLANK',b)

# WALLSEG: curved chamber wall segment (arc band) seen 3/4
b=GB()
outer=GB.ell(8,13,7.6,10.5); inner=GB.ell(8,13,4.4,7.0)
band=(outer-inner)&GB.rect(0,0,15,13)
b.add(band,0,lambda x,y: 4 if x<6 else (3 if x<10 else 2))
b.add(GB.rect(0,12,15,14)&(GB.ell(8,13,7.6,10.5)-GB.ell(8,13,4.4,7.0)) ,0,'flat',2)
done('WALLSEG',b)

# LINER: curved plate (half-cylinder shell) diagonal
b=GB()
b.add(GB.poly([(1,9),(9,2),(15,6),(7,13)]),0,lambda x,y: 4 if (x+y)<13 else 3 if (x+y)<18 else 2)
b.add(GB.poly([(1,9),(7,13),(7,15),(1,11)]),0,'flat',2)
b.add(GB.poly([(7,13),(15,6),(15,8),(7,15)]),0,'flat',1)
done('LINER',b)

# CUBE: iso cube
b=GB()
b.add(GB.poly([(8,1),(15,4.5),(8,8),(1,4.5)]),0,'flat',4)
b.add(GB.poly([(1,4.5),(8,8),(8,15),(1,11.5)]),0,'flat',3)
b.add(GB.poly([(8,8),(15,4.5),(15,11.5),(8,15)]),0,'flat',2)
done('CUBE',b)

# PLATE: iso thin plate
b=GB()
b.add(GB.poly([(8,3),(15,6.5),(8,10),(1,6.5)]),0,'flat',4)
b.add(GB.poly([(1,6.5),(8,10),(8,12),(1,8.5)]),0,'flat',3)
b.add(GB.poly([(8,10),(15,6.5),(15,8.5),(8,12)]),0,'flat',2)
done('PLATE',b)

# WAFERS: stack of thin discs offset
b=GB()
for i,(cx,cy) in enumerate([(9.5,4),(8,7.5),(6.5,11)]):
    b.add(GB.ell(cx,cy+1.2,6,2.6),0,'flat',2,edge=True)
    b.add(GB.ell(cx,cy,6,2.6),0,lambda x,y: 4 if x<8 else 3,edge=True)
done('WAFERS',b)

# SHARDS: three angular fragments
b=GB()
b.add(GB.poly([(1,12),(4,6),(7,9),(5,14)]),0,lambda x,y: 4 if x<4 else 2,edge=True)
b.add(GB.poly([(6,8),(10,1),(13,5),(9,12)]),0,lambda x,y: 5 if x<9 and y<6 else 3 if x<11 else 2,edge=True)
b.add(GB.poly([(9,14),(12,9),(15,12),(13,15)]),0,lambda x,y: 4 if x<12 else 2,edge=True)
done('SHARDS',b)

# MIX: heap of slot0 granules with slot1 chunks
b=GB()
b.add(GB.ell(8,12,7.4,3.6),0,lambda x,y: 4 if (x+y)<16 else 3 if (x+y)<20 else 2)
b.add(GB.ell(5,9,3,2.6),1,'sphere',3,edge=True)
b.add(GB.ell(11,8,2.6,2.6),1,'sphere',3,edge=True)
done('MIX',b)

# PIPEPART (milled bracket): L-shaped bracket with holes
b=GB()
b.add(GB.poly([(1,9),(8,5),(15,9),(8,13)]),0,'flat',4)
b.add(GB.poly([(1,9),(8,13),(8,15),(1,11)]),0,'flat',3)
b.add(GB.poly([(8,13),(15,9),(15,11),(8,15)]),0,'flat',2)
b.add(GB.poly([(4,7.4),(8,5),(8,1),(4,3.4)]),0,'flat',3)
b.add(GB.poly([(8,5),(9.6,5.9),(9.6,1.9),(8,1)]),0,'flat',2)
b.put([(6,9),(10,9),(8,10),(6,4)],'x')
done('BRACKET',b)

# GADGET: small brass instrument (dial + balloon) slot1 balloon
b=GB()
b.add(GB.ell(10.5,5,4.2,4.4),1,'sphere',3,edge=True)
b.add(GB.line(9,9,6,11,1),1,'flat',2)
b.add(GB.ell(6,11.5,5,3.6),0,'sphere',3,edge=True)
b.add(GB.ell(6,11.5,2.8,1.8),0,'flat',5)
b.put([(6,11),(7,10)],'x')
done('GADGET',b)
