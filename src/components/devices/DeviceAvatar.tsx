import {
    Avatar,
    Button,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    makeStyles,
    Theme,
} from "@material-ui/core"
import React, { CSSProperties, useEffect, useState } from "react"
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
import Alert from "../ui/Alert"

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

function LazyDeviceImage(props: { device: JDDevice }) {
    const { device } = props
    const specification = useDeviceSpecification(device)
    const imageUrl = useDeviceImage(specification, "lazy")
    const largeImageUrl = useDeviceImage(specification)
    const [showLarge, setShowLarge] = useState(false)

    if (!imageUrl) return null

    const handleLargeLoaded = () => setShowLarge(true)

    return (
        <>
            <img
                style={{
                    width: "100%",
                    display: showLarge ? undefined : "none",
                }}
                src={largeImageUrl}
                onLoad={handleLargeLoaded}
            />
            {!showLarge && (
                <img
                    style={{
                        minHeight: "18rem",
                        width: "100%",
                        filter: "blur",
                    }}
                    src={imageUrl}
                />
            )}
        </>
    )
}

export default function DeviceAvatar(props: {
    device: JDDevice
    size?: "small" | "large"
}) {
    const { device, size } = props
    const [identifyDialog, setIdentifyDialog] = useState(false)
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
    const handleSendIdentify = async () => await device.identify()
    const handleOpenIdentify = async () => setIdentifyDialog(true)
    const handleCloseIdentify = () => setIdentifyDialog(false)

    useEffect(() => {
        if (identifyDialog) {
            const timerId = setInterval(() => handleSendIdentify(), 3500)
            return () => clearInterval(timerId)
        }
    }, [identifyDialog])

    return (
        <>
            <CmdButton
                trackName="device.identify"
                style={style}
                size="small"
                title={`identify ${server ? "simulator" : "device"} ${name}`}
                onClick={imageUrl ? handleOpenIdentify : handleSendIdentify}
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
            {imageUrl && (
                <Dialog open={identifyDialog} onClose={handleCloseIdentify}>
                    <DialogTitle>
                        Identifying {device.friendlyName}...
                    </DialogTitle>
                    <DialogContent>
                        <Grid
                            container
                            alignItems="center"
                            alignContent={"center"}
                        >
                            <Grid item xs={12}>
                                <LazyDeviceImage device={device} />
                            </Grid>
                            <Grid item xs>
                                <Alert severity="info">
                                    Look for four blinks in around 2 seconds
                                    with the blue LED.
                                </Alert>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="outlined"
                            onClick={handleCloseIdentify}
                        >
                            Dismiss
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    )
}
