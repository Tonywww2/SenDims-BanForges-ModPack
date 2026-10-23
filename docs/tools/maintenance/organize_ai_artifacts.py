"""Archive development artifacts, preserving runtime files and checking every move.

Run with --apply from any directory. Without it, only print the relocation plan.
The dated manifest records provenance; archived cache snapshots keep their bytes.
"""
from __future__ import annotations

import argparse
from hashlib import sha256
import json
import os
from pathlib import Path
import re
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[3]
CACHE_DIRS = (
    "astral_gem_investigation", "astral_gems", "capacitor-migration",
    "culling-crash-2026-10-16", "deep-realm-certificate-crash", "mahjong-research",
    "oil-integrate-recipe", "omni-alloy-script-migration", "omni_alloy",
    "tetra-auxiliary-update", "tetra-material-design", "tetra-materials-implementation",
    "world-load-hang",
)
PREFIXES = {
    "kubejs/docs": "docs/kubejs",
    "kubejs/tools": "docs/tools",
    "dev_docs/assets": "docs/development/assets",
    **{f".cache/{name}": f"docs/archive/cache/{name}" for name in CACHE_DIRS},
    ".codex-tmp": "docs/archive/tmp",
}
for path in (ROOT / "dev_docs").glob("*.md"):
    PREFIXES[path.relative_to(ROOT).as_posix()] = "docs/development/" + path.name
for name in ("clear_block_entities.py", "ftbquest.py", "gem.py", "test.js", "test2.js"):
    PREFIXES["dev_docs/" + name] = "docs/tools/legacy/" + name
for name in ("halve_gif_frames.py", "replace_nbt_blocks.py"):
    PREFIXES[name] = "docs/tools/" + name
PREFIXES["checkerboard.png"] = "docs/assets/checkerboard.png"
TEXT_SUFFIXES = {".py", ".js", ".cjs", ".mjs", ".md", ".txt", ".json", ".mmd", ".html", ".gradle", ".java"}


def contained(path: Path) -> Path:
    path = path.resolve()
    if not path.is_relative_to(ROOT) or path == ROOT:
        raise ValueError(f"Refusing a path outside the workspace: {path}")
    return path


def relocated(path: Path) -> Path:
    relative = path.relative_to(ROOT).as_posix()
    for old, new in sorted(PREFIXES.items(), key=lambda pair: -len(pair[0])):
        if relative == old or relative.startswith(old + "/"):
            return ROOT / (new + relative[len(old):])
    return path


def markdown_links(text: str, before: Path, after: Path) -> str:
    def replace(match):
        raw = match.group(1)
        target = raw.strip("<>")
        if not target or target.startswith("#") or re.match(r"^[a-z]+://", target, re.I):
            return match.group(0)
        path, separator, fragment = target.partition("#")
        absolute = bool(re.match(r"^[A-Za-z]:[/\\]", path))
        old_target = Path(unquote(path)) if absolute else before.parent / unquote(path)
        old_target = old_target.resolve()
        if not old_target.is_relative_to(ROOT):
            return match.group(0)
        new_target = relocated(old_target)
        if not old_target.exists() and new_target == old_target:
            return match.group(0)  # Preserve historical references to absent files.
        updated = new_target.as_posix() if absolute else Path(os.path.relpath(new_target, after.parent)).as_posix()
        if separator:
            updated += separator + fragment
        if raw.startswith("<") or " " in updated:
            updated = "<" + updated + ">"
        return "](" + updated + ")"
    return re.sub(r"\]\(([^)\n]+)\)", replace, text)


