import React from "react"
import DSBlockEditor from "../../components/blockly/DSBlockEditor"

export const frontmatter = {
    title: "Data Science Editor",
    description: "Manipulate data using a block coding.",
}

export default function Page() {
    return <DSBlockEditor />
}
