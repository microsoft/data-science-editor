import { Grid, TextField } from "@mui/material"
import React, { ChangeEvent, startTransition, useMemo, useState } from "react"
import { arrayConcatMany, unique } from "../../../jacdac-ts/src/jdom/utils"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"
import TransportIcon from "../icons/TransportIcon"
import FilterChip from "../ui/FilterChip"
import DeviceSpecificationList from "./DeviceSpecificationList"
import ServiceSpecificationSelect from "./ServiceSpecificationSelect"

export default function FilteredDeviceSpecificationList(props: {
    count?: number
    company?: string
}) {
    const { ...others } = props
    const bus = useBus()
    const { deviceCatalog } = bus

    const [serviceClass, setServiceClass] = useState<number>(NaN)
    const handleServiceChanged = value => setServiceClass(value)

    const [query, setQuery] = useState("")
    const [firmwareSources, setFirmwareSources] = useState(false)
    const [hardwareDesign, setHardwareDesign] = useState(false)
    const [usb, setUsb] = useState(false)
    const [serial, setSerial] = useState(false)
    const [buyNow, setBuyNow] = useState(false)
    const [makeCode, setMakeCode] = useState(false)

    const requiredServiceClasses = !isNaN(serviceClass) && [serviceClass]

    const tags = useChange(deviceCatalog, _ =>
        unique(
            arrayConcatMany(
                _.specifications()
                    .map(spec => spec.tags)
                    .filter(tags => !!tags)
            )
        )
    )
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    const handleSearchQueryChange = (e: ChangeEvent<HTMLInputElement>) =>
        startTransition(() => setQuery(e.target.value))
    const handleSetFirmwareSources = () => setFirmwareSources(c => !c)
    const handleSetHardwareDesign = () => setHardwareDesign(c => !c)
    const handleSetUSB = () => setUsb(c => !c)
    const handleSetSerial = () => setSerial(c => !c)
    const handleBuyNow = () => setBuyNow(c => !c)
    const handleMakeCode = () => setMakeCode(c => !c)
    const handleSetSelectedTag = (tag: string) => () =>
        setSelectedTags(ts => {
            const i = ts.indexOf(tag)
            if (i < 0) return [...ts, tag]
            else return [...ts.slice(0, i), ...ts.slice(i + 1)]
        })

    const transports = useMemo<jdspec.TransportType[]>(
        () =>
            [usb && "usb", serial && "serial"].filter(
                t => !!t
            ) as jdspec.TransportType[],
        [usb, serial]
    )
    return (
        <>
            <Grid sx={{ mb: 1 }} container spacing={1}>
                <Grid item xs={12}>
                    <TextField
                        tabIndex={0}
                        type="search"
                        value={query}
                        fullWidth={true}
                        size="small"
                        label="Search devices"
                        aria-label="Search devices"
                        onChange={handleSearchQueryChange}
                    />
                </Grid>
                <Grid item xs>
                    <ServiceSpecificationSelect
                        label="Filter by Service"
                        serviceClass={serviceClass}
                        setServiceClass={handleServiceChanged}
                        hasRegisteredDevice={true}
                    />
                </Grid>
                <Grid item>
                    <FilterChip
                        label="buy now"
                        value={buyNow}
                        onClick={handleBuyNow}
                    />
                </Grid>
                <Grid item>
                    <FilterChip
                        label="MakeCode"
                        value={makeCode}
                        onClick={handleMakeCode}
                    />
                </Grid>
                <Grid item>
                    <FilterChip
                        label="firmware code"
                        value={firmwareSources}
                        onClick={handleSetFirmwareSources}
                    />
                </Grid>
                <Grid item>
                    <FilterChip
                        label="hardware design"
                        value={hardwareDesign}
                        onClick={handleSetHardwareDesign}
                    />
                </Grid>
                <Grid item>
                    <FilterChip
                        label="USB"
                        value={usb}
                        onClick={handleSetUSB}
                        icon={<TransportIcon type="usb" />}
                    />
                </Grid>
                <Grid item>
                    <FilterChip
                        label="Serial"
                        value={serial}
                        onClick={handleSetSerial}
                        icon={<TransportIcon type="serial" />}
                    />
                </Grid>
                {tags?.map(tag => (
                    <Grid item key={tag}>
                        <FilterChip
                            label={tag}
                            value={selectedTags.indexOf(tag) > -1}
                            onClick={handleSetSelectedTag(tag)}
                        />
                    </Grid>
                ))}
            </Grid>
            <DeviceSpecificationList
                {...others}
                query={query}
                buyNow={buyNow}
                makeCode={makeCode}
                firmwareSources={firmwareSources}
                hardwareDesign={hardwareDesign}
                requiredServiceClasses={requiredServiceClasses}
                transports={transports}
                tags={selectedTags}
            />
        </>
    )
}
