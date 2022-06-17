import { Link } from "gatsby-theme-material-ui"
import React from "react"
import ServiceSpecificationEditor from "../../components/tools/ServiceSpecificationEditor"

export const frontmatter = {
    title: "Service Specification Editor",
    description: "Edit a service markdown specification and preview the output. Start a pull request with the service content.",
}

export default function Page() {
    return (
        <>
            <h1>Service Specification Editor</h1>
            <p>
                Read the{" "}
                <Link to="/reference/service-specification/">
                    service specification
                </Link>{" "}
                documentation. Use the packet console to monitor packets from
                your devices.
            </p>
            <ServiceSpecificationEditor />
        </>
    )
}
