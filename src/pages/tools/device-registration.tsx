/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { lazy, useMemo, useState } from "react"
import { Grid, Select, SelectChangeEvent } from "@mui/material"
import useLocalStorage from "../../components/hooks/useLocalStorage"
import { clone, unique } from "../../../jacdac-ts/src/jdom/utils"
import {
    Box,
    Chip,
    Menu,
    MenuItem,
    TextField,
    Typography,
    Card,
    CardActions,
    Button,
} from "@mui/material"
import { ChangeEvent } from "react"
import {
    identifierToUrlPath,
    isInfrastructure,
    serviceSpecificationFromClassIdentifier,
} from "../../../jacdac-ts/src/jdom/spec"
import PaperBox from "../../components/ui/PaperBox"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import AddIcon from "@mui/icons-material/Add"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import CreateIcon from "@mui/icons-material/Create"
import IconButtonWithTooltip from "../../components/ui/IconButtonWithTooltip"
import { parseRepoUrl } from "../../components/github"
import {
    DEVICE_IMAGE_HEIGHT,
    DEVICE_IMAGE_WIDTH,
    generateDeviceSpecificationId,
    normalizeDeviceSpecification,
} from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import ImportImageCanvas from "../../components/ui/ImageImportCanvas"
// tslint:disable-next-line: no-submodule-imports
import { Autocomplete } from "@mui/material"
import { useFirmwareBlob } from "../../components/firmware/useFirmwareBlobs"
import { FirmwareBlob } from "../../../jacdac-ts/src/jdom/flashing"
import { useId } from "react"
import AddServiceIconButton from "../../components/AddServiceIconButton"
import useDevices from "../../components/hooks/useDevices"
import DeviceCardHeader from "../../components/devices/DeviceCardHeader"
import Suspense from "../../components/ui/Suspense"
import { ControlReg } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useGridBreakpoints from "../../components/useGridBreakpoints"
import Alert from "../../components/ui/Alert"
import { GithubPullRequestFiles } from "../../components/buttons/GithubPullRequestButton"
import useDeviceSpecifications from "../../components/devices/useDeviceSpecifications"
import useDeviceCatalog from "../../components/devices/useDeviceCatalog"
import GridHeader from "../../components/ui/GridHeader"
import { JD_SERVICE_INDEX_CTRL } from "../../../jacdac-ts/src/jdom/constants"
import ClearIcon from "@mui/icons-material/Clear"
import { Link } from "gatsby-theme-material-ui"
const GithubPullRequestButton = lazy(
    () => import("../../components/buttons/GithubPullRequestButton")
)

function CompanySelect(props: {
    error?: string
    onValueChange?: (name: string) => void
    company: string
    setCompany: (c: string) => void
}) {
    const { company, setCompany, error } = props
    const specifications = useDeviceSpecifications()
    const companies = useMemo(
        () => unique(specifications.map(dev => dev.company)).sort(),
        [specifications]
    )
    const id = useId()
    const companyId = id + "-company"

    const handleChange = (ev: unknown, newValue: string) => setCompany(newValue)
    const renderInputs = params => (
        <TextField
            {...params}
            error={!!error}
            label="Company*"
            helperText={error}
            variant="outlined"
        />
    )

    return (
        <Autocomplete
            id={companyId}
            freeSolo={true}
            fullWidth={true}
            includeInputInList
            autoComplete
            options={companies}
            renderInput={renderInputs}
            inputValue={company}
            onInputChange={handleChange}
        />
    )
}

