"""Render scientific comparison figures from saved benchmark measurements."""
import json
import os
from pathlib import Path
from workspace import ROOT

os.environ['MPLCONFIGDIR'] = str(ROOT / 'plot-cache')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties
import numpy as np


def render():
    output = ROOT / 'figures'
    output.mkdir(exist_ok=True)
    font = Path('C:/Windows/Fonts/msyh.ttc')
    if font.exists():
        plt.rcParams['font.family'] = FontProperties(fname=str(font)).get_name()
    plt.rcParams['axes.unicode_minus'] = False
    summary = json.loads((ROOT / 'formal-summary.json').read_text())
    labels = ['A 旧配置', 'B UTF', 'C UTF+C2MEF']
    colors = ['#667085', '#2b91a9', '#4a9b62']
    fig, ax = plt.subplots(figsize=(8, 4.8), layout='constrained')
    for index, variant in enumerate(['A', 'B', 'C']):
        rates = [row['fullChunksPerSecond'] for row in summary['runs'] if row['variant'] == variant]
        ax.bar(index, np.median(rates), width=0.55, color=colors[index])
        ax.scatter(index + np.linspace(-.12, .12, len(rates)), rates, s=36, color='#18232e', zorder=3)
        ax.text(index, np.median(rates), f' {np.median(rates):.1f}', ha='center', va='bottom')
    ax.set_xticks(range(3), labels)
    ax.set_ylabel('FULL 区块/秒')
    ax.set_title('持续生成吞吐，柱形为中位数，圆点为各个有效种子')
    ax.grid(axis='y', alpha=.2)
    ax.set_axisbelow(True)
    fig.savefig(output / 'throughput.png', dpi=180)
    plt.close(fig)
    fig, axes = plt.subplots(1, 3, figsize=(14, 4.5), layout='constrained')
    for axis, variant, label in zip(axes, ['A', 'B', 'C'], labels):
        values = np.load(ROOT / 'world-metrics' / (variant + '-heights.npz'))
        view = axis.imshow(values['floor'], origin='lower', cmap='terrain', vmin=-64, vmax=320,
                           extent=[15376, 17408, 15376, 17408])
        axis.set_title(label)
        axis.set_xlabel('X')
        axis.set_ylabel('Z')
    fig.colorbar(view, ax=axes, label='已保存区块的海底/地表高度 Y', shrink=.75)
    fig.suptitle('同种子、同坐标区域的实际存档高度图')
    fig.savefig(output / 'saved-terrain.png', dpi=180)
    plt.close(fig)
    surveys = [ROOT / 'runs/A-survey-20261107-20261109-161214/result.json',
               ROOT / 'runs/B-survey-20261107-20261109-113301/result.json']
    fig, axes = plt.subplots(1, 2, figsize=(11, 5), layout='constrained')
    for axis, path, label in zip(axes, surveys, labels[:2]):
        points = np.asarray(json.loads(path.read_text())['map']['points'], dtype=object)
        heights = points[:, 2].astype(float)
        if label.startswith('B'):
            heights = np.maximum(63, heights + 1)
        view = axis.imshow(heights.reshape(65, 65), origin='lower', cmap='terrain', vmin=63, vmax=320,
                           extent=[-16384, 16384, -16384, 16384])
        axis.set_title(label)
        axis.set_xlabel('X')
        axis.set_ylabel('Z')
    fig.colorbar(view, ax=axes, label='地表/水面高度预览 Y', shrink=.75)
    fig.suptitle('宏观布局采样，UTF 使用侵蚀前高度近似')
    fig.savefig(output / 'macro-layout.png', dpi=180)
    plt.close(fig)
    print('FIGURES_RENDERED', output)


if __name__ == '__main__':
    render()
