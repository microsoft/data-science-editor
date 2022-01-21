import type { VMCompileRequest, VMCompileResponse } from "../../../../workers/vm/dist/node_modules/vm.worker"
import workerProxy from "./proxy"

export async function jscCompile(
    source: string
    // eslint-disable-next-line @typescript-eslint/ban-types
): Promise<VMCompileResponse> {
    const worker = workerProxy("vm")
    console.log("vm: compile", { source })
    const res = await worker.postMessage<VMCompileRequest, VMCompileResponse>({
        worker: "vm",
        type: "compile",
        source,
    })
    console.log("vm: compiled", { ...res })
    return res
}
