import { serviceSpecifications } from "../../../../../jacdac-ts/src/jdom/spec"
import type {
    JacscriptCompileRequest,
    JacscriptCompileResponse,
    JacscriptSpecsRequest,
} from "../../../../workers/jacscript/jacscript-worker"
import workerProxy from "./proxy"

let specsSent = false

/**
 * Compiles the sources and keeps the compiled program ready to run. Can be done while running another program.
 * @param source
 * @returns
 */
export async function jacscriptCompile(
    source: string
    // eslint-disable-next-line @typescript-eslint/ban-types
): Promise<JacscriptCompileResponse> {
    const worker = workerProxy("jacscript")
    if (!specsSent) {
        await worker.postMessage<JacscriptSpecsRequest, {}>({
            worker: "jacscript",
            type: "specs",
            serviceSpecs: serviceSpecifications(),
        })
        specsSent = true
    }
    const res = await worker.postMessage<
        JacscriptCompileRequest,
        JacscriptCompileResponse
    >({
        worker: "jacscript",
        type: "compile",
        source,
    })
    return res
}
