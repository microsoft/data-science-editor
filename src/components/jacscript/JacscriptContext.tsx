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
import { DISCONNECT } from "../../../jacdac-ts/src/jdom/constants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useWindowEvent from "../hooks/useWindowEvent"
import { JSONTryParse } from "../../../jacdac-ts/src/jdom/utils"
import JacscriptVMLoader from "./JacscriptVMLoader"
import Suspense from "../ui/Suspense"
import { UIFlags } from "../../jacdac/providerbus"
import { useDebounce } from "use-debounce"

export interface JacscriptProps {
    source?: string
    setSource: (program: string) => void
    compilePending?: boolean
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
    const [compilePending, setCompilePending] = useState(false)
    const [compiled, setCompiled] = useState<JacscriptCompileResponse>()
    const [manager, setManager] = useState<JDService>(undefined)
    const [vmUsed, setVmUsed] = useState(0)
    const jacscript = !!UIFlags.jacscriptvm
    const [debouncedSource] = useDebounce(source, 1000)

    // keep track of source without re-render
    const lastSource = useRef(source)
    lastSource.current = source

    const acquireVm = () => {
        setVmUsed(x => x + 1)
        return () => setVmUsed(x => x - 1)
    }

    // unbind manager service if disconnected
    useEffect(
        () =>
            manager?.device?.subscribe(DISCONNECT, () => setManager(undefined)),
        [manager]
    )
    // if program changes, recompile
    useEffectAsync(async () => {
        const res = debouncedSource?.trim()
            ? await jacscriptCompile(debouncedSource)
            : undefined
        setCompiled(res)
        setCompilePending(false)
    }, [debouncedSource])

    const setSource = (newSource: string) => {
        if (source !== newSource) {
            setSource_(newSource)
            setCompiled(undefined)
            setCompilePending(true)
        }
    }

    useWindowEvent(
        "message",
        (msg: MessageEvent) => {
            const data = msg.data
            if (data && typeof data === "string") {
                const mdata = JSONTryParse(data) as any
                if (
                    mdata &&
                    mdata.channel === "jacscript" &&
                    mdata.type === "source"
                ) {
                    const msgSource = mdata.source
                    const force = mdata.force
                    if (force || lastSource.current !== msgSource) {
                        setSource(msgSource)
                        if (!vmUsed) acquireVm()
                    }
                }
            }
        },
        false,
        [vmUsed]
    )

    return (
        <JacscriptContext.Provider
            value={{
                source,
                setSource,
                compilePending,
                compiled,
                manager,
                setManager,
                acquireVm,
            }}
        >
            {children}
            {!!(jacscript || vmUsed) && (
                <Suspense>
                    <JacscriptVMLoader />
                </Suspense>
            )}
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
