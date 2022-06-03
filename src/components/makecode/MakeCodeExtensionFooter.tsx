import { Link } from "gatsby-theme-material-ui"
import React from "react"
import DeviceSpecificationList from "../specification/DeviceSpecificationList"
import MakeCodeProjects from "./MakeCodeProjects"

export default function MakeCodeExtensionFooter(props: {
    serviceName: string
}) {
    const { serviceName } = props

    return (
        <>
            <MakeCodeProjects
                header={<h2 id="projects">Projects</h2>}
                serviceName={serviceName}
            />

            <DeviceSpecificationList
                header={<h2 id="devices">Devices</h2>}
                buyNow={true}
                serviceName={serviceName}
            />
            <h2>See Also</h2>
            <ul>
                <li>
                    <Link to={`/user-guide/`}>User guide</Link>
                </li>
                <li>
                    <Link to={`/services/${serviceName}`}>
                        Service specification
                    </Link>
                </li>
            </ul>
        </>
    )
}
