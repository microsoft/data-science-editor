import React, { lazy, ReactNode, useContext } from "react"
import SliderField from "./SliderField"
import Suspense from "../../ui/Suspense"
import { ReactFieldJSON, toShadowDefinition } from "./ReactField"
import ValueContext, { ValueContextProps } from "./ValueContext"

const ServoWidget = lazy(() => import("../../widgets/ServoWidget"))

function ServiceFieldWidget() {
    const { value } = useContext<ValueContextProps<number>>(ValueContext)
    return (
        <Suspense>
            <ServoWidget
                angle={value}
                offset={0}
                color="secondary"
                enabled={true}
            />
        </Suspense>
    )
}

export default class ServoAngleField extends SliderField {
    static KEY = "jacdac_field_servo_angle"
    static SHADOW = toShadowDefinition(ServoAngleField)

    static fromJson(options: ReactFieldJSON) {
        return new ServoAngleField(options?.value, options)
    }

    getText_() {
        return this.value + "°"
    }

    renderWidget(): ReactNode {
        return <ServiceFieldWidget />
    }
}
