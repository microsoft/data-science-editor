import React, { useMemo } from "react"
import { Card, CardContent, Grid, Typography, useTheme } from "@mui/material"
import {
    identifierToUrlPath,
    serviceSpecificationFromClassIdentifier,
} from "../../../jacdac-ts/src/jdom/spec"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { CardActionArea } from "gatsby-theme-material-ui"
import { arrayShuffle } from "../../../jacdac-ts/src/jdom/utils"
import useDeviceImage from "../devices/useDeviceImage"
import {
    escapeDeviceIdentifier,
    humanify,
} from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import useDeviceSpecifications from "../devices/useDeviceSpecifications"
import useGridBreakpoints from "../useGridBreakpoints"
import CardMediaWithSkeleton from "../ui/CardMediaWithSkeleton"

function DeviceSpecificationCard(props: {
    specification: jdspec.DeviceSpec
    size: "list" | "catalog"
}) {
    const { specification, size } = props
    const { id, name, company, services } = specification
    const theme = useTheme()
    const height = theme.spacing(31)
    const imageUrl = useDeviceImage(specification, size)
    const serviceNames = services
        ?.map(sc =>
            humanify(serviceSpecificationFromClassIdentifier(sc)?.shortName)
        )
        ?.join(", ")
    return (
        <Card>
            <CardActionArea to={`/devices/${identifierToUrlPath(id)}`}>
                <CardMediaWithSkeleton
                    height={height}
                    src={imageUrl}
                    title={`photograph of ${specification.name}`}
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
                        {serviceNames || ""}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {company}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

export default function DeviceSpecificationList(props: {
    count?: number
    shuffle?: boolean
    company?: string
    requiredServiceClasses?: number[]
    devices?: jdspec.DeviceSpec[]
}) {
    const { count, shuffle, requiredServiceClasses, company, devices } = props
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
        if (shuffle) arrayShuffle(r)
        if (count !== undefined) r = r.slice(0, count)
        return r
    }, [
        requiredServiceClasses,
        shuffle,
        count,
        company,
        JSON.stringify(devices?.map(d => d.id)),
        specifications,
    ])
    const gridBreakpoints = useGridBreakpoints(specs.length)
    const size = specs?.length < 6 ? "catalog" : "list"

    if (!specs.length)
        return (
            <Typography variant="body1">No device registered yet.</Typography>
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
