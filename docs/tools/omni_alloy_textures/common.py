import sys, math, random
sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from core import *
from draw import *

MAT={}
def mat(name, base, **kw):
    MAT[name]=make_ramp(base, **kw); return name
def ramp_of(name): return MAT[name]

REG={}  # tex path -> (label, fn, kind)
def reg(path, label, kind='item'):
    def deco(fn):
        REG[path]=(label, fn, kind); return fn
    return deco

def cv(): return Canvas(MAT)

def dots(c, pts, m, lv):
    for x,y in pts:
        if c.get(x,y) is not None: c.set(x,y,m,lv)
def px(c, pts, color):
    for x,y in pts: c.rgba(x,y,color)
def g(c, rows, cmap, ox=0, oy=0): grid(c, rows, cmap, ox, oy)
