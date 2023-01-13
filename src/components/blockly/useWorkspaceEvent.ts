import { Events, Workspace } from "blockly"
import { useEffect } from "react"

/**
 * A hook to register event on a blockly workspace
 */
export default function useWorkspaceEvent(
    workspace: Workspace,
    handler: (event: Events.Abstract & { type: string }) => void
) {
    // register hook
    useEffect(() => {
        workspace?.addChangeListener(handler)
        return () => workspace?.removeChangeListener(handler)
    }, [workspace, handler])
}
