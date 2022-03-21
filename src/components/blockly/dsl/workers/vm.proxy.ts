import type {
    VMStateResponse,
    VMState,
    VMCommandRequest,
    VMRequest,
    VMPacketRequest,
    VMDeployRequest,
} from "../../../../workers/vm/dist/node_modules/vm.worker"
import workerProxy, { WorkerProxy } from "./proxy"
import bus from "../../../../jacdac/providerbus"
import {
    CHANGE,
    MESSAGE,
    REPORT_UPDATE,
} from "../../../../../jacdac-ts/src/jdom/constants"
import { JDBridge } from "../../../../../jacdac-ts/src/jdom/bridge"
import { JacscriptManagerServer } from "../../../../../jacdac-ts/src/servers/jacscriptmanagerserver"

class JacscriptBridge extends JDBridge {
    state: VMState = "stopped"
    variables: Record<string, number>

    constructor(readonly worker: WorkerProxy) {
        super(true)
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

    protected sendPacket(data: Uint8Array, sender: string): void {
        //console.debug("vm.proxy: send packet to worker", toHex(data))
        this.worker.postMessage({
            worker: "vm",
            type: "packet",
            data,
            sender,
        })
    }
}

async function jacscriptDeploy(
    binary: Uint8Array,
    debugInfo: unknown,
    restart?: boolean
): Promise<VMStateResponse> {
    const bridge = jacscriptBridge()
    console.log(`jdvm proxy: deploy ${binary.length} bytes`)
    const res = await bridge.worker.postMessage<
        VMDeployRequest,
        VMStateResponse
    >({
        worker: "vm",
        type: "deploy",
        binary,
        debugInfo,
        restart,
    })
    return res
}

async function jacscriptCommand(
    action: "start" | "stop"
): Promise<VMStateResponse> {
    const bridge = jacscriptBridge()
    if (action === "start") bridge.bus = bus
    else bridge.bus = undefined
    console.log(`jdvm: command ${action}`)
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

class VMJacscriptManagerServer extends JacscriptManagerServer {
    bridge: JacscriptBridge
    state: VMState

    constructor() {
        super()

        this.bridge = jacscriptBridge()
        this.bridge.on(CHANGE, this.handleBridgeChange.bind(this))
        this.running.on(CHANGE, this.handleRunningChange.bind(this))

        this.on(
            JacscriptManagerServer.PROGRAM_CHANGE,
            this.handleProgramChange.bind(this)
        )
    }

    private handleProgramChange() {
        console.debug("jdvm proxy: program change")
        const autoStart = !!this.autoStart.values()[0]
        jacscriptDeploy(this.binary, this.debugInfo, !!autoStart)
    }

    private handleBridgeChange() {
        this.state = this.bridge.state
        const running =
            this.state === "running" || this.state === "initializing"
        console.log(
            `jdvm server: state ${this.state} ${
                running ? "running" : "stopped"
            }`
        )
        this.running.setValues([running], true)
    }

    private handleRunningChange() {
        const running = this.running.values()[0]
        const action = running ? "start" : "stop"
        console.log(`jdvm server: ${action} ${this.state}`)
        jacscriptCommand(action)
    }
}

let bridge: JacscriptBridge
export function jacscriptBridge() {
    if (!bridge) {
        const worker = workerProxy("vm")
        bridge = new JacscriptBridge(worker)
    }
    return bridge
}
let server: JacscriptManagerServer
export function createVMJacscriptManagerServer(): JacscriptManagerServer {
    if (!server) server = new VMJacscriptManagerServer()
    return server
}
