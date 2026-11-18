import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.stream.JsonWriter;
import dev.architectury.platform.Platform;
import dev.ftb.mods.ftblibrary.FTBLibrary;
import dev.ftb.mods.ftblibrary.sidebar.SidebarButton;
import dev.ftb.mods.ftblibrary.sidebar.SidebarButtonGroup;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

/**
 * 替换 SidebarButtonManager.saveConfig() 的模板。PatchSidebarButtons 把本方法改名到目标类里，
 * 这里的 groups 字段与目标类同名同类型。不要在这里使用 lambda、内部类或字符串拼接。
 *
 * 原版每次资源重载都会用「当前已加载的按钮」重写整个 config/sidebar_buttons.json：
 * 某次重载里缺席的按钮（模组没加载、资源包没启用、加载出错的启动）会被删掉，下次以默认值回来；
 * 文件解析失败时也会直接用默认值覆盖；FileWriter 先清空再写，进程中断会留下空文件。
 * 新逻辑：在现有文件上合并，只更新当前存在的按钮；文件无法解析时不覆盖；内容没变不写；
 * 写入时先写临时文件再替换。
 */
public class SidebarSaveTemplate {
    private final List<SidebarButtonGroup> groups = new ArrayList<SidebarButtonGroup>();

    public void saveConfig() {
        Path path = Platform.getConfigFolder().resolve("sidebar_buttons.json");
        JsonObject root = new JsonObject();
        String existing = null;
        try {
            if (Files.isRegularFile(path)) {
                existing = new String(Files.readAllBytes(path), StandardCharsets.UTF_8);
                String text = existing;
                if (text.startsWith("﻿")) {
                    text = text.substring(1);
                }
                if (!text.isBlank()) {
                    JsonElement parsed = JsonParser.parseString(text);
                    if (!parsed.isJsonObject()) {
                        FTBLibrary.LOGGER.warn("{} is not a JSON object, leaving it unchanged", path);
                        return;
                    }
                    root = parsed.getAsJsonObject();
                }
            }
        } catch (Exception ex) {
            FTBLibrary.LOGGER.warn("Can't parse {}, leaving it unchanged: {}", path, ex.toString());
            return;
        }

        for (SidebarButtonGroup group : this.groups) {
            for (SidebarButton button : group.getButtons()) {
                String namespace = button.getId().m_135827_();
                JsonElement current = root.get(namespace);
                JsonObject values;
                if (current != null && current.isJsonObject()) {
                    values = current.getAsJsonObject();
                } else {
                    values = new JsonObject();
                    root.add(namespace, values);
                }
                values.addProperty(button.getId().m_135815_(), Boolean.valueOf(button.getConfig()));
                root.remove(button.getId().toString());
            }
        }

        Path temp = path.resolveSibling("sidebar_buttons.json.tmp");
        try {
            StringWriter out = new StringWriter();
            JsonWriter writer = new JsonWriter(out);
            writer.setIndent("\t");
            new GsonBuilder().disableHtmlEscaping().setPrettyPrinting().create().toJson(root, writer);
            writer.flush();
            String text = out.toString();
            if (text.equals(existing)) {
                return;
            }
            Files.write(temp, text.getBytes(StandardCharsets.UTF_8));
            try {
                Files.move(temp, path, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException ex) {
                Files.move(temp, path, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (Exception ex) {
            FTBLibrary.LOGGER.error("Failed to save {}", path, ex);
            try {
                Files.deleteIfExists(temp);
            } catch (Exception ignored) {
            }
        }
    }
}
