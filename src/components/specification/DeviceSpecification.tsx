import React, { useMemo } from "react"
import IDChip from "../IDChip"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import ServiceSpecificationCard from "./ServiceSpecificationCard"
import { Box, Chip, Grid } from "@mui/material"
import useGridBreakpoints from "../useGridBreakpoints"
import Markdown from "../ui/Markdown"
import DeviceSpecificationSource from "./DeviceSpecificationSource"
import FirmwareCard from "../firmware/FirmwareCard"
import useDeviceImage from "../devices/useDeviceImage"
import DownloadFirmwareButton from "../ui/DownloadFirmwareButton"
import MemoryIcon from "@mui/icons-material/Memory"
import ChipList from "../ui/ChipList"
import { semverCmp } from "../semver"
import DeviceSpecificationList from "./DeviceSpecificationList"
import StructuredData from "../ui/StructuredData"
import useDeviceSpecifications from "../devices/useDeviceSpecifications"
import { Link } from "gatsby-theme-material-ui"

function DeviceStructuredData(props: { device: jdspec.DeviceSpec }) {
    const { device } = props
    const payload = useMemo(() => {
        const { name, description, company, status } = device
        const availability = {
            deprecated: "Discontinued",
            experimental: "LimitedAvailability",
        }[status]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r: any = {
            "@context": "https://schema.org/",
            "@type": "Product",
            name,
            image: [
                useDeviceImage(device, "preview"),
                useDeviceImage(device, "catalog"),
                useDeviceImage(device, "full"),
            ],
            description,
            sku: device.id,
            brand: {
                "@type": "Brand",
                name: company,
            },
        }
        if (availability) r.availability = availability
        return r
    }, [device])
    return <StructuredData payload={payload} />
}

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
        hardwareDesign,
        firmwareSource,
    } = device
    const { services } = device
    const specifications = useDeviceSpecifications()
    const gridBreakpoints = useGridBreakpoints()
    const imageUrl = useDeviceImage(device, "catalog")

    const others =
        designIdentifier &&
        specifications
            .filter(
                spec =>
                    spec.id !== device.id &&
                    spec.designIdentifier === designIdentifier &&
                    spec.version !== undefined
            )
            ?.sort((l, r) => semverCmp(l.version, r.version))

    return (
        <>
            <DeviceStructuredData device={device} />
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
                            .map(serviceClass => ({
                                serviceClass,
                                spec: serviceSpecificationFromClassIdentifier(
                                    serviceClass
                                ),
                            }))
                            .map(({ serviceClass, spec }) => (
                                <Grid
                                    item
                                    key={serviceClass}
                                    {...gridBreakpoints}
                                >
                                    <ServiceSpecificationCard
                                        serviceClass={serviceClass}
                                        specification={spec}
                                    />
                                </Grid>
                            ))}
                    </Grid>
                </>
            )}
            {(hardwareDesign || firmwareSource) && (
                <>
                    <h3>Sources</h3>
                    <ul>
                        {hardwareDesign && (
                            <li>
                                <Link target="_blank" href={hardwareDesign}>
                                    Hardware design
                                </Link>
                            </li>
                        )}
                        {firmwareSource && (
                            <li>
                                <Link target="_blank" href={firmwareSource}>
                                    Firmware code
                                </Link>
                            </li>
                        )}
                    </ul>
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
