import Blockly, { ContextMenuRegistry } from "blockly"
import "@blockly/field-slider"
import "@blockly/block-dynamic-connection"
import { useEffect } from "react"
import { DisableTopBlocks } from "@blockly/disable-top-blocks"
import { UIFlags } from "../uiflags"

/**
 * Configures various blockly plugins
 */
// do not use block context
export default function useBlocklyPlugins(workspace: Blockly.WorkspaceSvg) {
    //plugins
    useEffect(() => {
        if (!workspace) return

        // context menu stuff
        if (ContextMenuRegistry.registry.getItem("blockInline"))
            ContextMenuRegistry.registry.unregister("blockInline")
        if (ContextMenuRegistry.registry.getItem("cleanWorkspace"))
            ContextMenuRegistry.registry.unregister("cleanWorkspace")

        if (!UIFlags.screenshot) {
            // The plugin must be initialized before it has any effect.
            // Add the disableOrphans event handler. This is not done automatically by
            // the plugin and should be handled by your application.
            workspace.addChangeListener(Blockly.Events.disableOrphans)
            const disableTopBlocksPlugin = new DisableTopBlocks()
            disableTopBlocksPlugin.init()
        }
        return () =>
            workspace.removeChangeListener(Blockly.Events.disableOrphans)
    }, [workspace])
}
