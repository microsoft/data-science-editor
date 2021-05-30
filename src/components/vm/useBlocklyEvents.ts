import Blockly from "blockly"
import { useEffect } from "react"
import {
    BlockTemplate,
    ServiceBlockDefinition,
    ServiceBlockDefinitionFactory,
} from "./toolbox"
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
                const def = (
                    Blockly.Blocks[block.type] as ServiceBlockDefinitionFactory
                )?.jacdacDefinition as ServiceBlockDefinition
                const template = def?.template as BlockTemplate
                if (template === "twin") {
                    // notify twin that the value changed
                    const twinField = block.inputList[1]
                        .fieldRow[0] as TwinField
                    twinField.emitChange()
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
}
