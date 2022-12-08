importScripts(
    "https://microsoft.github.io/devicescript/dist/devicescript-compiler.js"
)

const { compile } = (self as any).deviceScript

export type DeviceScriptDebugInfo = any
export type DeviceScriptError = any

export interface DeviceScriptMessage {
    worker: "devicescript"
    id?: string
}

export interface DeviceScriptRequest extends DeviceScriptMessage {
    type: string
}

export interface DeviceScriptCompileRequest extends DeviceScriptRequest {
    type: "compile"
    source: string
}

export interface DeviceScriptSpecsRequest extends DeviceScriptRequest {
    type: "specs"
    serviceSpecs: jdspec.ServiceSpec[]
}

export interface DeviceScriptCompileResponse extends DeviceScriptMessage {
    success: boolean
    binary: Uint8Array
    dbg: DeviceScriptDebugInfo
    clientSpecs: jdspec.ServiceSpec[]
    files: Record<string, Uint8Array | string>
    logs: string
    errors: DeviceScriptError[]
}

class WorkerHost {
    files: Record<string, Uint8Array | string>
    logs: string
    errors: { filename: string; message: string; line: number }[]

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
    error(err: DeviceScriptError) {
        console.log(err)
        const { filename, line, messageText } = err
        this.errors.push({
            filename,
            message: messageText,
            line,
        })
    }
    getSpecs(): jdspec.ServiceSpec[] {
        return this.specs
    }
    verifyBytecode(buf: Uint8Array, dbg?: DeviceScriptDebugInfo): void {}
}

let serviceSpecs: jdspec.ServiceSpec[]

const DEVICESCRIPT_PREFIX = 'import * as ds from "@devicescript/core"'
const handlers: { [index: string]: (props: any) => object | Promise<object> } =
    {
        compile: async (props: DeviceScriptCompileRequest) => {
            let { source = "" } = props
            if (!serviceSpecs) throw new Error("specs missing")

            if (source.indexOf(DEVICESCRIPT_PREFIX) < 0) {
                source = DEVICESCRIPT_PREFIX + "\n\n" + source
            }
            const host = new WorkerHost(serviceSpecs)
            const res = compile(source, { host })
            return <Partial<DeviceScriptCompileResponse>>{
                ...res,
                files: host.files,
                logs: host.logs,
                errors: host.errors,
            }
        },
        specs: async (props: DeviceScriptSpecsRequest) => {
            serviceSpecs = props.serviceSpecs
            return {}
        },
    }

function processMessage(message: DeviceScriptRequest): any {
    try {
        const handler = handlers[message.type]
        return handler?.(message)
    } catch (e) {
        console.debug(e)
        return undefined
    }
}

async function handleMessage(event: MessageEvent) {
    const message: DeviceScriptRequest = event.data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, worker, type, ...rest } = message
    if (worker !== "devicescript") return

    try {
        const result = await processMessage(message)
        if (result) {
            const resp = { id, worker, ...rest, ...result }
            self.postMessage(resp)
        }
    } catch (e) {
        console.debug(`devicescript: error ${e + ""}`, e)
        self.postMessage({
            id,
            type,
            worker,
            error: e + "",
        })
    }
}

self.addEventListener("message", handleMessage)
console.debug(`devicescript: worker registered`)
