import { useCallback, useEffect, useRef } from "react"
import {
    DeviceScriptManagerCmd,
    SRV_DEVICE_SCRIPT_MANAGER,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { OutPipe } from "../../../jacdac-ts/src/jdom/pipes"
import { startDeviceScriptVM } from "../blockly/dsl/workers/vm.proxy"
import useServices from "../hooks/useServices"
import useWindowEvent from "../hooks/useWindowEvent"

/**
 * Ensures that at least one jacscript VM is running
 * @returns
 */
export default function DeviceScriptVMLoader() {
    const managers = useServices({ serviceClass: SRV_DEVICE_SCRIPT_MANAGER })
    const manager = managers[0]
    const vmCleanup = useRef<() => void>()

    // ensure a single vm is running
    useEffect(() => {
        if (managers.length === 0 && !vmCleanup.current) {
            vmCleanup.current = startDeviceScriptVM()
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
                    DeviceScriptManagerCmd.DeployBytecode,
                    bytecode
                )
            }
        },
        [manager]
    )
    useWindowEvent("message", manager ? handleMessage : undefined)
    return null
}
