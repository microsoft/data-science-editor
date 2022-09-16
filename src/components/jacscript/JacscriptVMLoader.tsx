import { useCallback, useEffect, useRef } from "react"
import {
    JacscriptManagerCmd,
    SRV_JACSCRIPT_MANAGER,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { OutPipe } from "../../../jacdac-ts/src/jdom/pipes"
import { startJacscriptVM } from "../blockly/dsl/workers/vm.proxy"
import useServices from "../hooks/useServices"
import useWindowEvent from "../hooks/useWindowEvent"

/**
 * Ensures that at least one jacscript VM is running
 * @returns
 */
export default function JacscriptVMLoader() {
    const managers = useServices({ serviceClass: SRV_JACSCRIPT_MANAGER })
    const manager = managers[0]
    const vmCleanup = useRef<() => void>()

    // ensure a single vm is running
    useEffect(() => {
        if (managers.length === 0 && !vmCleanup.current) {
            vmCleanup.current = startJacscriptVM()
        } else if (managers.length > 1) {
            vmCleanup.current?.()
            vmCleanup.current = undefined
        }
    }, [managers.length])
    // always cleanup on final mount
    useEffect(() => () => vmCleanup.current?.(), [])

    const handleMessage = useCallback(
        async (
            ev: MessageEvent<{ source?: "jacscript"; data?: Uint8Array }>
        ) => {
            const data = ev.data
            if (data?.source === "jacscript") {
                console.debug(`jacscript: deploying bytecode`)
                const bytecode = data.data
                await OutPipe.sendBytes(
                    manager,
                    JacscriptManagerCmd.DeployBytecode,
                    bytecode
                )
            }
        },
        [manager]
    )
    useWindowEvent("message", manager ? handleMessage : undefined)
    return null
}
