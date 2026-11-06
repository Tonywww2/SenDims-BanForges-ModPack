"""Hand-drawn templates. codes: o outline; 1-5 primary ramp; p,a-e slot1; P,A-E slot2; q,f-j slot3; other letters via extra."""
from common import *

TPL={}
def tpl(name, rows): TPL[name]=grid_check(rows,name); return rows

def T(name, mats, extra=None, edits=None, finalize=False):
    """render template to Canvas so we can still add stuff."""
    rows=TPL[name]
    c=cv()
    mlist=list(mats)
    def mp(ch):
        sets=[('o','12345'),('p','abcde'),('P','ABCDE'),('q','fghij')]
        if extra and ch in extra:
            v=extra[ch]
            return v
        for i,(oc,dg) in enumerate(sets):
            if i>=len(mlist): break
            if ch==oc: return (mlist[i],0)
            if ch in dg: return (mlist[i],1+dg.index(ch))
        raise KeyError('%s: unmapped %r'%(name,ch))
    for y,row in enumerate(rows):
        for x,ch in enumerate(row):
            if ch in '. ': continue
            v=mp(ch)
            if v is None: continue
            if isinstance(v,str): c.rgba(x,y,v)
            else: c.set(x,y,v[0],v[1])
    if edits:
        for e in edits: grid(c,e[0],e[1],e[2] if len(e)>2 else 0,e[3] if len(e)>3 else 0)
    return c

def fin(c, **kw):
    kw.setdefault('outline',False); kw.setdefault('inner',False); kw.setdefault('rimlight',False)
    return c.finalize(**kw)

# ---------------- templates ----------------
tpl('INGOT',[
"................",
"................",
"................",
"................",
"....oooooooo....",
"...o55555554o...",
"..o5444444443o..",
".o544444444443o.",
".o333333333322o.",
".o322222222221o.",
".o222222222111o.",
"..oooooooooooo..",
"................",
"................",
"................",
"................"])

tpl('VIAL',[
"................",
"..........ppp...",
".........paaap..",
"..........pap...",
".........o333o..",
"........o5433o..",
".......o54xxxo..",
"......o5yxxxxo..",
".....o5yxxxxxo..",
"....o4yxxxxzo...",
"...o4yxxxzzo....",
"...o4xxxzzo.....",
"...o3xxzzzo.....",
"....o3zzoo......",
".....oo.........",
"................"])

tpl('CHUNK',[
"................",
"................",
"......ooo.......",
".....o554oo.....",
"....o54444oooo..",
"...o5444443343o.",
"..o54444433332o.",
"..o44443333322o.",
".o544433332222o.",
".o444333332221o.",
".o333333222221o.",
"..o33332222211o.",
"..o32222221111o.",
"...oo222111oo...",
".....ooooo......",
"................"])

tpl('MOUND',[
"................",
"................",
"................",
"................",
"................",
"......oooo......",
"....oo5544oo....",
"...o54443343o...",
"..o5444333432o..",
".o44433332223o..",
".o43433322322o..",
".o33333222212o..",
"..o2232222121o..",
"...oo2221111o...",
".....ooooooo....",
"................"])

tpl('DUST',[
"................",
"................",
"................",
"................",
"................",
"................",
".......oo.......",
"......o54o......",
".....o5443o.....",
"....o544332o....",
"...o54443322o...",
"..o5444333221o..",
".o544433322211o.",
".o333332222111o.",
"..oooooooooooo..",
"................"])

tpl('PACKET',[
"................",
"................",
"...ooooooooooo..",
"..o5555555554o..",
"..o5PPPPPPPPP4o.",
"..o5PAAAAAABP3o.",
"..o5PAxxxxxBP3o.",
"..o4PAxxxxxBP3o.",
"..o4PAxxxxxBP3o.",
"..o4PBBBBBBCP3o.",
"..o4PPPPPPPPP2o.",
"..o44333333322o.",
"..o4k3333333k2o.",
"..o33333333322o.",
"...oooooooooooo.",
"................"])


# ---------- procedural helpers for geometric templates ----------
def spans_to_rows(spans, fill):
    """spans: {y:(x0,x1)} inclusive; fill(x,y,edge)->char"""
    rows=[['.']*16 for _ in range(16)]
    S={}
    for y,(a,b) in spans.items():
        for x in range(a,b+1): S[(x,y)]=1
    for (x,y) in S:
        edge=any((x+dx,y+dy) not in S for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)))
        rows[y][x]=fill(x,y,edge,S)
    return [''.join(r) for r in rows]

def circle_spans(cx,cy,r,ry=None,squash=0.97):
    ry=ry or r; sp={}
    for y in range(16):
        xs=[x for x in range(16) if ((x+0.5-cx)/r)**2+((y+0.5-cy)/ry)**2<squash]
        if xs: sp[y]=(min(xs),max(xs))
    return sp

