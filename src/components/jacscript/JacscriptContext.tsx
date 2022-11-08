import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import useEffectAsync from "../useEffectAsync"
import { jacscriptCompile } from "../blockly/dsl/workers/jacscript.proxy"
import type { JacscriptCompileResponse } from "../../workers/jacscript/jacscript-worker"
import { startJacscriptVM } from "../blockly/dsl/workers/vm.proxy"
import { DISCONNECT } from "../../../jacdac-ts/src/jdom/constants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useWindowEvent from "../hooks/useWindowEvent"
import { JSONTryParse } from "../../../jacdac-ts/src/jdom/utils"

export interface JacscriptProps {
    source?: string
    setSource: (program: string) => void
    compiled?: JacscriptCompileResponse
    clientSpecs?: jdspec.ServiceSpec[]
    manager?: JDService
    setManager: (manager: JDService) => void
    acquireVm: () => () => void
}

export const JacscriptContext = createContext<JacscriptProps>({
    source: undefined,
    setSource: () => {},
    compiled: undefined,
    clientSpecs: undefined,
    manager: undefined,
    setManager: () => {},
    acquireVm: () => () => {},
})
JacscriptContext.displayName = "Jacscript"

export function JacscriptProvider(props: { children: ReactNode }) {
    const { children } = props
    const [source, setSource_] = useState<string>(undefined)
    const [compiled, setCompiled] = useState<JacscriptCompileResponse>()
    const [clientSpecs, setClientSpecs] = useState<jdspec.ServiceSpec[]>()
    const [manager, setManager] = useState<JDService>(undefined)
    const [vmUsed, setVmUsed] = useState(0)
    const vmCleanup = useRef<() => void>(undefined)

    const acquireVm = () => {
        setVmUsed(x => x + 1)
        return () => setVmUsed(x => x - 1)
    }

    // launch worker
    useEffect(() => {
        if (vmUsed > 0 && !vmCleanup.current)
            vmCleanup.current = startJacscriptVM()
        else if (vmUsed <= 0 && vmCleanup.current) {
            const cleanup = vmCleanup.current
            vmCleanup.current = undefined
            cleanup()
        }
    }, [vmUsed])
    // unbind manager service if disconnected
    useEffect(
        () =>
            manager?.device?.subscribe(DISCONNECT, () => setManager(undefined)),
        [manager]
    )
    // if program changes, recompile
    useEffectAsync(
        async mounted => {
            const res = source && (await jacscriptCompile(source))
            if (mounted()) {
                setCompiled(res)
            }
        },
        [source]
    )
    // if compiled changes, recompile
    useEffect(() => {
        if (
            JSON.stringify(clientSpecs) !==
            JSON.stringify(compiled?.clientSpecs)
        )
            setClientSpecs(compiled?.clientSpecs)
    }, [compiled])

    const setSource = (newSource: string) => {
        if (source !== newSource) setSource_(newSource)
    }

    useWindowEvent("message", (msg: MessageEvent) => {
        const data = msg.data
        if (data && typeof data === "string") {
            const mdata = JSONTryParse(data) as any
            if (
                mdata &&
                mdata.channel === "jacscript" &&
                mdata.type === "source"
            ) {
                const source = mdata.source
                setSource(source)
                if (!vmUsed) acquireVm()
            }
        }
    })

    return (
        <JacscriptContext.Provider
            value={{
                source,
                setSource,
                compiled,
                clientSpecs,
                manager,
                setManager,
                acquireVm,
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
            setSource: () => {},
            setManager: () => {},
            acquireVm: () => () => {},
        }
    )
}
