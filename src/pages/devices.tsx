import React from "react"
import FilteredDeviceSpecificationList from "../components/specification/FilteredDeviceSpecificationList"

export default function Page() {
    return (
        <FilteredDeviceSpecificationList
            showServiceList={true}
            showSearch={true}
        />
    )
}
