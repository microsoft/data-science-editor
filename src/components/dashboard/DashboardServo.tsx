import React from "react"
import { ServoReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import useThrottledValue from "../hooks/useThrottledValue"
import { SG90_RESPONSE_SPEED } from "../../../jacdac-ts/src/servers/servers"
import { Grid } from "@material-ui/core"
import ServoServer from "../../../jacdac-ts/src/servers/servoserver"
import RegisterInput from "../RegisterInput"
import JDService from "../../../jacdac-ts/src/jdom/service"
import ServoWidget from "../widgets/ServoWidget"
import useRegister from "../hooks/useRegister"

function useActualAngle(service: JDService, visible: boolean) {
    const angleRegister = useRegister(service, ServoReg.Angle)
    const [angle] = useRegisterUnpackedValue<[number]>(angleRegister, {
        visible,
    })
    // sec/60deg
    const responseSpeedRegister = useRegister(service, ServoReg.ResponseSpeed)
    const [responseSpeed] = useRegisterUnpackedValue<[number]>(
        responseSpeedRegister,
        { visible }
    )
    const rotationalSpeed = 60 / (responseSpeed || SG90_RESPONSE_SPEED)
    const actualAngle = useThrottledValue(angle || 0, rotationalSpeed)

    return actualAngle
}

export default function DashboardServo(props: DashboardServiceProps) {
    const { service, visible } = props

    const enabledRegister = useRegister(service, ServoReg.Enabled)
    const enabled = useRegisterBoolValue(enabledRegister, props)
    const angleRegister = useRegister(service, ServoReg.Angle)
    const angle = useActualAngle(service, visible)
    const offsetRegister = useRegister(service, ServoReg.Offset)
    const [offset] = useRegisterUnpackedValue<[number]>(offsetRegister, props)

    const server = useServiceServer<ServoServer>(service)
    const color = server ? "secondary" : "primary"

    const toggleOff = () => enabledRegister.sendSetBoolAsync(!enabled, true)

    return (
        <Grid container alignContent="center">
            <Grid item xs={12}>
                <ServoWidget
                    angle={angle}
                    offset={offset}
                    color={color}
                    enabled={enabled}
                    toggleOff={toggleOff}
                />
            </Grid>
            <Grid item xs={12}>
                <RegisterInput register={angleRegister} visible={visible} />
            </Grid>
        </Grid>
    )
}
