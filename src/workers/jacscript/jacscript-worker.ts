importScripts(
    "https://microsoft.github.io/jacscript/dist/jacscript-compiler.js"
)

const { compile } = (self as any).jacscript

export type JacscriptDebugInfo = any
export type JacscriptError = any
export type JacError = any

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

class WorkerHost {
    files: Record<string, Uint8Array | string>
    logs: string
    errors: JacError[]

    constructor(private specs: jdspec.ServiceSpec[]) {
        this.files = {}
        this.logs = ""
        this.errors = []

        this.error = this.error.bind(this)
    }
    mainFileName() {
        return ""
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
    verifyBytecode(buf: Uint8Array, dbg?: JacscriptDebugInfo): void {}
}

let serviceSpecs: jdspec.ServiceSpec[]

const handlers: { [index: string]: (props: any) => object | Promise<object> } =
    {
        compile: async (props: JacscriptCompileRequest) => {
            const { source } = props
            if (!serviceSpecs) throw new Error("specs missing")
            const host = new WorkerHost(serviceSpecs)
            const res = compile(source, { host })

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
