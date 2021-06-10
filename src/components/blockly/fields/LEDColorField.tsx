import React, { lazy, ReactNode, useContext } from "react"
import Suspense from "../../ui/Suspense"
import ReactField, { ReactFieldJSON, toShadowDefinition } from "./ReactField"
import { rgbToHtmlColor } from "../../../../jacdac-ts/src/jdom/utils"
import { child } from "../../widgets/svg"
import ValueContext, { ValueContextProps } from "./ValueContext"

const LEDWidget = lazy(() => import("../../widgets/LEDWidget"))

function LEDColorFieldWidget() {
    const { value, onValueChange } =
        useContext<ValueContextProps<number>>(ValueContext)
    return (
        <Suspense>
            <LEDWidget
                ledColor={value}
                onLedColorChange={onValueChange}
                ledCount={3}
                color="secondary"
            />
        </Suspense>
    )
}

export default class LEDColorField extends ReactField<number> {
    static KEY = "jacdac_field_led_color"
    static SHADOW = toShadowDefinition(LEDColorField)

    static fromJson(options: ReactFieldJSON) {
        return new LEDColorField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options?.value, undefined, options, { width: 28, height: 28 })
    }

    protected initCustomView() {
        const { width } = this.size_
        const r = width >> 1
        return child(this.fieldGroup_, "circle", {
            r: width >> 1,
            cx: r,
            cy: r,
            strokeWidth: 2,
            stroke: "#777",
        }) as SVGCircleElement
    }

    updateView() {
        const c = rgbToHtmlColor(this.value)
        const circle = this.view as SVGCircleElement
        if (c) {
            circle?.setAttribute("fill", c)
        }
    }

    getText_() {
        return rgbToHtmlColor(this.value)
    }

    renderField(): ReactNode {
        return <LEDColorFieldWidget />
    }
}
