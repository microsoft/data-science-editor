import React, { useContext } from "react"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import FingerprintIcon from "@mui/icons-material/Fingerprint"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import RefreshIcon from "@mui/icons-material/Refresh"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import CmdButton from "../CmdButton"
import useServiceProvider from "../hooks/useServiceProvider"
import CloseIcon from "@mui/icons-material/Close"
import SettingsIcon from "@mui/icons-material/Settings"
import { SRV_SETTINGS } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import useChange from "../../jacdac/useChange"
import { navigate } from "gatsby-link"
import HostedSimulatorsContext from "../HostedSimulatorsContext"

export default function DeviceActions(props: {
    device: JDDevice
    showSettings?: boolean
    showReset?: boolean
    showStop?: boolean
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

    const handleIdentify = async () => await device.identify()
    const handleReset = async () => await device.reset()
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
            {showSettings && settings && (
                <CmdButton
                    trackName="device.settings"
                    size="small"
                    title="settings"
                    onClick={handleSettings}
                    icon={<SettingsIcon />}
                />
            )}
            {showReset && (
                <CmdButton
                    trackName="device.reset"
                    size="small"
                    title="reset"
                    onClick={handleReset}
                    icon={<RefreshIcon />}
                />
            )}
        </>
    )
}
