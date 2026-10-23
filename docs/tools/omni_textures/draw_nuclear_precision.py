"""Native 16 px material studies for the neutron ring and optical grating.

Geometry follows the process material, rather than the machine that makes it:
machined silver alloy, borated graphite, isotope membranes, clad fuel and heat
exchange rings; steel scribers, real film, photographs and glass measuring rules.
All production pixels are plotted here at their final resolution.  Highlights
face the upper left.  No source pictures, noise, generated art or resampling.
"""
from pixel import Sprite, targets


MATERIALS = {
    "steel": {"o":"29313a", "d":"4c5964", "s":"7d8c94", "m":"acb9bb", "l":"d5dfd9", "h":"f3f7e9", "a":"84beca", "b":"b48a58"},
    "graphite": {"o":"24282d", "d":"343c44", "s":"515d66", "m":"7b8b91", "l":"abb8b8", "h":"d5deda", "a":"8ab8c6", "b":"ae8050"},
    "ceramic": {"o":"3b3b3e", "d":"747477", "s":"a4a6a1", "m":"cfcec1", "l":"e7e5d3", "h":"fff5dd", "a":"8ab8c6", "b":"a87553"},
    "copper": {"o":"45322d", "d":"795041", "s":"ab7050", "m":"d59b66", "l":"ecc68b", "h":"ffe6b5", "a":"829fa1", "b":"bac9c7"},
    "glass": {"o":"384452", "d":"536e83", "s":"7a9ea8", "m":"a1c8c6", "l":"d5e6d8", "h":"f5faf0", "a":"b4a6d3", "b":"b9a171"},
    "paper": {"o":"4b4038", "d":"8a7360", "s":"b9a185", "m":"dbc8a4", "l":"f1e4c5", "h":"fff5da", "a":"6c807e", "b":"5e685f"},
    "film": {"o":"292b30", "d":"3e424a", "s":"616874", "m":"8b929a", "l":"c0c4c8", "h":"f0f0e8", "a":"b9a784", "b":"736348"},
    "chaos": {"o":"292638", "d":"493b51", "s":"716075", "m":"a18b9b", "l":"d3b9c0", "h":"fff0d9", "a":"a2d6d5", "b":"d39f64"},
}


def material(kind):
    s = Sprite("nuclear")
    s.palette = MATERIALS[kind]
    return s


def blank_ring(kind="steel"):
    """Thick, tilted annulus: a bright top face and shaded near edge."""
    s = material(kind)
    s.ellipse((1,4,14,14),"o").ellipse((2,4,13,13),"d")
    s.ellipse((1,1,14,12),"o").ellipse((2,2,13,11),"s")
    s.line([(3,4),(5,3),(10,3)],"l")
    s.line([(2,5),(2,7)],"m")
    s.ellipse((4,4,11,10),"o").ellipse((5,5,10,9),"d")
    s.ellipse((5,6,10,9),None)
    s.line([(5,10),(10,10)],"m").line([(5,13),(10,13)],"s")
    return s


def nuclear_feed():
    # Ice alloy and a star-slurry blank: unmachined, hollow and helium sealed.
    s = blank_ring("steel")
    s.line([(3,4),(5,2),(10,2)],"#b6d9df")
    s.dot((3,3),"#e5f2ef").line([(11,3),(12,4)],"#8dabb9")
    s.rect((11,8,14,10),"o").rect((12,8,14,9),"a")
    s.rect((13,7,14,7),"s").dot((12,8),"h")
    s.line([(3,10),(5,12)],"m").line([(11,11),(12,10)],"d")
    return s


def machined_arc_sections():
    # Manufacturing cuts the rough ring into curved, regular stock sections.
    s = material("steel")
    s.poly([(2,6),(5,2),(9,1),(11,3),(7,5),(5,8),(4,10),(1,9)],"o")
    s.poly([(2,7),(5,3),(9,2),(9,3),(6,5),(4,8)],"m")
    s.line([(3,6),(5,3),(8,2)],"h").line([(3,8),(4,9),(5,7)],"d")
    s.poly([(7,8),(10,5),(13,4),(15,6),(12,9),(10,13),(7,14),(5,12)],"o")
    s.poly([(7,9),(11,6),(13,5),(13,6),(10,10),(9,12),(7,13),(6,12)],"s")
    s.line([(7,9),(11,6),(12,6)],"l")
    s.line([(10,10),(11,8)],"m").dot((7,12),"d")
    return s


def crushed_fragments():
    # Crushed ice-alloy stock: angular chips, without radioactive green dust.
    s = material("steel")
    for pts in [([(1,5),(4,2),(7,3),(6,7),(2,8)]),
                ([(9,3),(13,4),(14,7),(11,9),(8,6)]),
                ([(3,10),(6,8),(10,11),(8,14),(3,14),(1,12)])]:
        s.poly(pts,"o")
    s.poly([(2,5),(4,3),(6,4),(5,6),(2,7)],"m")
    s.line([(2,5),(4,3)],"h").poly([(5,5),(6,4),(5,7),(3,7)],"d")
    s.poly([(9,4),(12,5),(13,7),(11,8),(9,6)],"s")
    s.line([(10,4),(12,5)],"l")
    s.poly([(3,11),(6,9),(8,11),(7,13),(3,13),(2,12)],"s")
    s.line([(3,11),(5,10)],"l").dot((7,12),"d")
    s.rect((12,11,13,12),"d").dot((12,11),"m").dot((10,14),"s")
    return s


