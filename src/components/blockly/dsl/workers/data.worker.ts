/* eslint-disable @typescript-eslint/ban-types */
import { arrange, desc, tidy } from "@tidyjs/tidy"

export interface DataMessage {
    id?: string // added for worker comms
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

export async function transformData(message: DataMessage): Promise<object[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    try {
        // TODO move to web worker
        const handler = handlers[message.type]
        return handler?.(message)
    } catch (e) {
        console.debug(e)
    }
}
