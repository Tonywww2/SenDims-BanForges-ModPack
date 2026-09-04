# Bumblezone Honey Crystal Fluid Interaction Mixin Plan

## Scope

- Minecraft: `1.20.1`
- The Bumblezone: `7.13.3+1.20.1-forge`
- Target JAR: `mods/the_bumblezone-7.13.3+1.20.1-forge.jar`
- Target JAR SHA-256: `52181CE3A1EB8AFA9C00FE47BA829F2450DF8385573E119DDCD106A7EB9445F3`
- KubeJS: `2001.6.5-build.26`
- Requested result: Bumblezone honey-like fluid blocks must not create
  `the_bumblezone:glistering_honey_crystal` when touching water or any other
  fluid.
- Do not modify the Bumblezone JAR. Build and install a separate Forge addon
  mod containing the Mixin.

## First Verification Gate

Before implementing the Mixin, reproduce the interaction in a disposable
world and inspect the generated block with F3 or `/data get block`.

- Continue with this plan if the generated block is
  `the_bumblezone:glistering_honey_crystal`.
- Stop and ask the user to decide the intended scope if the generated block is
  `the_bumblezone:sugar_infused_stone` or
  `the_bumblezone:sugar_infused_cobblestone`.
- Do not silently remove the sugar-infused stone/cobblestone interaction. In
  Bumblezone 7.13.3, correctly tagged vanilla water follows that separate
  branch rather than the glistering crystal branch.

This gate matters because the observed description and the 7.13.3 bytecode do
not completely agree about vanilla water.

## Verified Control Path

Both of these classes contain the same private method:

- `com.telepathicgrunt.the_bumblezone.fluids.HoneyFluidBlock`
- `com.telepathicgrunt.the_bumblezone.fluids.RoyalJellyFluidBlock`
- Method: `neighboringFluidInteractions(Level, BlockPos): boolean`

The method is called by `neighborChanged` and `onPlace`. A `true` return makes
the caller schedule the next honey-fluid tick. A `false` return means that the
interaction replaced a block and no fluid tick is scheduled by that caller.

The method performs these checks in this order:

1. A neighboring fluid in `FluidTags.WATER` sets the water-interaction flags.
2. A non-empty neighboring fluid outside `BzTags.HONEY_FLUID` enters the
   glistering-crystal branch.
3. That branch has exactly three reads of
   `BzBlocks.GLISTERING_HONEY_CRYSTAL`, followed by
   `Level#setBlock(BlockPos, BlockState, 3)` at the current or neighboring
   position.
4. The later water/lava branch instead uses `SUGAR_INFUSED_STONE`,
   `SUGAR_INFUSED_COBBLESTONE`, and compat-provided honey/lava result blocks.

`HoneyFluid` also references `GLISTERING_HONEY_CRYSTAL`, but only in
`shouldRenderSide`; it is a rendering visibility check and must not be mixed
into for this change.

## Why KubeJS Is Not Suitable

There is no clean implementation in the current KubeJS environment:

- The two Bumblezone block classes call `Level#setBlock` directly from a
  private Java method. This write does not expose a cancellable KubeJS event at
  the decision point.
- The generated KubeJS block-modification API does not provide a replacement
  for these custom `neighborChanged`/`onPlace` implementations or the private
  `neighboringFluidInteractions` method.
- A placement-event cleanup is too late and cannot reliably recover which
  fluid occupied the replaced position.
- Tag manipulation is not acceptable. Water is checked before the honey tag,
  so suppressing its branch would require corrupting the global
  `minecraft:water` semantics. Suppressing every other fluid would require
  declaring unrelated fluids to be platform honey, affecting Bumblezone and
  other mods globally.
- `kubejs/mixin_scripts` cannot modify JVM classes in this instance.

Do not add a polling server-tick script that scans loaded chunks for crystals.
It would be expensive, would also delete naturally generated crystals, and
still could not restore the displaced fluid correctly.

## Addon Project

Create a small, separate Forge 1.20.1 / Java 17 addon mod, for example
`sdbf_bumblezone_tweaks`. Keep its source project outside `mods/`; only copy
the built addon JAR into `mods/` for testing.

The project must:

- Use the instance's Forge 1.20.1 version and official mappings.
- Compile against Bumblezone 7.13.3 as a deobfuscated `compileOnly`/local mod
  dependency. Do not unpack or edit the Bumblezone JAR.
- Declare a mandatory dependency on `the_bumblezone`, constrained to the
  verified 7.13.3 line unless a newer version is re-audited.
- Register a required server/common Mixin config with Java 17 compatibility.
- Contain no client-only references; the interaction is server-authoritative.

Suggested Mixin config properties:

```json
{
  "required": true,
  "minVersion": "0.8",
  "package": "sdbf.bumblezone.mixin",
  "compatibilityLevel": "JAVA_17",
  "refmap": "sdbf_bumblezone_tweaks.refmap.json",
  "mixins": [
    "HoneyCrystalFormationMixin"
  ],
  "injectors": {
    "defaultRequire": 1
  }
}
```