def borated_alloy():
    # Boron is added at the alloy smelter: graphite-grey metallic stock.
    s = material("graphite")
    s.poly([(1,8),(4,4),(11,2),(14,5),(14,9),(11,12),(4,14),(1,12)],"o")
    s.poly([(2,8),(5,5),(11,3),(13,5),(10,8),(4,10)],"m")
    s.poly([(2,9),(4,11),(10,9),(13,6),(13,9),(10,11),(4,13),(2,11)],"s")
    s.line([(2,8),(4,10),(4,12)],"l").line([(5,5),(10,4)],"h")
    s.line([(7,5),(6,7),(8,8),(7,9)],"s")
    s.line([(7,11),(11,9)],"d").dot((11,5),"l")
    return s


def pressure_plate():
    # Compacted high-density blank: broad flat face and a slim compressed edge.
    s = material("graphite")
    s.poly([(1,8),(7,3),(13,3),(15,6),(10,12),(3,14),(1,12)],"o")
    s.poly([(2,8),(7,4),(12,4),(14,6),(9,10),(3,12)],"m")
    s.poly([(3,12),(9,10),(14,6),(14,8),(10,12),(3,13),(2,12)],"d")
    s.line([(3,8),(7,5),(11,5)],"l")
    s.line([(5,9),(9,6)],"s").line([(7,10),(11,7)],"s")
    s.line([(3,12),(8,10)],"s").dot((7,4),"h")
    return s


def cast_ring_stock():
    # Ingot-former casting is deliberately a solid turning blank, not a reactor.
    s = material("steel")
    s.ellipse((2,5,13,14),"o").rect((2,6,13,10),"o")
    s.ellipse((3,6,12,13),"d").rect((3,6,12,10),"d")
    s.ellipse((2,2,13,11),"o").ellipse((3,3,12,10),"s")
    s.poly([(4,5),(6,4),(10,4),(11,5),(10,6),(5,8),(4,7)],"m")
    s.line([(4,5),(6,4),(9,4)],"h")
    s.line([(4,11),(6,12),(10,12)],"s")
    s.rect((6,6,9,8),"s").line([(7,6),(8,6)],"l")
    s.dot((11,7),"d")
    return s


def dense_ring():
    # Finished load-bearing annulus, with a properly bored central opening.
    s = blank_ring("steel")
    s.line([(3,4),(4,3),(10,3)],"h").line([(12,5),(12,7)],"d")
    s.line([(3,8),(4,9)],"l").line([(11,10),(12,9)],"s")
    s.dot((4,11),"d").dot((11,11),"d")
    s.rect((6,11,9,12),"d").line([(6,11),(9,11)],"m")
    return s


def separated_laminae():
    # Isotope-separator output is sorted metallic laminae from the bearing ring.
    s = material("steel")
    for dx,dy in [(0,6),(1,3),(2,0)]:
        s.poly([(1+dx,5+dy),(6+dx,2+dy),(11+dx,3+dy),(12+dx,5+dy),(6+dx,8+dy),(1+dx,7+dy)],"o")
        s.poly([(2+dx,5+dy),(6+dx,3+dy),(10+dx,4+dy),(11+dx,5+dy),(6+dx,7+dy),(2+dx,6+dy)],"s")
        s.line([(2+dx,5+dy),(6+dx,3+dy),(9+dx,4+dy)],"l")
        s.line([(5+dx,5+dy),(8+dx,4+dy)],"d")
    s.dot((7,3),"h").dot((10,5),"#c7b993")
    return s


def infused_mesh():
    # Iron supplied at fluid infusion becomes electrolyte-wetted porous foil.
    s = material("steel")
    s.poly([(2,5),(10,2),(14,5),(13,11),(6,14),(1,11)],"o")
    s.poly([(3,5),(10,3),(13,5),(12,10),(6,13),(2,10)],"d")
    for start,end in [((3,6),(10,4)),((3,8),(12,5)),((3,10),(12,7)),((5,11),(12,9))]:
        s.line([start,end],"m")
    for start,end in [((4,6),(6,12)),((7,5),(9,11)),((10,4),(12,9))]:
        s.line([start,end],"s")
    s.line([(3,5),(10,3)],"h").line([(6,13),(12,10)],"s")
    s.dot((5,7),"#9bc6cd").dot((8,8),"#bce0df").dot((10,6),"#9bc6cd")
    return s


def crystallized_filter_salt():
    # Redstone/quartz enrichment + leaching crystallizes pale rose silica plates.
    s = material("ceramic")
    s.poly([(2,11),(3,5),(6,2),(8,6),(7,13),(4,14)],"o")
    s.poly([(3,10),(4,5),(6,3),(6,11),(4,13)],"#d3a69c")
    s.line([(4,6),(6,3)],"#ffead7").line([(6,6),(6,11)],"#a67b82")
    s.poly([(7,12),(7,5),(10,1),(13,5),(12,12),(10,14)],"o")
    s.poly([(8,6),(10,2),(11,5),(10,12),(8,11)],"#f0c5b4")
    s.poly([(11,5),(12,5),(11,12),(10,13),(10,10)],"#a77f87")
    s.line([(9,5),(10,3)],"#fff0df")
    s.poly([(11,13),(12,9),(14,7),(15,10),(14,13)],"o")
    s.line([(12,12),(14,9),(14,11)],"#d7a79a")
    return s


