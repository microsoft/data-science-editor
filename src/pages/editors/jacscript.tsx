import React from "react"
import JacscriptTextEditor from "../../components/jacscript/JacscriptTextEditor"

export const frontmatter = {
    title: "Jacscript Editor",
    description: "Edit Jacscript programs.",
}
import CoreHead from "../../components/shell/Head"
export const Head = (props) => <CoreHead {...props} {...frontmatter} />


export default function Page() {
    return <JacscriptTextEditor />
}
