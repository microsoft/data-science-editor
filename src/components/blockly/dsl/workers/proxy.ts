/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { assert, SMap } from "../../../../../jacdac-ts/src/jdom/utils"
import createCsvWorker from "../../../../workers/csv/workerloader"
import createDataWorker from "../../../../workers/data/workerloader"
import createVMWorker from "../../../../workers/vm/workerloader"

export type VMType = "data" | "csv" | "vm"

export interface WorkerMessage {
    worker: VMType
    id?: string
}

export class WorkerProxy {
    readonly pendings: SMap<{
        resolve: (res: any) => void
        reject: (err: any) => void
    }> = {}
    constructor(readonly worker: Worker, readonly workerid: VMType) {
        this.worker.addEventListener("message", this.handleMessage.bind(this))
    }

    private handleMessage(event: MessageEvent) {
        const { data: message } = event
        const { id, worker } = message
        const pending = this.pendings[id]
        if (pending) {
            assert(worker === message.worker)
            pending.resolve(message)
        }
    }

    postMessage<T, R>(message: WorkerMessage & T): Promise<R> {
        message.id = message.id || Math.random() + ""
        message.worker = this.workerid
        return new Promise<R>((resolve, reject) => {
            this.pendings[message.id] = { resolve, reject }
            this.worker.postMessage(message)
        })
    }
}

const _workers: SMap<WorkerProxy> = {}
const loaders = {
    data: createDataWorker,
    csv: createCsvWorker,
    vm: createVMWorker,
}
export default function workerProxy(workerid: VMType) {
    const worker =
        _workers[workerid] ||
        (_workers[workerid] = new WorkerProxy(loaders[workerid](), workerid))
    return worker
}
