"""Crisp pixel construction: shapes write (material, level) cells; finalize -> Sprite."""
import math
from core import Sprite, hx

class Canvas:
    def __init__(self, mats, w=16, h=16):
        self.mats=mats  # dict name->ramp
        self.w=w; self.h=h
        self.cell=[[None]*w for _ in range(h)]   # (mat, level) or ('#',rgba)
        self.obj=[[-1]*w for _ in range(h)]      # object id for internal edges
        self.nobj=0
    def newobj(self):
        self.nobj+=1; return self.nobj
    def set(self,x,y,mat,lv,oid=None):
        x=int(x); y=int(y)
        if 0<=x<self.w and 0<=y<self.h:
            self.cell[y][x]=(mat,max(0,min(5,lv)))
            if oid is not None: self.obj[y][x]=oid
    def get(self,x,y):
        if 0<=x<self.w and 0<=y<self.h: return self.cell[y][x]
        return None
    def rgba(self,x,y,c):
        if 0<=x<self.w and 0<=y<self.h: self.cell[y][x]=('#',hx(c) if isinstance(c,str) else c)
    def clear(self,x,y):
        if 0<=x<self.w and 0<=y<self.h: self.cell[y][x]=None; self.obj[y][x]=-1
    def shift(self,mat,x,y,d):
        c=self.get(x,y)
        if c and c[0]!='#': self.cell[y][x]=(c[0] if mat is None else mat, max(0,min(5,c[1]+d)))
    def lv(self,x,y):
        c=self.get(x,y); return c[1] if c and c[0]!='#' else None

    def finalize(self, outline=True, inner=True, rimlight=True, rimdark=False, outline_mat=None):
        W,H=self.w,self.h
        filled=[[self.cell[y][x] is not None for x in range(W)] for y in range(H)]
        out=[[c for c in row] for row in self.cell]
        if rimlight:
            for y in range(H):
                for x in range(W):
                    c=self.cell[y][x]
                    if not c or c[0]=='#': continue
                    up=(y-1<0 or not filled[y-1][x]); lf=(x-1<0 or not filled[y][x-1])
                    if (up or lf) and c[1]>=2:
                        out[y][x]=(c[0],min(5,c[1]+1))
                    if rimdark:
                        dn=(y+1>=H or not filled[y+1][x]); rt=(x+1>=W or not filled[y][x+1])
                        if (dn or rt): out[y][x]=(c[0],max(1,c[1]-1))
        if inner:
            # darken pixels on boundary between different objects (lower/right object gets the line)
            for y in range(H):
                for x in range(W):
                    if not filled[y][x]: continue
                    o=self.obj[y][x]
                    if o<0: continue
                    for dx,dy in ((-1,0),(0,-1)):
                        xx,yy=x+dx,y+dy
                        if 0<=xx<W and 0<=yy<H and filled[yy][xx] and self.obj[yy][xx]>=0 and self.obj[yy][xx]!=o and self.obj[yy][xx]>o:
                            c=out[y][x]
                            if c and c[0]!='#': out[y][x]=(c[0],0)
        if outline:
            for y in range(H):
                for x in range(W):
                    if not filled[y][x]: continue
                    if any(not(0<=x+dx<W and 0<=y+dy<H) or not filled[y+dy][x+dx] for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))):
                        c=self.cell[y][x]
                        m=outline_mat or (c[0] if c[0]!='#' else None)
                        if m: out[y][x]=(m,0)
        s=Sprite(W,H)
        for y in range(H):
            for x in range(W):
                c=out[y][x]
                if c is None: continue
                if c[0]=='#': s.px[y][x]=c[1]
                else: s.px[y][x]=self.mats[c[0]][c[1]]
        return s

# ---------- primitives ----------
def fill_poly(cv, pts, mat, lv, oid=None):
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    for y in range(int(math.floor(min(ys))), int(math.ceil(max(ys)))+1):
        for x in range(int(math.floor(min(xs))), int(math.ceil(max(xs)))+1):
            if inside(pts,x+0.5,y+0.5): cv.set(x,y,mat,lv,oid)
def inside(pts,px,py):
    c=False; n=len(pts)
    for i in range(n):
        x1,y1=pts[i]; x2,y2=pts[(i+1)%n]
        if (y1>py)!=(y2>py):
            xi=x1+(py-y1)*(x2-x1)/(y2-y1)
            if px<xi: c=not c
    return c

