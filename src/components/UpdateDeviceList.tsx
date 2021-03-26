import { Button, Grid } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import React, { useContext, useEffect, useRef, useState } from "react"
import {
    DEVICE_CHANGE,
    FIRMWARE_BLOBS_CHANGE,
    SRV_BOOTLOADER,
} from "../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../jacdac-ts/src/jdom/device"
import {
    scanFirmwares,
    flashFirmwareBlob,
    updateApplicable,
} from "../../jacdac-ts/src/jdom/flashing"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import CircularProgressWithLabel from "./ui/CircularProgressWithLabel"
import DeviceCard from "./DeviceCard"
import useGridBreakpoints from "./useGridBreakpoints"
import AppContext from "./AppContext"
import useChange from "../jacdac/useChange"
import useDevices from "./hooks/useDevices"
import useFirmwareBlobs from "./firmware/useFirmwareBlobs"
import useMounted from "./hooks/useMounted"
import { semverCmp } from "./semver"

function UpdateDeviceCard(props: { device: JDDevice }) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { device } = props
    const { setError } = useContext(AppContext)
    const [progress, setProgress] = useState(0)
    const blobs = useFirmwareBlobs()
    const firmwareInfo = useChange(device, d => d.firmwareInfo)
    const blob =
        firmwareInfo &&
        blobs?.find(
            b => firmwareInfo.firmwareIdentifier == b.firmwareIdentifier
        )
    const update = blob && firmwareInfo && updateApplicable(firmwareInfo, blob)
    const upgrade = update && semverCmp(blob.version, firmwareInfo.version) > 0
    const flashing = useChange(device, d => d.flashing)
    const mounted = useMounted()

    const handleFlashing = async () => {
        if (device.flashing) return
        try {
            setProgress(0)
            device.flashing = true // don't refresh registers while flashing
            const updateCandidates = [firmwareInfo]
            await flashFirmwareBlob(bus, blob, updateCandidates, prog => {
                if (mounted())
                    setProgress(prog)
            })
            // trigger info
            device.firmwareInfo = undefined
        } catch (e) {
            if (mounted())
                setError(e)
        } finally {
            device.flashing = false
        }
    }

    return (
        <DeviceCard
            device={device}
            showFirmware={true}
            content={update && <span>{upgrade ? "Upgrade" : "Downgrade"} to {blob.version}</span>}
            // tslint:disable-next-line: react-this-binding-issue
            action={
                flashing ? (
                    <CircularProgressWithLabel value={progress} />
                ) : update ? (
                    <Button
                        aria-label="flash firmware to device"
                        disabled={flashing}
                        variant="contained"
                        color={upgrade ? "primary" : "secondary"}
                        onClick={handleFlashing}
                    >
                        Flash
                    </Button>
                ) : firmwareInfo ? (
                    <Alert severity="success">Up to date!</Alert>
                ) : undefined
            }
        />
    )
}

export default function UpdateDeviceList() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const scanning = useRef(false)
    const gridBreakpoints = useGridBreakpoints()
    const safeBoot = useChange(bus, b => b.safeBoot)
    const devices = useDevices(
        {
            announced: true,
            ignoreSelf: true,
            ignoreSimulators: true,
            firmwareIdentifier: true,
        },
        [safeBoot]
    ).filter(dev => safeBoot || !dev.hasService(SRV_BOOTLOADER))
    const isFlashing = useChange(bus, () => devices.some(dev => dev.flashing))
    const blobs = useFirmwareBlobs()
    async function scan() {
        if (!blobs?.length || isFlashing || scanning.current) return
        console.log(`start scanning bus`)
        try {
            scanning.current = true
            await scanFirmwares(bus)
        } finally {
            scanning.current = false
        }
    }
    // load indexed db file once
    useEffect(() => {
        scan()
    }, [isFlashing, blobs])
    useEffect(
        () =>
            bus.subscribe([DEVICE_CHANGE, FIRMWARE_BLOBS_CHANGE], () => scan()),
        []
    )

    return (
        <Grid container spacing={2}>
            {devices.map(device => (
                <Grid key={device.id} item {...gridBreakpoints}>
                    <UpdateDeviceCard device={device} />
                </Grid>
            ))}
        </Grid>
    )
}
