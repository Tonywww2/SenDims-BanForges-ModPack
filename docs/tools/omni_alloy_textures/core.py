"""Pixel-art toolkit: archetype grids with ramp digits, material ramps, overlays."""
from PIL import Image
import math, random

def hx(s):
    s=s.lstrip('#'); return (int(s[0:2],16),int(s[2:4],16),int(s[4:6],16),255)

# ramp: [outline, 1 darkest, 2 dark, 3 base, 4 light, 5 highlight]
RAMPS={}
def ramp(name,*cols): RAMPS[name]=[hx(c) for c in cols]

def mix(a,b,t):
    return tuple(int(round(a[i]*(1-t)+b[i]*t)) for i in range(3))+(255,)

# colorsys 在 Python 3.12 改过 rgb_to_hls 的算法（gh-106498），不同版本会差一个色阶。
# 这里内置 3.12+ 的实现，保证任何 Python 版本画出的像素都一致。
def _rgb_to_hls(r, g, b):
    maxc = max(r, g, b); minc = min(r, g, b)
    sumc = maxc + minc; rangec = maxc - minc; l = sumc / 2.0
    if minc == maxc: return 0.0, l, 0.0
    s = rangec / sumc if l <= 0.5 else rangec / (2.0 - maxc - minc)
    rc = (maxc - r) / rangec; gc = (maxc - g) / rangec; bc = (maxc - b) / rangec
    if r == maxc: h = bc - gc
    elif g == maxc: h = 2.0 + rc - bc
    else: h = 4.0 + gc - rc
    return (h / 6.0) % 1.0, l, s

def _hls_v(m1, m2, hue):
    hue = hue % 1.0
    if hue < 1.0 / 6.0: return m1 + (m2 - m1) * hue * 6.0
    if hue < 0.5: return m2
    if hue < 2.0 / 3.0: return m1 + (m2 - m1) * (2.0 / 3.0 - hue) * 6.0
    return m1

def _hls_to_rgb(h, l, s):
    if s == 0.0: return l, l, l
    m2 = l * (1.0 + s) if l <= 0.5 else l + s - (l * s)
    m1 = 2.0 * l - m2
    return _hls_v(m1, m2, h + 1.0 / 3.0), _hls_v(m1, m2, h), _hls_v(m1, m2, h - 1.0 / 3.0)

def make_ramp(base, hue_shift=True, contrast=1.0):
    """auto ramp from a base hex: [outline, d1, d2, base, l1, l2]; darker shades shift hue slightly."""
    r,g,b,_=hx(base); h,l,s=_rgb_to_hls(r/255,g/255,b/255)
    out=[]
    spec=((None,0.10,-0.04),(-0.30,0.08,-0.03),(-0.16,0.05,-0.015),(0,0,0),(0.11,-0.03,0.01),(0.22,-0.10,0.02))
    for i,(dl,ds,dh) in enumerate(spec):
        if dl is None: ll=max(0.06,min(0.30,l*0.34))
        else:
            dl*=contrast
            ll=l+dl
            if dl>0: ll=l+(1-l)*min(1,dl/0.25)*0.85 if l>0.75 else l+dl
            ll=max(0.04,min(0.97,ll))
        ss=max(0,min(1,s+ds)); hh=(h+(dh if hue_shift else 0))%1
        rr,gg,bb=_hls_to_rgb(hh,ll,ss); out.append((int(rr*255),int(gg*255),int(bb*255),255))
    return out

class Sprite:
    def __init__(self, w=16, h=16):
        self.w=w; self.h=h; self.px=[[None]*w for _ in range(h)]
    def copy(self):
        s=Sprite(self.w,self.h); s.px=[r[:] for r in self.px]; return s
    def img(self):
        im=Image.new('RGBA',(self.w,self.h),(0,0,0,0))
        for y in range(self.h):
            for x in range(self.w):
                if self.px[y][x]: im.putpixel((x,y),self.px[y][x])
        return im
    def get(self,x,y):
        if 0<=x<self.w and 0<=y<self.h: return self.px[y][x]
        return None
    def set(self,x,y,c):
        if 0<=x<self.w and 0<=y<self.h: self.px[y][x]=c

def resolve(ch, mats, extra):
    """mats: dict slot->ramp list. slot 0 uses 'o','1'-'5'; slot1 'p','a'-'e'; slot2 'P','A'-'E'; slot3 'q','f'-'j'"""
    if ch in extra: return extra[ch]
    sets=[('o','12345'),('p','abcde'),('P','ABCDE'),('q','fghij')]
    for i,(oc,digits) in enumerate(sets):
        if i not in mats: continue
        r=mats[i]
        if ch==oc: return r[0]
        if ch in digits: return r[1+digits.index(ch)]
    return None

def paint(grid, mats, extra=None, base=None):
    extra=extra or {}
    s=base.copy() if base else Sprite(len(grid[0]),len(grid))
    for y,row in enumerate(grid):
        for x,ch in enumerate(row):
            if ch in '. ': continue
            if ch=='_': s.px[y][x]=None; continue
            c=resolve(ch,mats,extra)
            if c is None: raise ValueError('unmapped %r at %d,%d'%(ch,x,y))
            s.px[y][x]=c
    return s

def grid_check(g,name=''):
    assert all(len(r)==len(g[0]) for r in g),(name,[len(r) for r in g])
    return g

def sheet(entries, path, scale=8, cols=8, label=True):
    """entries: list of (label, Image)"""
    from PIL import ImageDraw, ImageFont
    try: font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',13)
    except Exception:
        try: font=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',13)
        except Exception: font=ImageFont.load_default()
    cw=16*scale+24; ch=16*scale+60
    rows=(len(entries)+cols-1)//cols
    sh=Image.new('RGBA',(cols*cw+12,rows*ch+12),(48,52,58,255)); d=ImageDraw.Draw(sh)
    for i,(lab,im) in enumerate(entries):
        cx=12+(i%cols)*cw; cy=12+(i//cols)*ch
        w,h=im.size
        big=im.resize((w*scale//max(1,w//16) if w>16 else 16*scale, h*scale//max(1,w//16) if w>16 else h*scale),Image.NEAREST) if w==16 else im.resize((16*scale,int(h*16*scale/w)),Image.NEAREST)
        if big.height>16*scale: big=big.crop((0,0,16*scale,16*scale))
        sh.alpha_composite(big,(cx,cy))
        slot=Image.new('RGBA',(20,20),(139,139,139,255)); slot.alpha_composite(im.crop((0,0,16,16)) if w==16 else im.resize((16,int(h*16/w))).crop((0,0,16,16)),(2,2))
        sh.alpha_composite(slot,(cx,cy+16*scale+4))
        dk=Image.new('RGBA',(36,36),(28,28,30,255)); dk.alpha_composite((im.crop((0,0,16,16)) if w==16 else im.resize((16,int(h*16/w))).crop((0,0,16,16))).resize((32,32),Image.NEAREST),(2,2))
        sh.alpha_composite(dk,(cx+24,cy+16*scale+4))
        if label: d.text((cx+64,cy+16*scale+8),lab[:10],font=font,fill=(225,225,220,255))
        if label and len(lab)>10: d.text((cx+64,cy+16*scale+24),lab[10:20],font=font,fill=(225,225,220,255))
    sh.save(path)
