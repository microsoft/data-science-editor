import React, { useContext } from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import FingerprintIcon from "@mui/icons-material/Fingerprint"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import CmdButton from "../CmdButton"
import useServiceProvider from "../hooks/useServiceProvider"
import CloseIcon from "@mui/icons-material/Close"
import SettingsIcon from "@mui/icons-material/Settings"
import {
    SRV_SETTINGS,
    SRV_UNIQUE_BRAIN,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import useChange from "../../jacdac/useChange"
import { navigate } from "gatsby-link"
import HostedSimulatorsContext from "../HostedSimulatorsContext"
import CableIcon from "@mui/icons-material/Cable"
import DeviceResetButton from "./DeviceResetButton"
export default function DeviceActions(props: {
    device: JDDevice
    showSettings?: boolean
    showReset?: boolean
    showStop?: boolean
    showProxy?: boolean
    hideIdentity?: boolean
    children?: JSX.Element | JSX.Element[]
}) {
    const {
        device,
        showSettings,
        showReset,
        children,
        hideIdentity,
        showStop,
        showProxy,
    } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { removeHostedSimulator, isHostedSimulator } = useContext(
        HostedSimulatorsContext
    )
    const { deviceId } = device
    const provider = useServiceProvider(device)
    const settings = useChange(
        device,
        _ => _.services({ serviceClass: SRV_SETTINGS })?.[0]
    )
    const _showProxy = useChange(
        device,
        _ => showProxy && _.hasService(SRV_UNIQUE_BRAIN)
    )

    const handleIdentify = async () => await device.identify()
    const handleProxy = async () => await device.startProxy()
    const handleStop = async () => {
        removeHostedSimulator(deviceId)
        bus.removeServiceProvider(provider)
        bus.removeDevice(deviceId)
    }
    const handleSettings = async () => {
        navigate("/tools/settings")
    }
    return (
        <>
            {children}
            {showStop && (provider || isHostedSimulator(deviceId)) && (
                <CmdButton
                    trackName="device.stop"
                    size="small"
                    title="stop simulator"
                    onClick={handleStop}
                    icon={<CloseIcon />}
                />
            )}
            {!hideIdentity && (
                <CmdButton
                    trackName="device.identify"
                    size="small"
                    title="identify"
                    onClick={handleIdentify}
                    icon={<FingerprintIcon />}
                />
            )}
            {showSettings && !!settings && (
                <CmdButton
                    trackName="device.settings"
                    size="small"
                    title="settings"
                    onClick={handleSettings}
                    icon={<SettingsIcon />}
                />
            )}
            {_showProxy && (
                <CmdButton
                    trackName="device.proxy"
                    size="small"
                    title="dongle"
                    onClick={handleProxy}
                    icon={<CableIcon />}
                />
            )}
            {showReset && <DeviceResetButton device={device} />}
        </>
    )
}
