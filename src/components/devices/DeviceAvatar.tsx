import { Avatar, createStyles, makeStyles, Theme } from "@material-ui/core"
import React, { CSSProperties } from "react"
import { VIRTUAL_DEVICE_NODE_NAME } from "../../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import CmdButton from "../CmdButton"
import useServiceProvider from "../hooks/useServiceProvider"
import KindIcon from "../KindIcon"
import useDeviceName from "./useDeviceName"
import useDeviceImage from "./useDeviceImage"
import TransportIcon from "../icons/TransportIcon"
import { rgbToHtmlColor } from "../../../jacdac-ts/src/jdom/utils"
import useChange from "../../jacdac/useChange"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        img: {
            marginTop: "58%",
        },
        small: {
            width: theme.spacing(3),
            height: theme.spacing(3),
        },
        large: {
            width: theme.spacing(7),
            height: theme.spacing(7),
        },
    })
)

export default function DeviceAvatar(props: {
    device: JDDevice
    size?: "small" | "large"
}) {
    const { device, size } = props
    const specification = useDeviceSpecification(device)
    const imageUrl = useDeviceImage(specification, "avatar")
    const name = useDeviceName(device)
    const classes = useStyles()
    const sizeClassName =
        size === "small"
            ? classes.small
            : size === "large"
            ? classes.large
            : undefined
    const server = useServiceProvider(device)
    const source = device.source
    //const {
    //  className: statusLEDClassName,
    //  helmetStyle: statusLEDHelmetStyle } = useDeviceStatusLightStyle(device)
    //{statusLEDHelmetStyle && <Helmet><style>{statusLEDHelmetStyle}</style></Helmet>}
    //className={statusLEDClassName}
    const ctrl = server?.controlService
    const color = useChange(ctrl, _ => _?.statusLightColor)
    const style: CSSProperties = color
        ? {
              color: rgbToHtmlColor(color),
          }
        : undefined
    const handleIdentify = async () => await device.identify()
    return (
        <>
            <CmdButton
                trackName="device.identify"
                style={style}
                size="small"
                title={`identify ${server ? "simulator" : "device"} ${name}`}
                onClick={handleIdentify}
                icon={
                    server ? (
                        <KindIcon kind={VIRTUAL_DEVICE_NODE_NAME} />
                    ) : !imageUrl ? (
                        <TransportIcon type={source} />
                    ) : (
                        <Avatar
                            className={sizeClassName}
                            alt={specification?.name || "Image of the device"}
                            src={imageUrl}
                            classes={{
                                img: classes.img,
                            }}
                        />
                    )
                }
            />
        </>
    )
}
