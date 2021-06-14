import { DataMessage } from "../../../../workers/dist/node_modules/data.worker"
import workerProxy from "./proxy"

export default async function postTransformData(
    message: DataMessage
    // eslint-disable-next-line @typescript-eslint/ban-types
): Promise<object[]> {
    // check for missing data
    if (!message.data) return undefined
    const ws = workerProxy()
    message.jacdacdata = true
    const res = await ws.postMessage<DataMessage, DataMessage>(message)
    return res?.data
}
