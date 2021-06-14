/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { SMap } from "../../../../../jacdac-ts/src/jdom/utils"
import createWorker from "./workerloader"

export class WorkerProxy {
    readonly pendings: SMap<{
        resolve: (res: any) => void
        reject: (err: any) => void
    }> = {}
    constructor(readonly worker: Worker) {
        this.worker.addEventListener("message", this.handleMessage.bind(this))
    }

    private handleMessage(event: MessageEvent) {
        const { data: message } = event
        const { id } = message
        const pending = this.pendings[id]
        if (pending) pending.resolve(message)
    }

    postMessage<T, R>(message: { id?: string } & T): Promise<R> {
        message.id = message.id || Math.random() + ""
        return new Promise<R>((resolve, reject) => {
            this.pendings[message.id] = { resolve, reject }
            this.worker.postMessage(message)
        })
    }
}

let _worker: WorkerProxy
export default function workerProxy() {
    if (!_worker) _worker = new WorkerProxy(createWorker())
    return _worker
}