def filter_screen():
    # Assembler combines the crystalline media and redstone electrical contacts.
    s = material("steel")
    s.poly([(1,7),(8,2),(14,5),(14,10),(7,14),(1,11)],"o")
    s.poly([(2,7),(8,3),(13,5),(13,9),(7,13),(2,10)],"m")
    s.poly([(4,7),(8,5),(11,6),(11,9),(7,11),(4,9)],"d")
    for x,y in [(5,7),(7,6),(9,7),(5,9),(7,8),(9,9)]:
        s.dot((x,y),"#d0aca5")
    s.line([(2,7),(8,3),(11,4)],"h")
    s.line([(7,13),(12,10)],"s")
    s.rect((1,9,2,10),"#a65e53").rect((12,5,13,6),"#a65e53")
    return s


def annular_filter():
    # Thin stacked annular screens: recognizably a layer for the bearing ring.
    s = material("steel")
    s.ellipse((1,7,14,14),"o").ellipse((2,8,13,13),"d")
    s.ellipse((1,4,14,12),"o").ellipse((2,5,13,11),"s")
    s.ellipse((1,1,14,10),"o").ellipse((2,2,13,9),"m")
    s.ellipse((4,3,11,9),"d").ellipse((5,4,10,9),None)
    s.line([(3,4),(5,3),(10,3)],"l")
    for x,y in [(3,5),(3,7),(5,8),(7,9),(9,9),(11,8),(12,6),(11,3)]:
        s.dot((x,y),"d")
    s.line([(4,11),(10,11)],"#bd9c94").line([(5,13),(10,13)],"s")
    return s


def stable_isotope_pellets():
    # Decay hastening leaves stable, dull ceramic/metal pellets for melting.
    s = material("graphite")
    for x,y in [(1,7),(8,6),(4,1)]:
        s.rect((x,y+2,x+5,y+5),"o").ellipse((x,y+3,x+5,y+6),"o")
        s.rect((x+1,y+2,x+4,y+5),"s")
        s.line([(x+4,y+3),(x+4,y+5)],"d")
        s.ellipse((x,y,x+5,y+4),"o").ellipse((x+1,y+1,x+4,y+3),"m")
        s.line([(x+1,y+1),(x+3,y+1)],"l")
        s.line([(x+1,y+5),(x+2,y+6)],"m")
    s.dot((10,8),"#a59472").dot((6,3),"#bfb6a1")
    return s


def absorber_layer():
    # Borated carbon tiles assembled into a split annular neutron absorber.
    s = material("graphite")
    s.poly([(4,1),(10,1),(13,4),(13,11),(10,14),(4,14),(1,11),(1,4)],"o")
    s.poly([(4,2),(10,2),(12,4),(12,10),(10,12),(4,12),(2,10),(2,4)],"#69747a")
    s.poly([(5,4),(9,4),(10,5),(10,9),(9,10),(5,10),(4,9),(4,5)],"o")
    s.rect((5,5,9,9),None)
    s.line([(3,4),(4,3),(9,3)],"m").line([(4,12),(10,12)],"d")
    # Joints distinguish segmented ceramic from the metallic load-bearing ring.
    for a,b in [((4,2),(5,4)),((10,2),(9,4)),((2,6),(4,6)),((2,10),(4,9)),((6,10),(6,13)),((10,11),(12,12))]:
        s.line([a,b],"o")
    s.line([(11,4),(11,8)],"#799ca5").dot((3,4),"l")
    s.rect((12,6,14,8),None)
    return s


def spent_fuel():
    # The wrapper consumes HEA-242 depleted fuel: discrete clad fuel rods.
    s = material("steel")
    for x,y in [(2,4),(6,2),(10,4)]:
        s.rect((x,y,x+3,12),"o").rect((x+1,y+1,x+2,11),"d")
        s.rect((x,y,x+3,y+1),"s").dot((x+1,y),"h")
        for py in (y+3,y+5,y+7):
            if py<12:s.line([(x+1,py),(x+2,py)],"#86776d")
        s.rect((x,12,x+3,13),"m")
    s.rect((1,8,14,9),"o").rect((2,8,13,8),"s")
    s.dot((3,8),"l").dot((11,8),"l")
    return s


def reprocessed_granules():
    # Separated fractions are laid out on a creased ceramic process foil.
    s = material("ceramic")
    s.poly([(1,9),(7,5),(14,8),(13,12),(7,15),(1,12)],"o")
    s.poly([(2,9),(7,6),(13,8),(12,11),(7,14),(2,11)],"m")
    s.line([(2,9),(7,6)],"h").line([(7,13),(12,10)],"s")
    for pts in [([(3,7),(5,5),(7,6),(7,9),(5,10),(3,9)]),
                ([(8,7),(10,5),(12,6),(12,9),(10,10),(8,9)]),
                ([(6,11),(8,9),(10,10),(9,12),(7,13)])]:
        s.poly(pts,"#353b42")
    s.line([(4,7),(5,6),(6,6)],"#aeb8b6").line([(4,8),(6,9)],"#67737a")
    s.line([(9,7),(10,6),(11,6)],"#ba9d7e").dot((10,8),"#736760")
    s.line([(7,11),(8,10)],"#8a9a9d")
    return s


def salt_fuel_capsule():
    # MSR depleted-fuel carrier: a refractory capsule containing salt deposits.
    s = material("ceramic")
    s.poly([(4,3),(10,3),(12,5),(12,11),(10,14),(5,14),(3,11),(3,5)],"o")
    s.poly([(4,6),(11,6),(11,11),(9,13),(5,13),(4,11)],"s")
    s.rect((4,6,5,10),"l").line([(5,12),(8,13)],"m")
    s.ellipse((3,1,12,7),"o").ellipse((4,2,11,6),"m")
    s.ellipse((5,3,10,5),"#4e4945")
    s.dot((6,4),"#bea681").dot((8,3),"#ddc3a2").dot((9,4),"#9b8066")
    s.line([(4,3),(5,2),(9,2)],"h")
    s.rect((3,8,12,9),"#606c72").line([(4,8),(10,8)],"#a7b3b3")
    return s


