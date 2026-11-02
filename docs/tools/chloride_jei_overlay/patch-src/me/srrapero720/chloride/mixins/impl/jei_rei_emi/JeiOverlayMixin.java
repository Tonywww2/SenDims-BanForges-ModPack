package me.srrapero720.chloride.mixins.impl.jei_rei_emi;

import java.lang.reflect.Field;
import me.srrapero720.chloride.ChlorideConfig;
import mezz.jei.gui.filter.IFilterTextSource;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Pseudo;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * SDBF HotAI replacement for Chloride 1.8.1 on JEI 15.67+.
 *
 * <p>The original mixin shadowed {@code IngredientListOverlay.configButton} as {@code GuiIconToggleButton}; JEI
 * replaced that field with {@code IconButton}, so the mixin failed to apply and JEI could not start. JEI now has its
 * own "hide ingredients when not searching" check, so Chloride's {@code hideJREMI} option is applied there instead.
 * The search field is read reflectively: a future JEI layout change disables the option instead of breaking JEI.
 * The centered hint text ({@code hideJREMIHint}) is not drawn.</p>
 */
@Pseudo
@Mixin(targets = "mezz.jei.gui.overlay.IngredientListOverlayController", remap = false)
public class JeiOverlayMixin {
    @Unique
    private static Field chloride$filterTextSource;
    @Unique
    private static boolean chloride$filterTextUnavailable;

    @Inject(method = "isListHiddenWhenNotSearching()Z", at = @At("HEAD"), cancellable = true, require = 0, remap = false)
    private void chloride$hideWhenNotSearching(CallbackInfoReturnable<Boolean> cir) {
        if (!ChlorideConfig.ui.hideJREMI) return;
        String filterText = chloride$filterText(this);
        if (filterText != null && filterText.isBlank()) cir.setReturnValue(true);
    }

    @Unique
    private static String chloride$filterText(Object controller) {
        if (chloride$filterTextUnavailable) return null;
        try {
            Field field = chloride$filterTextSource;
            if (field == null) {
                field = controller.getClass().getDeclaredField("filterTextSource");
                field.setAccessible(true);
                chloride$filterTextSource = field;
            }
            Object source = field.get(controller);
            return source instanceof IFilterTextSource textSource ? textSource.getFilterText() : null;
        } catch (ReflectiveOperationException | RuntimeException e) {
            chloride$filterTextUnavailable = true;
            return null;
        }
    }
}
