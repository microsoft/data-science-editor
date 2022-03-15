import { Link } from "gatsby-theme-material-ui"
import React from "react"
import ServiceSpecificationEditor from "../../components/tools/ServiceSpecificationEditor"

export default function Page() {
    return (
        <>
            <h1>Service Specification Editor</h1>
            <p>
                Read the{" "}
                <Link to="/reference/service-specification/">
                    service specifiation
                </Link>{" "}
                documentation. Use the packet console to monitor packets from
                your devices.
            </p>
            <ServiceSpecificationEditor />
        </>
    )
}
