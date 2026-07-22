from __future__ import annotations

import argparse
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

ENTRY = {
    "author": "jean passant",
    "title": "Default Workflow Override",
    "id": "default-workflow-override",
    "reference": "LOCAL_ONLY_Default_Workflow_Override",
    "files": ["LOCAL_ONLY_Default_Workflow_Override"],
    "install_type": "git-clone",
    "description": (
        "Frontend extension that replaces ComfyUI's built-in default workflow "
        "with the workflow embedded in js/override.js."
    ),
}


def find_custom_nodes_dir(start: Path) -> Path:
    current = start.resolve()
    for candidate in [current, *current.parents]:
        if candidate.name == "custom_nodes":
            return candidate
    # Typical layout: ComfyUI/custom_nodes/<this node>/tools/register_...
    return start.resolve().parents[2]


def find_manager_dir(custom_nodes_dir: Path) -> Path:
    names = ["comfyui-manager", "ComfyUI-Manager", "ComfyUI-Manager-main"]
    for name in names:
        candidate = custom_nodes_dir / name
        if (candidate / "custom-node-list.json").exists():
            return candidate

    candidates = []
    for child in custom_nodes_dir.iterdir():
        if child.is_dir() and "manager" in child.name.lower() and (child / "custom-node-list.json").exists():
            candidates.append(child)

    if len(candidates) == 1:
        return candidates[0]

    raise FileNotFoundError(
        "Impossible de trouver ComfyUI-Manager avec un fichier custom-node-list.json. "
        "Lance ce script depuis ComfyUI/custom_nodes/Comfyui-Default-Workflow/tools ou passe --manager-dir."
    )


def load_database(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict) or not isinstance(data.get("custom_nodes"), list):
        raise ValueError(f"Format inattendu dans {path}")
    return data


def already_registered(nodes: list[dict[str, Any]]) -> bool:
    for node in nodes:
        if not isinstance(node, dict):
            continue
        if node.get("id") == ENTRY["id"]:
            return True
        if node.get("title") == ENTRY["title"]:
            return True
        if node.get("reference") == ENTRY["reference"]:
            return True
    return False


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Ajoute Default Workflow Override dans la base locale ComfyUI-Manager."
    )
    parser.add_argument(
        "--manager-dir",
        type=Path,
        default=None,
        help="Chemin vers ComfyUI/custom_nodes/comfyui-manager ou ComfyUI-Manager.",
    )
    parser.add_argument(
        "--repo-url",
        default=None,
        help="URL GitHub du dépôt si tu publies ce node. Remplace LOCAL_ONLY dans reference/files.",
    )
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    custom_nodes_dir = find_custom_nodes_dir(script_dir)
    manager_dir = args.manager_dir.resolve() if args.manager_dir else find_manager_dir(custom_nodes_dir)
    db_path = manager_dir / "custom-node-list.json"

    entry = dict(ENTRY)
    if args.repo_url:
        entry["reference"] = args.repo_url
        entry["files"] = [args.repo_url]

    data = load_database(db_path)
    custom_nodes = data["custom_nodes"]

    if already_registered(custom_nodes):
        print("Default Workflow Override est déjà présent dans custom-node-list.json.")
        print(f"Fichier : {db_path}")
        return 0

    backup = db_path.with_suffix(
        db_path.suffix + ".backup-" + datetime.now().strftime("%Y%m%d-%H%M%S")
    )
    shutil.copy2(db_path, backup)

    custom_nodes.insert(0, entry)
    with db_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("Entrée ajoutée dans la base locale ComfyUI-Manager.")
    print(f"Fichier modifié : {db_path}")
    print(f"Sauvegarde créée : {backup}")
    print("Redémarre ComfyUI, ouvre Manager > Install Custom Nodes, puis choisis DB: Local.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