def locking_ring():
    # Absorber annulus clad with a bright interlocking metal retaining ring.
    s = blank_ring("graphite")
    s.line([(3,4),(5,2),(10,2),(12,4)],"#b7c0bb")
    s.line([(3,9),(5,11),(10,11),(12,9)],"#8a999d")
    for x,y in [(1,5),(11,5),(5,11)]:
        s.rect((x,y,x+3,y+2),"o").rect((x+1,y,x+2,y+1),"#a8b7b6")
        s.dot((x+1,y),"#e6e8d6")
    s.rect((12,8,14,10),"o").rect((12,8,13,9),"#b89870")
    s.dot((12,8),"#e6cc9e")
    return s


def heat_exchange_sleeve():
    # Coaxial ring sleeve; copper cooling fins surround the retained clear bore.
    s = material("steel")
    s.ellipse((1,5,14,14),"o").ellipse((2,5,13,13),"d")
    s.line([(3,11),(5,13),(10,13),(12,11)],"#b87e54")
    s.line([(2,9),(4,11),(11,11),(13,9)],"#d29c68")
    s.line([(2,7),(4,9),(11,9),(13,7)],"#936142")
    s.ellipse((1,1,14,10),"o").ellipse((2,2,13,9),"m")
    s.ellipse((4,3,11,9),"o").ellipse((5,4,10,8),"d")
    s.ellipse((5,5,10,8),None)
    s.line([(3,4),(5,3),(10,3)],"h")
    s.line([(3,6),(4,7)],"s").line([(11,6),(12,5)],"s")
    s.rect((1,6,2,11),"s").rect((13,5,14,10),"d")
    s.dot((1,6),"l").line([(6,10),(9,10)],"#b6c4c1")
    return s


def field_stabilized_ring():
    # Kugelblitz processing densifies the sleeve; restrained charged bore seam.
    s = material("graphite")
    s.poly([(4,1),(10,1),(14,5),(14,10),(10,14),(4,14),(1,10),(1,5)],"o")
    s.poly([(4,2),(10,2),(13,5),(13,9),(10,12),(4,12),(2,9),(2,5)],"s")
    s.poly([(5,4),(9,4),(11,6),(11,8),(9,10),(5,10),(4,8),(4,6)],"o")
    s.poly([(6,5),(9,5),(10,6),(10,8),(9,9),(6,9),(5,8),(5,6)],None)
    s.line([(3,5),(5,3),(9,3)],"l").line([(3,6),(3,8)],"m")
    s.line([(5,10),(9,10),(11,8)],"#87bdc7")
    s.line([(5,13),(10,13)],"#a37857")
    s.rect((11,3,12,4),"d").dot((11,3),"m")
    s.line([(3,10),(5,12)],"d")
    return s


def calibrated_target_ring():
    # The actual ring is a particle-beam target, with an irradiated inner lining.
    s = blank_ring("steel")
    s.ellipse((4,4,11,10),"#745341").ellipse((5,5,10,9),"#cfa773")
    s.ellipse((5,6,10,9),None)
    s.line([(5,5),(8,5)],"#f0d6a4")
    s.line([(7,2),(7,4)],"d").line([(2,6),(4,6)],"d")
    s.line([(11,6),(13,6)],"d").line([(7,10),(7,12)],"d")
    s.dot((3,4),"h").dot((11,10),"#b4d3d4")
    s.line([(4,12),(6,13),(10,13)],"#6a818c")
    return s


def boron_quartz_feed():
    # Extractor feed is explicitly boron + quartz: mineral mix, not a vial.
    s = material("graphite")
    s.poly([(1,10),(3,6),(7,5),(10,8),(9,13),(5,15),(1,13)],"o")
    s.poly([(2,10),(4,7),(7,6),(9,8),(7,12),(4,13),(2,12)],"s")
    s.line([(3,9),(4,7),(6,7)],"m").line([(3,12),(6,13)],"d")
    s.poly([(7,7),(8,3),(10,1),(12,4),(11,9),(9,11)],"o")
    s.poly([(8,7),(9,3),(10,2),(10,8),(9,9)],"#dbe0d4")
    s.poly([(10,3),(11,4),(10,9),(9,10),(10,7)],"#96aaa9")
    s.line([(9,4),(10,2)],"#fff7dd")
    s.poly([(10,12),(11,9),(13,8),(15,10),(13,14)],"o")
    s.poly([(11,12),(12,10),(13,9),(14,10),(13,12)],"#b8c6c1")
    return s


def redstone_quartz_feed():
    # Enricher feed is redstone + quartz, visually continuous with rose crystals.
    s = material("paper")
    s.poly([(1,9),(5,7),(10,8),(14,11),(12,14),(4,15),(1,12)],"#623a3c")
    s.poly([(2,10),(5,8),(9,9),(12,11),(10,13),(4,14),(2,12)],"#a54848")
    s.line([(3,10),(5,9),(8,10)],"#d4745e")
    s.line([(4,13),(7,12),(11,12)],"#7f3d42")
    s.poly([(5,9),(5,4),(8,1),(11,3),(12,7),(9,11),(6,11)],"#57454c")
    s.poly([(6,8),(6,4),(8,2),(9,4),(9,8),(7,10)],"#edd6bd")
    s.poly([(9,3),(10,4),(11,7),(9,10),(8,10),(9,7)],"#c08b83")
    s.line([(6,5),(8,2)],"#fff1d5").dot((13,7),"#9a4546")
    s.dot((2,6),"#c76354")
    return s


