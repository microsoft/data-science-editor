import React, { lazy, ReactNode, useContext } from "react"
import SliderField from "./SliderField"
import Suspense from "../../ui/Suspense"
import {
    ReactFieldContext,
    ReactFieldContextProps,
    ReactFieldJSON,
    toShadowDefinition,
} from "./ReactField"

const ServoWidget = lazy(() => import("../../widgets/ServoWidget"))

function ServiceFieldWidget() {
    const { value } =
        useContext<ReactFieldContextProps<number>>(ReactFieldContext)
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
        return (this.value || 0) + "°"
    }

    renderWidget(): ReactNode {
        return <ServiceFieldWidget />
    }
}
