import { JacError, RunnerState, Runner, DebugInfo } from "jacscript"
import {
    CHANGE,
    GLOBALS_UPDATED,
    JDBus,
    localStorageSetting,
    Packet,
    PACKET_SEND,
} from "jacdac-ts"

export type VMState = "stopped" | "initializing" | "running" | "error"

export type VMError = JacError

export interface VMMessage {
    worker: "vm"
    id?: string
}

export interface VMRequest extends VMMessage {
    type?: string
}

export interface VMResponse extends VMRequest {
    error?: string
}

export interface VMDeployRequest extends VMMessage {
    type: "deploy"
    binary: Uint8Array
    debugInfo: unknown
    restart?: boolean
}

export interface VMStateRequest extends VMMessage {
    type: "state"
}

export interface VMStateResponse extends VMMessage {
    state?: VMState
    variables?: Record<string, number>
}

export interface VMCommandRequest extends VMMessage {
    type: "command"
    action: "start" | "stop"
}

export interface VMPacketRequest extends VMMessage {
    type: "packet"
    data: Uint8Array
}

const bus = new JDBus(null, {
    client: false,
    disableRoleManager: true,
})
bus.stop()
let runner: Runner

bus.on(PACKET_SEND, (pkt: Packet) => {
    const data = pkt.toBuffer()
    //console.log("vm.worker: send packet to proxy", toHex(data))
    self.postMessage(<VMPacketRequest>{
        worker: "vm",
        type: "packet",
        data,
    })
})

const states: Record<RunnerState, VMState> = {
    [RunnerState.Stopped]: "stopped",
    [RunnerState.Error]: "error",
    [RunnerState.Initializing]: "initializing",
    [RunnerState.Running]: "running",
}

function postState() {
    const state = states[runner?.state ?? RunnerState.Stopped]
    const variables = runner?.globals()
    console.log(`jdvm worker: state ${state}`)
    self.postMessage(<VMStateResponse>{
        type: "state",
        worker: "vm",
        state,
        variables,
    })
}

async function start() {
    console.log(`jdvm worker: start`)
    bus.start()
    runner?.run()
    postState()
}

async function stop() {
    console.log(`jdvm worker: stop`)
    runner?.stop()
    await bus.stop()
    postState()
}

const handlers: { [index: string]: (props: any) => object | Promise<object> } =
    {
        packet: (props: VMPacketRequest) => {
            const { data } = props
            const pkt = Packet.fromBinary(data, bus?.timestamp)
            bus.processPacket(pkt)
            //console.log("vm.worker: received packet from proxy", toHex(data))
            return undefined
        },
        deploy: async (props: VMDeployRequest) => {
            await stop()
            const { binary, debugInfo, restart } = props
            runner = new Runner(bus, binary, debugInfo as DebugInfo)
            runner.options.setting = localStorageSetting
            runner.on(CHANGE, postState)
            runner.on(GLOBALS_UPDATED, postState)

            if (restart) {
                console.debug("jdvm worker: restart")
                await start() // background start
            }
            return <Partial<VMStateResponse>>{
                state: states[runner?.state] || RunnerState.Stopped,
            }
        },
        state: () =>
            <Partial<VMStateResponse>>{
                state: states[runner?.state] || RunnerState.Stopped,
                variables: runner?.globals(),
            },
        command: async (props: VMCommandRequest) => {
            const { action } = props
            switch (action) {
                case "stop":
                    await stop()
                    break
                case "start":
                    await stop()
                    await start()
                    break
            }
            return <Partial<VMStateResponse>>{
                state: states[runner?.state] || RunnerState.Stopped,
            }
        },
    }

function processMessage(message: VMRequest): any {
    try {
        const handler = handlers[message.type]
        return handler?.(message)
    } catch (e) {
        console.debug(e)
        return undefined
    }
}

async function handleMessage(event: MessageEvent) {
    const message: VMRequest = event.data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, worker, type, ...rest } = message
    if (worker !== "vm") return

    try {
        const result = await processMessage(message)
        if (result) {
            const resp = { id, worker, ...rest, ...result }
            self.postMessage(resp)
        }
    } catch (e) {
        console.debug(`jdvm worker: error ${e + ""}`, e)
        self.postMessage({
            id,
            type,
            worker,
            error: e + "",
        })
    }
}

self.addEventListener("message", handleMessage)
console.debug(`jacdac vm: worker registered`)
