import React, { lazy, useMemo, useState } from "react"
import { Grid, Link } from "@material-ui/core"
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
} from "@material-ui/core"
import { ChangeEvent } from "react"
import {
    deviceSpecifications,
    serviceSpecificationFromClassIdentifier,
} from "../../../jacdac-ts/src/jdom/spec"
import PaperBox from "../../components/ui/PaperBox"
import { uniqueFirmwareId } from "../../components/RandomGenerator"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import AddIcon from "@material-ui/icons/Add"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import CreateIcon from "@material-ui/icons/Create"
import IconButtonWithTooltip from "../../components/ui/IconButtonWithTooltip"
import { parseRepoUrl } from "../../components/github"
import {
    DEVICE_IMAGE_HEIGHT,
    DEVICE_IMAGE_WIDTH,
    escapeDeviceIdentifier,
    escapeDeviceNameIdentifier,
    normalizeDeviceSpecification,
} from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import ImportImageCanvas from "../../components/ImageImportCanvas"
// tslint:disable-next-line: no-submodule-imports
import { Autocomplete } from "@material-ui/lab/"
import { useFirmwareBlob } from "../../components/firmware/useFirmwareBlobs"
import { FirmwareBlob } from "../../../jacdac-ts/src/jdom/flashing"
import { useId } from "react-use-id-hook"
import AddServiceIconButton from "../../components/AddServiceIconButton"
import useDevices from "../../components/hooks/useDevices"
import DeviceCardHeader from "../../components/DeviceCardHeader"
import Suspense from "../../components/ui/Suspense"
import { ControlReg } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import useGridBreakpoints from "../../components/useGridBreakpoints"
import Alert from "../../components/ui/Alert"

const GithubPullRequestButton = lazy(
    () => import("../../components/buttons/GithubPullRequestButton")
)

