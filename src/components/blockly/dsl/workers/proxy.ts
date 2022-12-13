/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { MESSAGE } from "../../../../../jacdac-ts/src/jdom/constants"
import { JDEventSource } from "../../../../../jacdac-ts/src/jdom/eventsource"
import { assert, SMap } from "../../../../../jacdac-ts/src/jdom/utils"
import createCsvWorker from "../../../../workers/csv/workerloader"
import createDataWorker from "../../../../workers/data/workerloader"
import createVMWorker from "../../../../workers/vm/workerloader"
import createDeviceScriptWorker from "../../../../workers/devicescript/workerloader"
import createCadWorker from "../../../../workers/cad/workerloader"

export type VMType = "data" | "csv" | "vm" | "cad" | "devicescript"

export interface WorkerMessage {
    worker: VMType
    id?: string
}

export interface WorkerResponse {
    error?: string
}

export class WorkerProxy extends JDEventSource {
    readonly pendings: Record<
        string,
        {
            resolve: (res: any) => void
            reject: (err: any) => void
        }
    > = {}
    constructor(readonly worker: Worker, readonly workerid: VMType) {
        super()
        this.handleMessage = this.handleMessage.bind(this)
        this.worker.addEventListener("message", this.handleMessage)
    }

    unmount() {
        delete _workers[this.workerid]
        this.worker.removeEventListener("message", this.handleMessage)
        this.worker.terminate()
        //Object.values(this.pendings).forEach(({ reject }) =>
        //    reject(new Error("worker terminated"))
        //)
    }

    private handleMessage(event: MessageEvent) {
        const { data: message } = event
        const { id, worker } = message
        const pending = id && this.pendings[id]
        if (pending) {
            assert(worker === message.worker)
            if (message.error)
                console.debug(
                    `${this.workerid}: error: ${message.error}`,
                    message
                )
            pending.resolve(message)
        } else {
            this.emit(MESSAGE, event.data)
        }
    }

    postMessage<T, R>(message: WorkerMessage & T): Promise<WorkerResponse & R> {
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
    cad: createCadWorker,
    devicescript: createDeviceScriptWorker,
}
export default function workerProxy(workerid: VMType) {
    const worker =
        _workers[workerid] ||
        (_workers[workerid] = new WorkerProxy(loaders[workerid](), workerid))
    return worker
}
