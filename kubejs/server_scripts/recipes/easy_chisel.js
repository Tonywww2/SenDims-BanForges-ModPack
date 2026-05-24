// priority: 50
ServerEvents.tags('item', event => {
    let groupIterator = $ChiselGroupLookup.getGroupNameIterator();
    while (groupIterator.hasNext()) {
        let groupName = String(groupIterator.next());
        let safeGroupName = groupName.toLowerCase().replace(/[^a-z0-9_.-]/gi, '_');
        let tagId = `kubejs:chisel_group_${safeGroupName}`;
        
        let items = $ChiselGroupLookup["getBlocksInGroup(java.lang.String)"](groupName);
        for (let item of items) {
            let itemId = Item.of(item).id;
            event.add(tagId, itemId);
        }
    }
});

ServerEvents.recipes(event => {
    // 复制配方：1个同tag物品 + 目标物品 = 2个目标物品
    let groupIterator = $ChiselGroupLookup.getGroupNameIterator();
    while (groupIterator.hasNext()) {
        let groupName = String(groupIterator.next());
        let safeGroupName = groupName.toLowerCase().replace(/[^a-z0-9_.-]/gi, '_');
        let tagId = `#kubejs:chisel_group_${safeGroupName}`;
        
        let items = $ChiselGroupLookup["getBlocksInGroup(java.lang.String)"](groupName);
        for (let item of items) {
            let itemId = Item.of(item).id;
            event.shapeless(`4x ${itemId}`, [Ingredient.of(tagId, 3), itemId]);
        }
    }
});