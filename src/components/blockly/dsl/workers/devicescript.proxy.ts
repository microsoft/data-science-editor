import { serviceSpecifications } from "../../../../../jacdac-ts/src/jdom/spec"
import type {
    DeviceScriptCompileRequest,
    DeviceScriptCompileResponse,
    DeviceScriptSpecsRequest,
} from "../../../../workers/devicescript/devicescript-worker"
import workerProxy from "./proxy"

let specsSent = false

/**
 * Compiles the sources and keeps the compiled program ready to run. Can be done while running another program.
 * @param source
 * @returns
 */
export async function deviceScriptCompile(
    source: string
    // eslint-disable-next-line @typescript-eslint/ban-types
): Promise<DeviceScriptCompileResponse> {
    const worker = workerProxy("devicescript")
    if (!specsSent) {
        await worker.postMessage<DeviceScriptSpecsRequest, {}>({
            worker: "devicescript",
            type: "specs",
            serviceSpecs: serviceSpecifications(),
        })
        specsSent = true
    }
    const res = await worker.postMessage<
        DeviceScriptCompileRequest,
        DeviceScriptCompileResponse
    >({
        worker: "devicescript",
        type: "compile",
        source,
    })
    return res
}