def grating_wafer():
    # A silicon/star-slurry substrate: a thin glazed wafer with conductive pads.
    s = material("glass")
    s.poly([(1,9),(6,3),(11,2),(15,6),(10,12),(5,14),(1,12)],"o")
    s.poly([(2,9),(6,4),(11,3),(13,6),(9,10),(5,12),(2,11)],"s")
    s.poly([(6,4),(11,3),(12,5),(8,7),(4,10),(3,10)],"m")
    s.line([(2,9),(6,4),(10,3)],"h")
    s.line([(5,13),(10,11),(14,7)],"d")
    for x,y in [(6,11),(8,10),(10,8),(12,6)]:s.dot((x,y),"#d7bd7f")
    s.line([(6,6),(10,5)],"a").line([(5,8),(9,7)],"l")
    return s


def soul_scriber_blank():
    # Two proud souls and iron make a steel scriber blank, with a tiny soul seam.
    s = material("steel")
    s.poly([(1,12),(3,9),(7,5),(10,2),(13,1),(13,4),(10,8),(5,12),(3,14)],"o")
    s.poly([(5,10),(8,6),(11,3),(12,2),(12,4),(9,7)],"m")
    s.line([(6,9),(9,5),(12,2)],"h")
    s.line([(7,10),(10,7),(12,4)],"d")
    s.poly([(2,12),(4,10),(6,11),(3,13)],"#756158")
    s.dot((3,11),"#bc9d76").line([(8,7),(10,5)],"#8ec8d0")
    return s


def research_scroll():
    # A researched blade drawing on paper, with wooden scroll rollers and ink.
    s = material("paper")
    s.poly([(3,2),(12,2),(12,12),(10,14),(2,14),(1,12),(3,11)],"o")
    s.rect((4,3,11,11),"l").rect((3,11,10,13),"m")
    s.rect((2,1,13,3),"o").rect((3,2,12,2),"d")
    s.dot((3,2),"m").dot((12,2),"s")
    s.line([(4,4),(4,10)],"h").line([(11,4),(11,10)],"s")
    s.line([(6,10),(8,8),(9,5)],"#555c61").line([(7,9),(9,6)],"#838b83")
    s.line([(5,10),(7,11)],"d")
    s.line([(5,5),(6,5)],"a").dot((6,7),"a").line([(9,10),(10,10)],"a")
    s.rect((1,12,10,14),"o").rect((2,12,9,13),"s")
    s.line([(3,12),(8,12)],"l").dot((2,13),"d")
    return s


def terra_scriber():
    # Horseshoe/amethyst/honey-derived tool: brass grip, faceted violet cutting tip.
    s = material("copper")
    s.poly([(1,12),(5,8),(7,9),(3,14)],"o")
    s.poly([(2,12),(5,9),(6,10),(3,13)],"s")
    s.line([(2,12),(5,9)],"l").line([(3,12),(4,13)],"d")
    s.line([(5,8),(7,10)],"#d1bb78",2)
    s.poly([(6,8),(9,4),(11,1),(14,1),(13,4),(9,8),(8,10)],"#4c435e")
    s.poly([(7,8),(10,4),(13,2),(12,4),(9,7)],"#bba2d1")
    s.line([(8,6),(11,3),(13,2)],"#eee0f0")
    s.line([(9,8),(12,5)],"#796f9d")
    return s


def quenched_knife():
    # Last Smith unfinished blade after water quenching: blue steel temper line.
    s = material("steel")
    s.poly([(2,14),(2,11),(6,8),(8,4),(12,1),(14,1),(13,5),(10,9),(6,12)],"o")
    s.poly([(6,9),(9,4),(13,2),(12,5),(9,8),(7,10)],"m")
    s.line([(7,8),(10,4),(13,2)],"h")
    s.line([(7,10),(10,8),(12,5)],"#617b9c")
    s.line([(3,12),(5,10)],"d",2).dot((3,12),"s")
    s.line([(5,9),(7,11)],"#9aa79f")
    s.poly([(2,3),(1,5),(2,6),(3,5)],"#7aa8b8").dot((2,4),"#c8dedb")
    return s


def engraving_knife_set():
    # Two parallel precision cutters fixed against the original glass substrate.
    s = material("steel")
    s.poly([(1,9),(8,2),(13,2),(15,5),(8,13),(3,14),(1,12)],"o")
    s.poly([(2,9),(8,3),(12,3),(13,5),(7,12),(3,13),(2,11)],"#6e9ca7")
    s.line([(2,9),(8,3),(11,3)],"#b1d3cf")
    for a,b in [((4,10),(10,4)),((6,12),(12,6))]:
        s.line([a,b],"o",3).line([a,b],"s",2)
        s.line([(a[0],a[1]-1),(b[0],b[1]-1)],"l")
    s.line([(3,9),(7,13)],"#755449",3)
    s.line([(3,9),(7,13)],"#c7a36d")
    s.dot((10,4),"h").dot((12,6),"#cfc0e0")
    return s


def developed_film():
    # Actual developed black-and-white film, with perforations and two negatives.
    s = material("film")
    s.poly([(2,1),(10,1),(10,11),(13,11),(14,9),(15,10),(14,13),(11,15),(3,15),(2,13)],"o")
    s.rect((3,2,9,13),"d").rect((4,2,8,6),"s").rect((4,8,8,12),"s")
    s.poly([(4,6),(6,3),(8,6)],"l").dot((8,3),"h")
    s.poly([(4,11),(5,9),(7,11),(8,10),(8,12),(4,12)],"l")
    for y in (2,5,8,11,13):s.dot((2,y),"m").dot((10,y),"m")
    s.line([(4,14),(10,14),(13,12)],"s").dot((3,2),"l")
    s.line([(12,11),(14,10)],"m")
    return s


