import React, { useContext } from "react"
import ApiKeyAccordion from "../../components/ApiKeyAccordion"
import BrainManagerContext from "../../components/brains/BrainManagerContext"

export const frontmatter = {
    title: "Brain Manager",
    description: "Manage brains.",
}

import CoreHead from "../../components/shell/Head"
export const Head = props => <CoreHead {...props} {...frontmatter} />

export default function Page() {
    const { token, setToken } = useContext(BrainManagerContext)
    return (
        <>
            <h1>Brain Manager</h1>
            <ApiKeyAccordion apiKey={token} setApiKey={setToken}>
                Enter your brain management API key.
            </ApiKeyAccordion>
        </>
    )
}
