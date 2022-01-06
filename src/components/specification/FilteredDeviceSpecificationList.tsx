import { Box } from "@mui/material"
import React, { useState } from "react"
import ChipList from "../ui/ChipList"
import FilterChip from "../ui/FilterChip"
import DeviceSpecificationList from "./DeviceSpecificationList"
import ServiceSpecificationSelect from "./ServiceSpecificationSelect"

export default function FilteredDeviceSpecificationList(props: {
    count?: number
    shuffle?: boolean
    company?: string
}) {
    const { ...others } = props

    const [serviceClass, setServiceClass] = useState<number>(NaN)
    const handleServiceChanged = value => setServiceClass(value)

    const [firmwareSources, setFirmwareSources] = useState(false)
    const [hardwareDesign, setHardwareDesign] = useState(false)
    const requiredServiceClasses = !isNaN(serviceClass) && [serviceClass]

    const handleSetFirmwareSources = () => setFirmwareSources(c => !c);
    const handleSetHardwareDesign = () => setHardwareDesign(c => !c);
    return (
        <>
            <Box display="flex" mb={1}>
                <ServiceSpecificationSelect
                    label="Filter by Service"
                    serviceClass={serviceClass}
                    setServiceClass={handleServiceChanged}
                    hasRegisteredDevice={true}
                />
                <ChipList>
                    <FilterChip label="firmware code" value={firmwareSources} onClick={handleSetFirmwareSources} />
                    <FilterChip label="hardware design" value={hardwareDesign} onClick={handleSetHardwareDesign} />
                </ChipList>
            </Box>
            <DeviceSpecificationList
                {...others}
                firmwareSources={firmwareSources}
                hardwareDesign={hardwareDesign}
                requiredServiceClasses={requiredServiceClasses}
            />
        </>
    )
}
