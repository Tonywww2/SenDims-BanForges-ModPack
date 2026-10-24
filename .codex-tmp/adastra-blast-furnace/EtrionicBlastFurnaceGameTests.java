package com.tonywww.slashblade_sendims.gametest;

import earth.terrarium.adastra.common.blockentities.machines.EtrionicBlastFurnaceBlockEntity;
import earth.terrarium.adastra.common.registry.ModBlocks;
import net.minecraft.core.BlockPos;
import net.minecraft.gametest.framework.GameTest;
import net.minecraft.gametest.framework.GameTestHelper;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.item.crafting.BlastingRecipe;
import net.minecraft.world.item.crafting.RecipeType;
import net.minecraftforge.gametest.GameTestHolder;
import net.minecraftforge.gametest.PrefixGameTestTemplate;

/** Exercises the actual Ad Astra machine with the production Mixin applied by Forge. */
@GameTestHolder("sendims_blasting_test")
@PrefixGameTestTemplate(false)
public final class EtrionicBlastFurnaceGameTests {
    private static final Item[] INPUTS = {Items.RAW_IRON, Items.RAW_IRON, Items.RAW_GOLD, Items.RAW_GOLD};

    private static final class Furnace extends EtrionicBlastFurnaceBlockEntity {
        Furnace(GameTestHelper helper) {
            super(BlockPos.ZERO, ModBlocks.ETRIONIC_BLAST_FURNACE.get().defaultBlockState());
            setLevel(helper.getLevel());
            setMode(Mode.BLASTING);
            for (int i = 0; i < INPUTS.length; i++) items().set(i + 1, new ItemStack(INPUTS[i]));
            update();
        }

        void tickRecipe() {
            getEnergyStorage().insertEnergy(Long.MAX_VALUE, false);
            recipeTick(getEnergyStorage());
        }

        void finishBatch(GameTestHelper helper) {
            for (int tick = 0; tick < 1000 && outputCount(this) == 0; tick++) tickRecipe();
            helper.assertTrue(outputCount(this) > 0, "Valid replacement recipes must eventually finish");
        }

        void finishSlot(BlastingRecipe recipe, int slot) {
            craft(recipe, slot);
        }

        void setProgress(int value) {
            cookTime = value;
        }
    }

    private static int count(Furnace furnace, Item item) {
        int result = 0;
        for (int slot = 5; slot <= 8; slot++) {
            ItemStack stack = furnace.getItem(slot);
            if (stack.is(item)) result += stack.getCount();
        }
        return result;
    }

    private static int outputCount(Furnace furnace) {
        int result = 0;
        for (int slot = 5; slot <= 8; slot++) result += furnace.getItem(slot).getCount();
        return result;
    }

    private static BlastingRecipe ironRecipe(GameTestHelper helper) {
        return helper.getLevel().getRecipeManager().getAllRecipesFor(RecipeType.BLASTING).stream()
                .filter(recipe -> recipe.getIngredients().get(0).test(new ItemStack(Items.RAW_IRON)))
                .findFirst().orElseThrow();
    }

    @GameTest(template = "blast_furnace_test")
    public static void reportedAabbToBbbbSwapCannotProduceA(GameTestHelper helper) {
        Furnace furnace = new Furnace(helper);
        for (int tick = 0; tick < 10; tick++) furnace.tickRecipe();
        furnace.items().set(1, new ItemStack(Items.RAW_GOLD));
        furnace.items().set(2, new ItemStack(Items.RAW_GOLD));
        furnace.finishBatch(helper);
        helper.assertTrue(count(furnace, Items.IRON_INGOT) == 0 && count(furnace, Items.GOLD_INGOT) == 4,
                "aabb -> bbbb must produce 0 A + 4 B; got " + count(furnace, Items.IRON_INGOT)
                        + " A + " + count(furnace, Items.GOLD_INGOT) + " B");
        helper.succeed();
    }

