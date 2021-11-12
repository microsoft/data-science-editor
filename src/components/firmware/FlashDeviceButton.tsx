import {
    Button,
    Typography,
    Dialog,
    DialogContent,
    DialogContentText,
    Grid,
} from "@mui/material"
import { Alert } from "@mui/material"
import React, { useContext, useEffect, useState } from "react"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import {
    flashFirmwareBlob,
    updateApplicable,
    FirmwareBlob,
} from "../../../jacdac-ts/src/jdom/flashing"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import CircularProgressWithLabel from "../ui/CircularProgressWithLabel"
import AppContext from "../AppContext"
import useChange from "../../jacdac/useChange"
import useMounted from "./../hooks/useMounted"
import useAnalytics from "../hooks/useAnalytics"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import { Link } from "gatsby-material-ui-components"
import DialogTitleWithClose from "../ui/DialogTitleWithClose"
import { useLatestReleaseAsset } from "../github"
import useBus from "../../jacdac/useBus"
import { semverCmp } from "../semver"

function DragAndDropUpdateButton(props: {
    firmwareVersion: string
    productIdentifier: number
    specification: jdspec.DeviceSpec
    info: { name: string; url: string; productIdentifier?: number }
}) {
    const bus = useBus()
    const { firmwareVersion, specification, info, productIdentifier } = props
    const { bootloader } = specification || {}
    const { driveName, sequence, ledAnimation } = bootloader || {}
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
                        {ledAnimation === "blue-glow" && (
                            <li>
                                You should see the status LED glow in Blue and
                                the <b>{driveName}</b> drive should appear.
                            </li>
                        )}
                        <li>
                            Drag and drop the file into the&nbsp;
                            <b>{driveName}</b> drive.
                        </li>
                        <li>
                            Once the file is copied, the device will
                            automatically restart with the new firmware.
                        </li>
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
}) {
    const { device, blob, ignoreFirmwareCheck } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { setError } = useContext(AppContext)
    const { trackEvent, trackError } = useAnalytics()
    const [progress, setProgress] = useState(0)
    const specification = useDeviceSpecification(device)
    const firmwares = specification?.firmwares
    const firmwareInfo = useChange(device, d => d?.firmwareInfo)
    const update =
        ignoreFirmwareCheck ||
        (blob?.version &&
            firmwareInfo?.version &&
            updateApplicable(firmwareInfo, blob))
    const upToDate =
        blob?.version &&
        firmwareInfo?.version &&
        blob.version === firmwareInfo.version
    const flashing = useChange(device, d => !!d?.flashing)
    const unsupported = specification && !specification.repo
    const missing = !device || !blob
    const disabled = flashing
    const color = update && !upToDate ? "primary" : "inherit"
    const mounted = useMounted()

    const handleFlashing = async () => {
        if (device.flashing) return
        const props = {
            productId: firmwareInfo.productIdentifier,
            name: firmwareInfo.name,
            version: firmwareInfo.version,
        }
        trackEvent("flash.start", props)
        try {
            setProgress(0)
            device.flashing = true // don't refresh registers while flashing
            const updateCandidates = [firmwareInfo]
            await flashFirmwareBlob(
                bus,
                blob,
                updateCandidates,
                ignoreFirmwareCheck,
                prog => {
                    if (mounted()) setProgress(prog)
                }
            )
            trackEvent("flash.success", props)
        } catch (e) {
            trackError(e, props)
            trackEvent("flash.error", props)
            if (mounted()) setError(e)
        } finally {
            device.flashing = false
        }
    }

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

    // tslint:disable-next-line: react-this-binding-issue
    return unsupported ? (
        <Alert severity="info">No registered firmware</Alert>
    ) : missing ? (
        <Alert severity="info">No firmware available</Alert>
    ) : flashing ? (
        <CircularProgressWithLabel value={progress} />
    ) : firmwareInfo || update ? (
        <>
            {upToDate ? (
                <Alert severity="success">Up to date!</Alert>
            ) : (
                <Alert severity="warning">{blob.version} available</Alert>
            )}
            {(!upToDate || ignoreFirmwareCheck) && firmwareInfo && (
                <Button
                    title={`Flash ${blob.version}`}
                    disabled={disabled}
                    variant="contained"
                    color={color}
                    onClick={handleFlashing}
                >
                    Flash
                </Button>
            )}
        </>
    ) : (
        <Alert severity="info">No firmware available</Alert>
    )
}
