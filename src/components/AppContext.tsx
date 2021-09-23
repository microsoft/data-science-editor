import { Button } from "gatsby-theme-material-ui"
import { useSnackbar } from "notistack"
import React, {
    createContext,
    lazy,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react"
import { ERROR } from "../../jacdac-ts/src/jdom/constants"
import { errorCode } from "../../jacdac-ts/src/jdom/error"
import Packet from "../../jacdac-ts/src/jdom/packet"
import JDService from "../../jacdac-ts/src/jdom/service"
import { isCancelError } from "../../jacdac-ts/src/jdom/utils"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import useAnalytics from "./hooks/useAnalytics"
import PacketsContext from "./PacketsContext"

import Suspense from "./ui/Suspense"
const StartSimulatorDialog = lazy(
    () => import("./dialogs/StartSimulatorDialog")
)
const SelectRoleDialog = lazy(() => import("./dialogs/SelectRoleDialog"))
const ConnectTransportDialog = lazy(
    () => import("./dialogs/ConnectTransportDialog")
)

export enum DrawerType {
    None,
    Toc,
    Packets,
    Dom,
}

export interface AppProps {
    drawerType: DrawerType
    setDrawerType: (type: DrawerType) => void
    searchQuery: string
    setSearchQuery: (s: string) => void
    toolsMenu: boolean
    setToolsMenu: (visible: boolean) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setError: (error: any) => void
    enqueueSnackbar: (
        message: string | ReactNode,
        variant?: "success" | "warning" | "info"
    ) => void
    toggleShowDeviceHostsDialog: () => void
    showSelectRoleDialog: (srv: JDService) => void
    toggleShowConnectTransportDialog: () => void
    selectedPacket: Packet
    setSelectedPacket: (pkt: Packet) => void
}

const AppContext = createContext<AppProps>({
    drawerType: DrawerType.None,
    setDrawerType: () => {},
    searchQuery: undefined,
    setSearchQuery: () => {},
    toolsMenu: false,
    setToolsMenu: () => {},
    setError: () => {},
    enqueueSnackbar: () => {},
    toggleShowDeviceHostsDialog: () => {},
    showSelectRoleDialog: () => {},
    toggleShowConnectTransportDialog: () => {},
    selectedPacket: undefined,
    setSelectedPacket: () => {},
})
AppContext.displayName = "app"

export default AppContext

// eslint-disable-next-line react/prop-types
export const AppProvider = ({ children }) => {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { setPaused } = useContext(PacketsContext)
    const [type, setType] = useState(DrawerType.None)
    const [searchQuery, setSearchQuery] = useState("")
    const [toolsMenu, _setToolsMenu] = useState(false)
    const [showDeviceHostsDialog, setShowDeviceHostsDialog] = useState(false)
    const [showConnectTransportDialog, setShowConnectTransportDialog] =
        useState(false)
    const [showSelectRoleDialogService, setShowSelectRoleDialogService] =
        useState<JDService>(undefined)
    const { trackError } = useAnalytics()
    const [selectedPacket, setSelectedPacket] = useState<Packet>(undefined)

    const { enqueueSnackbar: _enqueueSnackbar } = useSnackbar()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setError = (e: any) => {
        if (!e || isCancelError(e)) return
        const msg = e?.message || e + ""
        const code = errorCode(e)

        trackError?.(e, {
            code,
        })
        _enqueueSnackbar(msg, {
            variant: "error",
            autoHideDuration: code ? 8000 : 4000,
            preventDuplicate: true,
        })
    }

    const enqueueSnackbar = (
        message: string | ReactNode,
        variant?: "success" | "warning" | "info"
    ) => _enqueueSnackbar(message, { variant })

    const setDrawerType = (type: DrawerType) => {
        if (type !== DrawerType.None) _setToolsMenu(false)
        setType(type)
        setPaused(type !== DrawerType.Packets)
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

    const toggleShowDeviceHostsDialog = () => {
        const b = !showDeviceHostsDialog
        setShowDeviceHostsDialog(b)
        if (!b) setToolsMenu(false)
    }

    const toggleShowConnectTransportDialog = () => {
        const b = !showConnectTransportDialog
        setShowConnectTransportDialog(b)
        if (!b) setToolsMenu(false)
    }

    const handleCloseRoleDialog = () =>
        setShowSelectRoleDialogService(undefined)
    const showSelectRoleDialog = (srv: JDService) =>
        setShowSelectRoleDialogService(srv)

    return (
        <AppContext.Provider
            value={{
                drawerType: type,
                setDrawerType,
                searchQuery,
                setSearchQuery,
                toolsMenu,
                setToolsMenu,
                setError,
                enqueueSnackbar,
                toggleShowDeviceHostsDialog,
                showSelectRoleDialog,
                toggleShowConnectTransportDialog,
                selectedPacket,
                setSelectedPacket,
            }}
        >
            {children}
            {showDeviceHostsDialog && (
                <Suspense>
                    <StartSimulatorDialog
                        open={showDeviceHostsDialog}
                        onClose={toggleShowDeviceHostsDialog}
                    />
                </Suspense>
            )}
            {showSelectRoleDialogService && (
                <Suspense>
                    <SelectRoleDialog
                        service={showSelectRoleDialogService}
                        onClose={handleCloseRoleDialog}
                    />
                </Suspense>
            )}
            {showConnectTransportDialog && (
                <Suspense>
                    <ConnectTransportDialog
                        open={showConnectTransportDialog}
                        onClose={toggleShowConnectTransportDialog}
                    />
                </Suspense>
            )}
        </AppContext.Provider>
    )
}
