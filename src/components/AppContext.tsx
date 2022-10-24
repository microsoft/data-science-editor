import React, {
    createContext,
    useContext,
    useEffect,
    useLayoutEffect,
    useState,
} from "react"
import { ERROR } from "../../jacdac-ts/src/jdom/constants"
import { Packet } from "../../jacdac-ts/src/jdom/packet"
import { isCancelError } from "../../jacdac-ts/src/jdom/error"
import useBus from "../jacdac/useBus"
import useSnackbar from "./hooks/useSnackbar"
import PacketsContext from "./PacketsContext"

export enum DrawerType {
    None,
    Toc,
    Packets,
    Dom,
    Console,
    Dashboard,
}

export interface AppProps {
    drawerType: DrawerType
    setDrawerType: (type: DrawerType) => void
    toolsMenu: boolean
    setToolsMenu: (visible: boolean) => void
    selectedPacket: Packet
    setSelectedPacket: (pkt: Packet) => void
    showWebCam: boolean
    setShowWebCam: (newValue: boolean) => void
}

const AppContext = createContext<AppProps>({
    drawerType: DrawerType.None,
    setDrawerType: () => {},
    toolsMenu: false,
    setToolsMenu: () => {},
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
    const [toolsMenu, _setToolsMenu] = useState(false)
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

    useLayoutEffect(() => {
        if (typeof window !== "undefined")
            setTimeout(() => window.dispatchEvent(new Event("resize")), 1000)
    }, [type, toolsMenu])

    return (
        <AppContext.Provider
            value={{
                drawerType: type,
                setDrawerType,
                toolsMenu,
                setToolsMenu,
                selectedPacket,
                setSelectedPacket,
                showWebCam,
                setShowWebCam,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}
