import { Button } from "gatsby-theme-material-ui"
import { useSnackbar } from "notistack"
import React, {
    createContext,
    lazy,
    useContext,
    useEffect,
    useState,
} from "react"
import { ERROR } from "../../jacdac-ts/src/jdom/constants"
import errorPath from "../../jacdac-ts/src/jdom/error"
import { JDService } from "../../jacdac-ts/src/jdom/service"
import { isCancelError } from "../../jacdac-ts/src/jdom/utils"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"

import Suspense from "./ui/Suspense"
const StartSimulatorDialog = lazy(
    () => import("./dialogs/StartSimulatorDialog")
)
const SelectRoleDialog = lazy(() => import("./dialogs/SelectRoleDialog"))

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
    toggleShowDeviceHostsDialog: () => void
    showSelectRoleDialog: (srv: JDService) => void
}

const AppContext = createContext<AppProps>({
    drawerType: DrawerType.None,
    setDrawerType: () => {},
    searchQuery: undefined,
    setSearchQuery: () => {},
    toolsMenu: false,
    setToolsMenu: () => {},
    setError: () => {},
    toggleShowDeviceHostsDialog: () => {},
    showSelectRoleDialog: () => {},
})
AppContext.displayName = "app"

export default AppContext

// eslint-disable-next-line react/prop-types
export const AppProvider = ({ children }) => {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [type, setType] = useState(DrawerType.None)
    const [searchQuery, setSearchQuery] = useState("")
    const [toolsMenu, _setToolsMenu] = useState(false)
    const [showDeviceHostsDialog, setShowDeviceHostsDialog] = useState(false)
    const [showSelectRoleDialogService, setShowSelectRoleDialogService] =
        useState<JDService>(undefined)

    const { enqueueSnackbar } = useSnackbar()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setError = (e: any) => {
        if (!e || isCancelError(e)) return
        console.error(e)
        const msg = e?.message || e + ""
        const code = errorPath(e)
        enqueueSnackbar(msg, {
            variant: "error",
            preventDuplicate: true,
            autoHideDuration: code ? 8000 : 4000,
            action: code && <Button to={`/errors/${code}`}>Help</Button>,
        })
    }

    const setDrawerType = (type: DrawerType) => {
        if (type !== DrawerType.None) _setToolsMenu(false)
        setType(type)
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
                toggleShowDeviceHostsDialog,
                showSelectRoleDialog,
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
        </AppContext.Provider>
    )
}
