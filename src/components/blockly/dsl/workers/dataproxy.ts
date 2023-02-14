import type {
    DataRequest,
    DataMessage,
} from "../../../../workers/data/dist/node_modules/data-worker"
import workerProxy from "./proxy"

export async function postTransformData(
    message: DataRequest
): Promise<object[]> {
    if (!message.data) return undefined
    const worker = workerProxy("data")
    const res = await worker.postMessage<DataRequest, DataMessage>(message)
    return res?.data
}
