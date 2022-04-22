import type {
    VMStateResponse,
    VMState,
    VMRequest,
    VMPacketRequest,
} from "../../../../workers/vm/dist/node_modules/vm-worker"
import workerProxy, { WorkerProxy } from "./proxy"
import { CHANGE, MESSAGE } from "../../../../../jacdac-ts/src/jdom/constants"
import { JDBridge } from "../../../../../jacdac-ts/src/jdom/bridge"
import bus from "../../../../jacdac/providerbus"

class JacscriptBridge extends JDBridge {
    state: VMState = "stopped"
    variables: Record<string, number>

    constructor(readonly worker: WorkerProxy) {
        super("vm", true)
        worker.on(MESSAGE, (msg: VMRequest) => {
            const { type } = msg
            if (type === "packet") {
                const { data } = msg as VMPacketRequest
                //console.debug("vm.proxy: received packet from worker", toHex(data))
                bridge.receiveFrameOrPacket(data)
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

    protected sendPacket(data: Uint8Array, sender: string): void {
        //console.debug(`vm.proxy: send ${sender} packet to worker`, toHex(data))
        this.worker.postMessage({
            worker: "vm",
            type: "packet",
            data,
            sender,
        })
    }

    unmount() {
        this.worker.unmount()
    }
}

let bridge: JacscriptBridge
export function mountJacscriptBridge() {
    if (bridge) throw new Error("unmounted bridge")
    const worker = workerProxy("vm")
    const b = (bridge = new JacscriptBridge(worker))
    bridge.bus = bus
    return () => {
        bridge = undefined
        b.unmount()
    }
}

export function jacscriptBridge() {
    return bridge
}
