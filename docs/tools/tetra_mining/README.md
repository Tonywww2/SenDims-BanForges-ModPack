# Tetra 材料粗查与采掘模型验证

规则及更新说明见[采掘适配文档](../../kubejs/tetra-mining-oxygen-crystal-2026-11-02.md)。

- `node docs/tools/tetra_mining/audit_materials.cjs`：读取安装模组的材料资源与 KubeJS data 覆盖，执行阶段材料生成脚本，输出范围和中位数。未分期兼容材料不用于推导阶段成长。
- `node docs/tools/tetra_mining/verify_content.cjs`：验证材料组合的基础采掘节奏、模块非攻速字段、普通氧气罐提示及结晶繁殖配方。首次调整时的模块快照位于本地 `.sdbf-backups/tetra-mining-2026-11-02/module-baseline.json`，该检查需要此快照。

输出位于被忽略的 `docs/archive/tetra-mining-2026-11-02/`。速度值使用原版公式和数据计算，不启动 Minecraft，也不包括附魔、磨砺、角色属性等额外因素。
