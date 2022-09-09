import React from "react"
import Home from "../components/home/Home"

import CoreHead from "../components/shell/Head"
export const frontmatter = {
    title: "Jacdac",
}
export const Head = props => <CoreHead {...props} {...frontmatter} />

export default Home
