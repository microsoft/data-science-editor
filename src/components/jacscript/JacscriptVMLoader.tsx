import { useCallback, useEffect } from "react"
import {
    JacscriptManagerCmd,
    SRV_JACSCRIPT_MANAGER,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { OutPipe } from "../../../jacdac-ts/src/jdom/pipes"
import { startJacscriptVM } from "../blockly/dsl/workers/vm.proxy"
import useServices from "../hooks/useServices"
import useWindowEvent from "../hooks/useWindowEvent"

export default function JacscriptVMLoader() {
    const manager = useServices({ serviceClass: SRV_JACSCRIPT_MANAGER })?.[0]

    useEffect(() => startJacscriptVM(), [])
    const handleMessage = useCallback(
        async (
            ev: MessageEvent<{ source?: "jacscript"; data?: Uint8Array }>
        ) => {
            const data = ev.data
            console.log({ data })
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
