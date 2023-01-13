import Blockly from "blockly"
import { useCallback } from "react"
import ReactField from "./fields/ReactField"
import useWorkspaceEvent from "./useWorkspaceEvent"

/**
 * The glue between blockly change events and the React contexts.
 * @param workspace 
 */
// do not use block context
export default function useBlocklyEvents(workspace: Blockly.WorkspaceSvg) {
    const handleChange = useCallback(
        (event: Blockly.Events.Abstract & { type: string }) => {
            const { type } = event
            switch (type) {
                case Blockly.Events.BLOCK_CHANGE: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const change = event as any as Blockly.Events.Change
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
