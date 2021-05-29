import Blockly from "blockly"
import { useEffect } from "react"
import { DisableTopBlocks } from "@blockly/disable-top-blocks"
import { BlockTemplate, ServiceBlockDefinition, ServiceBlockDefinitionFactory } from "./toolbox"
import TwinField from "./fields/TwinField"

export default function useBlocklyEvents(workspace: Blockly.WorkspaceSvg) {
    const handleChange = (
        event: Blockly.Events.Abstract & { type: string }
    ) => {
        const { type } = event
        switch (type) {
            case Blockly.Events.BLOCK_CHANGE: {
                const change = event as Blockly.Events.Change
                const block = workspace.getBlockById(change.blockId)
                const def = (Blockly.Blocks[block.type] as ServiceBlockDefinitionFactory)
                    ?.jacdacDefinition as ServiceBlockDefinition
                const template = def?.template as BlockTemplate
                if (template === "twin") {
                    // notify twin that the value changed
                    const twinField = block.inputList[1]
                        .fieldRow[0] as TwinField
                    twinField.updateRole()
                }
                break
            }
        }
    }

    // register hook
    useEffect(() => {
        workspace?.addChangeListener(handleChange)
        return () => workspace?.removeChangeListener(handleChange)
    }, [workspace])

    //plugins
    useEffect(() => {
        if (!workspace) return
        // Add the disableOrphans event handler. This is not done automatically by
        // the plugin and should be handled by your application.
        workspace.addChangeListener(Blockly.Events.disableOrphans)

        // The plugin must be initialized before it has any effect.
        const disableTopBlocksPlugin = new DisableTopBlocks()
        disableTopBlocksPlugin.init()
        return workspace.removeChangeListener(Blockly.Events.disableOrphans)
    }, [workspace])
}
