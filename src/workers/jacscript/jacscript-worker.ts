import { compile, JacError, Host } from "jacscript-compiler"
import type { DebugInfo } from "jacscript-compiler"
import type { JacsModule } from "jacscript-vm"
import vmMod from "jacscript-vm"

export type JacscriptError = JacError

export type JacscriptDebugInfo = DebugInfo

export interface JacscriptMessage {
    worker: "jacscript"
    id?: string
}

export interface JacscriptRequest extends JacscriptMessage {
    type: string
}

export interface JacscriptCompileRequest extends JacscriptRequest {
    type: "compile"
    source: string
}

export interface JacscriptSpecsRequest extends JacscriptRequest {
    type: "specs"
    serviceSpecs: jdspec.ServiceSpec[]
}

export interface JacscriptCompileResponse extends JacscriptMessage {
    success: boolean
    binary: Uint8Array
    dbg: JacscriptDebugInfo
    clientSpecs: jdspec.ServiceSpec[]
    files: Record<string, Uint8Array | string>
    logs: string
    errors: JacscriptError[]
}

class WorkerHost implements Host {
    files: Record<string, Uint8Array | string>
    logs: string
    errors: JacError[]

    constructor(
        private specs: jdspec.ServiceSpec[],
        private vmMod: JacsModule
    ) {
        this.files = {}
        this.logs = ""
        this.errors = []

        this.vmMod.jacsInit()

        this.error = this.error.bind(this)
    }

    write(filename: string, contents: Uint8Array | string) {
        this.files[filename] = contents
    }
    log(msg: string): void {
        this.logs += msg + "\n"
    }
    error(err: JacError) {
        this.errors.push(err)
    }
    getSpecs(): jdspec.ServiceSpec[] {
        return this.specs
    }
    verifyBytecode(buf: Uint8Array, dbg?: DebugInfo): void {
        const r = this.vmMod.jacsDeploy(buf)
        if (r != 0) throw new Error("verification failed: " + r)
    }
}

let serviceSpecs: jdspec.ServiceSpec[]

const handlers: { [index: string]: (props: any) => object | Promise<object> } =
    {
        compile: async (props: JacscriptCompileRequest) => {
            const { source } = props
            if (!serviceSpecs) throw new Error("specs missing")
            const host = new WorkerHost(serviceSpecs, await vmMod())
            const res = compile(host, source)

            return <Partial<JacscriptCompileResponse>>{
                ...res,
                files: host.files,
                logs: host.logs,
                errors: host.errors,
            }
        },
        specs: async (props: JacscriptSpecsRequest) => {
            serviceSpecs = props.serviceSpecs
            return {}
        },
    }

function processMessage(message: JacscriptRequest): any {
    try {
        const handler = handlers[message.type]
        return handler?.(message)
    } catch (e) {
        console.debug(e)
        return undefined
    }
}

async function handleMessage(event: MessageEvent) {
    const message: JacscriptRequest = event.data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, worker, type, ...rest } = message
    if (worker !== "jacscript") return

    try {
        const result = await processMessage(message)
        if (result) {
            const resp = { id, worker, ...rest, ...result }
            self.postMessage(resp)
        }
    } catch (e) {
        console.debug(`jacscript: error ${e + ""}`, e)
        self.postMessage({
            id,
            type,
            worker,
            error: e + "",
        })
    }
}

self.addEventListener("message", handleMessage)
console.debug(`jacscript: worker registered`)
