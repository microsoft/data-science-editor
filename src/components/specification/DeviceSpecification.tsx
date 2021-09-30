import React from "react"
import IDChip from "../IDChip"
import {
    deviceSpecifications,
    serviceSpecificationFromClassIdentifier,
} from "../../../jacdac-ts/src/jdom/spec"
import ServiceSpecificationCard from "./ServiceSpecificationCard"
import { Box, Chip, Grid } from "@material-ui/core"
import useGridBreakpoints from "../useGridBreakpoints"
import Markdown from "../ui/Markdown"
import DeviceSpecificationSource from "./DeviceSpecificationSource"
import FirmwareCard from "../firmware/FirmwareCard"
import useDeviceImage from "../devices/useDeviceImage"
import DownloadFirmwareButton from "../ui/DownloadFirmwareButton"
import MemoryIcon from "@material-ui/icons/Memory"
import ChipList from "../ui/ChipList"
import { semverCmp } from "../semver"
import DeviceSpecificationList from "./DeviceSpecificationList"

export default function DeviceSpecification(props: {
    device: jdspec.DeviceSpec
    showSource?: boolean
}) {
    const { device, showSource } = props
    const {
        name,
        description,
        company,
        productIdentifiers,
        repo,
        firmwares,
        version,
        designIdentifier,
    } = device
    const { services } = device
    const gridBreakpoints = useGridBreakpoints()
    const imageUrl = useDeviceImage(device, "catalog")

    const others =
        designIdentifier &&
        deviceSpecifications()
            .filter(
                spec =>
                    spec.id !== device.id &&
                    spec.designIdentifier === designIdentifier &&
                    spec.version !== undefined
            )
            ?.sort((l, r) => semverCmp(l.version, r.version))

    return (
        <>
            <h2 key="title">
                {name}
                {!!version && ` v${version}`}
            </h2>
            <ChipList>
                <Chip size="small" label={company} />
                {designIdentifier && (
                    <Chip
                        aria-label={`design identifier: ${designIdentifier}`}
                        icon={<MemoryIcon />}
                        size="small"
                        label={designIdentifier}
                    />
                )}
                {productIdentifiers?.map(identifier => (
                    <IDChip
                        key={identifier}
                        id={identifier}
                        filter={`pid:0x${identifier.toString(16)}`}
                    />
                ))}
            </ChipList>
            <Box mt={1}>
                <img alt={`device ${name}`} src={imageUrl} loading="lazy" />
            </Box>
            {description && <Markdown source={description} />}
            {repo && <FirmwareCard slug={repo} />}
            {!!firmwares && (
                <>
                    <h3>Firmwares</h3>
                    <p>
                        Drag and drop the files below to your device drive. You
                        might have to press the bootloader button once to see
                        this drive.
                    </p>
                    <ul>
                        {firmwares.map(({ name, url }) => (
                            <li key={url}>
                                <DownloadFirmwareButton
                                    url={url}
                                    name={name}
                                    variant="outlined"
                                >
                                    {name}
                                </DownloadFirmwareButton>
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
            {!!others?.length && (
                <>
                    <h3>Other revisions</h3>
                    <DeviceSpecificationList devices={others} />
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
