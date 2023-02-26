/* eslint-disable @typescript-eslint/ban-types */
import Papa from "papaparse"

export interface CsvMessage {
    worker: "csv"
    id?: string
    type: string
}

export interface CsvRequest extends CsvMessage {
    type: string
}

export interface CsvDownloadRequest extends CsvRequest {
    url: string
    type: "download"
}

export interface CsvFileRequest extends CsvRequest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fileHandle: any /* FileSystemFileHandle */
}

export interface CsvSaveRequest extends CsvFileRequest {
    type: "save"
    data: object[]
}

export interface CsvUnparseRequest extends CsvRequest {
    type: "unparse"
    data: object[]
}

export interface CsvUnparseResponse extends CsvMessage {
    text: string
}

export interface CsvParseRequest extends CsvRequest {
    type: "parse"
    source: string
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

export interface CsvFileResponse extends CsvMessage {
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
            skipEmptyLines: true,
            comments: "#",
            transformHeader: (h: string) => h.trim().toLocaleLowerCase(),
            complete: (r: CsvFile) => resolve(r),
        })
    }).then(r => {
        cachedCSVs[url] = r
        return r
    })
}

const handlers: { [index: string]: (msg: CsvRequest) => Promise<object> } = {
    download: async (msg: CsvDownloadRequest) => {
        const { url } = msg
        const file = await downloadCSV(url)
        return { file }
    },
    save: async (msg: CsvSaveRequest) => {
        const { fileHandle, data } = msg

        // convert to CSV
        const contents = Papa.unparse(data)
        // Create a FileSystemWritableFileStream to write to.
        const writable = await fileHandle.createWritable()
        // Write the contents of the file to the stream.
        await writable.write(contents)
        // Close the file and write the contents to disk.
        await writable.close()

        return {}
    },
    parse: async (msg: CsvParseRequest) => {
        const { source } = msg

        return new Promise<{ file: CsvFile }>(resolve => {
            Papa.parse(source, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                comments: "#",
                transformHeader: (h: string) =>
                    h
                        .trim()
                        .replace(/[.]/g, "")
                        .replace(/(-|_)/g, " ")
                        .toLocaleLowerCase(),
                complete: (r: CsvFile) => {
                    // convert booleans to 0,1
                    if (r.data)
                        r.data.forEach(row =>
                            Object.keys(row).forEach(k => {
                                const v = row[k]
                                if (typeof v === "boolean") row[k] = v ? 1 : 0
                            })
                        )
                    resolve({ file: r })
                },
            })
        })
    },
    unparse: async (msg: CsvUnparseRequest) => {
        const { data } = msg
        const text = Papa.unparse(data)
        return { text }
    },
}

async function handleMessage(event: MessageEvent) {
    const message: CsvRequest = event.data
    const { id, worker, type } = message
    if (worker !== "csv") return

    try {
        const handler = handlers[type]
        const resp = await handler(message)
        self.postMessage({
            id,
            worker,
            ...resp,
        })
    } catch (e) {
        self.postMessage({
            id,
            worker,
            error: e + "",
        })
    }
}

self.addEventListener("message", handleMessage)
console.debug(`csv: worker registered`)
