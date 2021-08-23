import React, { ReactNode } from "react"
// tslint:disable-next-line: no-submodule-imports
import { makeStyles } from "@material-ui/core/styles"
// tslint:disable-next-line: no-submodule-imports
import Card from "@material-ui/core/Card"
// tslint:disable-next-line: no-submodule-imports
import CardContent from "@material-ui/core/CardContent"
import JDDevice from "../../jacdac-ts/src/jdom/device"
import {
    SRV_CONTROL,
    SRV_LOGGER,
    ControlReg,
} from "../../jacdac-ts/src/jdom/constants"
import ServiceButton from "./ServiceButton"
import useChange from "../jacdac/useChange"
import { navigate } from "gatsby"
import JDService from "../../jacdac-ts/src/jdom/service"
import { CardActions, createStyles } from "@material-ui/core"
import DeviceCardHeader from "./DeviceCardHeader"
import { useRegisterUnpackedValue } from "../jacdac/useRegisterValue"
import { DeviceLostAlert } from "./alert/DeviceLostAlert"

const useStyles = makeStyles(() =>
    createStyles({
        root: {},
        bullet: {
            display: "inline-block",
            margin: "0 2px",
            transform: "scale(0.8)",
        },
        title: {
            fontSize: 14,
        },
        pos: {
            marginBottom: 12,
        },
    })
)

function navigateToService(service: JDService) {
    const spec = service.specification
    if (spec) navigate(`/services/${spec.shortId}/`) // todo spec
}

function DeviceDescription(props: { device: JDDevice }) {
    const { device } = props
    const register = useChange(device, _ =>
        _?.service(0)?.register(ControlReg.DeviceDescription)
    )
    const [description] = useRegisterUnpackedValue<[string]>(register)
    return <span>{description || ""}</span>
}

export default function DeviceCard(props: {
    device: JDDevice
    children?: ReactNode
    action?: ReactNode
    content?: ReactNode
    showDeviceId?: boolean
    showServices?: boolean
    showTemperature?: boolean
    showFirmware?: boolean
    showDescription?: boolean
}) {
    const {
        device,
        children,
        action,
        content,
        showDeviceId,
        showDescription,
        showTemperature,
        showFirmware,
        showServices,
    } = props
    const classes = useStyles()
    const services = useChange(device, () =>
        device
            .services()
            .filter(
                service =>
                    service.serviceClass != SRV_CONTROL &&
                    service.serviceClass != SRV_LOGGER
            )
    )

    return (
        <Card className={classes.root}>
            <DeviceCardHeader
                device={device}
                showDeviceId={showDeviceId}
                showTemperature={showTemperature}
                showFirmware={showFirmware}
                showMedia={true}
            />
            {(showDescription || content) && (
                <CardContent>
                    {<DeviceLostAlert device={device} />}
                    {showDescription && <DeviceDescription device={device} />}
                    {content}
                </CardContent>
            )}
            <CardActions>
                {action}
                {showServices &&
                    services?.map(service => (
                        <ServiceButton
                            key={service.id}
                            service={service}
                            onClick={() => navigateToService(service)}
                        />
                    ))}
            </CardActions>
            {children}
        </Card>
    )
}