export default function DeviceRegistration() {
    const [device, setDevice] = useLocalStorage<jdspec.DeviceSpec>(
        "jacdac:devicedesigner;2",
        {
            id: "my-device",
            name: "My device",
            services: [],
            productIdentifiers: [],
            repo: "",
            version: "",
        } as jdspec.DeviceSpec
    )
    const gridBreakpoints = useGridBreakpoints()
    const devices = useDevices({
        announced: true,
        physical: true,
        ignoreInfrastructure: true,
        productIdentifier: true,
    })
    const updateDevice = () => {
        const dev = clone(device)
        dev.id = generateDeviceSpecificationId(dev)
        setDevice(dev)
    }
    const [firmwaresAnchorEl, setFirmwaresAnchorEl] =
        React.useState<null | HTMLElement>(null)
    const [imageDataURI, setImageDataURI] = useState<string>(undefined)
    const deviceCatalog = useDeviceCatalog()
    const id = useId()
    const nameId = id + "-name"
    const firmwareMenuId = id + "-firmwaremenu"
    const repoId = id + "-repo"
    const makeCodeRepoId = id + "-makecoderepo"
    const identifierId = id + "-identifier"
    const urlId = id + "-url"
    const descriptionId = id + "-description"
    const homepageId = id + "-homepage"
    const hardwareVersionId = id + "-hwversion"
    const hardwareDesignId = id + "-hwdesign"
    const firmwareSourceId = id + "-hwsource"
    const storeLinkId = id + "-store"
    const connectorId = id + "-connector"
    const shapeId = id + "-shape"
    const specifications = useDeviceSpecifications({
        includeDeprecated: true,
        includeExperimental: true,
    })
    const handleClear = () => {
        setDevice({
            id: "my-device",
            name: "",
            services: [],
            productIdentifiers: [],
            repo: "",
        } as jdspec.DeviceSpec)
        setImageDataURI(undefined)
    }
    const handleServiceAdd = (srv: jdspec.ServiceSpec) => {
        console.log(`add`, srv.classIdentifier)
        device.services.push(srv.classIdentifier)
        updateDevice()
    }
    const companyRepos = useMemo(
        () =>
            unique(
                specifications
                    .filter(d => d.company === device.company)
                    .map(d => d.repo)
                    .filter(repo => !!repo)
            ),
        [device?.company, specifications]
    )
    const { firmwareBlobs } = useFirmwareBlob(device.repo)
    const variant = "outlined"
    const companyError =
        device.company?.length > 64
            ? "Company is too long (max 64 characters)"
            : undefined
    const nameError =
        device.name?.length > 64
            ? "Name is too long (max 64 characters)"
            : undefined
    const parsedRepo = parseRepoUrl(device.repo)
    const githubError =
        device.repo && !parsedRepo ? "invalid GitHub repository" : ""
    const linkError =
        !device.link || /^https:\/\//i.test(device.link)
            ? ""
            : "Must be https://..."
    const storeLinkError =
        !device.storeLink || /^https:\/\//i.test(device.storeLink as string)
            ? ""
            : "Must be https://..."
    const idError =
        !device.id || !device.name
            ? "missing identifier"
            : specifications.find(dev => dev.id == device.id)
            ? "identifer already used"
            : ""
    const imageError = !imageDataURI ? "missing image" : ""
    const versionError =
        device?.version &&
        !/^(v\d+\.\d+(\.\d+(\.\d+)?)?\w?)?$/.test(device?.version)
            ? "Preferred format is vN.N"
            : ""
    const ok =
        !nameError &&
        !linkError &&
        !idError &&
        !imageError &&
        !companyError &&
        !versionError

    const route = device.id?.split("-").join("/")
    const modulePath = ok && `devices/${route}.json`
    const imagePath = ok && `devices/${route}.jpg`

    const handleNameChange = (ev: ChangeEvent<HTMLInputElement>) => {
        device.name = ev.target.value
        updateDevice()
    }
    const handleRepoChange = (ev: unknown, newValue: string) => {
        device.repo = newValue
        updateDevice()
    }
    const handleMakeCodeRepoChange = (ev: ChangeEvent<HTMLInputElement>) => {
        device.makeCodeRepo = ev.target.value?.trim()
        updateDevice()
    }
    const handleLinkChange = (ev: ChangeEvent<HTMLInputElement>) => {
        device.link = ev.target.value
        updateDevice()
    }
    const handleDescriptionChange = (ev: ChangeEvent<HTMLInputElement>) => {
        device.description = ev.target.value
        updateDevice()
    }
    const handleDeleteService = (i: number) => () => {
        device.services.splice(i, 1)
        updateDevice()
    }
    const handleDeleteFirmware = (i: number) => () => {
        device.productIdentifiers.splice(i, 1)
        updateDevice()
    }
    const handleVersion = (ev: ChangeEvent<HTMLInputElement>) => {
        device.version = ev.target.value?.trim()
        updateDevice()
    }
    const handleStoreLinkChange = (ev: ChangeEvent<HTMLInputElement>) => {
        device.storeLink = ev.target.value?.trim()
        updateDevice()
    }
    const handleShapeChange = (ev: SelectChangeEvent<jdspec.JacdacConnectorType>) => {
        device.shape = ev.target.value?.trim() as jdspec.ShapeWellKnown
        updateDevice()
    }
    const handleFirmwareAddClick = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        setFirmwaresAnchorEl(event.currentTarget)
        updateDevice()
    }
    const handleProductIdentifierAddRandomClick = () => {
        if (!device.productIdentifiers) device.productIdentifiers = []
        device.productIdentifiers.push(
            parseInt(deviceCatalog.uniqueFirmwareId(), 16)
        )
        updateDevice()
    }
    const handleFirmwareAddClose = (blob: FirmwareBlob) => () => {
        setFirmwaresAnchorEl(null)
        const id = blob?.productIdentifier
        if (id !== undefined) {
            device.productIdentifiers.push(id)
            device.name = blob.name
            updateDevice()
        }
    }
    const handleImageImported = (cvs: HTMLCanvasElement) => {
        const url = cvs.toDataURL("image/jpeg", 100)
        setImageDataURI(url)
    }
    const handleCompanyChanged = (value: string) => {
        device.company = value
        updateDevice()
    }
    const handleFirmwareSourceChanged = (ev: ChangeEvent<HTMLInputElement>) => {
        device.firmwareSource = ev.target.value?.trim()
        updateDevice()
    }
    const handleHardwareDesignChanged = (ev: ChangeEvent<HTMLInputElement>) => {
        device.hardwareDesign = ev.target.value?.trim()
        updateDevice()
    }
    const handleConnectorChanged = (
        ev: SelectChangeEvent<jdspec.JacdacConnectorType>
    ) => {
        device.connector = ev.target.value as jdspec.JacdacConnectorType
        if (device.connector === "edgeConsumer") delete device.connector
        updateDevice()
    }
    const renderRepoInput = params => (
        <TextField
            {...params}
            error={!!githubError}
            type="url"
            label="Firmware repository"
            helperText={
                githubError ||
                "GitHub Repository hosting the firmware binaries."
            }
            variant="outlined"
        />
    )
    const handleImportDevice = (dev: JDDevice) => async () => {
        const d: jdspec.DeviceSpec = {
            id: "my-device",
            name: "My device",
            company: "",
            services: [],
            productIdentifiers: [],
            repo: "",
        }

        const controlService = dev.service(JD_SERVICE_INDEX_CTRL)
        const descrReg = controlService.register(ControlReg.DeviceDescription)
        await descrReg.refresh()

        const fw = await dev.resolveProductIdentifier()
        if (fw) d.productIdentifiers = [fw]
        else d.productIdentifiers = []
        d.services = dev
            .services()
            .filter(srv => !isInfrastructure(srv.specification))
            .map(srv => srv.serviceClass)
        const description = (descrReg.stringValue || "").split(/\s+/g)
        d.company = description.shift() || ""
        d.name = description.join(" ")
        d.description = ""
        d.name?.replace(/\wv\d+.\d+\w/, m => {
            device.version = m
            return ""
        })

        setDevice(d)
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    const files = useMemo<GithubPullRequestFiles>(
        () =>
            modulePath && {
                [modulePath]: JSON.stringify(
                    normalizeDeviceSpecification(device),
                    null,
                    2
                ),
                [imagePath]: {
                    content: imageDataURI?.slice(imageDataURI?.indexOf(",")),
                    encoding: "base64",
                },
            },
        [modulePath, imagePath, imageDataURI, JSON.stringify(device)]
    )

    return (
        <>
            <h1>
                Device Registration
                <IconButtonWithTooltip
                    sx={{ ml: 1 }}
                    title="New Device"
                    onClick={handleClear}
                >
                    <ClearIcon />
                </IconButtonWithTooltip>
            </h1>
            <p>
                Fill in <b>Device Name</b>, <b>Company</b> and <b>Version</b> to
                uniquely identify your device. Fill in the additional fields
                with information about your devices and click on{" "}
                <b>Start Registration</b> to request an entry in the{" "}
                <Link target="_blank" to="/devices/" underline="hover">
                    Device Catalog
                </Link>
                .
            </p>
            <Grid container spacing={3}>
                {devices.map(dev => (
                    <Grid item key={dev.id} {...gridBreakpoints}>
                        <Card>
                            <DeviceCardHeader
                                device={dev}
                                showAvatar={true}
                                showDescription={true}
                            />
                            <CardActions>
                                <Button
                                    variant="outlined"
                                    onClick={handleImportDevice(dev)}
                                >
                                    Import
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
                <Grid item xs={12}>
                    <TextField
                        id={nameId}
                        required
                        error={!!nameError}
                        helperText={nameError}
                        fullWidth={true}
                        label="Device Name"
                        placeholder="My device"
                        value={device.name || ""}
                        onChange={handleNameChange}
                        variant={variant}
                    />
                    <Typography variant="caption">
                        Name of the device, without company or version. The name
                        will be used to generate the device identifier.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <CompanySelect
                        company={device?.company || ""}
                        error={companyError}
                        setCompany={handleCompanyChanged}
                    />
                    <Typography variant="caption">
                        Name of the company manufacturing this device. The
                        company name will be used to generate the device
                        identifier.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id={hardwareVersionId}
                        required
                        fullWidth={true}
                        error={!!versionError}
                        helperText={versionError}
                        label="Version"
                        value={device?.version || ""}
                        onChange={handleVersion}
                        variant={variant}
                    />
                    <Typography variant="caption">
                        Revision identifier for this hardware design using
                        semver format (v1.0, v1.1, ...).
                    </Typography>
                </Grid>
                <GridHeader title="Auto-generated Links" />
                <Grid item xs={12}>
                    <TextField
                        id={identifierId}
                        disabled
                        error={!!idError}
                        helperText={idError}
                        fullWidth={true}
                        label="Device Identifier"
                        variant={variant}
                        value={device.id || ""}
                    />
                    <Typography variant="caption">
                        This generated identifer is a URL friendly string
                        created from your company and product name.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id={urlId}
                        disabled
                        error={!!idError}
                        helperText={idError}
                        fullWidth={true}
                        label="Device Catalog URL"
                        variant={variant}
                        value={`https://microsoft.github.io/jacdac-docs/${identifierToUrlPath(
                            device.id
                        )}/`}
                    />
                    <Typography variant="caption">
                        The auto-generated URL that links to the page for this
                        device in the Device Catalog. If this URL is too long
                        for a QR Code, use a URL shortening service. To generate
                        a QR Code for your PCB, use the{" "}
                        <Link target="_blank" to="/tools/device-qr-code/">
                            Device QR Code Generator
                        </Link>{" "}
                        page.
                    </Typography>
                </Grid>

                <GridHeader title="Services" />
                <Grid item xs={12}>
                    <PaperBox elevation={1}>
                        <Typography>Product Identifiers</Typography>
                        {device.productIdentifiers?.map((id, i) => {
                            const blob = firmwareBlobs?.find(
                                b => b.productIdentifier == id
                            )
                            return (
                                <Box
                                    component="span"
                                    ml={0.5}
                                    mb={0.5}
                                    key={id}
                                >
                                    <Chip
                                        label={
                                            blob
                                                ? `${
                                                      blob.name
                                                  } (0x${id.toString(16)})`
                                                : `0x${id.toString(16)}`
                                        }
                                        onDelete={handleDeleteFirmware(i)}
                                    />
                                </Box>
                            )
                        })}
                        <IconButtonWithTooltip
                            title="Add random product identifier"
                            onClick={handleProductIdentifierAddRandomClick}
                        >
                            <CreateIcon />
                        </IconButtonWithTooltip>
                        {firmwareBlobs && (
                            <IconButtonWithTooltip
                                title="Add product identifier from repository"
                                aria-controls={firmwareMenuId}
                                aria-haspopup="true"
                                onClick={handleFirmwareAddClick}
                            >
                                <AddIcon />
                            </IconButtonWithTooltip>
                        )}
                        <Menu
                            id={firmwareMenuId}
                            anchorEl={firmwaresAnchorEl}
                            keepMounted
                            open={Boolean(firmwaresAnchorEl)}
                            onClose={handleFirmwareAddClose(undefined)}
                        >
                            {firmwareBlobs?.map(blob => (
                                <MenuItem
                                    key={blob.productIdentifier}
                                    value={blob.productIdentifier.toString(16)}
                                    onClick={handleFirmwareAddClose(blob)}
                                >
                                    {blob.name}
                                    <Typography
                                        variant="caption"
                                        component="span"
                                    >
                                        {blob.version}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                        <Typography variant="caption" component="div">
                            Product identifiers uniquely identify your hardware
                            on the Jacdac bus. Each revision of your hardware
                            should have a different identifier.
                        </Typography>
                    </PaperBox>
                </Grid>
                <Grid item xs={12}>
                    <PaperBox elevation={1}>
                        <Typography color="inherit">Services</Typography>
                        {device.services?.map((id, i) => (
                            <Box component="span" m={0.5} key={`${id}.${i}`}>
                                <Chip
                                    label={
                                        serviceSpecificationFromClassIdentifier(
                                            id
                                        )?.name || id
                                    }
                                    onDelete={handleDeleteService(i)}
                                />
                            </Box>
                        ))}
                        <AddServiceIconButton onAdd={handleServiceAdd} />
                    </PaperBox>
                </Grid>
                <Grid item xs={12}>
                    <PaperBox elevation={1}>
                        <Typography color="inherit">
                            Jacdac Connector
                        </Typography>
                        <Select
                            id={connectorId}
                            fullWidth={true}
                            size="small"
                            value={device.connector || "edgeConsumer"}
                            onChange={handleConnectorChanged}
                        >
                            <MenuItem value="noConnector">
                                No PCB edge connector
                            </MenuItem>
                            <MenuItem value="edgeIndependent">
                                PCB edge connector, independently powered
                            </MenuItem>
                            <MenuItem value="edgeConsumer">
                                PCB edge connector, consumer - power always
                                taken from Jacdac bus
                            </MenuItem>
                            <MenuItem value="edgeLowCurrentProvider">
                                PCB edge connector, low current provider - power
                                always provided to the Jacdac bus
                            </MenuItem>
                            <MenuItem value="edgeHighCurrentProvider">
                                PCB edge connector, high current provider
                            </MenuItem>
                            <MenuItem value="edgeLowCurrentProviderConsumer">
                                PCB edge connector, low current provider or
                                consumer
                            </MenuItem>
                            <MenuItem value="edgeHighCurrentProviderConsumer">
                                PCB edge connector, high current provider or
                                consumer
                            </MenuItem>
                            <MenuItem value="edgePassive">
                                PCB edge connector, passive - passthrough for
                                power and signal
                            </MenuItem>
                        </Select>
                        <Typography variant="caption" component="div">
                            Choose the type of Jacdac connector present on the
                            hardware, and the type of type of{" "}
                            <Link
                                target="_blank"
                                to="/ddk/design/#power-supply-sharing"
                            >
                                power supply sharing
                            </Link>
                            .
                        </Typography>
                    </PaperBox>
                </Grid>
                <Grid item xs={12}>
                    <PaperBox elevation={1}>
                        <Typography color="inherit">PCB Form factor</Typography>
                        <Select
                            id={shapeId}
                            fullWidth={true}
                            size="small"
                            value={device.shape || ""}
                            onChange={handleShapeChange}
                        >
                            <MenuItem value="">Unknown shape</MenuItem>
                            <MenuItem value="ec30_2x2_l">
                                EC30 grid, 20mm x 20mm, Jacdac edge connector on
                                the left
                            </MenuItem>
                            <MenuItem value="ec30_2x2_lr">
                                EC30 grid, 20mm x 20mm, Jacdac edge connector on
                                the left and right
                            </MenuItem>
                            <MenuItem value="ec30_3x2_l">
                                EC30 grid, 30mm x 20mm, Jacdac edge connector on
                                the left
                            </MenuItem>
                            <MenuItem value="ec30_3x2_lr">
                                EC30 grid, 30mm x 20mm, Jacdac edge connector on
                                the left and right
                            </MenuItem>
                            <MenuItem value="ec30_3x3_l">
                                EC30 grid, 30mm x 30mm, Jacdac edge connector on
                                the left
                            </MenuItem>
                            <MenuItem value="ec30_3x3_lr">
                                EC30 grid, 30mm x 30mm, Jacdac edge connector on
                                the left and right
                            </MenuItem>
                            <MenuItem value="ec30_5x2_l">
                                EC30 grid, 50mm x 30mm, Jacdac edge connector on
                                the left
                            </MenuItem>
                            <MenuItem value="ec30_5x2_lr">
                                EC30 grid, 50mm x 30mm, Jacdac edge connector on
                                the left and right
                            </MenuItem>
                        </Select>
                        <Typography variant="caption" component="div">
                            Choose the form factor of the PCB if applicable.
                        </Typography>
                    </PaperBox>
                </Grid>
                <GridHeader title="Catalog" />
                <Grid item xs={12}>
                    <TextField
                        id={descriptionId}
                        fullWidth={true}
                        required
                        label="Description"
                        multiline={true}
                        rows={4}
                        value={device.description || ""}
                        onChange={handleDescriptionChange}
                        variant={variant}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id={homepageId}
                        label="Home page URL"
                        error={!!linkError}
                        helperText={linkError}
                        fullWidth={true}
                        placeholder="https://..."
                        value={device.link || ""}
                        onChange={handleLinkChange}
                        variant={variant}
                        type="url"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id={storeLinkId}
                        label="Store URL"
                        error={!!storeLinkError}
                        helperText={
                            "URL where the device can be purchased" ||
                            storeLinkError
                        }
                        fullWidth={true}
                        placeholder="https://..."
                        value={device.storeLink || ""}
                        onChange={handleStoreLinkChange}
                        variant={variant}
                        type="url"
                    />
                </Grid>
                <Grid item xs={12}>
                    <PaperBox>
                        <Typography>Image</Typography>
                        <ImportImageCanvas
                            width={DEVICE_IMAGE_WIDTH}
                            height={DEVICE_IMAGE_HEIGHT}
                            onImageImported={handleImageImported}
                        />
                        <Typography variant="caption" component="div">
                            {`Import an image of the device: must be at least ${DEVICE_IMAGE_WIDTH}x${DEVICE_IMAGE_HEIGHT}, device must be fully visible on a wood (preferrably bamboo background).`}
                        </Typography>
                        {imageError && (
                            <Alert severity="error">{imageError}</Alert>
                        )}
                    </PaperBox>
                </Grid>
                <GridHeader title="Firmware and hardware information (optional)" />
                <Grid item xs={12}>
                    <Autocomplete
                        id={repoId}
                        freeSolo={true}
                        autoComplete
                        placeholder="https://github.com/..."
                        inputValue={device.repo || ""}
                        onInputChange={handleRepoChange}
                        options={companyRepos}
                        renderInput={renderRepoInput}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id={makeCodeRepoId}
                        fullWidth={true}
                        helperText="URL to MakeCode extension"
                        label="MakeCode extension"
                        placeholder="https://github.com/..."
                        value={device?.makeCodeRepo || ""}
                        onChange={handleMakeCodeRepoChange}
                        variant={variant}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id={firmwareSourceId}
                        fullWidth={true}
                        helperText="public URL to the firmware sources. If possible, provide a deep link to the relevant source files."
                        label="Firmware source repository"
                        placeholder="https://github.com/..."
                        value={device?.firmwareSource || ""}
                        onChange={handleFirmwareSourceChanged}
                        variant={variant}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id={hardwareDesignId}
                        fullWidth={true}
                        helperText="public URL to the repositry of hardware design files. If possible, provide a deep link to the relevant source files."
                        label="Hardware design repository"
                        placeholder="https://github.com/..."
                        value={device?.hardwareDesign}
                        onChange={handleHardwareDesignChanged}
                        variant={variant}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Suspense>
                        <GithubPullRequestButton
                            label={"start registration"}
                            title={`Device: ${device.name}`}
                            head={`devices/${device.id}`}
                            description={`This pull request will start the registration of your device in the Jacdac catalog.`}
                            files={files}
                        />
                    </Suspense>
                </Grid>
            </Grid>
        </>
    )
}
