import React, { useMemo } from "react"
import { Card, CardContent, Chip, Grid, Typography } from "@mui/material"
import {
    identifierToUrlPath,
    serviceSpecificationFromClassIdentifier,
} from "../../../jacdac-ts/src/jdom/spec"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { CardActionArea } from "gatsby-theme-material-ui"
import { arrayShuffle, uniqueMap } from "../../../jacdac-ts/src/jdom/utils"
import useDeviceImage from "../devices/useDeviceImage"
import {
    escapeDeviceIdentifier,
    humanify,
} from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import useDeviceSpecifications from "../devices/useDeviceSpecifications"
import useGridBreakpoints from "../useGridBreakpoints"
import ChipList from "../ui/ChipList"
import { serviceName } from "../../../jacdac-ts/src/jdom/pretty"

function DeviceSpecificationCard(props: {
    specification: jdspec.DeviceSpec
    size: "list" | "preview" | "catalog"
}) {
    const { specification, size } = props
    const {
        id,
        name,
        company,
        services,
        hardwareDesign,
        firmwareSource,
        storeLink,
    } = specification
    const imageUrl = useDeviceImage(specification, size)
    const serviceNames = uniqueMap(
        services,
        srv => srv + "",
        srv => srv
    )
        ?.map(sc =>
            humanify(
                serviceSpecificationFromClassIdentifier(
                    sc
                )?.shortName.toLowerCase()
            )
        )
        ?.join(", ")
    return (
        <Card>
            <CardActionArea to={`/devices/${identifierToUrlPath(id)}`}>
                <img
                    src={imageUrl}
                    style={{ aspectRatio: "3 / 2", width: "100%" }}
                    alt={`photograph of ${specification.name}`}
                />
                <CardContent>
                    <Typography
                        gutterBottom
                        variant="subtitle1"
                        component="div"
                    >
                        {name}
                    </Typography>
                    <Typography component="div" variant="subtitle2">
                        {serviceNames || "no services"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {company}
                    </Typography>
                    <ChipList>
                        {!storeLink && <Chip size="small" label="prototype" />}
                        {firmwareSource && (
                            <Chip size="small" label="firmware code" />
                        )}
                        {hardwareDesign && (
                            <Chip size="small" label="hardware design" />
                        )}
                    </ChipList>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

export default function DeviceSpecificationList(props: {
    query?: string
    count?: number
    shuffle?: boolean
    company?: string
    requiredServiceClasses?: number[]
    devices?: jdspec.DeviceSpec[]
    updates?: boolean
    buyNow?: boolean
    firmwareSources?: boolean
    hardwareDesign?: boolean
    transports?: jdspec.TransportType[]
    tags?: string[]
}) {
    const {
        query,
        count,
        shuffle,
        requiredServiceClasses,
        company,
        devices,
        updates,
        buyNow,
        hardwareDesign,
        firmwareSources,
        transports,
        tags,
    } = props
    const specifications = useDeviceSpecifications()
    const specs = useMemo(() => {
        let r = devices || specifications
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
        if (shuffle) arrayShuffle(r)
        if (count !== undefined) r = r.slice(0, count)
        return r
    }, [
        query,
        requiredServiceClasses,
        shuffle,
        count,
        company,
        JSON.stringify(devices?.map(d => d.id)),
        specifications,
        updates,
        buyNow,
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
