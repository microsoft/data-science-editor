import React, { lazy, ReactNode, useContext } from "react"
import Suspense from "../../ui/Suspense"
import ReactField, {
    ReactFieldContext,
    ReactFieldContextProps,
    ReactFieldJSON,
    toShadowDefinition,
} from "./ReactField"
import { rgbToHtmlColor } from "../../../../jacdac-ts/src/jdom/utils"
import Blockly from "blockly"
import { child } from "../../widgets/svg"

const LEDWidget = lazy(() => import("../../widgets/LEDWidget"))

function LEDColorFieldWidget() {
    const { value, onValueChange } =
        useContext<ReactFieldContextProps<number>>(ReactFieldContext)
    return (
        <Suspense>
            <LEDWidget
                value={value}
                onChange={onValueChange}
                ledCount={3}
                color="secondary"
            />
        </Suspense>
    )
}

export default class LEDColorField extends ReactField<number> {
    static KEY = "jacdac_field_led_color"
    static SHADOW = toShadowDefinition(LEDColorField)
    private circle: SVGCircleElement

    static fromJson(options: ReactFieldJSON) {
        return new LEDColorField(options)
    }

    constructor(options?: any) {
        super(options?.value, undefined, options)

        this.size_ = new Blockly.utils.Size(28, 28)
    }

    updateSize_() {}

    initView() {
        const { width } = this.size_
        const r = width >> 1
        this.circle = child(this.fieldGroup_, "circle", {
            r: width >> 1,
            cx: r,
            cy: r,
            strokeWidth: 2,
            stroke: "#777",
        }) as SVGCircleElement
        this.updateView()
    }

    doValueUpdate_(newValue: string) {
        this.value_ = newValue
        this.updateView()
    }

    updateView() {
        const c = rgbToHtmlColor(this.value)
        if (c) {
            this.circle?.setAttribute("fill", c)
        }
    }

    getText_() {
        return rgbToHtmlColor(this.value)
    }

    renderField(): ReactNode {
        return <LEDColorFieldWidget />
    }
}
