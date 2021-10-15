import React, { useContext, useEffect } from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import { snapshotSensors } from "../../../jacdac-ts/src/jdom/sensors"
import { inIFrame } from "../../../jacdac-ts/src/jdom/iframeclient"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"

export default function DataStreamer() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)

    useEffect(() => {
        if (!inIFrame()) return

        console.debug("datastreamer: start uploader")
        const upload = () => {
            const sensors = snapshotSensors(bus, true)
            const headers = arrayConcatMany(
                Object.entries(sensors).map(([key, values]) =>
                    new Array(values.length)
                        .fill(0)
                        .map((_, i) => `${key}${i + 1}`)
                )
            )
            const values = arrayConcatMany(
                Object.values(sensors).map(v => v as number[])
            )
            const msg = {
                source: "jacdac",
                type: "datarow",
                sensors,
                headers,
                values,
            }
            //console.log({ sensors, headers, values })
            window.parent.postMessage(msg, "*")
        }

        const id = setInterval(upload, 100)
        return () => {
            clearInterval(id)
            console.debug("datastreamer: stop uploader")
        }
    })
    return <span></span>
}
