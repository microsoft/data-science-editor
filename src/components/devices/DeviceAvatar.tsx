import React, { CSSProperties, useState } from "react"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import CmdButton from "../CmdButton"
import useServiceProvider from "../hooks/useServiceProvider"
import useDeviceName from "./useDeviceName"
import useDeviceImage from "./useDeviceImage"
import { rgbToHtmlColor } from "../../../jacdac-ts/src/jdom/utils"
import useChange from "../../jacdac/useChange"
import IdentifyDialog from "../dialogs/IdentifyDialog"
import JDServerServiceProvider from "../../../jacdac-ts/src/jdom/servers/serverserviceprovider"
import DeviceIcon from "./DeviceIcon"

export default function DeviceAvatar(props: {
    device: JDDevice
    size?: "small" | "large"
}) {
    const { device, size } = props
    const [identifyDialog, setIdentifyDialog] = useState(false)
    const specification = useDeviceSpecification(device)
    const imageUrl = useDeviceImage(specification, "avatar")
    const name = useDeviceName(device)
    const server = useServiceProvider<JDServerServiceProvider>(device)
    const ctrl = server?.controlService
    const color = useChange(ctrl, _ => _?.statusLightColor)
    const style: CSSProperties = color
        ? {
              color: rgbToHtmlColor(color),
          }
        : undefined
    const handleSendIdentify = async () => await device.identify()
    const handleOpenIdentify = async () => setIdentifyDialog(true)
    const handleCloseIdentify = () => setIdentifyDialog(false)
    return (
        <>
            <CmdButton
                trackName="device.identify"
                style={style}
                size="small"
                title={`identify ${server ? "simulator" : "device"} ${name}`}
                onClick={imageUrl ? handleOpenIdentify : handleSendIdentify}
                icon={<DeviceIcon device={device} size={size} avatar={true} />}
            />
            {imageUrl && (
                <IdentifyDialog
                    device={device}
                    open={identifyDialog}
                    onClose={handleCloseIdentify}
                />
            )}
        </>
    )
}
