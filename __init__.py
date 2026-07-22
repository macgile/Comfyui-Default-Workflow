"""
@author: jean passant
@title: ComfyUI Default Workflow Override
@nickname: Default Workflow Override
@description: Overrides ComfyUI's built-in default workflow with the workflow embedded in js/override.js.
"""

WEB_DIRECTORY = "./js"


class ComfyUIDefaultWorkflow:
    """Marker node for ComfyUI-Manager discovery.

    The actual feature is implemented by the frontend extension in
    js/override.js. This node intentionally does nothing; it exists so
    ComfyUI and ComfyUI-Manager can identify this package as a custom
    node pack.
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {}}

    RETURN_TYPES = ()
    FUNCTION = "noop"
    CATEGORY = "utils/workflow"
    DESCRIPTION = "Marker node for the Default Workflow Override frontend extension."

    def noop(self):
        return ()


NODE_CLASS_MAPPINGS = {
    "ComfyUIDefaultWorkflow": ComfyUIDefaultWorkflow,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "ComfyUIDefaultWorkflow": "Default Workflow",
}

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
