import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react"
import { JacscriptProgram } from "../../../jacdac-ts/src/vm/ir2jacscript"
import useEffectAsync from "../useEffectAsync"
import { jacscriptCompile } from "../blockly/dsl/workers/jacscript.proxy"
import type { JacscriptCompileResponse } from "../../workers/jacscript/jacscript-worker"
import { mountJacscriptBridge } from "../blockly/dsl/workers/vm.proxy"

export interface JacscriptProps {
    program?: JacscriptProgram
    setProgram: (program: JacscriptProgram) => void
    compiled?: JacscriptCompileResponse
    clientSpecs?: jdspec.ServiceSpec[]
}

export const JacscriptContext = createContext<JacscriptProps>({
    program: undefined,
    setProgram: () => {},
    compiled: undefined,
    clientSpecs: undefined,
})
JacscriptContext.displayName = "Jacscript"

export function JacscriptProvider(props: { children: ReactNode }) {
    const { children } = props
    const [program, setProgram_] = useState<JacscriptProgram>()
    const [compiled, setCompiled] = useState<JacscriptCompileResponse>()
    const [clientSpecs, setClientSpecs] = useState<jdspec.ServiceSpec[]>()

    useEffect(() => mountJacscriptBridge(), [])
    // if program changes, recompile
    useEffectAsync(
        async mounted => {
            const src = program?.program.join("\n")
            const res = src && (await jacscriptCompile(src))
            if (mounted()) setCompiled(res)
        },
        [program]
    )
    // if compiled changes, recompile
    useEffect(() => {
        if (
            JSON.stringify(clientSpecs) !==
            JSON.stringify(compiled?.clientSpecs)
        )
            setClientSpecs(compiled?.clientSpecs)
    }, [compiled])
    const setProgram = (newProgram: JacscriptProgram) => {
        if (JSON.stringify(program) !== JSON.stringify(newProgram))
            setProgram_(newProgram)
    }

    return (
        <JacscriptContext.Provider
            value={{
                program,
                setProgram,
                compiled,
                clientSpecs,
            }}
        >
            {children}
        </JacscriptContext.Provider>
    )
}

export default function useJacscript(): JacscriptProps {
    const res = useContext<JacscriptProps>(JacscriptContext)
    return (
        res || {
            setProgram: () => {},
        }
    )
}