def printed_photo():
    # Silver-gelatin print: a clear monochrome image within white paper margins.
    s = material("film")
    s.poly([(2,2),(12,1),(14,12),(4,14),(2,12)],"o")
    s.poly([(3,3),(11,2),(13,11),(4,13),(3,11)],"h")
    s.poly([(4,4),(10,3),(11,9),(5,10)],"s")
    s.poly([(4,9),(6,5),(8,7),(9,6),(11,9),(5,10)],"d")
    s.line([(6,5),(7,6)],"l").dot((10,4),"h")
    s.line([(5,11),(9,10)],"m")
    s.line([(4,13),(12,11)],"l").dot((3,3),"h")
    return s


def aged_photo():
    # Same photograph composition after silver-image browning and paper ageing.
    s = material("paper")
    s.poly([(2,2),(11,1),(13,3),(14,11),(11,12),(10,14),(3,14),(1,11)],"o")
    s.poly([(3,3),(11,2),(12,4),(13,10),(10,12),(9,13),(3,13),(2,11)],"m")
    s.poly([(4,4),(10,3),(11,9),(5,10)],"d")
    s.poly([(4,9),(6,5),(8,7),(9,6),(11,9),(5,10)],"#5c514d")
    s.line([(6,5),(7,6)],"#b1a186").dot((10,4),"l")
    s.line([(3,4),(3,9)],"l").line([(6,11),(10,10)],"s")
    s.line([(3,11),(4,12)],"d").dot((11,3),"s")
    s.line([(9,12),(9,13)],"d")
    return s


def photo_stack():
    # Several real photographs, with individually offset visible paper edges.
    s = material("film")
    s.poly([(1,6),(10,3),(15,7),(14,12),(5,15),(1,12)],"o")
    s.poly([(2,7),(10,4),(14,7),(13,11),(5,14),(2,11)],"l")
    s.line([(4,12),(12,9)],"d").line([(5,13),(13,10)],"m")
    s.poly([(2,3),(12,2),(14,10),(4,12),(2,10)],"o")
    s.poly([(3,4),(11,3),(13,9),(4,11),(3,9)],"h")
    s.poly([(4,5),(10,4),(11,8),(5,9)],"m")
    s.poly([(4,8),(6,5),(8,7),(10,6),(11,8),(5,9)],"d")
    s.dot((10,5),"h").line([(5,10),(8,9)],"s")
    return s


def imaging_ruler():
    # Offset glass scales with physical engraved ticks and aligned image fiducials.
    s = material("glass")
    s.poly([(1,10),(10,2),(14,3),(15,6),(5,15),(1,14)],"o")
    s.poly([(2,11),(11,3),(13,4),(13,6),(5,14),(2,13)],"d")
    s.line([(4,13),(12,6)],"s")
    s.poly([(1,8),(9,1),(13,2),(14,5),(5,13),(1,11)],"o")
    s.poly([(2,8),(9,2),(12,3),(12,5),(5,11),(2,10)],"m")
    s.line([(2,8),(9,2)],"h").line([(3,10),(11,3)],"s")
    for a,b in [((4,7),(5,8)),((6,5),(7,6)),((8,3),(9,4)),((10,3),(11,4))]:
        s.line([a,b],"o")
    s.dot((4,9),"h").dot((8,5),"l")
    s.line([(2,9),(4,11)],"#bfa372").line([(10,2),(12,4)],"#bfa372")
    return s


def brewed_reagent():
    # The wrapper specifically consumes Strong Swiftness: a pale blue potion.
    s = material("glass")
    s.rect((6,1,9,3),"#473a33").rect((7,1,8,2),"#b29165")
    s.rect((5,3,10,5),"o").rect((6,3,9,5),"m")
    s.poly([(5,6),(10,6),(13,9),(13,12),(10,15),(5,15),(2,12),(2,9)],"o")
    s.poly([(5,7),(10,7),(12,9),(12,12),(10,14),(5,14),(3,12),(3,9)],"s")
    s.poly([(3,10),(12,10),(12,12),(10,14),(5,14),(3,12)],"#7399b3")
    s.line([(4,10),(11,10)],"#a5c6dc")
    s.line([(5,7),(4,8),(4,11)],"h").dot((5,13),"l")
    s.line([(7,4),(8,4)],"h").line([(9,13),(11,11)],"#536b96")
    return s


def terra_blank():
    # The workshop precursor visibly combines a horseshoe and amethyst shard.
    s = material("copper")
    s.poly([(2,3),(5,2),(6,4),(5,6),(5,10),(7,11),(10,10),(10,6),(9,4),(11,2),(13,3),(14,9),(12,13),(8,15),(4,13),(1,9)],"o")
    s.poly([(3,4),(4,4),(3,7),(3,10),(6,13),(9,13),(12,10),(12,5),(11,4),(12,4),(13,8),(11,12),(8,14),(5,12),(2,9)],"s")
    s.line([(3,4),(2,8),(3,10)],"l").line([(5,12),(7,13)],"m")
    s.poly([(6,9),(6,5),(8,1),(11,4),(10,9),(8,11)],"#49394e")
    s.poly([(7,8),(7,5),(8,2),(9,4),(9,8),(8,9)],"#b09ac6")
    s.line([(7,5),(8,2)],"#ead6e6").dot((9,6),"#736a9f")
    return s


