import React from "react"
import DeviceScriptTextEditor from "../../components/devicescript/DeviceScriptTextEditor"

export const frontmatter = {
    title: "DeviceScript Editor",
    description: "Edit DeviceScript programs.",
}
import CoreHead from "../../components/shell/Head"
export const Head = props => <CoreHead {...props} {...frontmatter} />

export default function Page() {
    return <DeviceScriptTextEditor />
}
