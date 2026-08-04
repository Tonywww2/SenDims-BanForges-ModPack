# PneumaticCraft Armor Initialization Hotfix

## Scope

- Minecraft: 1.20.1
- PneumaticCraft: Repressurized: `6.0.23+mc1.20.1`
- Original JAR SHA-256: `8D5117F18A3F80EB6670CFB04F0A42A103195972BFDF429D2181587958EC4C38`
- Patched class SHA-256: `DFC173319D1F50A68EFCA27B10DA1E376C513793B0355174268DF0F098B62A4B`

## Problem

During initial resource loading, a client tick can call
`ClientArmorRegistry.getHandlersForSlot()` while
`registerArmorClientUpgradeHandlers()` is still populating its handler map.
This can make `pneumaticcraft:coordinate_tracker` appear to have no client
handler and crash the render thread.

## Patch

Hotai replaces:

`me/desht/pneumaticcraft/client/pneumatic_armor/ClientArmorRegistry.class`

Before initializing the immutable handler lists, the replacement checks that
every common handler for the requested armor slot already has a client handler.
It returns an empty list only during the incomplete registration window. Once
registration is complete, the original initialization and lookup path runs
unchanged.

Hotai may convert the replacement `.class` into a `.badiff` file on first
launch and remove the `.class`; this is expected behavior.

## Maintenance

Remove and regenerate this patch before changing the PneumaticCraft version.
Do not apply it to a JAR with a different SHA-256.