def iso_box(cv, ox, oy, a, b, h, mat, top=4, left=3, right=2, oid=None, topmat=None, leftmat=None, rightmat=None):
    """2:1 isometric box. (ox,oy)=back corner of top face. a along (+2,+1), b along (-2,+1), h up."""
    oid=oid or cv.newobj()
    B=(ox,oy); Rr=(ox+2*a,oy+a); F=(ox+2*a-2*b,oy+a+b); L=(ox-2*b,oy+b)
    fill_poly(cv,[L,F,(F[0],F[1]+h),(L[0],L[1]+h)],leftmat or mat,left,oid)
    fill_poly(cv,[F,Rr,(Rr[0],Rr[1]+h),(F[0],F[1]+h)],rightmat or mat,right,oid)
    fill_poly(cv,[B,Rr,F,L],topmat or mat,top,oid)
    return oid

def ellipse_mask(cx,cy,rx,ry):
    pts=set()
    for y in range(int(cy-ry-1),int(cy+ry+2)):
        for x in range(int(cx-rx-1),int(cx+rx+2)):
            if ((x+0.5-cx)/rx)**2+((y+0.5-cy)/ry)**2<0.97: pts.add((x,y))
    return pts

def cylinder(cv, cx, cy, rx, ry, h, mat, toplv=4, oid=None, topmat=None, sidelv=(4,3,3,2,2,1)):
    """vertical cylinder; (cx,cy)=center of top ellipse; side shading by horizontal position."""
    oid=oid or cv.newobj()
    bot=ellipse_mask(cx,cy+h,rx,ry)
    side=set()
    for y in range(int(cy),int(cy+h)+1):
        for x in range(int(cx-rx),int(cx+rx)+1):
            if abs(x+0.5-cx)<=rx: side.add((x,y))
    for (x,y) in bot|side:
        t=(x+0.5-(cx-rx))/(2*rx)   # 0 left -> 1 right
        k=sidelv[min(len(sidelv)-1,int(t*len(sidelv)))]
        cv.set(x,y,mat,k,oid)
    for (x,y) in ellipse_mask(cx,cy,rx,ry):
        cv.set(x,y,topmat or mat,toplv,oid)
    return oid

def ring(cv, cx, cy, rx, ry, tx, ty, h, mat, oid=None, toplv=None, ih=1):
    """washer/torus-like ring seen from above at an angle. tx,ty = band thickness in x/y."""
    oid=oid or cv.newobj()
    irx,iry=rx-tx, ry-ty
    otop=ellipse_mask(cx,cy,rx,ry); itop=ellipse_mask(cx,cy,irx,iry)
    oside=set()
    for d in range(0,int(h)+1): oside|=ellipse_mask(cx,cy+d,rx,ry)
    ibot=ellipse_mask(cx,cy+ih,irx,iry)
    for (x,y) in oside-otop:
        t=(x+0.5-(cx-rx))/(2*rx); k=[3,3,2,2,2,1][min(5,int(t*6))]
        cv.set(x,y,mat,k,oid)
    for (x,y) in otop-itop:
        ang=math.atan2((y+0.5-cy)/ry,(x+0.5-cx)/rx)
        d=math.cos(ang-math.radians(-135))
        # inner edge of band (near hole) slightly darker
        ex=((x+0.5-cx)/irx)**2+((y+0.5-cy)/iry)**2
        k=3+(1 if d>0.3 else 0)+(1 if d>0.85 else 0)-(1 if d<-0.55 else 0)
        if toplv is not None: k=toplv
        cv.set(x,y,mat,k,oid)
    for (x,y) in itop:
        if (x,y) in ibot: cv.clear(x,y)
        else:
            t=(x+0.5-(cx-irx))/(2*irx); k=[2,1,1,1,2,2][min(5,int(t*6))]
            cv.set(x,y,mat,k,oid)
    return oid

def sphere(cv, cx, cy, r, mat, ry=None, oid=None, levels=(1,2,3,4,5), light=(-0.6,-0.7)):
    oid=oid or cv.newobj(); ry=ry or r
    L=(light[0],light[1],0.55); n=math.sqrt(sum(c*c for c in L)); L=tuple(c/n for c in L)
    for (x,y) in ellipse_mask(cx,cy,r,ry):
        nx=(x+0.5-cx)/r; ny=(y+0.5-cy)/ry; nz=math.sqrt(max(0,1-nx*nx-ny*ny))
        d=nx*L[0]+ny*L[1]+nz*L[2]
        k=levels[min(len(levels)-1,max(0,int((d+0.15)/1.15*len(levels))))]
        cv.set(x,y,mat,k,oid)
    return oid

