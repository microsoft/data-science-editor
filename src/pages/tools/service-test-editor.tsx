import { Link } from "gatsby-theme-material-ui"
import React from "react"
import ServiceTestEditor from "../../components/tools/ServiceTestEditor"

export default function Page() {
    return (
        <>
            <h1>Service Test Editor</h1>
            <p>
                Read the{" "}
                <Link to="/reference/service-tests">
                    service test
                </Link>{" "}
                documentation.
            </p>
            <ServiceTestEditor />
        </>
    )
}
