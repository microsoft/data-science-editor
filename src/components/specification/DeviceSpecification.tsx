import React from "react"
import IDChip from "../IDChip"
import { Link } from "gatsby-theme-material-ui"
import {
    identifierToUrlPath,
    serviceSpecificationFromClassIdentifier,
} from "../../../jacdac-ts/src/jdom/spec"
import ServiceSpecificationCard from "./ServiceSpecificationCard"
import { Grid, Typography } from "@material-ui/core"
import useGridBreakpoints from "../useGridBreakpoints"
import Markdown from "../ui/Markdown"
import DeviceSpecificationSource from "./DeviceSpecificationSource"
import FirmwareCard from "../firmware/FirmwareCard"
import { escapeDeviceIdentifier } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import useDeviceImage from "../devices/useDeviceImage"

export default function DeviceSpecification(props: {
    device: jdspec.DeviceSpec
    showSource?: boolean
}) {
    const { device, showSource } = props
    const gridBreakpoints = useGridBreakpoints()
    const imageUrl = useDeviceImage(device)

    return (
        <>
            <h2 key="title">{device.name}</h2>
            <Typography variant="subtitle1">
                by{" "}
                <Link
                    to={`/devices/${identifierToUrlPath(
                        escapeDeviceIdentifier(device.company)
                    )}`}
                >
                    {device.company}
                </Link>
            </Typography>
            {
                <img
                    alt={`device ${device.name}`}
                    src={imageUrl}
                    loading="lazy"
                />
            }
            {device.description && <Markdown source={device.description} />}
            {device.repo && <FirmwareCard slug={device.repo} />}
            {!!device.productIdentifiers?.length && (
                <>
                    <h3>Product identifiers</h3>
                    <ul>
                        {device.productIdentifiers.map(identifier => (
                            <li key={identifier}>
                                <IDChip
                                    id={identifier}
                                    filter={`pid:0x${identifier.toString(16)}`}
                                />
                            </li>
                        ))}
                    </ul>
                </>
            )}
            <h3>Services</h3>
            <Grid container spacing={2}>
                {device.services
                    .map(sc => serviceSpecificationFromClassIdentifier(sc))
                    .map(spec => (
                        <Grid item key={spec.shortId} {...gridBreakpoints}>
                            <ServiceSpecificationCard specification={spec} />
                        </Grid>
                    ))}
            </Grid>
            {showSource && (
                <>
                    <h2>Specification</h2>
                    <DeviceSpecificationSource
                        deviceSpecification={device}
                        showJSON={true}
                    />
                </>
            )}
        </>
    )
}
