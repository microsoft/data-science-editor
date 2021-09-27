import { Avatar, createStyles, makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { VIRTUAL_DEVICE_NODE_NAME } from "../../../jacdac-ts/src/jdom/constants"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import useServiceProvider from "../hooks/useServiceProvider"
import KindIcon from "../KindIcon"
import useDeviceImage from "./useDeviceImage"
import JDServerServiceProvider from "../../../jacdac-ts/src/jdom/servers/serverserviceprovider"
import JacdacIcon from "../icons/JacdacIcon"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        img: {
            marginTop: "58%",
        },
        small: {
            width: theme.spacing(3),
            height: theme.spacing(3),
            marginRight: theme.spacing(0.5),
        },
        large: {
            width: theme.spacing(7),
            height: theme.spacing(7),
            marginRight: theme.spacing(1),
        },
    })
)

export default function DeviceIcon(props: {
    device: JDDevice
    size?: "small" | "large"
    avatar?: boolean
}) {
    const { device, size, avatar } = props
    const specification = useDeviceSpecification(device)
    const imageUrl = useDeviceImage(specification, "avatar")
    const classes = useStyles()
    const sizeClassName =
        size === "small"
            ? classes.small
            : size === "large"
            ? classes.large
            : undefined
    const server = useServiceProvider<JDServerServiceProvider>(device)
    return server ? (
        <KindIcon kind={VIRTUAL_DEVICE_NODE_NAME} />
    ) : !imageUrl ? (
        <JacdacIcon />
    ) : (
        <Avatar
            className={sizeClassName}
            alt={specification?.name || "Image of the device"}
            src={imageUrl}
            classes={{
                img: avatar ? classes.img : undefined,
            }}
        />
    )
}
