# PneumaticCraft Armor Initialization Hotfix

## Scope

- Minecraft: 1.20.1
- PneumaticCraft: Repressurized: `6.0.23+mc1.20.1`
- Original JAR SHA-256: `8D5117F18A3F80EB6670CFB04F0A42A103195972BFDF429D2181587958EC4C38`
- Patched class SHA-256: `C40AC4EC9DB28F84C20DBE204CBA30274BDD14BF83CFD01C4EEEBA4DEBA2343D`

## Problem

During initial resource loading, a client tick can call
`ClientArmorRegistry.getHandlersForSlot()` while
`registerArmorClientUpgradeHandlers()` is still populating its handler map.
Any upgrade that has not been registered yet appears to have no client handler
and crashes the render thread. Observed with `pneumaticcraft:coordinate_tracker`
(helmet) and `pneumaticcraft:jump_boost` (leggings).

## Patch

Hotai replaces:

`me/desht/pneumaticcraft/client/pneumatic_armor/ClientArmorRegistry.class`

Before initializing the immutable handler lists, the replacement checks that
every common handler of every armor slot already has a client handler.
`initHandlerLists()` validates all four slots, so checking only the requested
slot just moves the crash to another slot.

It returns an empty list only during the incomplete registration window. Once
registration is complete, the original initialization and lookup path runs
unchanged.

Hotai may convert the replacement `.class` into a `.badiff` file on first
launch and remove the `.class`; this is expected behavior.

## Maintenance

Remove and regenerate this patch before changing the PneumaticCraft version.
Do not apply it to a JAR with a different SHA-256.

When replacing the patch, delete any existing `.badiff` next to it first.
Leaving both files makes Hotai transform the same class twice.