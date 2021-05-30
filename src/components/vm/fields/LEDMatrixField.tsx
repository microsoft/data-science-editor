import React, { lazy, ReactNode } from "react"
import { fromHex, toHex } from "../../../../jacdac-ts/src/jdom/utils"
import Suspense from "../../ui/Suspense"
import { ReactFieldJSON, VALUE_CHANGE } from "./ReactField"
import ReactImageField from "./ReactImageField"
const LEDMatrixWidget = lazy(() => import("../../widgets/LEDMatrixWidget"))

export interface LEDMatrixFieldValue {
    // hex data
    leds: string
    rows: number
    columns: number
}

export default class LEDMatrixField extends ReactImageField<LEDMatrixFieldValue> {
    static KEY = "jacdac_field_led_matrix"

    constructor(value: string) {
        super(value)

        this.events.on(VALUE_CHANGE, () => {
            const { rows, columns } = this.value
            this.setSize(32, (32 / columns) * rows)    
        })
    }

    static fromJson(options: ReactFieldJSON) {
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

    renderValue(): string {
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
        return dataUri
    }

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
