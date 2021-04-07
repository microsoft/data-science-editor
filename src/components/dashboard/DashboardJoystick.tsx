import React from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import useServiceServer from "../hooks/useServiceServer"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import JoystickSensorServer from "../../../jacdac-ts/src/servers/joystickserver"
import JoystickWidget from "../widgets/JoystickWidget"
import { JoystickReg } from "../../../jacdac-ts/src/jdom/constants"

export default function DashboardJoystick(props: DashboardServiceProps) {
    const { service } = props
    const register = service.register(JoystickReg.Direction)
    const [x, y] = useRegisterUnpackedValue<[number, number]>(register, props)
    const host = useServiceServer<JoystickSensorServer>(service)
    const color = host ? "secondary" : "primary"

    const values = () => host.reading.values()
    const onUpdate = (newx: number, newy: number) => {
        host.reading.setValues([newx, newy])
        register.refresh()
    }

    return (
        <JoystickWidget
            x={x}
            y={y}
            color={color}
            onUpdate={onUpdate}
            hostValues={host && values}
        />
    )
}
