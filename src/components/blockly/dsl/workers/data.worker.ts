/* eslint-disable @typescript-eslint/ban-types */
import { arrange, desc, tidy } from "@tidyjs/tidy"
import Papa from "papaparse"
import { SMap } from "../../../../../jacdac-ts/src/jdom/utils"

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

export async function postTransformData(
    message: DataMessage
): Promise<object[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try {
        const { data } = message
        if (!data) return undefined
        const handler = handlers[message.type]
        return handler?.(message)
    } catch (e) {
        console.debug(e)
    }
}

export interface CsvFile {
    data?: object[]
    errors?: {
        type: string // A generalization of the error
        code: string // Standardized error code
        message: string // Human-readable details
        row: number // Row index of parsed data where error is
    }[]
}

const cachedCSVs: SMap<CsvFile> = {}
export function postLoadCSV(url: string): Promise<CsvFile> {
    const cached = cachedCSVs[url]
    if (cached) return Promise.resolve(cached)

    return new Promise<CsvFile>(resolve => {
        Papa.parse(url, {
            download: true,
            header: true,
            dynamicTyping: true,
            transformHeader: (h: string) => h.trim().toLocaleLowerCase(),
            complete: (r: CsvFile) => resolve(r),
        })
    }).then(r => {
        cachedCSVs[url] = r
        return r
    })
}
