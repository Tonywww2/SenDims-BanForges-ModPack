"""Forward a transform's approved short failure message without consuming input."""
from pathlib import Path

source = Path(r"C:/Users/Tony/Documents/EX/ForgeDev/DeepRealmTheForth/src/main/java/com/tonywww/deeprealm4th/menu/ForgingPadMenu.java")
text = source.read_text(encoding="utf-8")
old = '            if (!outcome.ok()) { progress.set(0, 0); return true; }'
new = '''            if (!outcome.ok()) {
                progress.set(0, 0);
                player.displayClientMessage(net.minecraft.network.chat.Component.literal(outcome.error()), true);
                return true;
            }'''
if text.count(old) != 1:
    raise RuntimeError("Expected the unchanged transform failure branch")
source.write_text(text.replace(old, new), encoding="utf-8", newline="\n")
print("Forging failures now report the transform reason and preserve all inputs.")
