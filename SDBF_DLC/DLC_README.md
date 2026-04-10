## 千界万锻DLC规范

### 1.1 DLC文件结构

一个规范的DLC应该为以下结构

new_dlc.zip - 必选 - 压缩包
    \new_dlc - 必选 - 文件夹
        \config - 包含内容的文件夹1
        \kubejs - kubejs文件夹
            \server_scripts - 服务端脚本文件夹
                \dlc - 统一的dlc文件夹
                    dlc_script_1.js - dlc新增的脚本1
                block_tags.js - 需要被覆盖的本体脚本，请查阅2.3.2了解更多信息
        \mods - 包含内容的文件夹2
            new_mod1.jar - dlc新增的模组1
        \SDBF_DLC - 必选 - dlc信息文件夹
            new_dlc_info.md - 必选 - dlc信息文件，请查阅2.1了解更多信息

描述描述描述描述描述描述

### 1.2 玩家应该如何安装DLC


### 1.2 DLC可以包含什么


### 2.1 DLC信息文件


### 2.2 通过DLC添加模组


### 2.3 通过DLC添加Kubejs脚本
#### 2.3.1 全新脚本

#### 2.3.2 修改现有的脚本


### 2.4 其他文件