def rewrite(text: str, before: Path, after: Path) -> str:
    if after.suffix == ".md":
        text = markdown_links(text, before, after)
    # Root-relative command examples, source metadata and explicit file paths.
    for old, new in sorted(PREFIXES.items(), key=lambda pair: -len(pair[0])):
        # Bare filenames are handled separately to avoid doubling a new prefix.
        if "/" not in old:
            continue
        for separator in ("/", "\\\\", "\\"):
            text = text.replace(old.replace("/", separator), new.replace("/", separator))
    for tool in ("halve_gif_frames.py", "replace_nbt_blocks.py"):
        text = text.replace("python " + tool, "python docs/tools/" + tool)
    name = after.relative_to(ROOT).as_posix()
    if name.startswith("docs/tools/"):
        # Top-level and nested tool depths are unchanged by kubejs -> docs.
        # These tools formerly resolved paths via the KubeJS parent itself.
        text = re.sub(r'\b(K|KUBE|KUBEJS)(\s*/\s*)([\'\"])docs/', r'ROOT\2\3docs/kubejs/', text)
        if after.name == "build_yakuman_certificates.py":
            text = text.replace("ROOT / 'docs/kubejs/yakuman-certificates.json'", "PACK / 'docs/kubejs/yakuman-certificates.json'")
        if after.name in ("draw_yakuman_certificate.py", "draw_yakuman_forging_soul.py"):
            text = text.replace("Path(__file__).resolve().parents[1] / 'assets/", "Path(__file__).resolve().parents[2] / 'kubejs/assets/")
        if after.name == "build_omni_alloy_preview.py":
            text = text.replace('KUBE / "tools/omni_alloy_preview.html"', 'ROOT / "docs/tools/omni_alloy_preview.html"')
        if after.name == "implement_omni_alloy.py":
            text = text.replace('    p = K / path', '    p = ROOT / path if path.startswith("docs/") else K / path')
            text = text.replace('write("docs/recipe-research/', 'write("docs/kubejs/recipe-research/')
        if after.name == "draw_organic.py":
            text = text.replace('root=Path(__file__).resolve().parents[2]', 'root=Path(__file__).resolve().parents[3]')
            text = text.replace('str(root/"tools")', 'str(root/"docs/tools")')
            text = text.replace('cache=root.parent/', 'cache=root/')
        if after.name == "replace_nbt_blocks.py":
            text = text.replace('script_dir = Path(__file__).parent.resolve()', 'script_dir = Path(__file__).resolve().parents[2]')
    return text


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    moves = {}
    groups = []
    cleanup = []
    for old, new in PREFIXES.items():
        source = contained(ROOT / old)
        destination = contained(ROOT / new)
        if not source.exists():
            continue
        files = sorted(p for p in source.rglob("*") if p.is_file()) if source.is_dir() else [source]
        if source.is_dir():
            cleanup.extend(p for p in source.rglob("*") if p.is_dir())
            cleanup.append(source)
        size = 0
        for file in files:
            if file.is_symlink():
                raise ValueError(f"Refusing to move a symlink: {file}")
            target = destination / file.relative_to(source) if source.is_dir() else destination
            target = contained(target)
            if target.exists() or target in moves.values() or file in moves:
                raise ValueError(f"Relocation collision: {file} -> {target}")
            moves[file] = target
            size += file.stat().st_size
        groups.append({"from": old, "to": new, "files": len(files), "bytes": size})
    for group in groups:
        print(f"{group['from']} -> {group['to']}: {group['files']} files")
    print(f"Total: {len(moves)} files; {sum(g['bytes'] for g in groups):,} bytes")
    if not args.apply:
        return
    manifest = ROOT / "docs/maintenance/ai-artifact-relocation-2026-10-22.json"
    if manifest.exists():
        raise ValueError("This one-time migration is already recorded; inspect the manifest before rerunning")
    hashes = {source: sha256(source.read_bytes()).hexdigest() for source in moves}
    for source, target in moves.items():
        target.parent.mkdir(parents=True, exist_ok=True)
        source.rename(target)
        if source.exists() or sha256(target.read_bytes()).hexdigest() != hashes[source]:
            raise AssertionError(f"Moved file integrity failed: {target}")
    # Rebase maintained tools/docs only. Archived historical fixtures stay exact.
    original_locations = {target: source for source, target in moves.items()}
    candidates = set((ROOT / "docs").rglob("*")) | {ROOT / "kubejs/startup_scripts/astral_gems/00_catalog.js"}
    changed = []
    for file in sorted(candidates):
        if not file.is_file() or file.suffix.lower() not in TEXT_SUFFIXES:
            continue
        relative = file.relative_to(ROOT).as_posix()
        if relative.startswith("docs/archive/") or file.resolve() == Path(__file__).resolve():
            continue
        raw = file.read_bytes()
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            continue
        updated = rewrite(text, original_locations.get(file, file), file)
        if updated != text:
            file.write_bytes(updated.encode("utf-8"))
            changed.append(relative)
    for directory in sorted(set(cleanup), key=lambda p: -len(p.parts)):
        contained(directory)
        try:
            directory.rmdir()  # Only remove verified, empty source directories.
        except OSError:
            pass
    manifest.parent.mkdir(parents=True, exist_ok=True)
    manifest.write_text(json.dumps({
        "date": "2026-10-22", "moved_files": len(moves),
        "moved_bytes": sum(g["bytes"] for g in groups), "groups": groups,
        "updated_references": changed,
        "verification": "Every moved file SHA256 matched before reference updates; archive snapshots are unchanged.",
        "preserved": ["Runtime scripts/assets/data", "local mod configuration and autogenerated API docs",
                      "AGENTS.md and .github agent instructions", "dev_docs spreadsheets, artwork and in-game Lua program",
                      ".cache/modeling-python dependencies", ".cache/mod-backups rollback jars"],
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Verified {len(moves)} moves; updated references in {len(changed)} files.")


if __name__ == "__main__":
    main()
