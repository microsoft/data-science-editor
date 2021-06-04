import Blockly, { ContextMenuRegistry } from "blockly"
import "@blockly/field-slider"
import "@blockly/block-dynamic-connection"
import { useEffect } from "react"
import { DisableTopBlocks } from "@blockly/disable-top-blocks"

export default function useBlocklyPlugins(workspace: Blockly.WorkspaceSvg) {
    //plugins
    useEffect(() => {
        if (!workspace) return

        // context menu stuff
        ContextMenuRegistry.registry.unregister("blockInline")
        ContextMenuRegistry.registry.unregister("cleanWorkspace")

        // Add the disableOrphans event handler. This is not done automatically by
        // the plugin and should be handled by your application.
        workspace.addChangeListener(Blockly.Events.disableOrphans)

        // The plugin must be initialized before it has any effect.
        const disableTopBlocksPlugin = new DisableTopBlocks()
        disableTopBlocksPlugin.init()
        return () =>
            workspace.removeChangeListener(Blockly.Events.disableOrphans)
    }, [workspace])
}