def lit(x,y,cx,cy,r,ry=None):
    ry=ry or r
    nx=(x+0.5-cx)/r; ny=(y+0.5-cy)/ry
    d=-0.6*nx-0.7*ny
    return d

# LENS: front view, bezel slot P/A.. , glass 1-5 with highlight
def _lens():
    cx,cy,r=8,8,7
    sp=circle_spans(cx,cy,r)
    def f(x,y,edge,S):
        if edge: return 'P'
        inner=all((x+dx,y+dy) in S and not any((x+dx+ex,y+dy+ey) not in S for ex,ey in ((1,0),(-1,0),(0,1),(0,-1))) for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)))
        d=lit(x,y,cx,cy,r)
        if not inner: return 'D' if d>0.2 else ('C' if d>-0.3 else 'B')
        dd=((x+0.5-cx)**2+(y+0.5-cy)**2)**0.5
        if (x,y) in ((5,4),(6,4),(4,5),(4,6)): return '5'
        if d>0.45: return '4'
        if d>0.0: return '3'
        if d>-0.45: return '2'
        return '1'
    return spans_to_rows(sp,f)
TPL['LENS']=_lens()

# DISC: 3/4 cylinder, top ellipse + side h px
def _disc(rx=7,ry=3.5,h=3,cy=6):
    cx=8
    top=circle_spans(cx,cy,rx,ry)
    sp={}
    for y,(a,b) in top.items(): sp[y]=(a,b)
    for d in range(1,h+1):
        for y,(a,b) in circle_spans(cx,cy+d,rx,ry).items():
            if y in sp: sp[y]=(min(a,sp[y][0]),max(b,sp[y][1]))
            else: sp[y]=(a,b)
    T_=set()
    for y,(a,b) in top.items():
        for x in range(a,b+1): T_.add((x,y))
    def f(x,y,edge,S):
        if edge: return 'o'
        if (x,y) in T_:
            # rim of top
            if any((x+dx,y+dy) not in T_ for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))):
                return '5' if lit(x,y,cx,cy,rx,ry)>-0.1 else '3'
            return '4'
        t=(x+0.5-(cx-rx))/(2*rx)
        return '3' if t<0.3 else ('2' if t<0.75 else '1')
    return spans_to_rows(sp,f)
TPL['DISC']=_disc()
TPL['PUCK']=_disc(rx=6,ry=3,h=6,cy=4)

# RING (hand)
tpl('RING',[
"................",
"................",
"....oooooooo....",
"..oo55554444oo..",
".o554444444433o.",
"o5544oooooo4332o",
"o544o111111o332o",
"o44o........o32o",
"o433o......o221o",
"o3333oooooo2221o",
"o33322222222211o",
"o22222222211111o",
".oo2222111111oo.",
"...oooooooooo...",
"................",
"................"])

# CARD (packaging specimen card): content area x4..11,y4..11
tpl('CARD',[
"................",
".oooooooooooooo.",
".o554444444443o.",
".o5k4444444k43o.",
".o444444444443o.",
".o444444444443o.",
".o444444444443o.",
".o444444444443o.",
".o444444444443o.",
".o444444444443o.",
".o444444444443o.",
".o444444444443o.",
".o4k4444444k32o.",
".o333333333322o.",
".oooooooooooooo.",
"................"])

tpl('BRICK',[
"................",
"................",
"................",
"......oooooooo..",
"....oo55555544o.",
"..oo554444444o3o",
".o544444444442o2o"[:16],
".o33333333333o22",
".o33333333332o2o",
".o32333333322oo.",
".o33333333222o..",
".o22222222221o..",
".oooooooooooo...",
"................",
"................",
"................"])

tpl('SHEET',[
"................",
"................",
"............oo..",
"..........oo45o.",
"........oo4443o.",
"......oo44443o..",
"....oo444433o...",
"..oo5444443o....",
".o5444443oo.....",
".o44443o32o.....",
"..o433o321o.....",
"...ooo4321o.....",
"......o21o......",
".......oo.......",
"................",
"................"])

tpl('SLICES',[
"................",
"..........oooo..",
"........oo5544o.",
"......oo54444o3o",
".....o5444443o2o",
"....oo4444oo2oo.",
"..oo5544o3o2o...",
".o54444443o2o...",
"o544444oo2oo....",
"o4444o3o2o......",
".oo3o3o2o.......",
"..o3332oo.......",
"..o222oo........",
"...ooo..........",
"................",
"................"])

tpl('PELLETS',[
"................",
"................",
".........ooo....",
"........o544o...",
".....ooo4443o...",
"....o544o332o...",
"...o54443o2o.ooo",
"...o44333oo.o544o"[:16],
"....o3322o.o4443",
".ooo.oooo..o3322",
"o544o..ooo..oo.o"[:16],
"o4443oo544o.....",
"o3322o54443o....",
".oooo.o3322o....",
"......oooo......",
"................"])

