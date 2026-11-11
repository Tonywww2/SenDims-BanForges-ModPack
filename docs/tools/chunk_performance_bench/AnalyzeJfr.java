import com.google.gson.GsonBuilder;
import jdk.jfr.consumer.RecordedEvent;
import jdk.jfr.consumer.RecordedFrame;
import jdk.jfr.consumer.RecordedStackTrace;
import jdk.jfr.consumer.RecordedThread;
import jdk.jfr.consumer.RecordingFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

class AnalyzeJfr {
    private static void increment(Map<String, Long> counts, String key) {
        counts.merge(key, 1L, Long::sum);
    }

    private static List<Map<String, Object>> top(Map<String, Long> counts, int limit) {
        return counts.entrySet().stream().sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit).map(entry -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("name", entry.getKey());
                    row.put("samples", entry.getValue());
                    return row;
                }).toList();
    }

    private static String category(List<String> frames) {
        String stack = String.join("\n", frames);
        if (stack.contains(".structure.") || stack.contains("JigsawPlacement")) return "structures";
        if (stack.contains(".levelgen.feature.") || stack.contains(".worldgen.feature.")) return "features";
        if (stack.contains("SurfaceRules") || stack.contains("SurfaceSystem")) return "surface";
        if (stack.contains(".levelgen.carver.")) return "carvers";
        if (stack.contains("com.terraforged.engine.")
                || stack.contains("com.terraforged.mod.worldgen.noise.")
                || stack.contains("com.pandaismyname1.ultraterraforged.world.worldgen.")) return "custom_terrain";
        if (stack.contains("DensityFunctions") || stack.contains("NoiseChunk")
                || stack.contains("NormalNoise") || stack.contains("PerlinNoise")) return "noise";
        if (stack.contains("Climate$") || stack.contains(".terrablender.")
                || stack.contains("BiomeSource")) return "biomes";
        if (stack.contains(".starlight.") || stack.contains(".lighting.")) return "lighting";
        if (stack.contains("PalettedContainer") || stack.contains("SimpleBitStorage")
                || stack.contains("LevelChunkSection")) return "block_storage";
        if (stack.contains("ChunkSerializer") || stack.contains("RegionFile")
                || stack.contains(".nbt.")) return "io_nbt";
        if (stack.contains(".latvian.mods.rhino.")) return "rhino_other";
        if (stack.contains("ForkJoinPool") || stack.contains("CompletableFuture")
                || stack.contains("PriorityConsecutiveExecutor")) return "scheduling_other";
        return "other";
    }

    public static void main(String[] args) throws Exception {
        Path input = Path.of(args[0]);
        Map<String, Long> eventCounts = new HashMap<>();
        Map<String, List<Double>> stages = new HashMap<>();
        Map<String, Long> threads = new HashMap<>();
        Map<String, Long> methods = new HashMap<>();
        Map<String, Long> leaves = new HashMap<>();
        Map<String, Long> categories = new HashMap<>();
        Map<String, Long> stacks = new HashMap<>();
        List<Map<String, Object>> slowStages = new ArrayList<>();
        List<Double> tickTimes = new ArrayList<>();
        List<Map<String, Object>> tickTimeline = new ArrayList<>();
        Instant firstEvent = null;
        Instant lastEvent = null;
        long sampledAllocationBytes = 0;
        long peakHeapSummaryBytes = 0;
        double pauseMs = 0;
        long selectedSamples = 0;
        try (RecordingFile recording = new RecordingFile(input)) {
            while (recording.hasMoreEvents()) {
                RecordedEvent event = recording.readEvent();
                if (firstEvent == null || event.getStartTime().isBefore(firstEvent)) firstEvent = event.getStartTime();
                if (lastEvent == null || event.getEndTime().isAfter(lastEvent)) lastEvent = event.getEndTime();
                String type = event.getEventType().getName();
                increment(eventCounts, type);
                if (type.equals("minecraft.ChunkGeneration")) {
                    String level = event.getString("level");
                    String status = event.getString("status");
                    if (level.contains("minecraft:overworld")) {
                        double milliseconds = event.getDuration().toNanos() / 1_000_000.0;
                        stages.computeIfAbsent(status, ignored -> new ArrayList<>())
                                .add(milliseconds);
                        if (milliseconds >= 250) {
                            Map<String, Object> slow = new LinkedHashMap<>();
                            slow.put("stage", status);
                            slow.put("x", event.getInt("chunkPosX"));
                            slow.put("z", event.getInt("chunkPosZ"));
                            slow.put("duration_ms", milliseconds);
                            slow.put("start", event.getStartTime().toString());
                            slowStages.add(slow);
                        }
                    }
                } else if (type.equals("jdk.GCPhasePause")) {
                    pauseMs += event.getDuration().toNanos() / 1_000_000.0;
                } else if (type.equals("minecraft.ServerTickTime")) {
                    double value = event.getLong("averageTickDuration") / 1_000_000.0;
                    tickTimes.add(value);
                    tickTimeline.add(Map.of("epoch_ms", event.getStartTime().toEpochMilli(), "average_ms", value));
                } else if (type.equals("jdk.ObjectAllocationSample")) {
                    sampledAllocationBytes += event.getLong("weight");
                } else if (type.equals("jdk.GCHeapSummary")) {
                    peakHeapSummaryBytes = Math.max(peakHeapSummaryBytes, event.getLong("heapUsed"));
                } else if (type.equals("jdk.ExecutionSample")) {
                    RecordedThread thread = event.getThread("sampledThread");
                    String name = thread.getJavaName();
                    increment(threads, name);
                    if (!(name.equals("Server thread") || name.startsWith("Worker-Main-")
                            || name.startsWith("UTF-WorldGen-") || name.startsWith("C2ME ")
                            || name.startsWith("c2me-") || name.startsWith("IO-Worker-")
                            || name.startsWith("ForkJoinPool.commonPool-worker-"))) continue;
                    RecordedStackTrace trace = event.getStackTrace();
                    if (trace == null || trace.getFrames().isEmpty()) continue;
                    List<String> frames = new ArrayList<>();
                    for (RecordedFrame frame : trace.getFrames()) {
                        frames.add(frame.getMethod().getType().getName() + "." + frame.getMethod().getName());
                    }
                    selectedSamples++;
                    increment(leaves, frames.get(0));
                    for (String frame : new HashSet<>(frames)) increment(methods, frame);
                    increment(categories, category(frames));
                    increment(stacks, String.join("\n", frames));
                }
            }
        }
        Map<String, Object> stageSummary = new LinkedHashMap<>();
        for (var entry : stages.entrySet()) {
            List<Double> times = entry.getValue();
            Collections.sort(times);
            Map<String, Object> statistics = new LinkedHashMap<>();
            statistics.put("count", times.size());
            statistics.put("cumulative_ms", times.stream().mapToDouble(Double::doubleValue).sum());
            statistics.put("median_ms", times.get(times.size() / 2));
            statistics.put("p95_ms", times.get((int) Math.ceil(times.size() * .95) - 1));
            statistics.put("p99_ms", times.get((int) Math.ceil(times.size() * .99) - 1));
            statistics.put("max_ms", times.get(times.size() - 1));
            stageSummary.put(entry.getKey(), statistics);
        }
        Map<String, Object> output = new LinkedHashMap<>();
        output.put("input", input.toString());
        output.put("events", eventCounts);
        output.put("gc_pause_ms", pauseMs);
        double seconds = firstEvent == null ? 0 : Duration.between(firstEvent, lastEvent).toNanos() / 1_000_000_000.0;
        output.put("recorded_seconds", seconds);
        output.put("sample_weight_allocated_bytes", sampledAllocationBytes);
        output.put("estimated_allocation_bytes_per_second", seconds > 0 ? sampledAllocationBytes / seconds : 0);
        output.put("peak_gc_heap_summary_bytes", peakHeapSummaryBytes);
        output.put("tick_timeline", tickTimeline);
        Collections.sort(tickTimes);
        if (!tickTimes.isEmpty()) {
            Map<String, Object> ticks = new LinkedHashMap<>();
            ticks.put("count", tickTimes.size());
            ticks.put("mean_ms", tickTimes.stream().mapToDouble(Double::doubleValue).average().orElse(0));
            ticks.put("p95_ms", tickTimes.get((int) Math.ceil(tickTimes.size() * .95) - 1));
            ticks.put("max_ms", tickTimes.get(tickTimes.size() - 1));
            output.put("one_second_average_tick_times", ticks);
        }
        output.put("stages", stageSummary);
        output.put("slow_chunk_stages", slowStages);
        output.put("execution_threads", top(threads, 40));
        output.put("selected_execution_samples", selectedSamples);
        output.put("categories", categories);
        output.put("inclusive_methods", top(methods, 70));
        output.put("self_methods", top(leaves, 60));
        output.put("representative_stacks", top(stacks, 12));
        Path destination = input.resolveSibling("jfr-summary.json");
        Files.writeString(destination, new GsonBuilder().setPrettyPrinting().create().toJson(output));
        System.out.println(input.getFileName() + " selected samples=" + selectedSamples
                + " stages=" + stages.size() + " pauseMs=" + pauseMs);
    }
}
