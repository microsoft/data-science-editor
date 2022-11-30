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

class DeviceScriptBridge extends JDBridge {
    refs = 0
    state: VMState = "stopped"
    variables: Record<string, number>
    sendCount = 0
    recvCount = 0

    constructor(readonly worker: WorkerProxy) {
        super("vm", true)
        this.mount(
            worker.subscribe(MESSAGE, (msg: VMRequest) => {
                const { type } = msg
                if (type === "packet") {
                    const { data } = msg as VMPacketRequest
                    bridge.receiveFrameOrPacket(data)
                } else if (type === "state") {
                    const { state, variables } = msg as VMStateResponse
                    if (
                        state !== this.state ||
                        JSON.stringify(this.variables) !==
                            JSON.stringify(variables)
                    ) {
                        this.state = state
                        this.variables = variables
                        this.emit(CHANGE)
                    }
                }
            })
        )
    }

    protected sendPacket(data: Uint8Array, sender: string): void {
        this.worker.postMessage({
            worker: "vm",
            type: "packet",
            data,
            sender,
        })
    }

    unmount() {
        this.worker.unmount()
        super.unmount()
    }
}

let bridge: DeviceScriptBridge
export function startDeviceScriptVM(): () => void {
    let b = bridge
    if (!bridge) {
        const worker = workerProxy("vm")
        b = bridge = new DeviceScriptBridge(worker)
        b.bus = bus
    }
    b.refs++
    return () => {
        b.refs--
        if (bridge === b && b.refs <= 0) {
            bridge = undefined
            b.unmount()
        }
    }
}

/**
 * Gets the current DeviceScript bridge; make sure it is started, do not keep a reference
 * @returns
 */
export function deviceScriptBridge() {
    return bridge
}
