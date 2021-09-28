import React, { CSSProperties, useState } from "react"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import CmdButton from "../CmdButton"
import useServiceProvider from "../hooks/useServiceProvider"
import useDeviceName from "./useDeviceName"
import { rgbToHtmlColor } from "../../../jacdac-ts/src/jdom/utils"
import useChange from "../../jacdac/useChange"
import IdentifyDialog from "../dialogs/IdentifyDialog"
import JDServerServiceProvider from "../../../jacdac-ts/src/jdom/servers/serverserviceprovider"
import DeviceIcon from "./DeviceIcon"

export default function DeviceAvatar(props: {
    device: JDDevice
    size?: "small" | "large"
    center?: boolean
}) {
    const { device, size, center } = props
    const [identifyDialog, setIdentifyDialog] = useState(false)
    const name = useDeviceName(device)
    const server = useServiceProvider<JDServerServiceProvider>(device)
    const ctrl = server?.controlService
    const color = useChange(ctrl, _ => _?.statusLightColor)
    const style: CSSProperties = color
        ? {
              color: rgbToHtmlColor(color),
          }
        : undefined
    const handleOpenIdentify = async () => setIdentifyDialog(true)
    const handleCloseIdentify = () => setIdentifyDialog(false)
    return (
        <>
            <CmdButton
                trackName="device.identify"
                style={style}
                size="small"
                title={`identify ${server ? "simulator" : "device"} ${name}`}
                onClick={handleOpenIdentify}
                icon={
                    <DeviceIcon
                        device={device}
                        size={size}
                        avatar={center !== false}
                    />
                }
            />
            {identifyDialog && (
                <IdentifyDialog
                    device={device}
                    open={identifyDialog}
                    onClose={handleCloseIdentify}
                />
            )}
        </>
    )
}
