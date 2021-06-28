import workerProxy from "./proxy"
import {
    CsvRequest,
    CsvFile,
    CsvResponse,
} from "../../../../workers/csv/dist/node_modules/csv.worker"

export default async function downloadCSV(url: string): Promise<CsvFile> {
    const worker = workerProxy("csv")
    const res = await worker.postMessage<CsvRequest, CsvResponse>({
        worker: "csv",
        url,
    })
    return res?.file
}
