import React, { useMemo } from "react"
import IDChip from "../IDChip"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import ServiceSpecificationCard from "./ServiceSpecificationCard"
import { AlertTitle, Box, Chip, Grid } from "@mui/material"
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
import { Button, Link } from "gatsby-theme-material-ui"
import { uniqueMap } from "../../../jacdac-ts/src/jdom/utils"
import Alert from "../ui/Alert"
import GithubRepositoryCard from "../github/GithubRepositoryCard"
import { deviceCatalog } from "../../../jacdac-ts/src/jdom/catalog"
import DeviceSpecificationCard from "./DeviceSpecificationCard"
import useChange from "../../jacdac/useChange"

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
        id,
        name,
        description,
        company,
        productIdentifiers,
        repo,
        makeCodeRepo,
        firmwares,
        version,
        designIdentifier,
        hardwareDesign,
        firmwareSource,
        link,
        storeLink,
        connector = "edge",
        devices,
    } = device
    const { services } = device
    const specifications = useDeviceSpecifications()
    const gridBreakpoints = useGridBreakpoints()
    const imageUrl = useDeviceImage(device, "catalog")
    console.log({ devices })
    const deviceSpecs = useChange(
        deviceCatalog,
        _ =>
            devices
                ?.map(id => _.specificationFromIdentifier(id))
                .filter(s => !!s),
        [devices?.join(",")]
    )
    const kitSpecs = useChange(deviceCatalog, _ =>
        _.specifications().filter(s => s.devices?.indexOf(id) > -1)
    )

    const others = specifications
        .filter(
            spec =>
                spec.id !== device.id &&
                ((designIdentifier &&
                    spec.designIdentifier === designIdentifier) ||
                    (spec.company === device.company &&
                        spec.name === device.name)) &&
                spec.version !== undefined
        )
        ?.sort((l, r) => semverCmp(l.version, r.version))

    return (
        <>
            <DeviceStructuredData device={device} />
            {!storeLink && (
                <Alert severity="info">
                    <AlertTitle>Prototype Hardware</AlertTitle>
                    This device is a prototype <b>not</b> available for
                    purchase.
                </Alert>
            )}
            <h2 key="title">
                {name}
                {!!version && ` v${version}`}
                {storeLink && (
                    <Button
                        sx={{ ml: 1 }}
                        href={storeLink}
                        variant="contained"
                        color="primary"
                    >
                        Buy Now
                    </Button>
                )}
            </h2>
            {connector === "none" && (
                <Alert severity="warning">
                    <AlertTitle>No edge connector available.</AlertTitle>
                    This device does <b>not</b> have a Jacdac PCB edge
                    connector. It is programmable as a Jacdac device but it
                    cannot be connected to other devices with a cable.
                </Alert>
            )}
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
            {link && (
                <p>
                    Learn more about
                    <Link sx={{ ml: 1 }} href={link}>
                        {name}
                    </Link>
                    .
                </p>
            )}
            {!!deviceSpecs?.length && (
                <>
                    <h3>Kit Devices</h3>
                    <Grid container spacing={2}>
                        {deviceSpecs.map(specification => (
                            <Grid
                                key={specification.id}
                                item
                                {...gridBreakpoints}
                            >
                                <DeviceSpecificationCard
                                    specification={specification}
                                    size={"catalog"}
                                />
                            </Grid>
                        ))}
                    </Grid>{" "}
                </>
            )}
            {!!kitSpecs?.length && (
                <>
                    <h3>Kits</h3>
                    <Grid container spacing={2}>
                        {kitSpecs.map(specification => (
                            <Grid
                                key={specification.id}
                                item
                                {...gridBreakpoints}
                            >
                                <DeviceSpecificationCard
                                    specification={specification}
                                    size={"catalog"}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
            {!!services?.length && (
                <>
                    <h3>Services</h3>
                    <Grid container spacing={2}>
                        {uniqueMap(
                            services,
                            id => id.toString(16),
                            id => id
                        )
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
            {repo && (
                <>
                    <h3>Firmware</h3>
                    <FirmwareCard slug={repo} />
                </>
            )}
            {makeCodeRepo && (
                <>
                    <h3>MakeCode Extension</h3>
                    <GithubRepositoryCard
                        slug={makeCodeRepo}
                        showDescription={true}
                        showDependencies={true}
                        showMakeCodeButton={true}
                    />
                </>
            )}
            {!!firmwares && (
                <>
                    <h3>Firmware</h3>
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
            {(hardwareDesign || firmwareSource) && (
                <>
                    <h3>Sources</h3>
                    <ul>
                        {firmwareSource && (
                            <li>
                                <Link target="_blank" href={firmwareSource}>
                                    Firmware code
                                </Link>
                            </li>
                        )}
                        {hardwareDesign && (
                            <li>
                                <Link target="_blank" href={hardwareDesign}>
                                    Hardware design
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
