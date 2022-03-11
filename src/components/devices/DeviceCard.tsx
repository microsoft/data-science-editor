import React, { ReactNode } from "react"
import { styled } from "@mui/material/styles"
// tslint:disable-next-line: no-submodule-imports
import Card from "@mui/material/Card"
// tslint:disable-next-line: no-submodule-imports
import CardContent from "@mui/material/CardContent"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { ControlReg } from "../../../jacdac-ts/src/jdom/constants"
import ServiceButton from "../ServiceButton"
import useChange from "../../jacdac/useChange"
import { navigate } from "gatsby"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { CardActions } from "@mui/material"
import DeviceCardHeader from "./DeviceCardHeader"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { DeviceLostAlert } from "../alert/DeviceLostAlert"
import { isInfrastructure } from "../../../jacdac-ts/src/jdom/spec"

const PREFIX = "DeviceCard"

const classes = {
    root: `${PREFIX}-root`,
    bullet: `${PREFIX}-bullet`,
    title: `${PREFIX}-title`,
    pos: `${PREFIX}-pos`,
}

const StyledCard = styled(Card)(() => ({
    [`&.${classes.root}`]: {},

    [`& .${classes.bullet}`]: {
        display: "inline-block",
        margin: "0 2px",
        transform: "scale(0.8)",
    },

    [`& .${classes.title}`]: {
        fontSize: 14,
    },

    [`& .${classes.pos}`]: {
        marginBottom: 12,
    },
}))

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
    showReset?: boolean
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
        showReset,
    } = props

    const services = useChange(device, () =>
        device.services().filter(srv => !isInfrastructure(srv.specification))
    )

    return (
        <StyledCard className={classes.root}>
            <DeviceCardHeader
                device={device}
                showDeviceId={showDeviceId}
                showTemperature={showTemperature}
                showFirmware={showFirmware}
                showMedia={true}
                showReset={showReset}
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
                            key={service.nodeId}
                            service={service}
                            onClick={() => navigateToService(service)}
                        />
                    ))}
            </CardActions>
            {children}
        </StyledCard>
    )
}
