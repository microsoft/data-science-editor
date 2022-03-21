import type {
    JacscriptCompileRequest,
    JacscriptCompileResponse,
} from "../../../../workers/jacscript/dist/node_modules/jacscript.worker"
import workerProxy from "./proxy"

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