def line(cv, x0,y0,x1,y1, mat, lv, oid=None):
    dx=abs(x1-x0); dy=-abs(y1-y0); sx=1 if x0<x1 else -1; sy=1 if y0<y1 else -1; err=dx+dy
    while True:
        cv.set(x0,y0,mat,lv,oid)
        if x0==x1 and y0==y1: break
        e2=2*err
        if e2>=dy: err+=dy; x0+=sx
        if e2<=dx: err+=dx; y0+=sy

def grid(cv, rows, cmap, ox=0, oy=0, oid=None):
    """rows: strings; cmap: char -> (mat,lv) or hex string; '.' skip, '_' clear"""
    for y,row in enumerate(rows):
        for x,ch in enumerate(row):
            if ch in '. ': continue
            if ch=='_': cv.clear(ox+x,oy+y); continue
            v=cmap[ch]
            if isinstance(v,str): cv.rgba(ox+x,oy+y,v)
            else: cv.set(ox+x,oy+y,v[0],v[1],oid)

# ---------- face-space painting versions ----------
def iso_box2(cv, ox, oy, a, b, h, mat, top=4, left=3, right=2, oid=None, paint=None):
    """like iso_box but calls paint(face,u,v) -> None | (mat,lv) | int(delta) for every pixel.
    face 'T': u in [0,a] along a-axis, v in [0,b] along b-axis
    face 'L' (front-left, B=b): u in [0,a], v depth [0,h]
    face 'R' (front-right, A=a): u in [0,b], v depth [0,h]"""
    oid=oid or cv.newobj()
    B=(ox,oy); Rr=(ox+2*a,oy+a); F=(ox+2*a-2*b,oy+a+b); L=(ox-2*b,oy+b)
    faces=[('L',[L,F,(F[0],F[1]+h),(L[0],L[1]+h)],left),('R',[F,Rr,(Rr[0],Rr[1]+h),(F[0],F[1]+h)],right),('T',[B,Rr,F,L],top)]
    for name,poly,lv in faces:
        xs=[p[0] for p in poly]; ys=[p[1] for p in poly]
        for y in range(int(math.floor(min(ys))),int(math.ceil(max(ys)))+1):
            for x in range(int(math.floor(min(xs))),int(math.ceil(max(xs)))+1):
                sx,sy=x+0.5,y+0.5
                if not inside(poly,sx,sy): continue
                if name=='T':
                    A=((sx-ox)/2+(sy-oy))/2; Bv=((sy-oy)-(sx-ox)/2)/2; u,v=A,Bv
                elif name=='R':
                    Bv=(ox+2*a-sx)/2; D=sy-oy-a-Bv; u,v=Bv,D
                else:
                    A=(sx-ox+2*b)/2; D=sy-oy-A-b; u,v=A,D
                m,l=mat,lv
                if paint:
                    r=paint(name,u,v)
                    if r is None: pass
                    elif isinstance(r,int): l=lv+r
                    elif r=='clear': cv.clear(x,y); continue
                    else: m,l=r
                cv.set(x,y,m,l,oid)
    return oid

def cylinder2(cv, cx, cy, rx, ry, h, mat, toplv=4, oid=None, sidelv=(4,3,3,2,2,1), paint=None):
    """paint(face,u,v): top: u,v in [-1,1] normalized ellipse coords; side: u=t in [0,1] left->right, v=depth px"""
    oid=oid or cv.newobj()
    side=set()
    for d in range(0,int(h)+1): side|=ellipse_mask(cx,cy+d,rx,ry)
    top=ellipse_mask(cx,cy,rx,ry)
    for (x,y) in side-top:
        t=(x+0.5-(cx-rx))/(2*rx); k=sidelv[min(len(sidelv)-1,max(0,int(t*len(sidelv))))]
        # depth below top rim at this column
        dx=(x+0.5-cx)/rx; ytop=cy+ry*math.sqrt(max(0,1-dx*dx)); v=y+0.5-ytop
        m,l=mat,k
        if paint:
            r=paint('S',t,v)
            if isinstance(r,int): l=k+r
            elif r is not None: m,l=r
        cv.set(x,y,m,l,oid)
    for (x,y) in top:
        u=(x+0.5-cx)/rx; v=(y+0.5-cy)/ry
        m,l=mat,toplv
        if paint:
            r=paint('T',u,v)
            if isinstance(r,int): l=toplv+r
            elif r=='clear': cv.clear(x,y); continue
            elif r is not None: m,l=r
        cv.set(x,y,m,l,oid)
    return oid