def omni_seed():
    # Eight physical sectors converge toward a projected star-slurry nucleation seed.
    s = material("chaos")
    s.poly([(5,1),(10,1),(14,5),(14,10),(10,14),(5,14),(1,10),(1,5)],"o")
    # Each sector represents one branch in the projection recipe, not decoration.
    for points,c in [([(5,2),(7,2),(7,5),(5,6),(3,4)],"#b7cfac"),
                     ([(8,2),(10,2),(12,4),(10,6),(8,5)],"#acd9df"),
                     ([(12,5),(13,6),(13,8),(10,8),(10,6)],"#b8a1d6"),
                     ([(13,9),(13,10),(11,12),(9,10),(10,9)],"#82b8c9"),
                     ([(10,12),(9,13),(8,13),(8,10),(9,10)],"#d2a576"),
                     ([(7,10),(7,13),(5,13),(4,12),(6,10)],"#7eabb6"),
                     ([(3,9),(5,9),(6,10),(4,12),(2,10)],"#aebbb4"),
                     ([(2,5),(4,5),(5,6),(5,8),(2,8)],"#d8ccae")]:
        s.poly(points,c)
    s.poly([(7,4),(10,6),(11,8),(8,11),(5,9),(4,7)],"o")
    s.poly([(7,5),(9,6),(10,8),(8,10),(6,9),(5,7)],"l")
    s.poly([(7,5),(9,6),(8,8),(5,7)],"h")
    s.poly([(8,8),(10,8),(8,10),(6,9)],"a")
    s.dot((3,5),"h").dot((5,2),"h").line([(11,11),(12,10)],"s")
    return s


def omni_billet():
    # Chaos-fused preform remains rough and faceted; no finished ingot silhouette.
    s = material("chaos")
    s.poly([(1,8),(3,4),(8,2),(12,2),(14,5),(15,9),(12,12),(6,14),(2,13)],"o")
    s.poly([(2,8),(4,5),(8,3),(11,3),(13,5),(10,8),(5,10)],"s")
    s.poly([(2,9),(5,11),(10,9),(14,6),(14,9),(11,11),(6,13),(3,12)],"d")
    s.line([(3,7),(5,5),(8,4),(11,4)],"m")
    s.line([(4,6),(6,5)],"l")
    # A continuous marbled seam shows the previously projected seed through metal.
    s.line([(9,3),(8,5),(9,6),(7,8),(8,10),(6,12)],"#cc9f8a")
    s.line([(9,3),(8,5),(9,6)],"#c6ddd5")
    s.line([(7,8),(8,10)],"#9c91bd").dot((7,11),"#cdb36f")
    s.dot((8,5),"h").line([(10,11),(12,10)],"s")
    return s


def process_liner():
    # A folded thin metal/ceramic liner used to package and carry native workpieces.
    s = material("ceramic")
    s.poly([(1,7),(7,2),(13,4),(15,7),(10,12),(5,14),(1,11)],"o")
    s.poly([(2,7),(7,3),(12,5),(13,7),(9,10),(5,12),(2,10)],"m")
    s.poly([(2,8),(4,10),(5,12),(5,13),(2,11)],"s")
    s.poly([(7,3),(12,5),(13,7),(10,8),(8,6),(5,5)],"l")
    s.line([(2,7),(6,4)],"h").line([(5,5),(8,6),(10,8),(13,7)],"s")
    s.line([(5,12),(9,10),(13,8)],"#70828a")
    s.line([(5,10),(7,8)],"s").dot((7,3),"h")
    return s


DRAWERS = {
    "omni_nuclear_feed": nuclear_feed,
    "omni_nuclear_01": machined_arc_sections,
    "omni_nuclear_02": crushed_fragments,
    "omni_nuclear_03": borated_alloy,
    "omni_nuclear_04": pressure_plate,
    "omni_nuclear_06": cast_ring_stock,
    "omni_nuclear_assembly_1": dense_ring,
    "omni_nuclear_09": separated_laminae,
    "omni_nuclear_11": infused_mesh,
    "omni_nuclear_15": crystallized_filter_salt,
    "omni_nuclear_16": filter_screen,
    "omni_nuclear_assembly_2": annular_filter,
    "omni_nuclear_20": stable_isotope_pellets,
    "omni_nuclear_assembly_3": absorber_layer,
    "omni_nuclear_22": spent_fuel,
    "omni_nuclear_25": reprocessed_granules,
    "omni_nuclear_23": salt_fuel_capsule,
    "omni_nuclear_assembly_4": locking_ring,
    "omni_nuclear_assembly_5": heat_exchange_sleeve,
    "omni_nuclear_30": field_stabilized_ring,
    "omni_nuclear_31": calibrated_target_ring,
    "omni_nuclear_07_precursor": boron_quartz_feed,
    "omni_nuclear_12_precursor": redstone_quartz_feed,
    "omni_precision_feed": grating_wafer,
    "omni_precision_01": soul_scriber_blank,
    "omni_precision_04": research_scroll,
    "omni_precision_05": terra_scriber,
    "omni_precision_15": quenched_knife,
    "omni_precision_assembly_1": engraving_knife_set,
    "omni_precision_08": developed_film,
    "omni_precision_16": printed_photo,
    "omni_precision_10": aged_photo,
    "omni_precision_17": photo_stack,
    "omni_precision_assembly_2": imaging_ruler,
    "omni_precision_12": brewed_reagent,
    "omni_precision_05_precursor": terra_blank,
    "omni_seed": omni_seed,
    "omni_billet": omni_billet,
    "omni_process_liner": process_liner,
}


