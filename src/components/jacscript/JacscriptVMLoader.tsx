import { useEffect } from "react"
import { startJacscriptVM } from "../blockly/dsl/workers/vm.proxy"

export default function JacscriptVMLoader() {
    useEffect(() => startJacscriptVM(), [])

    return null
}
