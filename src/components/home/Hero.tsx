import React from "react"
import { StaticImage } from "gatsby-plugin-image"
import SplitGrid from "./SplitGrid"

export default function Hero() {
    return <SplitGrid title="Jacdac" subtitle="plug-and-play for microcontrollers"
        image={<StaticImage src="./manymodulestogether.png" alt="Many Modules Together" />
        } />
}