CONCEPTS = {
    "omni_nuclear_feed":"冰晶合金粗环胚，右侧小型氦封接口；银灰基体与霜青冷封边。",
    "omni_nuclear_01":"从约束环胚切出的两段弧形金属料，保留原环弧度和切面。",
    "omni_nuclear_02":"破碎弧形金属料所得灰银不规则碎块，较大碎片可见金属断面。",
    "omni_nuclear_03":"加入硼的石墨灰合金料，顶面粗铸纹，厚暗侧壁。",
    "omni_nuclear_04":"压实的薄金属板坯，平整顶面与压缩后的密实薄边。",
    "omni_nuclear_06":"熔融后铸成实心圆柱车削坯，为后续致密环提供视觉连续性。",
    "omni_nuclear_assembly_1":"精车银钢承束环，清晰中心通孔、内壁和厚实承重边。",
    "omni_nuclear_09":"从承束环分出的三层同位素金属薄片，叠片体现分离工序。",
    "omni_nuclear_11":"铁制多孔网箔吸附浅蓝盐溶液，既有金属网孔也有少量液滴。",
    "omni_nuclear_15":"红石、石英经过富集与浸出后结晶的浅玫瑰色晶片；衔接红色载液。",
    "omni_nuclear_16":"带晶体滤材的金属筛片，红石接点位于两侧小触点。",
    "omni_nuclear_assembly_2":"多层环状筛网膜，仍保留中心束流通孔。",
    "omni_nuclear_20":"衰变后的稳定同位素圆柱颗粒，亚原子液化前的真实固态料。",
    "omni_nuclear_assembly_3":"分块烧结石墨陶瓷吸收层，开缝环形与细青色辐照内衬。",
    "omni_nuclear_22":"实际消耗HEA-242乏燃料，绘制三支金属包壳燃料棒与暗色芯料。",
    "omni_nuclear_25":"后处理分离出的不同金属颗粒置于陶瓷衬片，体现可回收物料。",
    "omni_nuclear_23":"熔盐反应堆乏燃料的耐火陶瓷包覆容器，内部可见凝结盐粒。",
    "omni_nuclear_assembly_4":"石墨环外加金属闭锁夹箍和燃料包覆扣，继承吸收层的环形。",
    "omni_nuclear_assembly_5":"同轴换热环套，厚度方向三层铜鳍片与银钢端面，中央保持通孔。",
    "omni_nuclear_30":"球状闪电处理后稳定致密的承束环，少量青色束流内衬而非闪电图标。",
    "omni_nuclear_31":"实际用作靶料的环形构件，四处定位刻线和被束流处理的金色孔壁。",
    "omni_nuclear_07_precursor":"核对原料为硼锭与石英，绘制深灰硼料混合白色石英晶体。",
    "omni_nuclear_12_precursor":"核对原料为红石与石英，绘制红石粉承载白色石英片。",
    "omni_precision_feed":"薄玻璃/硅晶基板，少量星浆干涉色与边缘导电触点。",
    "omni_precision_01":"耀魂与铁形成的银钢刻线刀胚，刀脊仅保留细青色魂纹。",
    "omni_precision_04":"带刀具研究示意图的纸卷，棕色卷轴与清晰墨线，保持标准刀卷设定。",
    "omni_precision_05":"泰拉材料加工成黄铜握柄、紫水晶刃尖刻针，衔接实际紫晶原料。",
    "omni_precision_15":"经过炼药锅水淬的银钢刀胚，刀口青蓝回火线和单滴冷却水。",
    "omni_precision_assembly_1":"原光栅基板上装配的双平行刻线刀组，玻璃承台与铜锁带。",
    "omni_precision_08":"黑白胶卷显影载体，真实条状负片、齿孔与卷曲尾部。",
    "omni_precision_16":"保留拍摄图像的黑白照片，白相纸边与清楚山景。",
    "omni_precision_10":"同一构图在老化后的褐色影像和泛黄相纸，折角与旧边。",
    "omni_precision_17":"错位叠放的多张真实照片，能看出独立相纸边和顶层图像。",
    "omni_precision_assembly_2":"两层透明玻璃成像标尺，可见刻度、定位点、叠层与夹带。",
    "omni_precision_12":"实际要求迅捷II药水，使用浅蓝药液、玻璃瓶与软木塞。",
    "omni_precision_05_precursor":"实际幸运马蹄铁与紫水晶组合原料，保留马蹄铁轮廓和晶体。",
    "omni_seed":"八支线实体色块投影收敛于中心星浆结晶，八扇区围合清晰晶核。",
    "omni_billet":"混沌聚合后的粗糙金属锻坯，表面连续的多相嵌纹对应原核而非成品锭。",
    "omni_process_liner":"薄陶瓷复合衬片，折叠边展示薄度、承载性与工艺封装用途。",
}


def draw(catalog, assets_root):
    result = {"items": {}, "blocks": {}}
    selected = targets(catalog, {"nuclear", "precision"})
    expected = {"kubejs:" + name for name in DRAWERS}
    if set(selected) != expected:
        raise ValueError(f"Nuclear/precision texture coverage differs: {set(selected) ^ expected}")
    if targets(catalog, {"nuclear", "precision"}, "blocks"):
        raise ValueError("Unexpected nuclear/precision blocks need hand drawing")
    if set(CONCEPTS) != set(DRAWERS):
        raise ValueError("Every manually drawn material must have an explicit design rationale")
    for ident in selected:
        result["items"][ident] = DRAWERS[ident.split(":", 1)[1]]().save(assets_root, ident)
    return result
