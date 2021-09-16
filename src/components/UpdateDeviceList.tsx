import { Grid } from "@material-ui/core"
import React, { useContext, useEffect, useRef } from "react"
import {
    DEVICE_CHANGE,
    FIRMWARE_BLOBS_CHANGE,
    SRV_BOOTLOADER,
} from "../../jacdac-ts/src/jdom/constants"
import JDDevice from "../../jacdac-ts/src/jdom/device"
import { scanFirmwares } from "../../jacdac-ts/src/jdom/flashing"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import DeviceCard from "./DeviceCard"
import useGridBreakpoints from "./useGridBreakpoints"
import useChange from "../jacdac/useChange"
import useDevices from "./hooks/useDevices"
import useFirmwareBlobs from "./firmware/useFirmwareBlobs"
import { FlashDeviceButton } from "./firmware/FlashDeviceButton"

function UpdateDeviceCard(props: { device: JDDevice }) {
    const { device } = props
    const blobs = useFirmwareBlobs()
    const firmwareInfo = useChange(device, d => d.firmwareInfo)
    const blob =
        firmwareInfo &&
        blobs?.find(b => firmwareInfo.productIdentifier == b.productIdentifier)

    return (
        <DeviceCard
            device={device}
            showFirmware={true}
            // tslint:disable-next-line: react-this-binding-issue
            action={<FlashDeviceButton device={device} blob={blob} />}
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
        },
        [safeBoot]
    )
        .filter(dev => safeBoot || !dev.hasService(SRV_BOOTLOADER))
        .sort(
            (l, r) => -(l.productIdentifier || 0) + (r.productIdentifier || 0)
        )
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
