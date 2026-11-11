import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicReference;
import net.minecraft.server.level.ChunkHolder;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.chunk.ChunkAccess;

public final class AutoSaveFixture extends AutoSaveTemplate {
    private int saves;
    private boolean failSave;
    private static void require(boolean value, String message) {
        if (!value) throw new IllegalStateException(message);
        System.out.println("OK " + message);
    }
    @Override public void enqueueDirtyChunkPosForAutoSave(ChunkPos position) {
        synchronized (dirtyChunkPosForAutoSave) { dirtyChunkPosForAutoSave.putAndMoveToLast(position, System.currentTimeMillis()); }
    }
    @Override protected boolean m_198874_(ChunkHolder holder) {
        require(!Thread.holdsLock(dirtyChunkPosForAutoSave), "Save runs outside queue monitor");
        AtomicReference<Throwable> failure = new AtomicReference<>();
        Thread completion = new Thread(() -> {
            try { enqueueDirtyChunkPosForAutoSave(new ChunkPos(999)); }
            catch (Throwable error) { failure.set(error); }
        });
        completion.setDaemon(true);
        completion.start();
        try { completion.join(1000); } catch (InterruptedException error) { throw new RuntimeException(error); }
        require(!completion.isAlive() && failure.get() == null, "Worldgen callback can enqueue while save waits");
        if (failSave) throw new IllegalArgumentException("fixture save failure");
        saves++;
        return true;
    }
    private ChunkHolder add(long id, CompletableFuture<ChunkAccess> future) {
        ChunkPos position = new ChunkPos(id);
        ChunkHolder holder = new ChunkHolder(position, future);
        f_140129_.put(id, holder);
        dirtyChunkPosForAutoSave.put(position, 0);
        return holder;
    }
    public static void main(String[] arguments) {
        AutoSaveFixture test = new AutoSaveFixture();
        test.add(1, CompletableFuture.completedFuture(new ChunkAccess()));
        require(test.runOneChunkAutoSave() && test.saves == 1, "Completed chunk saved once");
        test.dirtyChunkPosForAutoSave.clear();
        CompletableFuture<ChunkAccess> pending = new CompletableFuture<>();
        ChunkHolder holder = test.add(2, pending);
        require(!test.runOneChunkAutoSave(), "Pending chunk deferred");
        pending.complete(new ChunkAccess());
        require(test.dirtyChunkPosForAutoSave.containsKey(holder.m_140092_()), "Completed pending chunk requeued");
        require(!test.runOneChunkAutoSave(), "Autosave delay preserved");
        test.dirtyChunkPosForAutoSave.clear();
        test.add(3, CompletableFuture.completedFuture(new ChunkAccess()));
        test.failSave = true;
        try { test.runOneChunkAutoSave(); throw new AssertionError("Missing save failure"); }
        catch (IllegalArgumentException expected) { require(!Thread.holdsLock(test.dirtyChunkPosForAutoSave), "Save exceptions preserve released monitor"); }
    }
}