function CompanySelect(props: {
    error?: string
    value?: string
    onValueChange?: (name: string) => void
}) {
    const { onValueChange, value, error } = props
    const [company, setCompany] = useState(value)
    const companies = useMemo(
        () => unique(deviceSpecifications().map(dev => dev.company)),
        []
    )
    const companyId = useId()
    const helperText =
        "Name of the company manufacturing this device. The company name will be used to generate the module identifier."

    const handleChange = (ev: unknown, newValue: string) => {
        setCompany(newValue)
        onValueChange?.(newValue)
    }
    const renderInputs = params => (
        <TextField
            {...params}
            error={!!error}
            label="Company"
            helperText={error || helperText}
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
            aria-label={helperText}
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
        } as jdspec.DeviceSpec
    )
    const gridBreakpoints = useGridBreakpoints()
    const devices = useDevices({
        announced: true,
        physical: true,
        ignoreSelf: true,
        productIdentifier: true,
    })
    const updateDevice = () => {
        setDevice(clone(device))
    }
    const [firmwaresAnchorEl, setFirmwaresAnchorEl] =
        React.useState<null | HTMLElement>(null)
    const [imageBase64, setImageBase64] = useState<string>(undefined)
    const nameId = useId()
    const firmwareMenuId = useId()
    const repoId = useId()
    const identifierId = useId()
    const descriptionId = useId()
    const homepageId = useId()
    const hardwareVersionId = useId()
    const hardwareDesignId = useId()
    const handleServiceAdd = (srv: jdspec.ServiceSpec) => {
        console.log(`add`, srv.classIdentifier)
        device.services.push(srv.classIdentifier)
        updateDevice()
    }
    const companyRepos = useMemo(
        () =>
            unique(
                deviceSpecifications()
                    .filter(d => d.company === device.company)
                    .map(d => d.repo)
                    .filter(repo => !!repo)
            ),
        [device?.company]
    )
    const { firmwareBlobs } = useFirmwareBlob(device.repo)
    const variant = "outlined"
    const companyError = !device.company ? "select a company" : ""
    const nameError = device.name?.length > 32 ? "name too long" : undefined
    const parsedRepo = parseRepoUrl(device.repo)
    const githubError = parsedRepo ? "" : "invalid GitHub repository"
    const linkError =
        !device.link || /^https:\/\//.test(device.link)
            ? ""
            : "Must be https://..."
    const idError = !device.id
        ? "missing identifier"
        : deviceSpecifications().find(dev => dev.id == device.id)
        ? "identifer already used"
        : ""
    const servicesError = device.services?.length
        ? ""
        : "Select at least one service"
    const imageError = !imageBase64 ? "missing image" : ""
    const ok =
        !nameError &&
        parsedRepo &&
        !linkError &&
        !idError &&
        !servicesError &&
        !imageError &&
        !companyError

    const route = device.id?.split("-").join("/")
    const modulePath = ok && `devices/${route}.json`
    const imagePath = ok && `devices/${route}.jpg`

    const updateDeviceId = () => {
        const companyid = escapeDeviceIdentifier(device.company)
        const nameid = escapeDeviceNameIdentifier(device.name)
        device.id = companyid + "-" + nameid
    }

    const handleNameChange = (ev: ChangeEvent<HTMLInputElement>) => {
        device.name = ev.target.value
        updateDeviceId()
        updateDevice()
    }
    const handleRepoChange = (ev: unknown, newValue: string) => {
        console.log(`new repo`, { newValue })
        device.repo = newValue
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
    const handleHardwareDesign = (ev: ChangeEvent<HTMLInputElement>) => {
        device.hardwareDesignIdentifier = ev.target.value
        updateDevice()
    }
    const handleHardwareVersion = (ev: ChangeEvent<HTMLInputElement>) => {
        device.hardwareDesignVersion = ev.target.value
        updateDevice()
    }
    const handleFirmwareAddClick = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        setFirmwaresAnchorEl(event.currentTarget)
        // device.firmwares.push(parseInt(uniqueFirmwareId(), 16))
        updateDevice()
    }
    const handleProductIdentifierAddRandomClick = () => {
        device.productIdentifiers.push(parseInt(uniqueFirmwareId(), 16))
        updateDevice()
    }
    const handleFirmwareAddClose = (blob: FirmwareBlob) => () => {
        setFirmwaresAnchorEl(null)
        const id = blob?.productIdentifier
        if (id !== undefined) {
            device.productIdentifiers.push(id)
            device.name = blob.name
            updateDeviceId()
            updateDevice()
        }
    }
    const handleImageImported = (cvs: HTMLCanvasElement) => {
        const url = cvs.toDataURL("image/jpeg", 99)
        setImageBase64(url.slice(url.indexOf(",")))
    }
    const handleCompanyChanged = (value: string) => {
        device.company = value
        updateDeviceId()
        updateDevice()
    }
    const renderRepoInput = params => (
        <TextField
            {...params}
            error={!!githubError}
            type="url"
            label="Firmware repository *"
            helperText={
                githubError ||
                "GitHub Repository hosting the firmware binaries."
            }
            variant="outlined"
        />
    )
    const handleImportDevice = (dev: JDDevice) => async () => {
        const controlService = dev.service(0)
        const descrReg = controlService.register(ControlReg.DeviceDescription)
        await descrReg.refresh(true)

        const fw = await dev.resolveProductIdentifier()
        if (fw) device.productIdentifiers = [fw]
        device.services = dev.serviceClasses.slice(1)
        device.description = descrReg.stringValue
        updateDevice()
    }

    return (
        <>
            <h1>Device Registration</h1>
            <p>
                Compose a device from various services, prepare the metadata and
                register it to the <Link href="/devices/">Devices catalog</Link>
                .
            </p>
            <Grid container direction="row" spacing={2}>
                {devices.map(dev => (
                    <Grid item key={dev.id} {...gridBreakpoints}>
                        <Card>
                            <DeviceCardHeader device={dev} />
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
                        label="Name"
                        placeholder="My module"
                        value={device.name || ""}
                        onChange={handleNameChange}
                        variant={variant}
                    />
                </Grid>
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
                    <CompanySelect
                        value={device?.company}
                        error={companyError}
                        onValueChange={handleCompanyChanged}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id={hardwareDesignId}
                        required
                        fullWidth={true}
                        helperText="A unique identifier for this hardware design."
                        label="Hardware design identifier"
                        value={""}
                        onChange={handleHardwareDesign}
                        variant={variant}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id={hardwareVersionId}
                        required
                        fullWidth={true}
                        helperText="Revision identifier for this hardware design."
                        label="Hardware version"
                        value={""}
                        onChange={handleHardwareVersion}
                        variant={variant}
                    />
                </Grid>
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
                            may have a different identifier.
                        </Typography>
                    </PaperBox>
                </Grid>
                <Grid item xs={12}>
                    <PaperBox elevation={1}>
                        <Typography color={servicesError ? "error" : "inherit"}>
                            Services *
                        </Typography>
                        {device.services?.map((id, i) => (
                            <Box component="span" m={0.5} key={id}>
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
                    <TextField
                        id={identifierId}
                        disabled
                        error={!!idError}
                        fullWidth={true}
                        label="Identifier"
                        helperText={
                            "This generated identifer is a URL friendly string created from your company and product name."
                        }
                        variant={variant}
                        value={device.id || ""}
                    />
                </Grid>
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
                        label="Home page url"
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
                    <PaperBox>
                        <Typography>Catalog image</Typography>
                        <ImportImageCanvas
                            width={DEVICE_IMAGE_WIDTH}
                            height={DEVICE_IMAGE_HEIGHT}
                            onImageImported={handleImageImported}
                        />
                        <Typography variant="caption" component="div">
                            {`Import a ${DEVICE_IMAGE_WIDTH}x${DEVICE_IMAGE_HEIGHT} image of the device.`}
                        </Typography>
                        {imageError && (
                            <Alert severity="error">{imageError}</Alert>
                        )}
                    </PaperBox>
                </Grid>
                <Grid item xs={12}>
                    <Suspense>
                        <GithubPullRequestButton
                            label={"register device"}
                            title={`Device: ${device.name}`}
                            head={`devices/${device.id}`}
                            description={`This pull request registers a new device for Jacdac.`}
                            files={
                                modulePath && {
                                    [modulePath]: JSON.stringify(
                                        normalizeDeviceSpecification(device),
                                        null,
                                        2
                                    ),
                                    [imagePath]: {
                                        content: imageBase64,
                                        encoding: "base64",
                                    },
                                }
                            }
                        />
                    </Suspense>
                </Grid>
            </Grid>
        </>
    )
}
