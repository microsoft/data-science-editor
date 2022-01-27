import React, {
    createContext,
    lazy,
    useContext,
    useEffect,
    useState,
} from "react"
import { ERROR } from "../../jacdac-ts/src/jdom/constants"
import { Packet } from "../../jacdac-ts/src/jdom/packet"
import { isCancelError } from "../../jacdac-ts/src/jdom/utils"
import useBus from "../jacdac/useBus"
import useSnackbar from "./hooks/useSnackbar"
import PacketsContext from "./PacketsContext"

import Suspense from "./ui/Suspense"
const StartSimulatorDialog = lazy(
    () => import("./dialogs/StartSimulatorDialog")
)

export enum DrawerType {
    None,
    Toc,
    Packets,
    Dom,
    Console,
}

export interface ShowDeviceHostsOptions {
    sensor?: boolean
}

export interface AppProps {
    drawerType: DrawerType
    setDrawerType: (type: DrawerType) => void
    searchQuery: string
    setSearchQuery: (s: string) => void
    toolsMenu: boolean
    setToolsMenu: (visible: boolean) => void
    toggleShowDeviceHostsDialog: (options?: ShowDeviceHostsOptions) => void
    selectedPacket: Packet
    setSelectedPacket: (pkt: Packet) => void
    showWebCam: boolean
    setShowWebCam: (newValue: boolean) => void
}

const AppContext = createContext<AppProps>({
    drawerType: DrawerType.None,
    setDrawerType: () => {},
    searchQuery: undefined,
    setSearchQuery: () => {},
    toolsMenu: false,
    setToolsMenu: () => {},
    toggleShowDeviceHostsDialog: () => {},
    selectedPacket: undefined,
    setSelectedPacket: () => {},
    showWebCam: false,
    setShowWebCam: () => {},
})
AppContext.displayName = "app"

export default AppContext

// eslint-disable-next-line react/prop-types
export const AppProvider = ({ children }) => {
    const bus = useBus()
    const { setSilent } = useContext(PacketsContext)
    const [type, setType] = useState(DrawerType.None)
    const [searchQuery, setSearchQuery] = useState("")
    const [toolsMenu, _setToolsMenu] = useState(false)
    const [showDeviceHostsDialog, setShowDeviceHostsDialog] = useState(false)
    const [showDeviceHostsSensors, setShowDeviceHostsSensors] = useState(false)
    const [selectedPacket, setSelectedPacket] = useState<Packet>(undefined)
    const [showWebCam, setShowWebCam] = useState(false)
    const { setError } = useSnackbar()

    const setDrawerType = (type: DrawerType) => {
        if (type !== DrawerType.None) _setToolsMenu(false)
        setType(type)
        setSilent(type !== DrawerType.Packets)
    }

    const setToolsMenu = (open: boolean) => {
        if (open) setType(DrawerType.None)
        _setToolsMenu(open)
    }

    // notify errors
    useEffect(
        () =>
            bus.subscribe(ERROR, (e: { exception: Error }) => {
                if (isCancelError(e.exception)) return
                setError(e.exception)
            }),
        []
    )

    const toggleShowDeviceHostsDialog = (options?: ShowDeviceHostsOptions) => {
        const b = !showDeviceHostsDialog
        if (b) setShowDeviceHostsSensors(!!options?.sensor)
        setShowDeviceHostsDialog(b)
        if (!b) setToolsMenu(false)
    }

    return (
        <AppContext.Provider
            value={{
                drawerType: type,
                setDrawerType,
                searchQuery,
                setSearchQuery,
                toolsMenu,
                setToolsMenu,
                toggleShowDeviceHostsDialog,
                selectedPacket,
                setSelectedPacket,
                showWebCam,
                setShowWebCam,
            }}
        >
            {children}
            <Suspense>
                <StartSimulatorDialog
                    open={showDeviceHostsDialog}
                    onClose={toggleShowDeviceHostsDialog}
                    sensor={showDeviceHostsSensors}
                />
            </Suspense>
        </AppContext.Provider>
    )
}
