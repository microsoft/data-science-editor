import workerProxy from "./proxy"
import {
    CsvMessage,
    CsvFile,
    CsvResponse,
} from "../../../../workers/dist/node_modules/csv.worker"

export default async function downloadCSV(url: string): Promise<CsvFile> {
    console.log(`download csv`, { url })
    const ws = workerProxy()
    const res = await ws.postMessage<CsvMessage, CsvResponse>({
        worker: "csv",
        url,
    })
    console.log(`downloaded csv`, res)
    return res?.file
}
