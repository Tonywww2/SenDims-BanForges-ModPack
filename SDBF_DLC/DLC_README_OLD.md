## 千界万锻扩展包规范-旧

注意：当前规范还在持续的完善中，可能随时会有结构性的修改。

### 1.1 扩展包文件结构

#### 1.1.1 标准扩展包结构
标准的DLC结构：

    new_dlc_1.0.0.zip* - 压缩包，建议使用扩展包ID+版本号
        \new_dlc* - 文件夹
            \config - 包含内容的文件夹1
            \kubejs - kubejs文件夹
                \contentpacks - KubeLoader内容包文件夹
                    \new_dlc_cp - 扩展包的内容包文件夹，用于存放kubejs脚本，要求以扩展包ID开头，建议以_contentpack或_cp结尾
                    	\server_scripts - 扩展包的内容包文件夹中的服务端脚本文件夹
            \mods - 包含内容的文件夹2
                new_mod1.jar - 扩展包新增的模组1
            \SDBF_DLC* - **扩展包信息文件夹**
                new_dlc.json* - **扩展包信息文件**，必须使用[扩展包ID]命名，请查阅2.1了解更多信息
                \DLC_icons - **扩展包图标文件夹**
                    new_dlc.png - 扩展包的图标，可选，必须使用[扩展包ID]命名，仅支持.png格式

注：以*结尾的项目为必选。

注：实例中的扩展包命名ID为`[new_dlc]`



#### 1.1.2 CurseForge导入包格式的扩展包结构
如果你不希望二次分发别人的模组/项目，你应该使用这种格式：

    new_dlc_1.0.0.zip* - 压缩包，建议使用扩展包ID+版本号
        \overrides* - overrides文件夹
        manifest.json - 导入包格式的清单文件，用于列出需要自动下载的项目，遵循CurseForge格式
            \config - 包含内容的文件夹1
            \kubejs - kubejs文件夹
                \contentpacks - KubeLoader内容包文件夹
                    \new_dlc_cp - 扩展包的内容包文件夹，用于存放kubejs脚本，要求以扩展包ID开头，建议以_contentpack或_cp结尾
                    	\server_scripts - 扩展包的内容包文件夹中的服务端脚本文件夹
            \mods - 包含内容的文件夹2
                new_mod1.jar - 扩展包新增的模组1
            \SDBF_DLC* - **扩展包信息文件夹**
                new_dlc.json* - **扩展包信息文件**，必须使用[扩展包ID]命名，请查阅2.1了解更多信息
                \DLC_icons - **扩展包图标文件夹**
                    new_dlc.png - 扩展包的图标，可选，必须使用[扩展包ID]命名，仅支持.png格式



### 1.2 玩家应该如何安装扩展包
#### 1.2.1 手动安装

1. 将扩展包（压缩包）解压，得到其中的`new_dlc`文件夹（假设`new_dlc`为扩展包ID）

2. 打开这个文件夹，确保其中是诸如`mods`、`config`等内容文件夹，而非`new_dlc`文件夹的嵌套。

3. 将`new_dlc`文件夹中的全部文件（`mods`、`config`等），复制到整合包的实例文件夹内

   例：

   1. Prism：`\PrismLauncher\instances\SDBF\minecraft\`
   2. PCL：`\PCL\.minecraft\versions\SDBF\`
   3. MultiMC：`MultiMC\instances\SDBF\.minecraft\`

4. 复制后，不应该出现"目标已存在重复文件"或相似的提示，否则**可能**代表正在安装的DLC可能与现有的环境有冲突



#### 1.2.2 扩展包安装器安装

TBD



### 2.1 扩展包信息文件
**扩展包信息文件**是整个扩展包的身份文件，必须命名为 `[扩展包ID].json` 并存放于 SDBF_DLC 文件夹内。
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
假设扩展包ID为new_dlc，那么扩展包信息文件的路径应为：`new_dlc/SDBF_DLC/new_dlc.json`或`overrides/SDBF_DLC/new_dlc.json`

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
    "kubejs/contentpacks/new_dlc_cp/*",
    "mods/new_mod1.jar",
    "SDBF_DLC/new_dlc.json",
    "SDBF_DLC/DLC_icons/new_dlc.png"
  ]
}
```

注意：`"kubejs/contentpacks/new_dlc_cp/*"`将会标记`new_dlc_cp`文件夹以及其内部的子文件夹。

#### 2.1.3 图标

你可以为你的扩展包设置自定义图标。

只需要将一张`.png`格式的图片放置于`SDBF_DLC/DLC_icons/`文件夹内，并重命名为`new_dlc.png`。



### 2.2 通过扩展包添加模组

只建议添加必须添加的模组。

请将这些模组放置于对应格式的`\mods\`文件夹内，或者在导入包格式中使用`manifest.json`来标注需要下载的模组/项目



### 2.3 通过扩展包添加Kubejs脚本

#### 2.3.0 KubeLoader

使用KubeLoader整合扩展包中Kubejs相关内容，可以减少最终打包时的工作量。

https://github.com/WhiseNT/kubeloader/wiki



#### 2.3.1 全新脚本
如果你使用了KubeLoader的格式，则对于全新脚本的命名和格式没有特定要求。但仍然建议遵守一定的规范，以便自身或他人能更轻松的理解脚本中的内容。



#### 2.3.2 修改/移除整合包本体的配方

你可以使用`SDBF.getRecipeHelper()`来使用修改由KubeJS添加的配方的函数。

```java
.addRemovedIdStr(String id); // 向黑名单中添加一个配方 ID
.removeIdStr(String id); // 从黑名单中移除一个配方 ID
.clearAll(); // 清除全部黑名单（不建议使用）
.isRemoved(ResourceLocation id); // 检查一个 ID 是否在移除列表中 
.getRemovedIds(); // 获取黑名单（Set，副本）
```

假如你想移除一个本体的配方：`sdbf:deeprealm_certificate_s1`（深境证章的合成配方）

```javascript
ServerEvents.recipes(event => {
    let rh = SDBF.getRecipeHelper();
    rh.addRemovedIdStr("sdbf:deeprealm_certificate_s1");

})
```

如果你想修改修改这个配方，那么只需要在移除后使用不同的id添加这个配方即可：

```javascript
ServerEvents.recipes(event => {
    let rh = SDBF.getRecipeHelper();
    rh.addRemovedIdStr("sdbf:deeprealm_certificate_s1");
    
    event.shaped('slashblade_sendims:deeprealm_certificate', [
        'CBC',
        'BAB',
        'CBC'
    ], {
        A: "kubejs:bedrock_breaker",
        B: "minecraft:command_block",
        C: "minecraft:bedrock"
    }).id('new_dlc:deeprealm_certificate_new');

})
```



#### 2.3.3 修改整合包本体的其他脚本

推荐使用KubeLoader的KLM功能实现：https://github.com/WhiseNT/kubeloader/wiki/KLM



### 2.4 其他文件

TBD



### 3.1 其它信息

### 3.1.1 休谟指数

作为扩展包的作者，你可以向千界万锻开发团队提出**休谟指数测量**申请，开发团队会不定时的为提交了测量申请的扩展包测定**休谟指数**。

一个扩展包的**休谟指数**可能会随时修改。

**休谟指数**于本项目中的含义将不会被明确定义。

**休谟指数**与扩展包的制作质量、内容大小无关。



扩展包休谟指数表：TBD
