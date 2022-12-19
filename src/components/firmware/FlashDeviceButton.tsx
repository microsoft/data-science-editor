import {
    Button,
    Typography,
    Dialog,
    DialogContent,
    Grid,
    AlertTitle,
} from "@mui/material"
import { Alert } from "@mui/material"
import React, { useEffect, useState } from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import {
    updateApplicable,
    FirmwareBlob,
    FirmwareUpdater,
} from "../../../jacdac-ts/src/jdom/flashing"
import CircularProgressWithLabel from "../ui/CircularProgressWithLabel"
import useChange from "../../jacdac/useChange"
import useAnalytics from "../hooks/useAnalytics"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import { Link } from "gatsby-material-ui-components"
import DialogTitleWithClose from "../ui/DialogTitleWithClose"
import { useLatestReleaseAsset } from "../github"
import useBus from "../../jacdac/useBus"
import { semverCmp } from "../semver"
import useSnackbar from "../hooks/useSnackbar"
import { PROGRESS } from "../../../jacdac-ts/src/jdom/constants"
import useDeviceFirmwareInfo from "./useDeviceFirmwareInfo"

function DragAndDropUpdateButton(props: {
    firmwareVersion: string
    productIdentifier: number
    specification: jdspec.DeviceSpec
    info: { name: string; url: string; productIdentifier?: number }
}) {
    const bus = useBus()
    const { firmwareVersion, specification, info, productIdentifier } = props
    const { bootloader } = specification || {}
    const { driveName, sequence, ledAnimation, firmwareUploader } =
        bootloader || {}
    const { name, url } = info
    const [open, setOpen] = useState(false)
    const { trackEvent } = useAnalytics()
    const handleOpen = () => {
        trackEvent("flash.download", {
            device: specification.name,
            firmwareName: name,
        })
        setOpen(true)
    }
    const handleClose = () => setOpen(false)
    const { version, assertUrl } = useLatestReleaseAsset(url)
    const current =
        !!productIdentifier && productIdentifier === info.productIdentifier
    const hasUpdate =
        current &&
        version &&
        firmwareVersion &&
        semverCmp(firmwareVersion, version) > 0

    // device dissapears after reset
    useEffect(() => {
        if (open) {
            bus.pushDeviceFrozen()
            return () => bus.popDeviceFrozen()
        }
    }, [open])

    return (
        <>
            <Button
                variant={hasUpdate ? "contained" : "outlined"}
                color={current ? "primary" : "inherit"}
                onClick={handleOpen}
            >
                {name}
                {version && (
                    <Typography sx={{ ml: 1 }} variant="caption">
                        {version}
                    </Typography>
                )}
            </Button>
            <Dialog open={open}>
                <DialogTitleWithClose onClose={handleClose}>
                    Updating your {specification.name}
                </DialogTitleWithClose>
                <DialogContent>
                    <p>
                        Follow these instruction to upgrade your{" "}
                        {specification.name} with <b>{name}</b>.
                    </p>
                    <ol>
                        <li>
                            <Link href={assertUrl || url}>
                                Download the firmware file
                            </Link>
                        </li>
                        {sequence === "reset" && (
                            <li>
                                Press the <b>Reset (RST)</b> button
                            </li>
                        )}
                        {sequence === "reset-boot" && (
                            <li>
                                Press the <b>Reset (RST)</b> then{" "}
                                <b>Bootloader (BOOT)</b> button
                            </li>
                        )}
                        {sequence === "boot-power" && (
                            <li>
                                Unplug the device, press the
                                <b>Bootloader (BOOT)</b> button, plug the device
                            </li>
                        )}
                        {ledAnimation === "blue-glow" && driveName && (
                            <li>
                                You should see the status LED glow in Blue and
                                the <b>{driveName}</b> drive should appear.
                            </li>
                        )}
                        {driveName && (
                            <>
                                <li>
                                    Drag and drop the file into the&nbsp;
                                    <b>{driveName}</b> drive.
                                </li>
                                <li>
                                    Once the file is copied, the device will
                                    automatically restart with the new firmware.
                                </li>
                            </>
                        )}
                        {firmwareUploader && (
                            <li>
                                Open{" "}
                                <a
                                    href={firmwareUploader}
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    Firmware Uploader
                                </a>
                                and follow the instruction to upload the
                                firmware.
                            </li>
                        )}
                    </ol>
                </DialogContent>
            </Dialog>
        </>
    )
}

