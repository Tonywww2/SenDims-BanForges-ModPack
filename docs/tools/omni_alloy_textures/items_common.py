import sys; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from tpl3 import *
def I(name, mats, extra=None): return T(name, mats, extra=extra)
def S(c, pts, m, lv):
    for (x,y) in pts: c.set(x,y,m,lv)
def Sx(c, pts, m, lv):   # only on filled
    for (x,y) in pts:
        if c.get(x,y) is not None: c.set(x,y,m,lv)
def H(c, pts, col):
    for (x,y) in pts: c.rgba(x,y,col)
def recolor(c, frm, to, keep_level=True, lvmap=None):
    for y in range(c.h):
        for x in range(c.w):
            cell=c.get(x,y)
            if cell and cell[0]==frm:
                l=cell[1] if not lvmap else lvmap.get(cell[1],cell[1])
                c.set(x,y,to,l)
def region(c, m):
    return [(x,y) for y in range(c.h) for x in range(c.w) if c.get(x,y) and c.get(x,y)[0]==m]
def outl(c, m, newm):
    """recolor outline (level 0) pixels of material m to material newm outline"""
    for (x,y) in region(c,m):
        if c.get(x,y)[1]==0: c.set(x,y,newm,0)
