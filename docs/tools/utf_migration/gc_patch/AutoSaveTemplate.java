import com.ishland.c2me.opts.scheduling.common.Config;
import it.unimi.dsi.fastutil.longs.Long2ObjectLinkedOpenHashMap;
import it.unimi.dsi.fastutil.objects.Object2LongLinkedOpenHashMap;
import net.minecraft.server.level.ChunkHolder;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.chunk.ChunkAccess;
import java.util.concurrent.CompletableFuture;

public abstract class AutoSaveTemplate {
    protected Long2ObjectLinkedOpenHashMap<ChunkHolder> f_140129_ = new Long2ObjectLinkedOpenHashMap<>();
    protected final Object2LongLinkedOpenHashMap<ChunkPos> dirtyChunkPosForAutoSave = new Object2LongLinkedOpenHashMap<>();
    protected abstract boolean m_198874_(ChunkHolder holder);
    public abstract void enqueueDirtyChunkPosForAutoSave(ChunkPos position);

    public boolean runOneChunkAutoSave() {
        while (true) {
            ChunkHolder holder = null;
            synchronized (dirtyChunkPosForAutoSave) {
                var iterator = dirtyChunkPosForAutoSave.object2LongEntrySet().fastIterator();
                while (iterator.hasNext()) {
                    var entry = iterator.next();
                    if (System.currentTimeMillis() - entry.getLongValue() < Config.autoSaveDelayMillis) break;
                    // Fastutil iterator entries can move during remove, so copy the key first.
                    ChunkPos position = entry.getKey();
                    iterator.remove();
                    if (position == null) continue;
                    holder = f_140129_.get(position.m_45588_());
                    if (holder != null) break;
                }
            }
            if (holder == null) return false;
            CompletableFuture<ChunkAccess> future = holder.m_140090_();
            if (future.isDone()) {
                // Saving may initialize modded block entities and synchronously request chunks.
                // World-generation completion callbacks must remain able to enqueue saves.
                m_198874_(holder);
                return true;
            }
            ChunkHolder pending = holder;
            future.handle((chunk, error) -> {
                enqueueDirtyChunkPosForAutoSave(pending.m_140092_());
                return null;
            });
        }
    }
}
