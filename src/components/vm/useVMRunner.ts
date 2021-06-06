import { useContext, useEffect, useState } from "react"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { VMProgram } from "../../../jacdac-ts/src/vm/ir"
import {
    VMProgramRunner,
    VMTraceContext,
} from "../../../jacdac-ts/src/vm/runner"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import AppContext from "../AppContext"
import { ERROR, TRACE } from "../../../jacdac-ts/src/jdom/constants"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import RoleManager from "../../../jacdac-ts/src/servers/rolemanager"

export default function useVMRunner(
    roleManager: RoleManager,
    program: VMProgram,
    autoRun: boolean
) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { setError } = useContext(AppContext)
    const [runner, setRunner] = useState<VMProgramRunner>()
    const [_autoStart, _setAutoStart] = useState<boolean>(!!autoRun)

    const run = async () => {
        _setAutoStart(!!autoRun)
        await runner.startAsync()
    }
    const cancel = async () => {
        _setAutoStart(false)
        runner.cancel()
    }

    // auto start
    useEffect(() => {
        if (_autoStart && runner) runner.startAsync()
        return () => runner?.cancel()
    }, [runner, _autoStart])

    // create runner
    useEffect(() => {
        try {
            const newTestRunner =
                program && new VMProgramRunner(bus, roleManager, program)
            setRunner(newTestRunner)

            return () => newTestRunner?.unmount()
        } catch (e) {
            console.debug(e)
            setRunner(undefined)
        }
    }, [roleManager, program])

    // errors
    useEffect(() => runner?.subscribe(ERROR, e => setError(e)), [runner])
    // traces
    const handleTrace = (value: {
        message: string
        context: VMTraceContext
    }) => {
        const { message, context } = value
        if (Flags.diagnostics) console.debug(`vm> ${message}`, context)
    }
    useEffect(
        () =>
            runner?.subscribe<{ message: string; context: VMTraceContext }>(
                TRACE,
                handleTrace
            ),
        [runner]
    )

    return { runner, run, cancel }
}
