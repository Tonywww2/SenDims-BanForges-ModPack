import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;

final class CollectorClockTemplate {
    private static long totalGcMillis() {
        long total = 0;
        for (GarbageCollectorMXBean collector : ManagementFactory.getGarbageCollectorMXBeans()) {
            String name = collector.getName();
            // ZGC cycle timers include concurrent work. Its separate pause beans measure stalls.
            if (name.startsWith("ZGC ") && name.endsWith("Cycles")) continue;
            long elapsed = collector.getCollectionTime();
            if (elapsed > 0) total += elapsed;
        }
        return total;
    }
}
