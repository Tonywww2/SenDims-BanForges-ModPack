"""Apply the two required GemPayload checks without replacing unrelated source."""
from pathlib import Path

source = Path(r"C:/Users/Tony/Documents/EX/ForgeDev/DeepRealmTheForth/src/main/java/com/tonywww/deeprealm4th/astral/data/GemPayload.java")
text = source.read_text(encoding="utf-8")
changes = {
    "if (this.affixes.isEmpty() || this.affixes.size() > 5)": "if (this.affixes.size() > 5)",
    '"A gem needs 1..5 natural affixes"': '"A gem needs 0..5 natural affixes"',
    '            List<Affix> affixes = decodeAffixes(data.getList("affixes", Tag.TAG_COMPOUND));': '''            if (!data.contains("affixes", Tag.TAG_LIST) || !data.contains("reinforcements", Tag.TAG_LIST))
                return DecodeResult.invalid("missing_gem_field");
            ListTag naturalAffixes = (ListTag) data.get("affixes");
            ListTag upgrades = (ListTag) data.get("reinforcements");
            if (!naturalAffixes.isEmpty() && naturalAffixes.getElementType() != Tag.TAG_COMPOUND
                    || !upgrades.isEmpty() && upgrades.getElementType() != Tag.TAG_COMPOUND)
                return DecodeResult.invalid("invalid_gem_affix_count");
            List<Affix> affixes = decodeAffixes(naturalAffixes);''',
    "if (affixes.isEmpty() || affixes.size() > 5)": "if (affixes.size() > 5)",
    'List<Affix> reinforcements = decodeAffixes(data.getList("reinforcements", Tag.TAG_COMPOUND));':
        "List<Affix> reinforcements = decodeAffixes(upgrades);",
}
for old, new in changes.items():
    if text.count(old) != 1:
        raise RuntimeError(f"Expected exactly one source occurrence: {old}")
    text = text.replace(old, new)
source.write_text(text, encoding="utf-8", newline="\n")
print("Updated GemPayload: accept zero affixes; reject missing or mistyped lists.")
