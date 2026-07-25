本整合包的扩展包系统已替换为*DLC管理器*。

### 1.1 通过扩展包添加Kubejs脚本

#### 1.1.0 KubeLoader

使用KubeLoader整合扩展包中Kubejs相关内容，可以减少最终打包时的工作量。

https://github.com/WhiseNT/kubeloader/wiki



#### 1.1.1 全新脚本
如果你使用了KubeLoader的格式，则对于全新脚本的命名和格式没有特定要求。但仍然建议遵守一定的规范，以便自身或他人能更轻松的理解脚本中的内容。



#### 1.1.2 修改/移除整合包本体的配方

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



#### 1.1.3 修改整合包本体的其他脚本

推荐使用KubeLoader的KLM功能实现：https://github.com/WhiseNT/kubeloader/wiki/KLM



### 1.2 其他文件

TBD



### 2.1 其它信息

### 2.1.1 休谟指数

作为扩展包的作者，你可以向千界万锻开发团队提出**休谟指数测量**申请，开发团队会不定时的为提交了测量申请的扩展包测定**休谟指数**。

一个扩展包的**休谟指数**可能会随时修改。

**休谟指数**于本项目中的含义将不会被明确定义。

**休谟指数**与扩展包的制作质量、内容大小无关。



扩展包休谟指数表：TBD
