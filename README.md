# Default Workflow Override for ComfyUI

This custom node pack replaces ComfyUI's built-in default workflow with the workflow embedded in `js/override.js`.

The Python node `ComfyUIDefaultWorkflow` is only a marker node used for ComfyUI and ComfyUI-Manager discovery. The functional override is implemented by the frontend extension.

## Files

- `__init__.py`: exposes the marker node and frontend web directory.
- `js/override.js`: contains the replacement workflow and the frontend hook.
- `node_list.json`: explicit node list for ComfyUI-Manager indexing.
- `pyproject.toml`: metadata for ComfyUI Registry / ComfyUI-Manager compatibility.

## Installation

Copy this folder into:

```text
ComfyUI/custom_nodes/Comfyui-Default-Workflow/
```

Restart ComfyUI and hard-refresh the browser with `Ctrl + F5`.

## ComfyUI-Manager visibility

For a private/local node, ComfyUI-Manager may detect it as installed, but it will not appear in the public **Install Custom Nodes** database unless it is published as a Git repository and registered in ComfyUI-Manager's `custom-node-list.json` or in the ComfyUI Registry.

A template entry is provided in `manager/custom-node-list-entry.template.json`.

## Affichage dans ComfyUI-Manager

Si le node est actif dans `Paramètres > Extensions > Personnalisé` mais absent de `Manager > Install Custom Nodes`, consulte `REGISTER_IN_MANAGER.md`.

C'est normal pour une installation locale par ZIP : Manager liste principalement les nodes enregistrés dans sa base locale/publique. Le script fourni ajoute une entrée locale à `custom-node-list.json` pour permettre le test via `DB: Local`.


## Version 0.0.7

Cette version retire le fallback agressif basé sur `graph.clear()` et le moniteur périodique.
Le workflow personnalisé est chargé :

- quand le workflow builtin ComfyUI est détecté ;
- quand un graph vide est chargé juste après une action utilisateur ressemblant à la création d’un nouvel onglet/workflow ;
- sans toucher aux graphes utilisateur déjà ouverts.

Logs utiles dans la console navigateur :

```text
[Comfyui-Default-Workflow.override] extension loaded
[Comfyui-Default-Workflow.override] replacing ComfyUI builtin default workflow
[Comfyui-Default-Workflow.override] replacing armed empty workflow load
[Comfyui-Default-Workflow.override] load replacement workflow: new workflow tab click / 100ms
```
