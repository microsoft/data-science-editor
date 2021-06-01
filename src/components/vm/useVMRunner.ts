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
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { RoleManager } from "../../../jacdac-ts/src/vm/rolemanager"

export default function useVMRunner(
    roleManager: RoleManager,
    program: IT4Program
) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { setError } = useContext(AppContext)
    const [testRunner, setTestRunner] = useState<IT4ProgramRunner>()

    // create runner
    useEffect(() => {
        try {
            const newTestRunner =
                program && new IT4ProgramRunner(bus, roleManager, program)
            setTestRunner(newTestRunner)

            return () => newTestRunner?.unmount()
        } catch (e) {
            setTestRunner(undefined)
        }
    }, [roleManager, program])

    // errors
    useEffect(
        () => testRunner?.subscribe(ERROR, e => setError(e)),
        [testRunner]
    )
    // traces
    const handleTrace = (value: { message: string; context: TraceContext }) => {
        const { message, context } = value
        if (Flags.diagnostics) console.debug(`vm> ${message}`, context)
    }
    useEffect(
        () =>
            testRunner?.subscribe<{ message: string; context: TraceContext }>(
                TRACE,
                handleTrace
            ),
        [testRunner]
    )

    return testRunner
}
