/* eslint-disable @typescript-eslint/ban-types */
import { arrange, desc, tidy } from "@tidyjs/tidy"
import { WorkerMessage } from "./message"

export interface DataMessage extends WorkerMessage {
    jacdacdata: true
    type: "arrange"
    data: object[]
}

export interface ArrangeMessage extends DataMessage {
    type: "arrange"
    column: string
    descending: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers: { [index: string]: (props: any) => object[] } = {
    arrange: (props: ArrangeMessage) => {
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
    const { data: message } = event
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { jacdacdata, data, ...rest } = message
    if (!jacdacdata) return

    const newData = await transformData(message as DataMessage)
    const resp = { jacdacdata: true, ...rest, data: newData }
    self.postMessage(resp)
}

self.addEventListener("message", handleMessage)
console.debug(`jacdac data: worker registered`)