Register this config through the ForgeGradle template's supported Mixin
configuration mechanism and verify its name appears in the built JAR metadata.

## Mixin Design

Use one string-targeted Mixin for both duplicate block implementations. Inject
immediately before every read of `BzBlocks.GLISTERING_HONEY_CRYSTAL` inside
`neighboringFluidInteractions` and return `true`.

```java
package sdbf.bumblezone.mixin;

import net.minecraft.core.BlockPos;
import net.minecraft.world.level.Level;
import org.objectweb.asm.Opcodes;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(
    targets = {
        "com.telepathicgrunt.the_bumblezone.fluids.HoneyFluidBlock",
        "com.telepathicgrunt.the_bumblezone.fluids.RoyalJellyFluidBlock"
    },
    remap = false
)
abstract class HoneyCrystalFormationMixin {
    @Inject(
        method = "neighboringFluidInteractions",
        at = @At(
            value = "FIELD",
            target = "Lcom/telepathicgrunt/the_bumblezone/modinit/BzBlocks;" +
                "GLISTERING_HONEY_CRYSTAL:" +
                "Lcom/telepathicgrunt/the_bumblezone/modinit/registry/RegistryEntry;",
            opcode = Opcodes.GETSTATIC
        ),
        cancellable = true,
        require = 3,
        expect = 3,
        allow = 3,
        remap = false
    )
    private void sdbf$skipGlisteringCrystalFormation(
        Level level,
        BlockPos pos,
        CallbackInfoReturnable<Boolean> callback
    ) {
        callback.setReturnValue(true);
    }
}
```

Treat this as the intended injection shape, then compile it against the chosen
ForgeGradle/Mixin toolchain. If the annotation processor rejects a multi-target
Mixin, split it into two identical Mixin classes rather than changing the
injection semantics.

The handler must return `true`, not `false`:

- `true` suppresses the pending crystal access and lets the caller schedule a
  normal honey-fluid tick.
- Returning `false` reproduces the original "a block was replaced" control
  flow without actually replacing it and may leave the fluid stalled.

Do not inject at method `HEAD`; that would also disable the separate
water/lava sugar-infused block behavior. Do not redirect every
`Level#setBlock` call; a future version could add unrelated writes to the same
method, and the original return control flow would still be wrong.

`require = 3`, `expect = 3`, and `allow = 3` are intentional compatibility
guards. Each target method has exactly three crystal field reads in the
verified JAR. A changed Bumblezone implementation should fail loudly rather
than partially restoring crystal generation.

## Build-Time Checks

1. Run the normal Gradle build and tests.
2. Inspect the built JAR and confirm it contains the Mixin class, Mixin JSON,
   refmap, `mods.toml`, and the Mixin registration metadata.
3. Start a development run or the real instance and confirm there are no
   target, refmap, injection-count, or classloading errors.
4. Confirm the log reports successful application to both
   `HoneyFluidBlock` and `RoyalJellyFluidBlock`.

Do not weaken `required` or the injection counts merely to make startup pass.
If they fail, re-audit the target bytecode.

## In-Game Acceptance Matrix

Acceptance requires launching the full client and entering a disposable world.
Reaching only the main menu, running only a data generator, or running only a
server is not sufficient.

Test both `the_bumblezone:honey_fluid_block` and
`the_bumblezone:royal_jelly_fluid_block` against:

- A vanilla water source and flowing water.
- A vanilla lava source and flowing lava.
- A placeable third-party fluid such as `thermal:resin`.
- At least one additional non-water modded fluid from the instance.

For every pair, test both placement orders and contact from the side, above,
and below. Wait several fluid ticks after contact.

Required results:

- No contact case creates `the_bumblezone:glistering_honey_crystal`.
- Honey and royal jelly continue to schedule ticks and flow instead of
  freezing at the contact boundary.
- The game emits no repeated neighbor-update errors or stack overflow.
- Naturally generated/pre-placed glistering honey crystals remain untouched.
- Under the selective scope of this plan, vanilla water/lava may still produce
  the existing sugar-infused or compat result blocks. If the user requests
  removal of those results too, that is a separate behavior change and needs a
  newly approved injection scope.

After testing, inspect `logs/latest.log` and `logs/debug.log` for Mixin errors
and exceptions even if the visible behavior looks correct.

## Maintenance

Re-audit this plan whenever Bumblezone changes version or the target JAR hash
differs. At minimum, verify:

- Both target classes still own `neighboringFluidInteractions(Level, BlockPos)`.
- The method still has exactly three `GETSTATIC` reads of
  `BzBlocks.GLISTERING_HONEY_CRYSTAL` per class.
- Returning `true` still causes both callers to schedule a normal fluid tick.
- Water/lava result logic still occurs after the intercepted crystal branch.

Never patch or replace classes inside the Bumblezone JAR itself.