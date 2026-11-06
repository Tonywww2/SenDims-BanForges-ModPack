import cofh.core.util.helpers.FluidHelper;
import cofh.thermal.lib.util.recipes.internal.IMachineRecipe;
import net.minecraft.resources.ResourceLocation;
import net.minecraftforge.fluids.FluidStack;
import net.minecraftforge.registries.ForgeRegistries;
import java.util.function.Predicate;

/** These methods are embedded into the existing Thermal machine class, not shipped separately. */
public final class InsolatorHydrogenSupport {
    private static boolean sdbf$isHydrogen(FluidStack stack) {
        if (stack.isEmpty()) return false;
        var tags = ForgeRegistries.FLUIDS.tags();
        return tags != null && tags.getTag(tags.createTagKey(new ResourceLocation("forge", "hydrogen"))).contains(stack.getFluid());
    }

    public static Predicate<FluidStack> sdbf$allowedFluid() {
        return FluidHelper.IS_WATER.or(InsolatorHydrogenSupport::sdbf$isHydrogen);
    }

    public static boolean sdbf$fluidMatches(IMachineRecipe recipe, FluidStack actual) {
        if (recipe == null) return false;
        var inputs = recipe.getInputFluids();
        if (inputs.isEmpty()) return true;
        FluidStack required = inputs.get(0);
        if (required.isEmpty()) return true;
        if (FluidHelper.IS_WATER.test(required)) return FluidHelper.IS_WATER.test(actual);
        // The single-item recipe manager expands tags into concrete fluids and indexes only the item.
        // Match the entire hydrogen tag here, not just whichever concrete fluid was indexed last.
        if (sdbf$isHydrogen(required)) return sdbf$isHydrogen(actual);
        return required.isFluidEqual(actual);
    }
}
