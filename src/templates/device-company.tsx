import { Link } from "gatsby-theme-material-ui"
import React from "react"
import FilteredDeviceSpecificationList from "../components/specification/FilteredDeviceSpecificationList"

export default function Page(props: { pageContext: { company: string } }) {
    return (
        <>
            <h1>{props.pageContext.company}</h1>
            <FilteredDeviceSpecificationList
                company={props.pageContext.company}
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
