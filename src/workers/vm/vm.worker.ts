import { compile, JacError, Host } from "jacscript"

class WorkerHost implements Host {
    files: Record<string, Uint8Array | string> = {};
    logs = ''
    errors: JacError[] = []

    write(filename: string, contents: Uint8Array | string) {
        this.files[filename] = contents;
    }
    log(msg: string): void {
        this.logs += msg + '\n';
    }
    error(err: JacError) {
        this.errors.push(err);
    }
}

export interface VMError {
    line: number
    column: number
    message: string
    codeFragment: string
}

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

const handlers: { [index: string]: (props: any) => object } = {
    compile: (props: VMCompileRequest) => {
        const { source } = props
        const host = new WorkerHost();
        const res = compile(host, source);
        return {
            ...res,
            files: host.files,
            logs: host.logs,
            errors: host.errors
        }
    },
}

function processMessage(message: VMRequest): object {
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
        const resp = { id, worker, ...rest, ...result }
        self.postMessage(resp)
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
