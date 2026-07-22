# Default Workflow Override for ComfyUI

This custom node pack replaces ComfyUI's built-in default workflow with the workflow embedded in `js/override.js`.

The Python node `ComfyUIDefaultWorkflow` is only a marker node used for ComfyUI discovery. The functional override is implemented by the frontend extension.

## Files

- `__init__.py`: exposes the marker node and frontend web directory.
- `js/override.js`: contains the replacement workflow and the frontend hook.
- `node_list.json`: explicit node list for discovery indexing.
- `pyproject.toml`: metadata for ComfyUI compatibility.

## Installation

Copy this folder into:

```text
ComfyUI/custom_nodes/Comfyui-Default-Workflow/
```

Restart ComfyUI and hard-refresh the browser with `Ctrl + F5`.

## Behavior

The custom workflow is loaded:

- When the built-in ComfyUI default workflow is detected.
- When an empty graph is loaded just after a user action resembling new tab/workflow creation.
- Without touching already-open user graphs.

Useful console logs:

```text
[Comfyui-Default-Workflow.override] extension loaded
[Comfyui-Default-Workflow.override] replacing ComfyUI builtin default workflow
[Comfyui-Default-Workflow.override] replacing armed empty workflow load
[Comfyui-Default-Workflow.override] load replacement workflow: new workflow tab click / 100ms
```

## License

MIT
