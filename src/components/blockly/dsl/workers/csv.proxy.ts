import workerProxy from "./proxy"
import {
    CsvRequest,
    CsvFile,
    CsvResponse,
} from "../../../../workers/csv/dist/node_modules/csv.worker"

export default async function downloadCSV(url: string): Promise<CsvFile> {
    console.log(`download csv`, { url })
    const worker = workerProxy("csv")
    const res = await worker.postMessage<CsvRequest, CsvResponse>({
        worker: "csv",
        url,
    })
    console.log(`downloaded csv`, res)
    return res?.file
}
