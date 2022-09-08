import React from "react"
import JacscriptEditor from "../../components/jacscript/JacscriptEditor"

export const frontmatter = {
    title: "Jacscript Editor",
    description: "Edit Jacscript programs using blocks.",
}
import CoreHead from "../../components/shell/Head"
export const Head = (props) => <CoreHead {...props} {...frontmatter} />

export default function Page() {
    return <JacscriptEditor />
}
