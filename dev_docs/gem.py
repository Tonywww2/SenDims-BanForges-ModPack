import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# ==========================================
# 1. 配置参数 / Configuration Parameters
# ==========================================
tiers = [
    (1, 100, "T0"),
    (51, 250, "T1"),
    (101, 400, "T2"),
    (151, 550, "T3"),
]

luck_values = [0, 0.5, 1, 2, 3]
simulation_size = 100000  # 每个组合模拟 10 万次以获得平滑的概率曲线 / 100k simulations per combo for smooth curves

def get_base_success(luck):
    """
    根据图片图例推导：luck每增加1，baseSuccess增加 0.0008
    Derived from image legend: baseSuccess increases by 0.0008 per luck point
    """
    return 0.9500 + (luck * 0.0008)

# ==========================================
# 2. 核心数学逻辑 (使用 Numpy 向量化加速)
# Core Math Logic (Vectorized with Numpy for speed)
# ==========================================
def roll_stat_vectorized(min_val, max_val, luck, size):
    base_success = get_base_success(luck)
    if min_val >= max_val:
        return np.full(size, min_val)

    rng = max_val - min_val
    
    # 反推最大理论 target，消除右侧尖峰
    # Calculate theoretical max target to eliminate right-side spike
    max_target = (rng - 1) / 2.0
    min_u = base_success ** max_target
    
    # 生成安全范围内的随机数数组
    # Generate random number array within the safe range
    u = min_u + (1 - min_u) * np.random.random(size)
    
    target = np.log(u) / np.log(base_success)
    discriminant = 1 + 8 * rng * target
    
    # 防止浮点数误差导致判别式小于0
    # Prevent negative discriminant due to floating point errors
    discriminant = np.maximum(discriminant, 0)
    
    d = np.floor((1 + np.sqrt(discriminant)) / 2)
    result = min_val + d
    
    return np.minimum(max_val, result)

# ==========================================
# 3. 绘图逻辑 / Plotting Logic
# ==========================================
# 设置中文字体支持 (如果您的系统不支持，可注释掉)
# Set Chinese font support (comment out if your system doesn't support it)
plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS'] 
plt.rcParams['axes.unicode_minus'] = False

# 创建 2x2 的子图网格
# Create a 2x2 subplot grid
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
axes = axes.flatten()

print("开始模拟与绘制概率分布曲线... / Starting simulation and plotting probability curves...")

for i, (min_val, max_val, tier_name) in enumerate(tiers):
    ax = axes[i]
    
    for luck in luck_values:
        # 生成模拟数据 / Generate simulation data
        data = roll_stat_vectorized(min_val, max_val, luck, simulation_size)
        base_success = get_base_success(luck)
        
        # 使用 Seaborn 绘制平滑的核密度估计曲线 (KDE)
        # Use Seaborn to plot smooth Kernel Density Estimation (KDE) curves
        sns.kdeplot(
            data, 
            ax=ax, 
            label=f"luck={luck}, b={base_success:.4f}",
            linewidth=2,
            clip=(min_val, max_val) # 限制曲线不超出数值边界 / Clip curve to value boundaries
        )
    
    ax.set_title(f"Tier: {tier_name} [{min_val}, {max_val}]", fontsize=14)
    ax.set_xlabel("Final Value", fontsize=12)
    ax.set_ylabel("Probability Density", fontsize=12)
    ax.legend(fontsize=10)
    ax.grid(True, linestyle='--', alpha=0.6)

plt.tight_layout()
plt.show()
print("绘制完成！ / Plotting complete!")