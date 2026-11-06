"""Char-grid builder for templates: compose parts with masks + shading, auto outline."""
import math
SL={0:('o','12345'),1:('p','abcde'),2:('P','ABCDE'),3:('q','fghij')}
def ch(slot,lv): return SL[slot][0] if lv<=0 else SL[slot][1][min(5,lv)-1]

class GB:
    def __init__(s): s.g=[['.']*16 for _ in range(16)]; s.part=[[0]*16 for _ in range(16)]; s.np=0; s.slot=[[0]*16 for _ in range(16)]
    # masks
    @staticmethod
    def rect(x0,y0,x1,y1): return {(x,y) for x in range(x0,x1+1) for y in range(y0,y1+1)}
    @staticmethod
    def ell(cx,cy,rx,ry,th=0.97):
        return {(x,y) for x in range(16) for y in range(16) if ((x+0.5-cx)/rx)**2+((y+0.5-cy)/ry)**2<th}
    @staticmethod
    def poly(pts):
        S=set()
        for y in range(16):
            for x in range(16):
                px,py=x+0.5,y+0.5; c=False; n=len(pts)
                for i in range(n):
                    x1,y1=pts[i]; x2,y2=pts[(i+1)%n]
                    if (y1>py)!=(y2>py):
                        xi=x1+(py-y1)*(x2-x1)/(y2-y1)
                        if px<xi: c=not c
                if c: S.add((x,y))
        return S
    @staticmethod
    def line(x0,y0,x1,y1,w=1):
        S=set(); n=max(abs(x1-x0),abs(y1-y0))*3+1
        for i in range(n+1):
            t=i/n; x=x0+(x1-x0)*t; y=y0+(y1-y0)*t
            for dx in range(w):
                for dy in range(w): S.add((int(round(x))+dx,int(round(y))+dy))
        return S
    # paint
    def add(s, mask, slot=0, shade='flat', lv=3, edge=False, **kw):
        s.np+=1; pid=s.np
        mask={p for p in mask if 0<=p[0]<16 and 0<=p[1]<16}
        if not mask: return mask
        xs=[p[0] for p in mask]; ys=[p[1] for p in mask]
        x0,x1,y0,y1=min(xs),max(xs),min(ys),max(ys)
        for (x,y) in mask:
            if callable(shade): l=shade(x,y)
            elif shade=='flat': l=lv
            elif shade=='box':   # front flat with top highlight, right/bottom shadow
                l=lv
                if (x,y-1) not in mask: l=lv+1
                elif (x+1,y) not in mask or (x,y+1) not in mask: l=lv-1
            elif shade=='cylv':  # vertical cylinder: horizontal gradient
                t=(x-x0+0.5)/(x1-x0+1); l=[lv+1,lv+1,lv,lv,lv-1,lv-1,lv-2][min(6,int(t*7))]
            elif shade=='cylh':
                t=(y-y0+0.5)/(y1-y0+1); l=[lv+1,lv+1,lv,lv,lv-1,lv-1,lv-2][min(6,int(t*7))]
            elif shade=='sphere':
                cx=(x0+x1+1)/2; cy=(y0+y1+1)/2; rx=(x1-x0+1)/2; ry=(y1-y0+1)/2
                d=-0.6*(x+0.5-cx)/rx-0.7*(y+0.5-cy)/ry
                l=lv+(2 if d>0.7 else 1 if d>0.25 else 0 if d>-0.25 else -1 if d>-0.7 else -2)
            elif shade=='diag':  # light from top-left across the mask
                t=((x-x0)+(y-y0))/max(1,(x1-x0)+(y1-y0)); l=[lv+1,lv,lv,lv-1,lv-1][min(4,int(t*5))]
            else: l=lv
            l=max(1,min(5,l))
            s.g[y][x]=ch(slot,l); s.part[y][x]=pid; s.slot[y][x]=slot
        if edge:
            for (x,y) in mask:
                if any((x+dx,y+dy) not in mask for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))):
                    s.g[y][x]=ch(slot,0)
        return mask
    def put(s,pts,c):
        for x,y in pts:
            if 0<=x<16 and 0<=y<16: s.g[y][x]=c
    def clear(s,mask):
        for x,y in mask:
            if 0<=x<16 and 0<=y<16: s.g[y][x]='.'; s.part[y][x]=0
    def outline(s):
        out=[r[:] for r in s.g]
        for y in range(16):
            for x in range(16):
                if s.g[y][x]=='.': continue
                if any(not(0<=x+dx<16 and 0<=y+dy<16) or s.g[y+dy][x+dx]=='.' for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))):
                    out[y][x]=ch(s.slot[y][x],0)
        s.g=out; return s
    def rows(s): return [''.join(r) for r in s.g]
