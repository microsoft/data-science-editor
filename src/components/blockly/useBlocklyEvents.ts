import Blockly from "blockly"
import { useCallback } from "react"
import ReactField from "./fields/ReactField"
import useWorkspaceEvent from "./useWorkspaceEvent"

// do not use block context

export default function useBlocklyEvents(workspace: Blockly.WorkspaceSvg) {
    const handleChange = useCallback(
        (event: Blockly.Events.Abstract & { type: string }) => {
            const { type } = event
            switch (type) {
                case Blockly.Events.BLOCK_CHANGE: {
                    const change = event as Blockly.Events.Change
                    const block = workspace.getBlockById(change.blockId)
                    // notify twin that the value changed
                    const twinInput = block.inputList[1]
                    const twinField = twinInput?.fieldRow.find(
                        f => f.name === "twin"
                    ) as ReactField<unknown>
                    twinField?.emitChange?.()
                    break
                }
            }
        },
        [workspace]
    )
    useWorkspaceEvent(workspace, handleChange)
}
