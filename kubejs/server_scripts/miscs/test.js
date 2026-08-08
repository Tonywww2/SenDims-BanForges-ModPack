// KubeJS 6 暂不支持原生往 /kubejs 下动态挂载指令热重载。
// 最好的热重载调试方式是使用 PlayerEvents.chat 拦截消息：
// 这样每次 /kubejs reload server_scripts 之后直接生效，无需 /reload
PlayerEvents.chat(event => {
    // 使用特定前缀模拟指令，例如 "-checktag"
    if (event.message.trim() == '-checktag') {
        let player = event.player;
        if (!player) return;

        let targetTag = "ad_astra:can_survive_extreme_cold";
        
        // 生成TagKey
        let tagKey = $TagKey.create($Registries.ENTITY_TYPE, Utils.id(targetTag));
        
        // 从注册表获取对应的实体类型
        let entityType = Utils.getRegistry('entity_type').getValue('ad_astra:corrupted_lunarian');

        // 判断该实体类型是否拥有该 Tag
        let hasTag = entityType.is(tagKey);

        player.tell(`[Tag检测] 注册表标签 #${targetTag} 是否包含: ${hasTag}`);

        // 取消原本的聊天发送
        event.cancel();
    }
});