export function FlashDeviceButton(props: {
    device: JDDevice
    blob: FirmwareBlob
    ignoreFirmwareCheck?: boolean
    hideUpToDate?: boolean
}) {
    const { device, blob, ignoreFirmwareCheck, hideUpToDate } = props
    const bus = useBus()
    const { setError } = useSnackbar()
    const { trackEvent, trackError } = useAnalytics()
    const [progress, setProgress] = useState(0)
    const specification = useDeviceSpecification(device)
    const firmwares = specification?.firmwares
    const bootloader = useChange(device, _ => _?.bootloader)
    const firmwareUpdater = useChange(device, _ => _?.firmwareUpdater)
    const firmwareInfo = useDeviceFirmwareInfo(device)
    const update =
        ignoreFirmwareCheck ||
        (blob?.version &&
            firmwareInfo?.version &&
            updateApplicable(firmwareInfo, blob))
    const upToDate =
        blob?.version &&
        firmwareInfo?.version &&
        blob.version === firmwareInfo.version
    const unsupported = specification && !specification.repo
    const missing = !device || !blob
    const disabled = !!firmwareUpdater
    const color = update && !upToDate ? "primary" : "inherit"

    useEffect(
        () =>
            firmwareUpdater?.subscribe(PROGRESS, (v: number) =>
                setProgress(v * 100)
            ),
        [firmwareUpdater]
    )

    const handleFlashing = async () => {
        if (device.firmwareUpdater) return
        const props = {
            productId: firmwareInfo.productIdentifier,
            name: firmwareInfo.name,
            version: firmwareInfo.version,
        }
        console.debug("start flash", { ...props, device })
        trackEvent("flash.start", props)
        const updater = new FirmwareUpdater(device.bus, blob)
        try {
            device.firmwareUpdater = updater
            setProgress(0)
            const updateCandidates = [firmwareInfo]
            await updater.flash(updateCandidates, ignoreFirmwareCheck)
            trackEvent("flash.success", props)
        } catch (e) {
            trackError(e, props)
            trackEvent("flash.error", props)
            setError(e)
        } finally {
            console.debug("end flash", { ...props, device })
            // rebuild device
            bus.removeDevice(device.deviceId)
        }
    }

    useEffect(() => {
        if (device && firmwareInfo && !bootloader && update && !upToDate) {
            handleFlashing()
        }
    }, [device, firmwareInfo, bootloader, update, upToDate])

    if (hideUpToDate && upToDate) return null

    if (firmwares?.length)
        return (
            <Grid container spacing={1} direction="row">
                {firmwares.map(fw => (
                    <Grid item key={fw.name}>
                        <DragAndDropUpdateButton
                            firmwareVersion={firmwareInfo?.version}
                            productIdentifier={firmwareInfo?.productIdentifier}
                            specification={specification}
                            info={fw}
                        />
                    </Grid>
                ))}
            </Grid>
        )

    return unsupported ? (
        <Alert severity="info">No registered firmware</Alert>
    ) : missing ? (
        <Alert severity="info">No firmware available</Alert>
    ) : firmwareUpdater ? (
        <>
            <Typography variant="caption" component="div" color="textSecondary">
                Updating firmware
            </Typography>
            <CircularProgressWithLabel value={progress} />
        </>
    ) : firmwareInfo || update ? (
        <Alert severity={upToDate ? "success" : "info"}>
            <AlertTitle>
                {upToDate ? "Up to date!" : `${blob.version} available`}
            </AlertTitle>
            {(!upToDate || ignoreFirmwareCheck) && firmwareInfo && (
                <Button
                    title={`Flash ${blob.version}`}
                    disabled={disabled}
                    variant="contained"
                    color={color}
                    onClick={handleFlashing}
                >
                    Update
                </Button>
            )}
        </Alert>
    ) : (
        <Alert severity="info">No firmware available</Alert>
    )
}