    @GameTest(template = "blast_furnace_test")
    public static void replacementInputsRestartAndProduceOnlyMatchingResults(GameTestHelper helper) {
        // Every subset of slots, including the reported aabb -> bbbb (mask 3),
        // both early in the cycle and immediately before its completion tick.
        for (int mask = 1; mask < 16; mask++) {
            for (boolean atCompletion : new boolean[]{false, true}) {
                Furnace furnace = new Furnace(helper);
                int ticks = atCompletion ? furnace.cookTimeTotal() : 2;
                for (int tick = 0; tick < ticks; tick++) furnace.tickRecipe();
                helper.assertTrue(outputCount(furnace) == 0, "Fixture must still be processing");
                int expectedIron = 0;
                for (int index = 0; index < INPUTS.length; index++) {
                    Item input = INPUTS[index];
                    if ((mask & (1 << index)) != 0) {
                        input = input == Items.RAW_IRON ? Items.RAW_GOLD : Items.RAW_IRON;
                        // Direct mutation also covers automation that does not call setChanged().
                        furnace.items().set(index + 1, new ItemStack(input));
                    }
                    if (input == Items.RAW_IRON) expectedIron++;
                }
                furnace.tickRecipe();
                helper.assertTrue(outputCount(furnace) == 0 && furnace.cookTime() == 1,
                        "Replacing input must restart the shared timer, mask " + mask);
                furnace.finishBatch(helper);
                helper.assertTrue(count(furnace, Items.IRON_INGOT) == expectedIron
                                && count(furnace, Items.GOLD_INGOT) == 4 - expectedIron,
                        "Outputs must match the items actually consumed, mask " + mask);
                for (int slot = 1; slot <= 4; slot++) {
                    helper.assertTrue(furnace.getItem(slot).isEmpty(), "Exactly one item per slot consumed");
                }
            }
        }
        helper.succeed();
    }

    @GameTest(template = "blast_furnace_test")
    public static void emptyAndUnsmeltableReplacementCannotProduce(GameTestHelper helper) {
        for (int slot = 1; slot <= 4; slot++) {
            for (ItemStack replacement : new ItemStack[]{ItemStack.EMPTY, new ItemStack(Items.STICK)}) {
                Furnace furnace = new Furnace(helper);
                furnace.tickRecipe();
                furnace.items().set(slot, replacement.copy());
                furnace.finishBatch(helper);
                helper.assertTrue(count(furnace, Items.IRON_INGOT) == (slot <= 2 ? 1 : 2)
                                && count(furnace, Items.GOLD_INGOT) == (slot > 2 ? 1 : 2),
                        "Removed/invalid slot must not create its cached output");
                helper.assertTrue(ItemStack.matches(furnace.getItem(slot), replacement),
                        "Invalid replacement must not be consumed");
                for (int tick = 0; tick < 250; tick++) furnace.tickRecipe();
                helper.assertTrue(outputCount(furnace) == 3, "Empty inputs must never repeat output");
            }
        }
        helper.succeed();
    }

    @GameTest(template = "blast_furnace_test")
    public static void craftRechecksTheCurrentInput(GameTestHelper helper) {
        BlastingRecipe recipe = ironRecipe(helper);
        for (ItemStack replacement : new ItemStack[]{ItemStack.EMPTY,
                new ItemStack(Items.RAW_GOLD), new ItemStack(Items.STICK)}) {
            Furnace furnace = new Furnace(helper);
            furnace.items().set(1, replacement.copy());
            furnace.finishSlot(recipe, 1);
            helper.assertTrue(outputCount(furnace) == 0, "Stale recipe must be rejected at craft()");
            helper.assertTrue(ItemStack.matches(furnace.getItem(1), replacement),
                    "Rejected craft must leave replacement untouched");
        }
        Furnace valid = new Furnace(helper);
        valid.finishSlot(null, 1);
        helper.assertTrue(outputCount(valid) == 0 && valid.getItem(1).getCount() == 1, "Null recipe is a no-op");
        valid.finishSlot(recipe, 1);
        helper.assertTrue(count(valid, Items.IRON_INGOT) == 1 && valid.getItem(1).isEmpty(),
                "Matching craft must still consume and produce once");
        helper.succeed();
    }

    @GameTest(template = "blast_furnace_test")
    public static void unchangedAndRestockedInputsKeepProgress(GameTestHelper helper) {
        Furnace furnace = new Furnace(helper);
        for (int tick = 0; tick < 10; tick++) furnace.tickRecipe();
        furnace.items().set(1, new ItemStack(Items.RAW_IRON, 2));
        furnace.tickRecipe();
        helper.assertTrue(furnace.cookTime() == 11, "Restocking the same ingredient must not reset progress");
        furnace.finishBatch(helper);
        helper.assertTrue(count(furnace, Items.IRON_INGOT) == 2 && count(furnace, Items.GOLD_INGOT) == 2,
                "Normal mixed batch must retain its original results");
        helper.assertTrue(furnace.getItem(1).getCount() == 1, "Restocked surplus must remain");
        helper.succeed();
    }

    @GameTest(template = "blast_furnace_test")
    public static void blastingCacheValidationDoesNotRunInAlloyMode(GameTestHelper helper) {
        Furnace furnace = new Furnace(helper);
        furnace.setMode(EtrionicBlastFurnaceBlockEntity.Mode.ALLOYING);
        furnace.items().set(1, new ItemStack(Items.STICK));
        furnace.setProgress(37);
        furnace.tickRecipe();
        helper.assertTrue(furnace.cookTime() == 37 && outputCount(furnace) == 0,
                "Blasting cache repair must not reset alloying progress");
        helper.succeed();
    }
}
