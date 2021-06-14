/* eslint-disable @typescript-eslint/ban-types */
import Papa from "papaparse"
import { WorkerMessage } from "./message"

export interface CsvMessage extends WorkerMessage {
    worker: "csv"
    url: string
}

export interface CsvFile {
    url: string
    data?: object[]
    errors?: {
        type: string // A generalization of the error
        code: string // Standardized error code
        message: string // Human-readable details
        row: number // Row index of parsed data where error is
    }[]
}

export interface CsvResponse extends WorkerMessage {
    worker: "csv"
    file: CsvFile
}

const cachedCSVs: { [index: string]: CsvFile } = {}
function downloadCSV(url: string): Promise<CsvFile> {
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

async function handleMessage(event: MessageEvent) {
    const message: CsvMessage = event.data
    const { worker, url } = message
    if (worker !== "csv") return
    const file = await downloadCSV(url)
    self.postMessage({
        id: message.id,
        worker: "csv",
        file,
    })
}

self.addEventListener("message", handleMessage)
console.debug(`jacdac csv: worker registered`)
