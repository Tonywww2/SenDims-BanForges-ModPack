import cofh.lib.common.block.BlockIngredient;
import cofh.thermal.core.common.block.entity.device.DeviceTreeExtractorBlockEntity;
import cofh.thermal.core.util.managers.device.TreeExtractorManager;
import cofh.thermal.core.util.recipes.device.TreeExtractorMapping;
import it.unimi.dsi.fastutil.longs.*;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraftforge.fluids.FluidStack;
import java.util.*;

/** Build-time donor only. Its members are reobfuscated and embedded in the original class. */
public class TreeExtractorOptimized extends DeviceTreeExtractorBlockEntity {
    private long sdbf$lastCheck;
    private long sdbf$retryAfter;
    private boolean sdbf$pending;
    private boolean sdbf$force;
    private boolean sdbf$unloaded;

    public TreeExtractorOptimized(BlockPos pos, BlockState state) { super(pos, state); }

    private BlockState sdbf$readState(BlockPos pos) {
        if (level.isOutsideBuildHeight(pos)) return Blocks.AIR.defaultBlockState();
        if (!level.hasChunkAt(pos)) {
            sdbf$unloaded = true;
            return null;
        }
        return level.getBlockState(pos);
    }

    private void sdbf$clearTree() {
        logs = new BlockPos[0];
        leaves = new BlockPos[0];
        recipe = null;
        renderFluid = FluidStack.EMPTY;
    }

    private void sdbf$deferUnloaded() {
        sdbf$clearTree();
        sdbf$pending = true;
        sdbf$retryAfter = level.getGameTime() + 20;
    }

    @Override
    protected void updateValidity() {
        if (level == null || level.isClientSide) return;
        long now = level.getGameTime();
        if (!sdbf$force && cached && (now == sdbf$lastCheck || now < sdbf$retryAfter)) {
            sdbf$pending = true;
            return;
        }
        sdbf$lastCheck = now;
        sdbf$retryAfter = now;
        sdbf$pending = false;
        sdbf$unloaded = false;
        cached = true;
        if (!level.isAreaLoaded(worldPosition, 1)) { sdbf$deferUnloaded(); return; }
        if (isValid()) {
            BlockIngredient leaf = recipe.getLeaves(), trunk = recipe.getTrunk();
            boolean valid = true;
            for (BlockPos pos : leaves) {
                BlockState state = sdbf$readState(pos);
                if (state == null || !leaf.test(state)) { valid = false; break; }
            }
            if (valid) for (BlockPos pos : logs) {
                BlockState state = sdbf$readState(pos);
                if (state == null || !trunk.test(state)) { valid = false; break; }
            }
            if (valid) return;
            if (sdbf$unloaded) { sdbf$deferUnloaded(); return; }
        }
        for (Direction dir : getSearchOrder()) {
            TreeInfo info = detectTree(worldPosition.relative(dir));
            if (sdbf$unloaded) { sdbf$deferUnloaded(); return; }
            if (info != null) {
                leaves = info.leaves();
                logs = info.logs();
                recipe = info.recipe();
                renderFluid = recipe.getFluid();
                return;
            }
        }
        sdbf$clearTree();
    }

    @Override
    protected void updateActiveState() {
        if (!cached || sdbf$pending && level != null && level.getGameTime() != sdbf$lastCheck && level.getGameTime() >= sdbf$retryAfter) updateValidity();
        // The builder changes this super-call to DeviceBlockEntity.updateActiveState.
        super.updateActiveState();
    }

    private void sdbf$forceUpdateValidity() {
        sdbf$force = true;
        try { updateValidity(); } finally { sdbf$force = false; }
    }

    @Override
    protected int getTimeConstant() {
        if (level == null || !isValid()) return timeConstant;
        int count = 2;
        BlockPos base = logs[0];
        for (Direction direction : Direction.Plane.HORIZONTAL) {
            BlockState state = sdbf$readState(base.relative(direction));
            if (state == null) { sdbf$deferUnloaded(); return timeConstant; }
            if (isTreeExtractor(state)) ++count;
        }
        return count * timeConstant / 2;
    }

