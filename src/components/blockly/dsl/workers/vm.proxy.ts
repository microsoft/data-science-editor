import type {
    VMCompileRequest,
    VMCompileResponse,
    VMStateRequest,
    VMStateResponse,
    VMState,
    VMCommandRequest,
    VMRequest,
    VMPacketRequest,
} from "../../../../workers/vm/dist/node_modules/vm.worker"
import workerProxy, { WorkerProxy } from "./proxy"
import bus from "../../../../jacdac/providerbus"
import { CHANGE, MESSAGE } from "../../../../../jacdac-ts/src/jdom/constants"
import { JDBridge } from "../../../../../jacdac-ts/src/jdom/bridge"

class JacScriptBridge extends JDBridge {
    state: VMState = "stopped"
    variables: Record<string, number>

    constructor(readonly worker: WorkerProxy) {
        super()
        worker.on(MESSAGE, (msg: VMRequest) => {
            const { type } = msg
            if (type === "packet") {
                const { data } = msg as VMPacketRequest
                //console.debug("vm.proxy: received packet from worker", toHex(data))
                bridge.receivePacket(data)
            } else if (type === "state") {
                const { state, variables } = msg as VMStateResponse
                if (
                    state !== this.state ||
                    JSON.stringify(this.variables) !== JSON.stringify(variables)
                ) {
                    this.state = state
                    this.variables = variables
                    this.emit(CHANGE)
                }
            }
        })
    }

    protected sendPacket(data: Uint8Array): void {
        //console.debug("vm.proxy: send packet to worker", toHex(data))
        this.worker.postMessage({
            worker: "vm",
            type: "packet",
            data,
        })
    }
}

let bridge: JacScriptBridge
export function jacScriptBridge() {
    if (!bridge) {
        const worker = workerProxy("vm")
        bridge = new JacScriptBridge(worker)
    }
    return bridge
}

/**
 * Compiles the sources and keeps the compiled program ready to run. Can be done while running another program.
 * @param source
 * @returns
 */
export async function jacScriptCompile(
    source: string,
    restart?: boolean
    // eslint-disable-next-line @typescript-eslint/ban-types
): Promise<VMCompileResponse> {
    const worker = workerProxy("vm")
    const res = await worker.postMessage<VMCompileRequest, VMCompileResponse>({
        worker: "vm",
        type: "compile",
        source,
        restart,
    })
    return res
}

/**
 * Updates the run state
 * @param source
 * @returns
 */
export async function jacScriptCommand(
    action: "start" | "stop"
): Promise<VMStateResponse> {
    const bridge = jacScriptBridge()
    if (action === "start") bridge.bus = bus
    else bridge.bus = undefined
    console.log(`jsc: command ${action}`)
    const res = await bridge.worker.postMessage<
        VMCommandRequest,
        VMStateResponse
    >({
        worker: "vm",
        type: "command",
        action,
    })
    return res
}
