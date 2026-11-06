from blocks import *
# 桶不另画：桶物品模型使用 Forge 的 forge:fluid_container，由桶底图与本流体的静止贴图合成。
import json

FLUIDS={
 # id: (label, color, style)
 'omni_bio_feed':('星浆培养液','8fc46a','broth'),
 'omni_bio_10_fluid':('发酵构件液','c8b070','bubbly'),
 'omni_bio_11_fluid':('蒸馏构件液','e8dca0','clear'),
 'omni_thermal_14_fluid':('熔岩炉构件液','f08a2a','molten'),
 'omni_thermal_17_fluid':('热解炉构件液','4a3424','oil'),
 'omni_thermal_18_fluid':('分馏精炼机构件液','d8a23a','clear'),
 'omni_thermal_20_brew':('相变抑制酿液','5ac8c0','potion'),
 'omni_engineering_03_fluid':('机械挤压构件液','8fc4e8','viscous'),
 'omni_engineering_20_fluid':('低温燃料制备构件液','aee8f8','cryo'),
 'omni_engineering_19_fluid':('燃油精炼构件液','f0b030','clear'),
 'omni_engineering_26_fluid':('Naquadah 重液制备构件液','3ac87a','glow'),
 'omni_pneumatic_05_fluid':('气动炼油构件液','e0c060','clear'),
 'omni_pneumatic_06_fluid':('热气动处理构件液','dfeaf0','viscous'),
 'omni_pneumatic_07_fluid':('流体混合构件液','5aa0e8','water'),
 'omni_nuclear_05_fluid':('核工熔融构件液','e8783a','molten'),
 'omni_nuclear_07_fluid':('核工提取构件液','b8e0e0','water'),
 'omni_nuclear_08_fluid':('核工电解构件液','d8f0a0','bubbly'),
 'omni_nuclear_10_fluid':('核工化学反应构件液','e0eaee','water'),
 'omni_nuclear_12_fluid':('核工流体富集构件液','5ad8e8','glow'),
 'omni_nuclear_13_fluid':('核工离心构件液','3ab8a8','water'),
 'omni_nuclear_14_fluid':('核工浸出构件液','8a9a5a','broth'),
 'omni_nuclear_19_fluid':('亚原子液化构件液','b88af0','glow'),
 'omni_nuclear_21_fluid':('核工辐照构件液','7af04a','glow'),
 'omni_nuclear_17_fluid':('气体洗涤构件液','c8c4e0','steam'),
 'omni_nuclear_18_fluid':('核工超冷构件液','6ab8f0','cryo'),
 'omni_nuclear_24_fluid':('核聚变构件液','f08ae0','plasma'),
 'omni_nuclear_26_fluid':('核工换热构件液','f0dcc8','steam'),
 'omni_nuclear_27_fluid':('裂变沸腾构件液','c8e4f4','bubbly'),
 'omni_nuclear_28_fluid':('大型涡轮构件液','b8c0c8','steam'),
 'omni_nuclear_29_fluid':('小型蒸汽涡轮构件液','a8d0e8','water'),
 'omni_nuclear_20_melt':('稳定同位素熔体','c8e060','molten'),
 'omni_fusion_feed':('聚变氘载液','a8b8f0','glow'),
}

STYLE={  # levels thresholds, contrast, extras
 'water':dict(contrast=1.0),'clear':dict(contrast=0.7),'broth':dict(contrast=1.0,sparkle='e8e0ff'),
 'bubbly':dict(contrast=0.9,bubbles=True),'molten':dict(contrast=1.3,crust=True),'oil':dict(contrast=1.1,gloss=True),
 'potion':dict(contrast=1.0,swirl='b88af0'),'viscous':dict(contrast=0.8,gloss=True),'cryo':dict(contrast=0.9,sparkle='ffffff'),
 'glow':dict(contrast=1.2,glow=True),'steam':dict(contrast=0.6),'plasma':dict(contrast=1.4,glow=True,sparkle='ffffff'),
}

def frames_tex(color, style, size, nframes, speed, seed):
    st=STYLE[style]; r=make_ramp(color, contrast=st.get('contrast',1.0))
    n1=pnoise(seed,cell=size//4,octaves=2,size=size); n2=pnoise(seed+7,cell=size//2,octaves=2,size=size)
    crust=pnoise(seed+3,cell=size//2,octaves=1,size=size) if st.get('crust') else None
    im=Image.new('RGBA',(size,size*nframes))
    rnd=random.Random(seed)
    bub=[(rnd.randrange(size),rnd.randrange(size),rnd.randrange(nframes)) for _ in range(size//4)]
    spk=[(rnd.randrange(size),rnd.randrange(size),rnd.randrange(nframes)) for _ in range(size//3)]
    for f in range(nframes):
        sh=int(f*size/nframes) if speed=='flow' else f*size//nframes
        for y in range(size):
            for x in range(size):
                if speed=='flow':
                    a=n1[(y-sh)%size][x]; b=n2[(y-sh*2//2-f)%size][(x+f//4)%size]
                else:
                    a=n1[y][(x+sh)%size]; b=n2[(y+sh)%size][x]
                v=(a+b)/2
                if style in ('steam','clear'): v=0.5+(v-0.5)*0.6
                k=3
                if v>0.56: k=4
                if v>0.66: k=5
                if v<0.44: k=2
                if v<0.32: k=1
                if st.get('glow') and v>0.6: k=5
                if crust and crust[(y-(sh//4 if speed=='flow' else 0))%size][x]<0.32: k=max(1,k-2)
                im.putpixel((x,y+f*size),r[k])
        if st.get('bubbles'):
            for (bx,by,ph) in bub:
                life=(f-ph)%nframes
                if life<6:
                    yy=(by-life)%size; im.putpixel((bx,yy+f*size),r[5]); 
                    if life<5: im.putpixel(((bx+1)%size,yy+f*size),r[4])
        sp=st.get('sparkle')
        if sp:
            for (sx,sy,ph) in spk:
                if (f-ph)%nframes<3: im.putpixel((sx,(sy+(sh if speed=='flow' else 0))%size+f*size),hx(sp))
        if st.get('swirl'):
            sw=make_ramp(st['swirl'])
            for y in range(size):
                for x in range(size):
                    v=n2[(y+f)%size][(x+f)%size]
                    if 0.55<v<0.6: im.putpixel((x,y+f*size),sw[4])
        if st.get('gloss'):
            for (sx,sy,ph) in spk[:size//6]:
                im.putpixel((sx,(sy+(sh if speed=='flow' else 0))%size+f*size),r[5])
    return im

for fid,(lab,col,style) in FLUIDS.items():
    def still(col=col,style=style,fid=fid): return frames_tex(col,style,16,16,'still',sum(map(ord,fid))*7)
    def flow(col=col,style=style,fid=fid): return frames_tex(col,style,32,16,'flow',sum(map(ord,fid))*7+5)
    REG['block/%s_still'%fid]=(lab+'（静止）', still, 'fluid_still')
    REG['block/%s_flow'%fid]=(lab+'（流动）', flow, 'fluid_flow')
