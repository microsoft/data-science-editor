import React from "react"
import FilteredDeviceSpecificationList from "../components/specification/FilteredDeviceSpecificationList"

export const frontmatter = {
    title: "Devices",
}
import CoreHead from "../components/shell/Head"
export const Head = props => <CoreHead {...props} {...frontmatter} />

export default function Page() {
    return (
        <FilteredDeviceSpecificationList
            showServiceList={true}
            showSearch={true}
        />
    )
}
