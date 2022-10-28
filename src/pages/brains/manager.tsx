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
    const { domain, setDomain, token, setToken } =
        useContext(BrainManagerContext)
    return (
        <>
            <h1>Brain Manager</h1>
            {domain && (
                <ul>
                    <li>
                        <a href={`https://${domain}/swagger/`}>
                            https://{domain}/swagger/
                        </a>
                    </li>
                </ul>
            )}
            <ApiKeyAccordion
                title="Domain"
                apiKey={domain}
                setApiKey={setDomain}
                inputType="text"
            >
                Enter your Web api domain.
            </ApiKeyAccordion>
            <ApiKeyAccordion title="Token" apiKey={token} setApiKey={setToken}>
                Enter your brain management API key.
            </ApiKeyAccordion>
        </>
    )
}
