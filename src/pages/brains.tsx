import React, { useContext } from "react"
import BrainHome from "../components/brains/BrainHome"
import BrainManagerContext from "../components/brains/BrainManagerContext"

import CoreHead from "../components/shell/Head"
export const frontmatter = {
    title: "Low-Code Connected Things",
}
export const Head = props => <CoreHead {...props} {...frontmatter} />

export default function Page() {
    const { brainManager } = useContext(BrainManagerContext)
    return brainManager ? <BrainHome /> : <div>...</div>
}
