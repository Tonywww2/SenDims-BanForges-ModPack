// NativeEvents.onEvent($ItemStackedOnOtherEvent, event => {
//     let action = event.getClickAction();
//     if (action != "SECONDARY") return false;
    
//     let me = event.getStackedOnItem();
//     if (me != "slashblade:proudsoul") return;

//     let other = event.getCarriedItem();
//     if (!(other.item instanceof $ItemSlashBlade)) {
//         event.setCanceled(false);
//         return;
//     }

//     let state = $SDUtils.getState(other);

//     if (!state) return;

//     state.setProudSoulCount(state.getProudSoulCount() + 400);

//     me.shrink(1);

//     event.getPlayer().addItemCooldown(me, 5);

//     event.getSlot().setChanged();

//     event.setCanceled(true);


// })