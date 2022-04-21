import vmMod from "jacscript-vm"

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

export interface VMPacketRequest extends VMMessage {
    type: "packet"
    data: Uint8Array
}


const init = vmMod().then(Module => {
    Module.sendPacket = data => {
        self.postMessage(<VMPacketRequest>{
            worker: "vm",
            type: "packet",
            data,
        })
    }
    Module.jacsStart()
    return Module
})

const handlers: { [index: string]: (props: any) => object | Promise<object> } =
    {
        packet: (props: VMPacketRequest) => {
            const { data } = props
            init.then(m => m.handlePacket(data))
            //console.log("vm.worker: received packet from proxy", toHex(data))
            return undefined
        },
        // not used
        deploy: async (props: VMDeployRequest) => {
            const { binary, debugInfo, restart } = props
            const Module = await init
            const verificationError = Module.jacsDeploy(binary)
            if (verificationError != 0) {
                console.log("verification error: " + verificationError)
                return { verificationError }
            }
            return {}
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
