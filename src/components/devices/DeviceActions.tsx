import React, { useContext } from "react"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import FingerprintIcon from "@material-ui/icons/Fingerprint"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import RefreshIcon from "@material-ui/icons/Refresh"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import CmdButton from "../CmdButton"
import useServiceProvider from "../hooks/useServiceProvider"
import CloseIcon from "@material-ui/icons/Close"
import SettingsIcon from "@material-ui/icons/Settings"
import { SRV_SETTINGS } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import useChange from "../../jacdac/useChange"
import { navigate } from "gatsby-link"

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
    const provider = useServiceProvider(device)
    const settings = useChange(
        device,
        _ => _.services({ serviceClass: SRV_SETTINGS })?.[0]
    )

    const handleIdentify = async () => {
        await device.identify()
    }
    const handleReset = async () => {
        await device.reset()
    }
    const handleStop = async () => {
        bus.removeServiceProvider(provider)
    }
    const handleSettings = async () => {
        navigate("/tools/settings")
    }
    return (
        <>
            {showStop && provider && (
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
            {children}
        </>
    )
}
