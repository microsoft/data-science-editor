/* eslint-disable @typescript-eslint/ban-types */
import { arrange, desc, tidy } from "@tidyjs/tidy"
import { WorkerMessage } from "./message"

export interface DataMessage extends WorkerMessage {
    worker: "data"
    type: "arrange"
    data: object[]
}

export interface DataArrangeMessage extends DataMessage {
    worker: "data"
    type: "arrange"
    column: string
    descending: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers: { [index: string]: (props: any) => object[] } = {
    arrange: (props: DataArrangeMessage) => {
        const { column, descending, data } = props
        return tidy(data, arrange(descending ? desc(column) : column))
    },
}

function transformData(message: DataMessage): object[] {
    try {
        const handler = handlers[message.type]
        return handler?.(message)
    } catch (e) {
        console.debug(e)
        return undefined
    }
}

async function handleMessage(event: MessageEvent) {
    const message: DataMessage = event.data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { worker, data, ...rest } = message
    if (worker !== "data") return

    const newData = await transformData(message)
    const resp = { jacdacdata: true, ...rest, data: newData }
    self.postMessage(resp)
}

self.addEventListener("message", handleMessage)
console.debug(`jacdac data: worker registered`)
