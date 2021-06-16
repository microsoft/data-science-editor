/* eslint-disable @typescript-eslint/ban-types */
import { filter, select, arrange, desc, tidy } from "@tidyjs/tidy"

export interface DataMessage {
    worker: "data"
    id?: string
    data: object[]
}

export interface DataRequest extends DataMessage {
    type?: string
}

export interface DataArrangeRequest extends DataRequest {
    type: "arrange"
    column: string
    descending: boolean
}

export interface DataDropRequest extends DataRequest {
    type: "drop"
    columns: string[]
}

export interface DataFilterColumnsRequest extends DataRequest {
    type: "filter_columns"
    columns: string[]
    logic: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers: { [index: string]: (props: any) => object[] } = {
    arrange: (props: DataArrangeRequest) => {
        const { column, descending, data } = props
        return tidy(data, arrange(descending ? desc(column) : column))
    },
    drop: (props: DataDropRequest) => {
        const { columns, data } = props
        if (!columns) return data
        else return tidy(data, select(columns.map(column => `-${column}` ))) 
    },
    filter_columns: (props: DataFilterColumnsRequest) => {
        const { columns, logic, data } = props
        const [left, right] = columns
        if (!left || !right) return data

        switch(logic) {
            case "gt":
                return tidy(data, filter((d) => d[columns[0]] > d[columns[1]]));
                break;
            case "lt":
                return tidy(data, filter((d) => d[columns[0]] < d[columns[1]]));
                break;
            case "ge":
                return tidy(data, filter((d) => d[columns[0]] >= d[columns[1]]));
                break;
            case "le":
                return tidy(data, filter((d) => d[columns[0]] <= d[columns[1]]));
                break;            
            case "eq":
                return tidy(data, filter((d) => d[columns[0]] === d[columns[1]]));
                break;
            case "ne":
                return tidy(data, filter((d) => d[columns[0]] !== d[columns[1]]));
                break;             
            default:
                return data;
                break;
        } 
    },
}

function transformData(message: DataRequest): object[] {
    try {
        const handler = handlers[message.type]
        return handler?.(message)
    } catch (e) {
        console.debug(e)
        return undefined
    }
}

async function handleMessage(event: MessageEvent) {
    const message: DataRequest = event.data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { worker, data, ...rest } = message
    if (worker !== "data") return
    console.debug("Jacdac data in:", {message})
    const newData = await transformData(message)
    console.debug("Jacdac data out:", {message})
    const resp = { worker, ...rest, data: newData }
    self.postMessage(resp)
}

self.addEventListener("message", handleMessage)
console.debug(`jacdac data: worker registered`)
