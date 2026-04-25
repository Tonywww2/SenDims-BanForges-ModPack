NativeEvents.onEvent($ModularItemDamageEvent, event => {
    let stack = event.getItemStack();
    if (stack.getItem() instanceof $ModularArmorItem) {
        event.setAmount(1);
    }

})