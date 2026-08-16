MoreJSEvents.villagerTrades(event => {
    const profession = "nuclearcraft:nuclear_scientist";
    const levels = [1, 5];

    event.removeVanillaTrades([profession], levels);
    event.removeModdedTrades([profession], levels);
});