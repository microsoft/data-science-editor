import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import useEffectAsync from "../useEffectAsync"
import { deviceScriptCompile } from "../blockly/dsl/workers/devicescript.proxy"
import type { DeviceScriptCompileResponse } from "../../workers/devicescript/devicescript-worker"
import {
    DEVICE_ANNOUNCE,
    DISCONNECT,
    SRV_DEVICE_SCRIPT_MANAGER,
    SRV_ROLE_MANAGER,
} from "../../../jacdac-ts/src/jdom/constants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useWindowEvent from "../hooks/useWindowEvent"
import { fromHex, JSONTryParse } from "../../../jacdac-ts/src/jdom/utils"
import DeviceScriptVMLoader from "./DeviceScriptVMLoader"
import Suspense from "../ui/Suspense"
import { UIFlags } from "../../jacdac/providerbus"
import { useDebounce } from "use-debounce"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useBus from "../../jacdac/useBus"

export interface DeviceScriptProps {
    source?: string
    setSource: (program: string) => void
    bytecode?: Uint8Array
    compilePending?: boolean
    compiled?: DeviceScriptCompileResponse
    clientSpecs?: jdspec.ServiceSpec[]
    manager?: JDService
    setManager: (manager: JDService) => void
    acquireVm: () => () => void
}

export const DeviceScriptContext = createContext<DeviceScriptProps>({
    source: undefined,
    setSource: () => {},
    compiled: undefined,
    clientSpecs: undefined,
    manager: undefined,
    setManager: () => {},
    acquireVm: () => () => {},
})
DeviceScriptContext.displayName = "DeviceScript"

export function DeviceScriptProvider(props: { children: ReactNode }) {
    const { children } = props
    const bus = useBus()
    const [source, setSource_] = useState<string>(undefined)
    const [compilePending, setCompilePending] = useState(false)
    const [bytecode, setBytecode] = useState<Uint8Array>(undefined)
    const [compiled, setCompiled] = useState<DeviceScriptCompileResponse>()
    const [manager, setManager] = useState<JDService>(undefined)
    const [vmUsed, setVmUsed] = useState(0)
    const devicescriptvm = !!UIFlags.devicescriptvm
    const [debouncedSource] = useDebounce(source, 1000)

    // keep track of source without re-render
    const lastSource = useRef(source)
    lastSource.current = source

    const acquireVm = () => {
        setVmUsed(x => x + 1)
        return () => setVmUsed(x => x - 1)
    }

    useEffect(() => {
        const roleManager = manager?.device?.services({
            serviceClass: SRV_ROLE_MANAGER,
        })?.[0]
        bus.setRoleManagerService(roleManager)
    }, [bus, manager])

    // automatically bind to first jacscript manager when a device comes online
    useEffect(
        () =>
            bus?.subscribe(DEVICE_ANNOUNCE, (device: JDDevice) => {
                if (!manager) {
                    const service = device.services({
                        serviceClass: SRV_DEVICE_SCRIPT_MANAGER,
                    })?.[0]
                    setManager(service)
                }
            }),
        [bus, manager]
    )

    // unbind manager service if disconnected
    useEffect(
        () =>
            manager?.device?.subscribe(DISCONNECT, () => setManager(undefined)),
        [manager]
    )

    // if program changes, recompile
    useEffectAsync(async () => {
        if (debouncedSource !== undefined) {
            const res = debouncedSource?.trim()
                ? await deviceScriptCompile(debouncedSource)
                : undefined
            setCompiled(res)
            setBytecode(res?.binary)
        }
        setCompilePending(false)
    }, [debouncedSource])

    const setSource = (newSource: string) => {
        if (source !== newSource) {
            setSource_(newSource)
            setCompiled(undefined)
            setBytecode(undefined)
            setCompilePending(true)
        }
    }

    useWindowEvent(
        "message",
        (msg: MessageEvent) => {
            const data = msg.data
            const mdata = typeof data === "string" ? JSONTryParse(data) : data
            if (mdata?.channel !== "devicescript") return
            if (mdata.type === "source") {
                const msgSource: string = mdata.source
                const force = mdata.force
                if (
                    msgSource !== undefined &&
                    (force || lastSource.current !== msgSource)
                ) {
                    setSource(msgSource)
                    if (!vmUsed) acquireVm()
                }
            } else if (mdata.type === "bytecode") {
                const msgBytecode: string = mdata.bytecode
                if (msgBytecode !== undefined) {
                    const bc = fromHex(msgBytecode)
                    console.log({ bytecode: msgBytecode })
                    setSource_(undefined)
                    setCompiled(undefined)
                    setBytecode(bc)
                    setCompilePending(false)
                    if (!vmUsed) acquireVm()
                }
            }
        },
        false,
        [vmUsed]
    )

    return (
        <DeviceScriptContext.Provider
            value={{
                source,
                setSource,
                bytecode,
                compilePending,
                compiled,
                manager,
                setManager,
                acquireVm,
            }}
        >
            {children}
            {!!(devicescriptvm || vmUsed) && (
                <Suspense>
                    <DeviceScriptVMLoader />
                </Suspense>
            )}
        </DeviceScriptContext.Provider>
    )
}

export default function useDeviceScript(): DeviceScriptProps {
    const res = useContext<DeviceScriptProps>(DeviceScriptContext)
    return (
        res || {
            setSource: () => {},
            setManager: () => {},
            acquireVm: () => () => {},
        }
    )
}
