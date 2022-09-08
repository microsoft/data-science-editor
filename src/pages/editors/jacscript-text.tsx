import React from "react"
import JacscriptTextEditor from "../../components/jacscript/JacscriptTextEditor"

export const frontmatter = {
    title: "Jacscript Text Editor",
    description: "Edit Jacscript programs using text.",
}
import CoreHead from "../../components/shell/Head"
export const Head = (props) => <CoreHead {...props} {...frontmatter} />


export default function Page() {
    return <JacscriptTextEditor />
}
