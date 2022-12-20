import React from "react"
import DSBlockEditor from "../components/blockly/DSBlockEditor"

import CoreHead from "../components/shell/Head"
export const frontmatter = {
    title: "Data Science Editor",
}
export const Head = props => <CoreHead {...props} {...frontmatter} />

export default DSBlockEditor
