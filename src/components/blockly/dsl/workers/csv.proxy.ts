/* eslint-disable @typescript-eslint/ban-types */
import workerProxy from "./proxy"
import {
    CsvDownloadRequest,
    CsvSaveRequest,
    CsvParseRequest,
    CsvFile,
    CsvFileResponse,
    CsvUnparseRequest,
    CsvUnparseResponse,
    CsvMessage,
} from "../../../../workers/csv/dist/node_modules/csv.worker"

export async function downloadCSV(url: string): Promise<CsvFile> {
    const worker = workerProxy("csv")
    const res = await worker.postMessage<CsvDownloadRequest, CsvFileResponse>({
        worker: "csv",
        type: "download",
        url,
    })
    return res?.file
}

export async function saveCSV(
    fileHandle: FileSystemFileHandle,
    data: object[]
): Promise<void> {
    const worker = workerProxy("csv")
    await worker.postMessage<CsvSaveRequest, CsvMessage>({
        worker: "csv",
        type: "save",
        fileHandle,
        data,
    })
}

export async function unparseCSV(data: object[]): Promise<string> {
    const worker = workerProxy("csv")
    const resp = await worker.postMessage<
        CsvUnparseRequest,
        CsvUnparseResponse
    >({
        worker: "csv",
        type: "unparse",
        data,
    })
    return resp?.text
}

export async function parseCSV(source: string): Promise<CsvFile> {
    const worker = workerProxy("csv")
    const resp = await worker.postMessage<CsvParseRequest, CsvFileResponse>({
        worker: "csv",
        type: "parse",
        source,
    })
    return resp?.file
}
