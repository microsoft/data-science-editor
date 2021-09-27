import React from "react"
import IDChip from "../IDChip"
import { Link } from "gatsby-theme-material-ui"
import {
    identifierToUrlPath,
    serviceSpecificationFromClassIdentifier,
} from "../../../jacdac-ts/src/jdom/spec"
import ServiceSpecificationCard from "./ServiceSpecificationCard"
import { Box, Grid, Typography } from "@material-ui/core"
import useGridBreakpoints from "../useGridBreakpoints"
import Markdown from "../ui/Markdown"
import DeviceSpecificationSource from "./DeviceSpecificationSource"
import FirmwareCard from "../firmware/FirmwareCard"
import { escapeDeviceIdentifier } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import useDeviceImage from "../devices/useDeviceImage"
import GithubDowloadRawFileButton from "../ui/GithubDowloadRawFileButton"

export default function DeviceSpecification(props: {
    device: jdspec.DeviceSpec
    showSource?: boolean
}) {
    const { device, showSource } = props
    const { name, description, company, productIdentifiers, repo, firmwares } =
        device
    const { services } = device
    const gridBreakpoints = useGridBreakpoints()
    const imageUrl = useDeviceImage(device)

    return (
        <>
            <h2 key="title">{name}</h2>
            <Typography variant="subtitle1">
                by{" "}
                <Link
                    to={`/devices/${identifierToUrlPath(
                        escapeDeviceIdentifier(company)
                    )}`}
                >
                    {company}
                </Link>
                {!!productIdentifiers?.length && (
                    <>
                        &nbsp;
                        {productIdentifiers.map(identifier => (
                            <IDChip
                                key={identifier}
                                id={identifier}
                                filter={`pid:0x${identifier.toString(16)}`}
                            />
                        ))}
                    </>
                )}
            </Typography>
            {
                <Box mt={1}>
                    <img alt={`device ${name}`} src={imageUrl} loading="lazy" />
                </Box>
            }
            {description && <Markdown source={description} />}
            {repo && <FirmwareCard slug={repo} />}
            {!!firmwares && (
                <>
                    <h3>Firmwares</h3>
                    <ul>
                        {firmwares.map(({ name, url }) => (
                            <li key={url}>
                                <GithubDowloadRawFileButton
                                    url={url}
                                    name={name}
                                >
                                    {name}
                                </GithubDowloadRawFileButton>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {!!services?.length && (
                <>
                    <h3>Services</h3>
                    <Grid container spacing={2}>
                        {services
                            .map(sc =>
                                serviceSpecificationFromClassIdentifier(sc)
                            )
                            .map(spec => (
                                <Grid
                                    item
                                    key={spec.shortId}
                                    {...gridBreakpoints}
                                >
                                    <ServiceSpecificationCard
                                        specification={spec}
                                    />
                                </Grid>
                            ))}
                    </Grid>
                </>
            )}
            {showSource && (
                <>
                    <h3>Specification</h3>
                    <DeviceSpecificationSource
                        deviceSpecification={device}
                        showJSON={true}
                    />
                </>
            )}
        </>
    )
}
