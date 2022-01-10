import { Box } from "@mui/material"
import React, { useMemo, useState } from "react"
import TransportIcon from "../icons/TransportIcon"
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
    const [usb, setUsb] = useState(false)
    const [serial, setSerial] = useState(false)
    const requiredServiceClasses = !isNaN(serviceClass) && [serviceClass]

    const handleSetFirmwareSources = () => setFirmwareSources(c => !c)
    const handleSetHardwareDesign = () => setHardwareDesign(c => !c)
    const handleSetUSB = () => setUsb(c => !c)
    const handleSetSerial = () => setSerial(c => !c)

    const transports = useMemo<jdspec.TransportType[]>(
        () => [usb && "usb", serial && "serial"].filter(t => !!t) as jdspec.TransportType[],
        [usb, serial]
    )
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
                    <FilterChip
                        label="firmware code"
                        value={firmwareSources}
                        onClick={handleSetFirmwareSources}
                    />
                    <FilterChip
                        label="hardware design"
                        value={hardwareDesign}
                        onClick={handleSetHardwareDesign}
                    />
                    <FilterChip
                        label="USB"
                        value={usb}
                        onClick={handleSetUSB}
                        icon={<TransportIcon type="usb" />}
                    />
                    <FilterChip
                        label="Serial"
                        value={serial}
                        onClick={handleSetSerial}
                        icon={<TransportIcon type="serial" />}
                    />
                </ChipList>
            </Box>
            <DeviceSpecificationList
                {...others}
                firmwareSources={firmwareSources}
                hardwareDesign={hardwareDesign}
                requiredServiceClasses={requiredServiceClasses}
                transports={transports}
            />
        </>
    )
}
