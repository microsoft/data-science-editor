import React from "react"
export const frontmatter = {
    title: "Web Tools",
    hideBreadcrumbs: true,
}
import CoreHead from "../components/shell/Head"
export const Head = props => <CoreHead {...props} {...frontmatter} />

import Tools from "../components/home/Tools"
export default Tools
