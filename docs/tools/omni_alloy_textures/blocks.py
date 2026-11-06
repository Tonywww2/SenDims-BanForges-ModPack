"""Seamless 16x16 block textures; pnoise is shared with fluids.py."""
import math, random
from items_common import *
from PIL import Image

def pnoise(seed, cell=4, octaves=2, size=16):
    """periodic value noise in [0,1], tiling over size"""
    rnd=random.Random(seed)
    out=[[0.0]*size for _ in range(size)]
    amp=1.0; tot=0
    c=cell
    for o in range(octaves):
        n=size//c
        lat=[[rnd.random() for _ in range(n)] for _ in range(n)]
        for y in range(size):
            for x in range(size):
                fx=x/c; fy=y/c; x0=int(fx)%n; y0=int(fy)%n; x1=(x0+1)%n; y1=(y0+1)%n
                tx=fx-int(fx); ty=fy-int(fy); tx=tx*tx*(3-2*tx); ty=ty*ty*(3-2*ty)
                a=lat[y0][x0]*(1-tx)+lat[y0][x1]*tx; b=lat[y1][x0]*(1-tx)+lat[y1][x1]*tx
                out[y][x]+=amp*(a*(1-ty)+b*ty)
        tot+=amp; amp*=0.5; c=max(1,c//2)
    return [[v/tot for v in row] for row in out]

def ramp_at(ramp, p):
    """取色阶上的连续位置：整数位取原色，半格位取相邻两色的中间色（过渡色）。"""
    p=max(0.0,min(5.0,p)); i=int(p); f=p-i
    if i>=5 or f<1e-6: return ramp[min(5,i)]
    return mix(ramp[i],ramp[i+1],f)

def _step(v, th, w):
    t=(v-th)/w+0.5
    if t<=0: return 0.0
    if t>=1: return 1.0
    return t*t*(3-2*t)

def _shade(c, k):
    """k>0 提亮、k<0 压暗，用于杂色。"""
    return mix(c,(255,255,255,255),k) if k>0 else mix(c,(0,0,0,255),-k)

class Tex:
    """方块面。base() 画底层石质；之后用 set() 画的都算“装饰”，
    出图时装饰周围补一圈过渡色，再整体加一层杂色。"""
    def __init__(s,w=16,h=16,seed=0):
        s.w=w; s.h=h; s.px=[[None]*w for _ in range(h)]; s.lv=[[3.0]*w for _ in range(h)]
        s.feat=[[False]*w for _ in range(h)]; s.layered=False; s.seed=seed
        s.soft=0.38      # 装饰外沿过渡色的混合比例
        s.grain=(0.10,0.08,0.07)  # 杂色：压暗概率、提亮概率、幅度
    def put(s,x,y,col):
        s.px[y%s.h][x%s.w]=col if isinstance(col,tuple) else hx(col)
    def set(s,x,y,col):
        s.put(x,y,col)
        if s.layered: s.feat[y%s.h][x%s.w]=True
    def layer_done(s): s.layered=True
    def finish(s):
        w,h=s.w,s.h; src=[r[:] for r in s.px]
        if s.layered and s.soft>0:
            for y in range(h):
                for x in range(w):
                    if s.feat[y][x]: continue
                    best=None; bd=0
                    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                        nx,ny=(x+dx)%w,(y+dy)%h
                        if s.feat[ny][nx]:
                            c=src[ny][nx]; d=sum(abs(c[i]-src[y][x][i]) for i in range(3))
                            if d>bd: bd=d; best=c
                    if best is not None: s.px[y][x]=mix(src[y][x],best,s.soft)
        pd,pl,amt=s.grain; rnd=random.Random(s.seed*7+13)
        for y in range(h):
            for x in range(w):
                r=rnd.random()
                if s.feat[y][x]: continue
                if r<pd: s.px[y][x]=_shade(s.px[y][x],-amt)
                elif r>1-pl: s.px[y][x]=_shade(s.px[y][x],amt)
    def img(s):
        s.finish()
        im=Image.new('RGBA',(s.w,s.h))
        for y in range(s.h):
            for x in range(s.w): im.putpixel((x,y),s.px[y][x] or (255,0,255,255))
        return im

def base(ramp, seed, cell=4, octaves=2, levels=(0.35,0.5,0.65,0.8), lo=1, soft=0.075, fine=0.10, mottle=0.14):
    """底层石质：大块噪声决定明暗，色阶交界处用半格过渡色；再叠细噪声与低频斑驳。"""
    t=Tex(seed=seed); n=pnoise(seed,cell,octaves); f=pnoise(seed+7919,2,1); m=pnoise(seed+4243,8,1)
    rnd=random.Random(seed*31+5)
    for y in range(16):
        for x in range(16):
            v=n[y][x]+(f[y][x]-0.5)*fine+(rnd.random()-0.5)*0.05
            p=float(lo)
            for th in levels: p+=_step(v,th,soft)   # 逐项累加：Python 3.12 起内置 sum() 对浮点改用补偿求和
            p=min(5.0,p)
            q=round(p*2)/2; t.lv[y][x]=q; c=ramp_at(ramp,q)
            if m[y][x]>0.64: c=mix(c,ramp[1],mottle)
            elif m[y][x]<0.30: c=mix(c,ramp[5],mottle*0.8)
            t.put(x,y,c)
    t.layer_done()
    return t

def speck(t, ramp_or_col, pts):
    for (x,y,*l) in pts:
        col=ramp_or_col[l[0]] if l and isinstance(ramp_or_col,list) else ramp_or_col
        t.set(x,y,col)
def rpts(seed, n, minsep=2):
    r=random.Random(seed); pts=[]
    while len(pts)<n:
        p=(r.randrange(16),r.randrange(16))
        if all(min(abs(p[0]-q[0]),16-abs(p[0]-q[0]))+min(abs(p[1]-q[1]),16-abs(p[1]-q[1]))>=minsep for q in pts): pts.append(p)
    return pts
def walk(seed, start, steps, dirs=((1,0),(0,1),(1,1),(1,-1))):
    r=random.Random(seed); x,y=start; pts=[(x,y)]
    for _ in range(steps):
        dx,dy=r.choice(dirs); x=(x+dx)%16; y=(y+dy)%16; pts.append((x,y))
    return pts
RP=lambda h,**kw: make_ramp(h,**kw)

# ---------------- BLOCKS ----------------
@reg('block/omni_bio_01_block','盐卤凝固构件','block')
def _():
    r=RP('dfe6c4'); g_=RP('9cc47a'); t=base(r,11,cell=4,levels=(0.30,0.45,0.62,0.80),lo=2)
    for (x,y) in rpts(12,9,4): t.set(x,y,g_[3]); t.set(x+1,y,g_[2])
    for (x,y) in rpts(13,5,5): t.set(x,y,'f4fff0')
    return t

@reg('block/omni_bio_13_precursor','蜜蜂方块转化前驱块','block')
def _():
    r=RP('ebe3c4'); w=RP('e9bd4e'); t=base(r,21,cell=8,levels=(0.3,0.45,0.6,0.85),lo=2)
    for (cx,cy) in [(3,3),(11,9),(6,12)]:
        for dx in range(-1,3):
            for dy in range(-1,2):
                t.set(cx+dx,cy+dy,w[3 if (dx+dy)%2 else 4])
        t.set(cx,cy,w[1]); t.set(cx+1,cy,w[2])
    return t

def hexcells(t, wall, cell):
    # 错位蜂巢格（周期 16）：格壁上沿高光，格内左上亮、右下暗
    n=pnoise(t.seed+1,4,1)
    for y in range(16):
        for x in range(16):
            row=(y//4)%4; ox=2 if row%2 else 0
            lx=(x+ox)%4; ly=y%4
            if lx==0 and ly==0: t.put(x,y,wall[2])
            elif ly==0: t.put(x,y,ramp_at(wall,4.5 if (x+y)%3==0 else 4))
            elif lx==0: t.put(x,y,ramp_at(wall,3 if n[y][x]<0.6 else 2.5))
            else: t.put(x,y,ramp_at(cell,3.5-0.5*(lx+ly-2)+(0.5 if n[y][x]>0.7 else 0)))
    t.layer_done()

@reg('block/omni_bio_13_block','蜜蜂方块转化构件','block')
def _():
    t=Tex(seed=13); hexcells(t,RP('e9bd4e'),RP('8fbf5e'))
    for (x,y) in [(2,2),(10,6),(6,10),(14,14)]: t.set(x,y,'d8f8b0')
    return t

def holystone(seed):
    r=RP('cfd2d6'); return base(r,seed,cell=4,levels=(0.32,0.46,0.6,0.78),lo=2), r

def inclusions(t, ramp, seed, n=4):
    for (x,y) in rpts(seed,n,5):
        t.set(x,y,ramp[4]); t.set(x+1,y,ramp[3]); t.set(x,y+1,ramp[2]); t.set(x+1,y+1,ramp[1])

@reg('block/omni_aether_03_precursor','圣石碎片转化前驱块','block')
def _():
    t,r=holystone(31); inclusions(t,RP('a66ee0'),32); 
    for (x,y) in rpts(33,3,6): t.set(x,y,'f0d070')
    return t

@reg('block/omni_aether_09_precursor','枯萎孢子转化前驱块','block')
def _():
    t,r=holystone(41); inclusions(t,RP('8a6ab0'),42)
    for (x,y) in rpts(43,3,6): t.set(x,y,'8a8a90')
    return t

@reg('block/omni_aether_12_precursor','金色史维特球转化前驱块','block')
def _():
    t,r=holystone(51); inclusions(t,RP('b07ad0'),52)
    for (x,y) in rpts(53,3,6): t.set(x,y,'e8a83a')
    return t

@reg('block/omni_aether_03_block','圣石碎片转化构件','block')
def _():
    t,r=holystone(61); a=RP('e8b83a')
    for s in (62,63,64):
        for (x,y) in walk(s,(s*5%16,s*3%16),9): t.set(x,y,a[3])
    for (x,y) in rpts(65,4,5): t.set(x,y,a[5]); t.set(x+1,y,a[4])
    return t

@reg('block/omni_aether_04_block','史维特球转化构件','block')
def _():
    j=RP('7ab8e8'); t=base(j,71,cell=8,levels=(0.3,0.42,0.58,0.75),lo=2)
    for (x,y) in rpts(72,5,5): t.set(x,y,j[5]); t.set(x+1,y+1,j[1])
    for (x,y) in rpts(73,6,4): t.set(x,y,'d8f0ff')
    return t

@reg('block/omni_aether_05_block','冰石冻结构件','block')
def _():
    i=RP('a8dcf0'); t=base(i,81,cell=4,levels=(0.3,0.45,0.6,0.8),lo=2)
    for s in (82,83):
        for (x,y) in walk(s,(s%16,0),14,dirs=((1,1),(0,1),(-1,1))): t.set(x,y,'f0faff')
    for (x,y) in rpts(84,3,6): t.set(x,y,'a66ee0')
    return t

@reg('block/omni_aether_06_block','冰饰品冻结构件','block')
def _():
    i=RP('7ec0e8'); t=base(i,91,cell=8,levels=(0.3,0.45,0.6,0.8),lo=2)
    for (cx,cy) in [(4,4),(12,11)]:
        for d in range(-2,3): t.set(cx+d,cy,'eaf8ff'); t.set(cx,cy+d,'eaf8ff')
        for d in (-1,1): t.set(cx+d,cy+d,'cfeefc'); t.set(cx+d,cy-d,'cfeefc')
    return t

@reg('block/omni_aether_07_block','群系放置转化构件','block')
def _():
    i=RP('bfe8f6'); t=Tex(seed=7)
    for y in range(16):
        for x in range(16):
            # 菱形晶面：棱线最亮，棱线内侧一格偏亮，晶面另一端压暗
            u=(x+y)%8; v=(x-y)%8
            k=4 if u<4 and v<4 else 3 if u<4 else 2 if v<4 else 3
            if u==1 or v==1: k+=0.5
            if u==7 or v==7 or u==4 or v==4: k-=0.5
            if u==0 or v==0: k=5
            t.put(x,y,ramp_at(i,k))
    t.layer_done()
    for (x,y) in [(4,4),(12,12),(4,12),(12,4)]: t.set(x,y,'ffffff')
    return t

@reg('block/omni_aether_09_block','枯萎孢子转化构件','block')
def _():
    m=RP('7a6e86'); t=base(m,101,cell=4,levels=(0.3,0.45,0.6,0.8),lo=1)
    for s in (102,103,104):
        for (x,y) in walk(s,(s*7%16,s*11%16),8): t.set(x,y,m[4])
    for (x,y) in rpts(105,8,3): t.set(x,y,'c8b8d8')
    return t

@reg('block/omni_aether_12_block','金色史维特球转化构件','block')
def _():
    j=RP('e8b040'); t=base(j,111,cell=8,levels=(0.3,0.42,0.58,0.75),lo=2)
    for (x,y) in rpts(112,5,5): t.set(x,y,j[5]); t.set(x+1,y+1,j[1])
    for (x,y) in rpts(113,6,4): t.set(x,y,'fff0b0')
    return t

@reg('block/omni_aether_13_block','发光孢子转化构件','block')
def _():
    d=RP('3a4a52'); t=base(d,121,cell=4,levels=(0.35,0.5,0.65,0.85),lo=1)
    for (x,y) in rpts(122,10,3): t.set(x,y,'7af0d8')
    for (x,y) in rpts(123,5,4): t.set(x,y,'d0fff4')
    return t

@reg('block/omni_aether_14_block','瓦解号角构件','block')
def _():
    s=RP('b8c4cc'); t=base(s,131,cell=4,levels=(0.3,0.45,0.6,0.8),lo=2); t.soft=0.2
    cracks=walk(132,(0,5),16,dirs=((1,0),(1,1),(1,-1)))+walk(133,(7,0),16,dirs=((0,1),(1,1),(-1,1)))
    for (x,y) in cracks: t.set(x,y,s[0])
    for (x,y) in cracks: t.set(x+1,y+1,s[5]) if t.px[(y+1)%16][(x+1)%16]!=s[0] else None
    return t

@reg('block/omni_mana_feed','虹移腔室基座','block')
def _():
    d=RP('3a3448'); t=base(d,141,cell=4,levels=(0.35,0.5,0.65,0.85),lo=1)
    rb=['e86a6a','e8c06a','8ae06a','6ac8e8','8a6ae8','d86ad8']
    for i in range(2):
        for x in range(16):
            y=4+i*8+round(1.6*math.sin(2*math.pi*(x+i*5)/16)); t.set(x,y,rb[(x//3+i*2)%6])
    for (x,y) in rpts(144,3,6): t.set(x,y,'cfeaff'); t.set(x+1,y,'8ab8e8')
    return t

def lrock(seed):
    r=RP('ece8dc'); return base(r,seed,cell=8,levels=(0.3,0.45,0.62,0.85),lo=2), r

@reg('block/omni_mana_01_block','白雏菊转化构件','block')
def _():
    t,r=lrock(151)
    rb=['f0a0b8','f0e0a0','b0f0b8','a0d8f0']
    for x in range(16): t.set(x,8+round(1.4*math.sin(2*math.pi*(x+3)/16)),rb[(x//4)%4])
    return t

def ore(t, ramp, seed, n=4):
    for (x,y) in rpts(seed,n,5):
        for (dx,dy,k) in [(0,0,4),(1,0,3),(0,1,3),(1,1,2),(-1,0,2)]: t.set(x+dx,y+dy,ramp[k])
        t.set(x,y-1,ramp[5])

@reg('block/omni_mana_02_block','凝矿兰构件','block')
def _():
    t,r=lrock(161); ore(t,RP('5ec8d8'),162); return t

@reg('block/omni_mana_03_block','狱火凝矿兰构件','block')
def _():
    d=RP('6a3a3a'); t=base(d,171,cell=4,levels=(0.3,0.45,0.6,0.8),lo=1); ore(t,RP('f08a3a'),172); return t

@reg('block/omni_mana_04_block','石莲转化构件','block')
def _():
    t=Tex(seed=181); bands=[RP('e8d8e8'),RP('d8e8e0'),RP('e8e0c8'),RP('d0d8f0')]
    n=pnoise(181,4,2)
    for y in range(16):
        for x in range(16):
            bv=(y+n[y][x]*4)/4; b=int(bv)%4; fr=bv-int(bv)
            k=round((2+n[(y+3)%16][(x+5)%16]*3)*2)/2
            c=ramp_at(bands[b],k)
            if fr<0.22: c=mix(c,ramp_at(bands[(b-1)%4],k),0.5)   # 两条色带交界处的过渡色
            t.put(x,y,c)
    t.layer_done()
    return t

def frame_px(c, lx, ly, mid=None):
    """8×8 面板的边框：上沿与左沿受光，下沿与右沿背光，转角取中间色。"""
    hi=lx==0 or ly==0; lo_=lx==7 or ly==7
    if hi and lo_: return ramp_at(c,3)
    if hi: return ramp_at(c,4 if mid is None else mid+1)
    return ramp_at(c,2 if mid is None else mid-0.5)

@reg('block/omni_engineering_08_precursor','万用电解前驱块','block')
def _():
    c=RP('d9884c'); q=RP('ece6e0'); t=Tex(seed=88); n=pnoise(89,4,1)
    for y in range(16):
        for x in range(16):
            lx,ly=x%8,y%8
            if lx in (0,7) or ly in (0,7): t.put(x,y,frame_px(c,lx,ly))
            else:
                k=4.5-0.5*((lx+ly-2)//3)-(0.5 if lx==1 or ly==1 else 0)+(0.5 if n[y][x]>0.72 else 0)
                t.put(x,y,ramp_at(q,k))
    t.layer_done()
    for (x,y) in [(0,0),(8,8),(0,8),(8,0)]: t.set(x,y,c[5])
    return t

@reg('block/omni_engineering_08_block','万用电解构件','block')
def _():
    c=RP('b06a3a'); v=RP('5ab8a0'); t=Tex(seed=190); n=pnoise(193,4,2)
    for y in range(16):
        for x in range(16):
            lx,ly=x%8,y%8
            if lx in (0,7) or ly in (0,7): t.put(x,y,frame_px(c,lx,ly,mid=3))
            else:
                k=round((2+(n[y][x]-0.5)*1.6)*2)/2-(0.5 if lx==1 or ly==1 else 0)
                t.put(x,y,ramp_at(v,k))
    t.layer_done(); t.soft=0.22
    inner=lambda pts:[(x,y) for (x,y) in pts if x%8 not in (0,7) and y%8 not in (0,7)]
    for (x,y) in inner(rpts(191,16,3)): t.set(x,y,v[4])
    for (x,y) in inner(rpts(192,8,4)): t.set(x,y,'cfeaff')
    for (x,y) in [(3,3),(11,11),(3,11),(11,3)]: t.set(x,y,'e8f8ff'); t.set(x+1,y,'8ad0e8')
    return t

@reg('block/omni_pneumatic_15_precursor','AE 熵变前驱块','block')
def _():
    b=RP('8ab8e0'); t=base(b,201,cell=8,levels=(0.3,0.45,0.6,0.8),lo=2)
    for (x,y) in rpts(202,4,5):
        t.set(x,y,'e8f6ff'); t.set(x,y+1,'b8e0f8'); t.set(x+1,y+1,'90c8f0'); t.set(x-1,y+1,'d0eeff')
    return t

@reg('block/omni_pneumatic_15_block','AE 熵变构件','block')
def _():
    b=RP('8ab8e0'); t=base(b,211,cell=8,levels=(0.3,0.45,0.6,0.8),lo=2)
    h=RP('e8783a')
    for y in range(16):
        for x in range(16):
            d=(x+y)%16
            if d>=8: t.put(x,y,ramp_at(h,t.lv[y][x]))
            elif d==0: t.put(x,y,mix(ramp_at(h,t.lv[y][x]),t.px[y][x],0.5))   # 冷热交界的过渡色
    for y in range(16):
        for x in range(16):
            if (x+y)%16==8: t.set(x,y,'fff0c0')
    return t
