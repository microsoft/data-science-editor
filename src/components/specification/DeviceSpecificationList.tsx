import React, { useMemo } from "react"
import { Grid, Typography } from "@mui/material"
import { escapeDeviceIdentifier } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import useDeviceSpecifications from "../devices/useDeviceSpecifications"
import useGridBreakpoints from "../useGridBreakpoints"
import { serviceName } from "../../../jacdac-ts/src/jdom/pretty"
import DeviceSpecificationCard from "./DeviceSpecificationCard"

export default function DeviceSpecificationList(props: {
    query?: string
    count?: number
    company?: string
    requiredServiceClasses?: number[]
    devices?: jdspec.DeviceSpec[]
    updates?: boolean
    buyNow?: boolean
    makeCode?: boolean
    firmwareSources?: boolean
    hardwareDesign?: boolean
    transports?: jdspec.TransportType[]
    tags?: string[]
}) {
    const {
        query,
        count,
        requiredServiceClasses,
        company,
        devices,
        updates,
        buyNow,
        makeCode,
        hardwareDesign,
        firmwareSources,
        transports,
        tags,
    } = props
    const specifications = useDeviceSpecifications()
    const specs = useMemo(() => {
        let r = (devices || specifications).slice(0)
        if (company) {
            const lc = escapeDeviceIdentifier(company)
            r = r.filter(spec =>
                escapeDeviceIdentifier(spec.company).startsWith(lc)
            )
        }
        if (requiredServiceClasses)
            r = r.filter(
                spec =>
                    spec.services.length &&
                    requiredServiceClasses.every(
                        srv => spec.services.indexOf(srv) > -1
                    )
            )
        if (updates) r = r.filter(spec => spec.repo)
        if (buyNow) r = r.filter(spec => !!spec.storeLink)
        if (hardwareDesign) r = r.filter(spec => spec.hardwareDesign)
        if (firmwareSources) r = r.filter(spec => spec.firmwareSource)
        if (makeCode) r = r.filter(spec => spec.makeCodeRepo)
        if (transports?.length)
            r = r.filter(spec => transports.indexOf(spec.transport?.type) > -1)
        if (tags?.length)
            r = r.filter(spec => spec.tags?.find(tag => tags.includes(tag)))
        if (query)
            r = r.filter(spec =>
                [
                    spec.name,
                    spec.description,
                    spec.company,
                    ...(spec.productIdentifiers || []).map(p => p.toString(16)),
                    ...spec.services.map(p => p.toString(16)),
                    ...spec.services.map(srv => serviceName(srv)),
                ].some(s => s?.toLowerCase()?.indexOf(query.toLowerCase()) > -1)
            )
        r.sort(
            (a, b) =>
                (a.connector === "noConnector" ? 1 : 0) -
                (b.connector === "noConnector" ? 1 : 0)
        )
        if (count !== undefined) r = r.slice(0, count)
        return r
    }, [
        query,
        requiredServiceClasses,
        count,
        company,
        JSON.stringify(devices?.map(d => d.id)),
        specifications,
        updates,
        buyNow,
        makeCode,
        hardwareDesign,
        firmwareSources,
        transports?.join(","),
        tags?.join(","),
    ])
    const gridBreakpoints = useGridBreakpoints(specs.length)
    const size = specs?.length < 6 ? "catalog" : "preview"

    if (!specs.length)
        return (
            <Typography variant="body1">
                {query
                    ? `No device matching the search criterias.`
                    : `No device registered yet.`}
            </Typography>
        )

    return (
        <Grid container spacing={2}>
            {specs.map(specification => (
                <Grid key={specification.id} item {...gridBreakpoints}>
                    <DeviceSpecificationCard
                        specification={specification}
                        size={size}
                    />
                </Grid>
            ))}
        </Grid>
    )
}
