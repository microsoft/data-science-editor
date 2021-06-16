import { VMRequest } from "../../../../workers/vm/dist/node_modules/vm.worker"
import workerProxy from "./proxy"

export default async function doSomethingVM(
    message: VMRequest
    // eslint-disable-next-line @typescript-eslint/ban-types
): Promise<any> {
    const worker = workerProxy("vm")
    return worker.postMessage(message)
}
