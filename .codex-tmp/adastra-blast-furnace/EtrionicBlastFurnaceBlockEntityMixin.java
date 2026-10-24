package com.tonywww.slashblade_sendims.mixin.adastra;

import earth.terrarium.adastra.common.blockentities.machines.EtrionicBlastFurnaceBlockEntity;
import earth.terrarium.botarium.common.energy.impl.WrappedBlockEnergyContainer;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.crafting.BlastingRecipe;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(EtrionicBlastFurnaceBlockEntity.class)
public abstract class EtrionicBlastFurnaceBlockEntityMixin {

    @Shadow(remap = false)
    @Final
    private BlastingRecipe[] recipes;

    @Inject(method = "recipeTick", at = @At("HEAD"), remap = false)
    private void sbs$refreshChangedBlastingInputs(WrappedBlockEnergyContainer energy, CallbackInfo ci) {
        EtrionicBlastFurnaceBlockEntity entity = (EtrionicBlastFurnaceBlockEntity) (Object) this;
        if (entity.mode() != EtrionicBlastFurnaceBlockEntity.Mode.BLASTING) {
            return;
        }
        for (int index = 0; index < recipes.length; index++) {
            if (recipes[index] != null && !sbs$matchesInput(recipes[index], entity.getItem(index + 1))) {
                // All four slots share one timer. Invalidate the whole batch before
                // rebuilding it, otherwise a stale recipe can consume a replacement item.
                for (int recipeIndex = 0; recipeIndex < recipes.length; recipeIndex++) {
                    entity.clearRecipe(recipeIndex);
                }
                entity.update();
                return;
            }
        }
    }

    @Inject(method = "craft", at = @At("HEAD"), cancellable = true, remap = false)
    private void sbs$validateBlastingInput(BlastingRecipe recipe, int slot, CallbackInfo ci) {
        EtrionicBlastFurnaceBlockEntity entity = (EtrionicBlastFurnaceBlockEntity) (Object) this;
        // Upstream craft() trusts its cached recipe even when canCraft() returned false.
        // Validate at the mutation boundary as well, including empty and non-recipe inputs.
        if (recipe != null && !sbs$matchesInput(recipe, entity.getItem(slot))) {
            ci.cancel();
        }
    }

    @Unique
    private static boolean sbs$matchesInput(BlastingRecipe recipe, ItemStack input) {
        return !input.isEmpty() && recipe.getIngredients().get(0).test(input);
    }
}
