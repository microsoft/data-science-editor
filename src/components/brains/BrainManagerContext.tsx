import { navigate } from "gatsby"
import React, {
    createContext,
    useEffect,
    useMemo,
    useState,
    useRef,
    lazy,
} from "react"
import { CLOSE } from "../../../jacdac-ts/src/jdom/constants"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"
import useLocalStorage, { getLocalStorageItem } from "../hooks/useLocalStorage"
import Suspense from "../ui/Suspense"
import useEffectAsync from "../useEffectAsync"
import { BrainManager, BrainScript } from "./braindom"
import WebSocketBridge from "./WebSocketBridge"
const CreateBrainScriptDialog = lazy(() => import("./CreateBrainScriptDialog"))

export interface BrainManagerProps {
    domain?: string
    setDomain: (domain: string) => void
    token?: string
    setToken: (token: string) => void
    brainManager: BrainManager
    scriptId?: string
    setScriptId: (id: string) => void
    createScript: (
        name: string,
        editor?: "js" | "blocks"
    ) => Promise<BrainScript>
    openScript: (id: string) => Promise<void>
    showNewScriptDialog: () => void
    deviceId?: string
    setDeviceId: (id: string) => void
    liveDeviceId?: string
    connectLiveDevice: (id: string) => Promise<void>
}

const defaultContextProps: BrainManagerProps = Object.freeze({
    setDomain: () => {},
    setToken: () => {},
    setScriptId: () => {},
    setDeviceId: () => {},
    connectLiveDevice: async () => {},
    createScript: async () => undefined,
    showNewScriptDialog: () => {},
    openScript: async () => {},
    brainManager: undefined,
})
const BrainManagerContext =
    createContext<BrainManagerProps>(defaultContextProps)
BrainManagerContext.displayName = "brains"

export default BrainManagerContext

const DOMAIN_KEY = "brain-manager-domain"
const TOKEN_KEY = "brain-manager-token"

export function isBrainManagerEnabled() {
    return !!getLocalStorageItem(TOKEN_KEY)
}

// eslint-disable-next-line react/prop-types
export const BrainManagerProvider = ({ children }) => {
    const bus = useBus()
    const [createScriptOpen, setCreateScriptOpen] = useState(false)
    const [domain, _setDomain] = useLocalStorage(
        DOMAIN_KEY,
        "https://jacdac-portal2.azurewebsites.net"
    )
    const [token, setToken] = useLocalStorage(TOKEN_KEY)
    const brainManager = useMemo(
        () =>
            token && domain ? new BrainManager(bus, domain, token) : undefined,
        [domain, token]
    )
    const [scriptId, setScriptId] = useState("")
    const [deviceId, setDeviceId] = useState("")
    const [liveDeviceId, setLiveDeviceId] = useState("")
    const bridgeRef = useRef<{
        deviceId: string
        bridge: WebSocketBridge
    }>()

    const handleCloseCreateScriptDialog = () => setCreateScriptOpen(false)
    const showNewScriptDialog = () => setCreateScriptOpen(true)

    const setDomain = (domain: string) => {
        _setDomain(domain?.replace(/\/$/, ""))
        setToken("")
    }

    const openScript = async (sid: string) => {
        const script = brainManager?.script(sid)
        if (!script) return
        const body = await script.refreshBody()
        if (!body) return

        // commit script and open
        setScriptId(script.scriptId)
        if (body.blocks !== undefined) navigate("/editors/jacscript-blocks/")
        else navigate("/editors/jacscript/")
    }

    const createScript = async (name: string, editor?: "js" | "blocks") => {
        const script = await brainManager?.createScript(
            name || `my device.${editor || "js"}`,
            editor
        )
        return script
    }

    // refresh selected device, scripts
    useChange(
        brainManager,
        (_: BrainManager) => {
            if (scriptId && !_?.script(scriptId)) setScriptId("")
            if (deviceId && !_?.device(deviceId)) setDeviceId("")
            if (liveDeviceId) {
                const ld = _?.device(liveDeviceId)
                if (!ld?.connected) setLiveDeviceId("")
            }
        },
        [scriptId, deviceId, liveDeviceId]
    )

    // first reload
    useEffectAsync(() => brainManager?.refresh(), [])

    const cleanupBridge = () => {
        const { bridge } = bridgeRef.current || {}
        if (bridge) {
            console.debug(`cleanup transport`)
            bridge.bus = undefined
            bridgeRef.current = undefined
        }
    }

    const connectLiveDevice = async (did: string) => {
        const dev = brainManager?.device(did)
        if (dev && did === liveDeviceId) return // already opened

        cleanupBridge()

        const { url, protocol } = (await dev?.createConnection()) || {}
        if (!url) {
            setLiveDeviceId("")
            return
        }

        console.debug(`connect websocket ${url}`)
        const bridge = new WebSocketBridge(url, protocol)
        bridge.on(CLOSE, () => brainManager.refreshDevices())
        bridge.bus = bus
        bridgeRef.current = {
            deviceId: liveDeviceId,
            bridge,
        }
        bridge.connect()
        setLiveDeviceId(did)
    }

    useEffect(() => {
        if (!liveDeviceId) cleanupBridge()
    }, [liveDeviceId])
    useEffect(() => cleanupBridge, [])

    return (
        <BrainManagerContext.Provider
            value={{
                domain,
                setDomain,
                token,
                setToken,
                brainManager,
                scriptId,
                setScriptId,
                deviceId,
                setDeviceId,
                liveDeviceId,
                connectLiveDevice,
                openScript,
                createScript,
                showNewScriptDialog,
            }}
        >
            {children}
            {createScriptOpen && (
                <Suspense>
                    <CreateBrainScriptDialog
                        onClose={handleCloseCreateScriptDialog}
                    />
                </Suspense>
            )}
        </BrainManagerContext.Provider>
    )
}