tpl('BOTTLE',[
"................",
"......oooo......",
"......opppo.....",
".......oao......",
"......o5o3o.....",
".....o5433o.....",
"....o54xxx3o....",
"...o5yxxxxx3o...",
"...o4xxxxxxz2o..",
"..o4yxxxxxxzz2o.",
"..o3xxxxxxzzz2o.",
"..o3xxxxxzzzz1o.",
"...o3xxzzzzz1o..",
"....oo2zzz11o...",
"......ooooo.....",
"................"])

tpl('FRAME',[
"................",
"......oooo......",
"....oo5554oo....",
"..oo554oo4443oo.",
".o5544o..o4433o.",
".o5oo3o..o3oo3o.",
".o5o.oooooo.o3o.",
".o4o.o5444o.o3o.",
".o4o.o4..3o.o2o.",
".o4o.o3oo2o.o2o.",
".o4oo32oo2oo.o2o"[:16],
".o4433oo22112o..",
".oo332o..o21oo..",
"...ooo....ooo...",
"................",
"................"])

tpl('COIL',[
"................",
"................",
"....oooooooo....",
"...o55444443o...",
"..oPPPPPPPPPPo..",
"..oABABABABABo..",
"..oBCBCBCBCBCo..",
"..oABABABABABo..",
"..oBCBCBCBCBCo..",
"..oABABABABABo..",
"..oBCBCBCBCBCo..",
"..oPPPPPPPPPPo..",
"...o33322211o...",
"....oooooooo....",
"................",
"................"])

tpl('VALVE',[
"................",
"......oooo......",
"......o54o......",
".....oo43oo.....",
"..ooo544332ooo..",
".o5544444433322o"[:16],
"o5444444443332o.",
"o4ooo44433ooo2o.",
"o4o.o4433o.o2o..",
"o4ooo44333ooo2o.",
"o44444433332221o",
".o3333333222211o",
"..oo33322221oo..",
"....oooooooo....",
"................",
"................"])

tpl('CHIP',[
"................",
".........oo.....",
".......oo54o....",
".....oo5444oo...",
"...oo544x4443o..",
".oo54444x44433o.",
"o54444xxxx4433o.",
"o4444x44x443332o",
".oo44x44x44332o.",
"...oo44444332oo.",
".....oo4332oo...",
".......o32o.....",
"........oo......",
"................",
"................",
"................"])

tpl('SCROLL',[
"................",
"................",
"...........ooo..",
"..........o544o.",
".........o54x3o.",
"........o54xxoo.",
".......o54xx3o..",
"......o54xx3o...",
".....o54xx3o....",
"....o54xx3o.....",
"..oo44xx3o......",
".o544433o.......",
".o44333o........",
".o3322o.........",
"..oooo..........",
"................"])

tpl('KNIVES',[
"................",
"...........o..o.",
"..........o5oo5o",
".........o54o54o",
"........o54oo4o.",
".......o54o54o..",
"......o54o54o...",
".....o54o54o....",
"....oaao54o.....",
"...oabbaoo......",
"..oabbbbo.......",
".oabbbbo........",
".obbbco.........",
".occco..........",
"..ooo...........",
"................"])

tpl('RULER',[
"................",
"................",
"..............oo",
"............oo5o",
"..........oo54o.",
"........oo5x4o..",
"......oo5x4x3o..",
"....oo5x4x43o...",
"..oo5x4x433o....",
".o5x4x4332o.....",
".o4x4332oo......",
".o4332oo........",
".o32oo..........",
"..oo............",
"................",
"................"])

tpl('ORB',[
"................",
".......xx.......",
".....oooooo.....",
"...oo555444oo...",
"..o5554444433o..",
"..o5544444333o..",
".o554444443332o.",
"xo544444433332ox",
"xo444444333322ox",
".o444443333222o.",
"..o3333332222o..",
"..o3332222211o..",
"...oo222211oo...",
".....oooooo.....",
".......xx.......",
"................"])

tpl('BILLET',[
"................",
"................",
"................",
"..........oooo..",
"........oo5544o.",
"......oo554444o.",
"....oo5544444o3o",
"..oo554444444o2o",
".o54444444443o2o",
".o4444444443o22o",
".o3333333333o21o",
".o3222222222o1o.",
".o2222222211oo..",
"..oooooooooo....",
"................",
"................"])

tpl('GEM',[
"................",
"................",
"....oooooooo....",
"...o55545444o...",
"..o5554554443o..",
".o555445544433o.",
".oooooooooooooo.",
".o44433333322o..",
"..o4433332221o..",
"...o43332221o...",
"....o433221o....",
".....o4321o.....",
"......o32o......",
".......oo.......",
"................",
"................"])

tpl('GEARPART',[
"................",
"................",
"......oooo......",
".....o5544o.....",
"..ooo544433ooo..",
".o5544oooo3332o.",
".o544o....o332o.",
"..oo4o....o3oo..",
".o544o....o321o.",
".o4433oooo2221o.",
"..ooo433322ooo..",
".....o3221o.....",
"......oooo......",
"................",
"................",
"................"])
