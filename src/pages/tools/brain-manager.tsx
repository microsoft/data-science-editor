import React from "react"
import ApiKeyAccordion from "../../components/ApiKeyAccordion"
import { BRAIN_API_KEY } from "../../components/brains/api"
import useSessionStorage from "../../components/hooks/useSessionStorage"

export const frontmatter = {
    title: "Brain Manager",
    description: "Manage brains.",
}

import CoreHead from "../../components/shell/Head"
export const Head = props => <CoreHead {...props} {...frontmatter} />

export default function Page() {
    const [apiToken, setApiToken] = useSessionStorage(BRAIN_API_KEY)
    return (
        <>
            <h1>Brain Manager</h1>
            <ApiKeyAccordion apiKey={apiToken} setApiKey={setApiToken}>
                Enter your brain management API key.
            </ApiKeyAccordion>
        </>
    )
}
