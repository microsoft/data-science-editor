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
    program: IT4Program,
    autoStart: boolean
) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { setError } = useContext(AppContext)
    const [runner, setRunner] = useState<IT4ProgramRunner>()
    const [_autoStart, _setAutoStart] = useState<boolean>(!!autoStart)

    const run = () => {
        _setAutoStart(!!autoStart)
        runner.start()
    }
    const cancel = () => {
        _setAutoStart(false)
        runner.cancel()
    }

    // auto start
    useEffect(() => {
        if (_autoStart && runner) runner.start()
        return () => runner?.cancel()
    }, [runner, _autoStart])

    // create runner
    useEffect(() => {
        try {
            const newTestRunner =
                program && new IT4ProgramRunner(bus, roleManager, program)
            setRunner(newTestRunner)

            return () => newTestRunner?.unmount()
        } catch (e) {
            setRunner(undefined)
        }
    }, [roleManager, program])

    // errors
    useEffect(() => runner?.subscribe(ERROR, e => setError(e)), [runner])
    // traces
    const handleTrace = (value: { message: string; context: TraceContext }) => {
        const { message, context } = value
        if (Flags.diagnostics) console.debug(`vm> ${message}`, context)
    }
    useEffect(
        () =>
            runner?.subscribe<{ message: string; context: TraceContext }>(
                TRACE,
                handleTrace
            ),
        [runner]
    )

    return { runner, run, cancel }
}
