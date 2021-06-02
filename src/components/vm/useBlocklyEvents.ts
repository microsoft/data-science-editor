import Blockly from "blockly"
import { useEffect } from "react"
import ReactField from "./fields/ReactField"
import { BlockTemplate, resolveServiceBlockDefinition } from "./toolbox"

export default function useBlocklyEvents(workspace: Blockly.WorkspaceSvg) {
    const handleChange = (
        event: Blockly.Events.Abstract & { type: string }
    ) => {
        const { type } = event
        switch (type) {
            case Blockly.Events.BLOCK_CHANGE: {
                const change = event as Blockly.Events.Change
                const block = workspace.getBlockById(change.blockId)
                const def = resolveServiceBlockDefinition(block.type)
                const template = def?.template as BlockTemplate
                if (template === "twin") {
                    // notify twin that the value changed
                    const twinInput = block.inputList[1]
                    const twinField = twinInput
                        .fieldRow[0] as ReactField<unknown>
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
