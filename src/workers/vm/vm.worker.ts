import { compile, JacError, Host, RunnerState, Runner } from "jacscript"
import { JDBus, localStorageSetting, Packet, PACKET_SEND, toHex } from "jacdac-ts"


export type VMState = RunnerState

export type VMError = JacError

export interface VMMessage {
    worker: "vm"
    id?: string
}

export interface VMRequest extends VMMessage {
    type?: string
}

export interface VMCompileRequest extends VMMessage {
    type: "compile"
    source: string
}

export interface VMCompileResponse extends VMMessage {
    files: Record<string, Uint8Array | string>
    logs: string
    errors: VMError[]
}

export interface VMStateRequest extends VMMessage {
    type: "state"
}

export interface VMStateResponse extends VMMessage {
    state?: VMState
}

export interface VMCommandRequest extends VMMessage {
    type: "command"
    action: "start" | "stop"
}

export interface VMRunResponse extends VMCompileResponse {
    state: VMState
}

export interface VMPacketRequest extends VMMessage {
    type: "packet"
    data: Uint8Array
}


const bus = new JDBus(
    null,
    {
        client: false,
        disableRoleManager: true,
    }
)
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

class WorkerHost implements Host {
    files: Record<string, Uint8Array | string> = {}
    logs = ""
    errors: JacError[] = []

    write(filename: string, contents: Uint8Array | string) {
        this.files[filename] = contents
    }
    log(msg: string): void {
        this.logs += msg + "\n"
    }
    error(err: JacError) {
        this.errors.push(err)
    }
}

function postState() {
    const state = bus.running ? RunnerState.Running : undefined;
    //console.log("vm.worker: state", state)
    self.postMessage(<VMStateResponse>{
        type: "state",
        worker: "vm",
        state
    })
}

async function start() {
    if (!runner) return

    bus.start()
    runner.run();
    postState()
}

async function stop() {
    if (runner) {
        // TODO Stop!
    }
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
        compile: async (props: VMCompileRequest) => {
            const { source } = props
            const host = new WorkerHost()
            const res = compile(host, source)

            if (res.success) {
                await stop()
                const { binary, dbg } = res
                runner = new Runner(bus, binary, dbg)
                runner.options.setting = localStorageSetting
            }

            return <Partial<VMCompileResponse>>{
                ...res,
                files: host.files,
                logs: host.logs,
                errors: host.errors,
            }
        },
        state: () => {
            const state = bus.running ? RunnerState.Running : undefined;
            return <Partial<VMStateResponse>>{
                state,
            }
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

            return <Partial<VMRunResponse>>{
                state: runner?.state,
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
        self.postMessage({
            id,
            worker,
            error: e + "",
        })
    }
}

self.addEventListener("message", handleMessage)
console.debug(`jacdac vm: worker registered`)