    @Override
    protected TreeInfo detectTree(BlockPos basePos) {
        BlockState base = sdbf$readState(basePos);
        if (base == null) return null;
        List<TreeExtractorMapping> matching = new ArrayList<>();
        Iterator<TreeExtractorMapping> iterator = TreeExtractorManager.instance().getRecipes().iterator();
        while (iterator.hasNext()) {
            TreeExtractorMapping entry = iterator.next();
            if (!entry.getTrunk().test(base)) continue;
            Block sapling = entry.getSapling();
            if (sapling == null || sapling.defaultBlockState().canSurvive(level, basePos)) matching.add(entry);
        }
        if (matching.isEmpty()) return null;
        TreeExtractorMapping[] candidates = matching.toArray(new TreeExtractorMapping[0]);
        TreeInfo result = detectTreeDirection(candidates, basePos, Direction.UP);
        return result == null && !sdbf$unloaded ? detectTreeDirection(candidates, basePos, Direction.DOWN) : result;
    }

    @Override
    protected TreeInfo detectTreeDirection(TreeExtractorMapping[] input, BlockPos base, Direction growth) {
        int min = level.getMinBuildHeight(), max = level.getMaxBuildHeight();
        List<BlockPos> trunks = new ArrayList<>();
        trunks.add(base.immutable());
        BlockPos.MutableBlockPos cursor = base.mutable();
        TreeExtractorMapping[] candidates = input.clone();
        TreeExtractorMapping[] scratch = new TreeExtractorMapping[input.length];
        int count = candidates.length;
        scan: while (cursor.getY() < max && cursor.getY() > min) {
            cursor.move(growth);
            // These offsets are cumulative in Thermal. Preserve their exact order.
            for (Vec3i offset : TRUNK_SEARCH) {
                cursor.move(offset);
                BlockState state = sdbf$readState(cursor);
                if (state == null) return null;
                int matches = 0;
                for (int i = 0; i < count; ++i) if (candidates[i].getTrunk().test(state)) scratch[matches++] = candidates[i];
                if (matches > 0) {
                    trunks.add(cursor.immutable());
                    TreeExtractorMapping[] swap = candidates; candidates = scratch; scratch = swap;
                    count = matches;
                    continue scan;
                }
            }
            break;
        }
        int accepted = 0;
        for (int i = 0; i < count; ++i) if (trunks.size() >= candidates[i].getMinHeight()) candidates[accepted++] = candidates[i];
        count = accepted;
        if (count == 0) return null;

        // Match Reference2ReferenceArrayMap's identity de-duplication and insertion order.
        int unique = 0;
        for (int i = 0; i < count; ++i) {
            TreeExtractorMapping entry = candidates[i];
            boolean duplicate = false;
            for (int j = 0; j < unique; ++j) if (candidates[j] == entry) { duplicate = true; break; }
            if (!duplicate) candidates[unique++] = entry;
        }
        count = unique;
        LongArrayList[] leafLists = new LongArrayList[count];
        // A radius-six Manhattan ball has 377 positions, including the starting trunk.
        for (int i = 0; i < count; ++i) leafLists[i] = new LongArrayList(Math.min(candidates[i].getMaxLeaves(), 376));
        cursor = trunks.get(trunks.size() - 1).mutable();
        LongArrayFIFOQueue queue = new LongArrayFIFOQueue();
        queue.enqueue(cursor.asLong());
        LongOpenHashSet visited = new LongOpenHashSet(128);
        visited.add(queue.firstLong());
        int x = cursor.getX(), y = cursor.getY(), z = cursor.getZ();
        Direction[] directions = Direction.values();
        while (!queue.isEmpty()) {
            long pos = queue.dequeueLong();
            for (Direction dir : directions) {
                long adj = BlockPos.offset(pos, dir);
                if (distManhattan(adj, x, y, z) > LEAF_SEARCH_DIST || !visited.add(adj)) continue;
                BlockState state = sdbf$readState(cursor.set(adj));
                if (state == null) return null;
                boolean valid = false;
                for (int i = 0; i < count; ++i) {
                    TreeExtractorMapping entry = candidates[i];
                    if (entry.getLeaves().test(state)) {
                        LongArrayList blocks = leafLists[i];
                        blocks.add(adj);
                        valid = true;
                        if (blocks.size() >= entry.getMaxLeaves()) return new TreeInfo(entry, trunks, blocks);
                    } else if (entry.getTrunk().test(state)) valid = true;
                }
                if (valid) queue.enqueue(adj);
            }
        }
        int best = -1;
        for (int i = 0; i < count; ++i) if (leafLists[i].size() >= candidates[i].getMinLeaves() && (best < 0 || leafLists[i].size() > leafLists[best].size())) best = i;
        return best < 0 ? null : new TreeInfo(candidates[best], trunks, leafLists[best]);
    }
}
