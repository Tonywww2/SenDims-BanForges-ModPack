import com.tonywww.deeprealm4th.astral.data.GemPayload;
import java.util.List;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.IntTag;
import net.minecraft.nbt.ListTag;

/** Focused check against the actual Minecraft NBT classes and mod payload. */
public final class GemProcessingCheck {
    private static void require(boolean result, String name) {
        if (!result) throw new AssertionError(name);
    }
    public static void main(String[] args) {
        CompoundTag extensions = new CompoundTag();
        extensions.putInt("enhancement_uses", 1);
        var payload = new GemPayload("minecraft:quartz", "alpha",
                new GemPayload.Natural(100, 40, 20), List.of(),
                List.of(new GemPayload.Affix(GemPayload.Stat.SIZE, GemPayload.Operation.FLAT, 10)), extensions);
        extensions.putInt("enhancement_uses", 999);
        var encoded = payload.encode();
        var decoded = GemPayload.decode(encoded);
        require(decoded.ok() && decoded.value().affixes().isEmpty(), "zero affixes round-trip");
        require(decoded.value().effective(GemPayload.Stat.SIZE) == 110, "reinforcement retained");
        require(decoded.value().extensions().getInt("enhancement_uses") == 1, "counter copied");
        var missing = encoded.copy(); missing.remove("affixes");
        require(!GemPayload.decode(missing).ok(), "missing affixes rejected");
        missing = encoded.copy(); missing.remove("reinforcements");
        require(!GemPayload.decode(missing).ok(), "missing reinforcements rejected");
        ListTag wrong = new ListTag(); wrong.add(IntTag.valueOf(1));
        var invalid = encoded.copy(); invalid.put("affixes", wrong);
        require(!GemPayload.decode(invalid).ok(), "wrong list element type rejected");
        ListTag six = new ListTag();
        for (int i = 0; i < 6; i++) {
            CompoundTag affix = new CompoundTag();
            affix.putString("stat", "size"); affix.putString("operation", "flat"); affix.putDouble("value", 1);
            six.add(affix);
        }
        invalid = encoded.copy(); invalid.put("affixes", six);
        require(!GemPayload.decode(invalid).ok(), "six natural affixes rejected");
        System.out.println("PASS: actual GemPayload zero-affix decoding, immutable counters, reinforcement and malformed-list checks.");
    }
}
