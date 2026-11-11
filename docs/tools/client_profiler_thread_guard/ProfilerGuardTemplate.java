import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;

/** Methods and fields copied into the installed Minecraft ActiveProfiler by ASM. */
final class ProfilerGuardTemplate {
    private static final Logger f_18369_ = null;
    private volatile Thread sdbf$profilerOwner;
    private static final AtomicBoolean sdbf$reportedForeignWriter = new AtomicBoolean();

    private boolean sdbf$isProfilerOwner() {
        Thread current = Thread.currentThread();
        Thread owner = sdbf$profilerOwner;
        if (owner == null) {
            // Reload profilers can be constructed before their worker starts using them.
            synchronized (this) {
                if (sdbf$profilerOwner == null) {
                    sdbf$profilerOwner = current;
                }
                owner = sdbf$profilerOwner;
            }
        }
        if (owner == current) {
            return true;
        }
        if (sdbf$reportedForeignWriter.compareAndSet(false, true)) {
            f_18369_.warn(
                "[SDBF profiler guard] Rejected cross-thread profiler write. Owner={}, caller={}",
                owner.getName(), current.getName(),
                new IllegalStateException("Cross-thread ActiveProfiler caller")
            );
        }
        return false;
    }
}
