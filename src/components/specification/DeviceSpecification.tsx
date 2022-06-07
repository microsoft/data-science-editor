import React, { lazy, useMemo } from "react"
import IDChip from "../IDChip"
import {
    identifierToUrlPath,
    serviceSpecificationFromClassIdentifier,
} from "../../../jacdac-ts/src/jdom/spec"
import { AlertTitle, Chip, Divider, Grid, Typography } from "@mui/material"
import useGridBreakpoints from "../useGridBreakpoints"
import Markdown from "../ui/Markdown"
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
import { arrayify, ellipseFirstSentence, unique } from "../../../jacdac-ts/src/jdom/utils"
import Alert from "../ui/Alert"
import { deviceCatalog } from "../../../jacdac-ts/src/jdom/catalog"
import DeviceSpecificationCard from "./DeviceSpecificationCard"
import useChange from "../../jacdac/useChange"
import Suspense from "../ui/Suspense"
import MakeCodeProjects from "../makecode/MakeCodeProjects"
import PageLinkList from "../ui/PageLinkList"
import MakeCodeExtensions from "../makecode/MakeCodeExtensions"
import WebShareButton from "../ui/WebShareButton"
import GithubRepositoryList from "../github/GithubRespositoryList"
const Enclosure = lazy(() => import("../enclosure/Enclosure"))

const HR_GAP = 4

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
}) {
    const { device } = props
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
        connector = "edgeConsumer",
        devices,
        shape,
    } = device
    const storeLinks = arrayify(storeLink)
    const services = unique(device.services)
    const specifications = useDeviceSpecifications()
    const gridBreakpoints = useGridBreakpoints()
    const imageUrl = useDeviceImage(device, "catalog")
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
    const serviceSpecs = services
        .map(serviceSpecificationFromClassIdentifier)
        .filter(sc => !!sc)

    return (
        <>
            <DeviceStructuredData device={device} />
            <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                    <div style={{ position: "relative" }}>
                        <img
                            alt={`device ${name}`}
                            src={imageUrl}
                            loading="lazy"
                        />
                        <WebShareButton
                            style={{
                                top: "1rem",
                                right: "1rem",
                                position: "absolute",
                            }}
                            title={`Jacdac - ${name}`}
                            text={description}
                        />
                    </div>
                </Grid>
                <Grid item xs={12} sm={7}>
                    <h2 key="title">
                        {name}
                        {!!version && (
                            <Typography
                                sx={{ ml: 1 }}
                                component="span"
                                variant="subtitle1"
                            >
                                v{version}
                            </Typography>
                        )}
                        <Typography component="div" variant="subtitle1">
                            by{" "}
                            <Link
                                to={`/devices/${identifierToUrlPath(company)}/`}
                            >
                                {company}
                            </Link>
                        </Typography>
                    </h2>
                    <Divider sx={{ mb: 2 }} light={true} />
                    {connector === "noConnector" && (
                        <Alert severity="warning">
                            <AlertTitle>
                                No PCB edge connector available.
                            </AlertTitle>
                            This device does <b>not</b> have a Jacdac PCB edge
                            connector. It is programmable as a Jacdac device but
                            it cannot be connected to other devices with a
                            cable.
                        </Alert>
                    )}
                    {connector === "edgeIndependent" && (
                        <Alert severity="warning">
                            <AlertTitle>
                                Independently powered PCB edge connector
                                available.
                            </AlertTitle>
                            This device has a Jacdac PCB edge connector without
                            a power connection. It is programmable as a Jacdac
                            device and it can be connected to other devices with
                            a cable, but it will not provide to modules or
                            consume power the Jacdac bus.
                        </Alert>
                    )}
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
                    {!storeLink?.length && (
                        <Alert severity="info">
                            <AlertTitle>Prototype Hardware</AlertTitle>
                            This device is a prototype <b>not</b> available for
                            purchase.
                        </Alert>
                    )}
                    {!!storeLinks?.length && (
                        <>
                            <h3>Buy now</h3>
                            <p>
                                Here is a list of resellers where you can buy
                                this device.
                            </p>
                            <ul>
                                {storeLinks.map(link => (
                                    <Link key={link} href={link}>
                                        {link}
                                    </Link>
                                ))}
                            </ul>
                        </>
                    )}
                </Grid>
            </Grid>
            {makeCodeRepo?.length && (
                <>
                    <Divider light={true} />
                    <h3 id="makecodeextensions">
                        Required MakeCode Extensions
                    </h3>
                    <p>
                        These MakeCode Extensions are needed to use Jacdac with
                        this device.
                    </p>
                    <GithubRepositoryList
                        repos={makeCodeRepo}
                        showDescription={true}
                        showDependencies={true}
                        showMakeCodeButton={true}
                    />
                </>
            )}
            {!!services?.length && (
                <>
                    <Divider light={true} />
                    <h3 id="makecode">MakeCode Projects</h3>
                    <MakeCodeProjects serviceClass={services} />
                    <MakeCodeExtensions
                        header={<h4 id="makecodeextensions">Extensions</h4>}
                        serviceClass={services}
                    />
                </>
            )}
            {!!deviceSpecs?.length && (
                <>
                    <Divider light={true} />
                    <h3>Kit Devices</h3>
                    <Grid sx={{ mb: HR_GAP }} container spacing={2}>
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
                    <Divider light={true} />
                    <h3>Kits</h3>
                    <Grid sx={{ mb: HR_GAP }} container spacing={2}>
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
            <Divider light={true} />
            <h2>Technical Details</h2>
            <ChipList>
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
            <PageLinkList
                header={<h3 id="services">Service specifications</h3>}
                nodes={serviceSpecs.map(({ shortId, name, notes }) => ({
                    slug: `/services/${shortId}/`,
                    title: name,
                    description: ellipseFirstSentence(notes["short"]),
                }))}
            />
            {shape && (
                <>
                    <h3 id="pcbformfactor">PCB Form Factor</h3>
                    <p>
                        Use the files below to get started with laser cutting
                        and 3D modelling for this device.
                    </p>
                    <Suspense>
                        <Enclosure shape={shape} />
                    </Suspense>
                </>
            )}
            {!!firmwares && (
                <>
                    <h3 id="firmwarebinaries">Firmware binaries</h3>
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
            {repo && (
                <>
                    <h3 id="firmwarerepository">Firmware repository</h3>
                    <FirmwareCard slug={repo} />
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
                    <h3>Other hardware revisions</h3>
                    <DeviceSpecificationList devices={others} />
                </>
            )}
        </>
    )
}
