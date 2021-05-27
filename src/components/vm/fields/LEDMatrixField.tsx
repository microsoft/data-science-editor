import React, { lazy, ReactNode } from "react"
import { fromHex, toHex } from "../../../../jacdac-ts/src/jdom/utils"
import Suspense from "../../ui/Suspense"
import { ReactField } from "./ReactField"
import Blockly from "blockly"
import { child, elt } from "../../widgets/svg"
const LEDMatrixWidget = lazy(() => import("../../widgets/LEDMatrixWidget"))

export interface LEDMatrixFieldValue {
    // hex data
    leds: string
    rows: number
    columns: number
}

export default class LEDMatrixField extends ReactField<LEDMatrixFieldValue> {
    static KEY = "jacdac_field_led_matrix"
    private img: SVGImageElement

    constructor(value: string) {
        super(value)

        this.size_ = new Blockly.utils.Size(32, 32)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(options: any) {
        return new LEDMatrixField(options?.value)
    }

    get defaultValue() {
        return {
            leds: toHex(new Uint8Array(4)),
            rows: 5,
            columns: 5,
        }
    }

    getText_() {
        const { leds, rows, columns } = this.value
        return `${leds} (${rows}x${columns})`
    }

    private renderValue() {
        const { leds, rows, columns } = this.value
        // render current state to LEDmatrix field
        const columnspadded = columns + (8 - (columns % 8))
        const ledsBytes = fromHex(leds)
        const cvs = document.createElement("canvas")
        const b = 3
        const pw = 8
        const ph = 8
        const w = rows * pw + (rows - 1) * b
        const h = columns * ph + (columns - 1) * b
        cvs.width = w + 2 * b
        cvs.height = h + 2 * b
        const ctx = cvs.getContext("2d")
        ctx.fillStyle = "#444"
        ctx.fillRect(b, b, w, h)
        ctx.fillStyle = "blue"
        for (let x = 0; x < columns; ++x) {
            for (let y = 0; y < rows; ++y) {
                const bitindex = y * columnspadded + x
                const byte = ledsBytes[bitindex >> 3]
                const bit = bitindex % 8
                const on = 1 === ((byte >> bit) & 1)
                ctx.fillStyle = on ? "#ffc400" : "#000"
                ctx.fillRect(x * (pw + b) + b, y * (ph + b) + b, pw, ph)
            }
        }
        const dataUri = cvs.toDataURL("image/png")
        this.img?.setAttributeNS(
            "http://www.w3.org/1999/xlink",
            "xlink:href",
            dataUri
        )
    }

    initView() {
        const { rows, columns } = this.value
        const w = this.size_.width
        this.img = child(this.fieldGroup_, "image", {
            height: ((w / columns) * rows) | 0,
            width: w,
            alt: "LED matrix",
        }) as SVGImageElement
        this.renderValue()
    }

    doValueUpdate_(newValue: string) {
        this.value_ = newValue
        this.renderValue()
    }

    updateSize_() {}

    renderField(): ReactNode {
        const { leds, rows, columns } = this.value
        const ledsBytes = fromHex(leds)
        const onChange = (newLeds: Uint8Array) =>
            (this.value = {
                leds: toHex(newLeds),
                rows,
                columns,
            })
        return (
            <Suspense>
                <LEDMatrixWidget
                    color="secondary"
                    brightness={1}
                    leds={ledsBytes}
                    rows={rows}
                    columns={columns}
                    onChange={onChange}
                />
            </Suspense>
        )
    }
}
