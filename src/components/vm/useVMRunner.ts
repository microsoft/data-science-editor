import { useContext, useEffect, useState } from "react"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { IT4Program } from "../../../jacdac-ts/src/vm/ir"
import {
    IT4ProgramRunner,
    TraceContext,
} from "../../../jacdac-ts/src/vm/vmrunner"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import AppContext from "../AppContext"
import { ERROR, TRACE } from "../../../jacdac-ts/src/jdom/constants"

export default function useVMRunner(program: IT4Program) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { setError } = useContext(AppContext)
    const [testRunner, setTestRunner] = useState<IT4ProgramRunner>()

    // create runner
    useEffect(() => {
        const runner = program && new IT4ProgramRunner(program, bus)
        setTestRunner(runner)
    }, [program])

    // errors
    useEffect(() => testRunner?.subscribe(ERROR, e => setError(e)))
    // traces
    const handleTrace = (value: { message: string; context: TraceContext }) => {
        const { message, context } = value
        console.debug(`vm> ${message}`, context)
    }
    useEffect(() =>
        testRunner?.subscribe<{ message: string; context: TraceContext }>(
            TRACE,
            handleTrace
        )
    )

    return {
        runner: testRunner,
    }
}
