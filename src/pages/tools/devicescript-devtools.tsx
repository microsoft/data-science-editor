import React from "react"
import DeviceScriptDevTools from "../../components/devicescript/DeviceScriptDevTools"

export const frontmatter = {
    title: "DeviceScript Developer Tools",
    description: "Edit, debug, deploy DeviceScript programs.",
}
import CoreHead from "../../components/shell/Head"
export const Head = props => <CoreHead {...props} {...frontmatter} />

export default function Page() {
    return <DeviceScriptDevTools />
}
