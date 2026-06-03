## 千界万锻扩展包规范

### 1.1 扩展包文件结构

#### 1.1.1 标准扩展包结构
标准的DLC结构：

    new_dlc.zip* - 压缩包，不强制使用扩展包ID
        \new_dlc* - 文件夹
            \config - 包含内容的文件夹1
            \kubejs - kubejs文件夹
                \server_scripts - 服务端脚本文件夹
                    \dlc - 统一的dlc文件夹
                        new_dlc_script_1.js - 扩展包新增的脚本1，命名必须以\[扩展包ID\]开头
                    block_tags.js - 需要被覆盖的本体脚本，请查阅2.3.2了解更多信息
            \mods - 包含内容的文件夹2
                new_mod1.jar - 扩展包新增的模组1
            \SDBF_DLC* - **扩展包信息文件夹**
                new_dlc.json* - **扩展包信息文件**，必须使用\[扩展包ID\]命名，请查阅2.1了解更多信息
                \DLC_icons - **扩展包图标文件夹**
                    new_dlc.png - 扩展包的图标，可选，必须使用\[扩展包ID\]命名，仅支持.png格式

注：以*结尾的项目为必选。

注：实例中的扩展包命名空间/DLCID为\[new_dlc\]

#### 1.1.2 CurseForge导入包格式的扩展包结构
如果你不希望二次分发别人的模组/项目，你应该使用这种格式：
TBD

### 1.2 玩家应该如何安装扩展包
TBD

### 1.3 扩展包可以包含什么
TBD

### 2.1 扩展包信息文件
**扩展包信息文件**是整个扩展包的身份证，必须命名为 \[扩展包ID\].json 并存放于 SDBF_DLC 文件夹内。
它负责向系统声明该扩展包的元数据、版本兼容性以及包含的具体文件。

#### 2.1.1 字段规范说明

信息文件是一个标准的 JSON 对象，包含以下核心键值：

    id (String, **必填**): 扩展包 的唯一命名空间/ID。必须与文件名保持一致（例如文件名为 new_dlc.json，则 ID 为 new_dlc）。仅支持小写字母、数字和下划线。

    name (String, **必填**): 扩展包 的展示名称（例如 "千界万锻：黄铜时代"、“黄铜时代扩展包”）。

    version (String, **必填**): 当前 扩展包 的版本号，建议遵循某种版本规范（例如 "1.0.0"、“26_06_03”）。

    base_modpack_version (String, **必填**): 制作/测试此 扩展包 时，所基于的 千界万锻 整合包本体版本号。用于向玩家提示潜在的版本兼容性问题。

    author (Array, **必填**): 制作此 扩展包 的作者名称或团队名称。

    description (String, **必填**): 关于该 扩展包 新增内容的简短介绍。

    links (Object, 可选): 相关的外部链接，如 homepage、source、 issues。

    dependencies (Array of Strings, 可选): 依赖列表。如果此 扩展包 必须在安装了其他某个 扩展包 的情况下才能运行，需在此处填写对方的 id。

    incompatibilities (Array of Strings, 可选): 不兼容列表。如果已知此 扩展包 与某些 扩展包 存在严重冲突，在此处填写对方的 id。

    files (Array of Strings, 必填): 文件清单。一个包含该 扩展包 所有注入到整合包中的文件的**相对路径**的数组。

        作用： 这是非常重要的部分。未来玩家想要卸载或更新 扩展包 时，系统可以直接读取这个数组，将对应的脚本、配置和模组精准删除，而不会误删其他文件。

        格式： 路径应以整合包的根目录（.minecraft 或实例目录）为起点计算，例如 "mods/new_mod1.jar"。

#### 2.1.2 JSON 文件示例
假设扩展包ID为new_dlc，那么DLC信息文件的路径应为：SDBF_DLC/new_dlc.json

```json
{
  "id": "new_dlc",
  "name": "千界万锻：扩展包",
  "version": "1.0.1",
  "base_modpack_version": "b_260603",
  "author": ["Steve"],
  "description": "为整合包添加了无尽交换，等价贪婪等内容。",
  "links": {
    "homepage": "https://github.com/YourName/NewDLC",
    "issues": "https://github.com/YourName/NewDLC/issues"
  },
  "dependencies": [
    "another_dlc"
  ],
  "incompatibilities": [
    "some_dlc"
  ],
  "files": [
    "config/avaritia.toml",
    "kubejs/server_scripts/dlc/new_dlc_script_1.js",
    "mods/new_mod1.jar",
    "SDBF_DLC/new_dlc.json",
    "SDBF_DLC/DLC_icons/new_dlc.png"
  ]
}
```


### 2.2 通过扩展包添加模组
TBD

### 2.3 通过扩展包添加Kubejs脚本
#### 2.3.1 全新脚本
TBD

#### 2.3.2 修改现有的脚本或本体的配方
TBD



### 2.4 其他文件


