import { Link } from "gatsby-theme-material-ui"
import React from "react"
import FilteredDeviceSpecificationList from "../components/specification/FilteredDeviceSpecificationList"

import CoreHead from "../components/shell/Head"
export const Head = (props) => <CoreHead {...props} />

export default function Page(props: { pageContext: { company: string } }) {
    const { company } = props.pageContext
    return (
        <>
            <h1>{company}</h1>
            <FilteredDeviceSpecificationList
                showServiceList={true}
                showSearch={true}
                company={company}
            />
            <h2>See Also</h2>
            <ul>
                <li>
                    <Link to="/reference/device-registration/">
                        device registration
                    </Link>
                </li>
            </ul>
        </>
    )
}
