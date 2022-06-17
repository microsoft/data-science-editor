import React from "react"
import JacscriptEditor from "../../components/jacscript/JacscriptEditor"

export const frontmatter = {
    title: "Jacscript Editor",
    description: "Edit Jacscript programs using blocks.",
}

export default function Page() {
    return <JacscriptEditor />
}
