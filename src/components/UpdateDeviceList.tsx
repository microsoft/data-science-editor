import { Grid } from "@mui/material"
import React, { useContext } from "react"
import { SRV_BOOTLOADER } from "../../jacdac-ts/src/jdom/constants"
import JDDevice from "../../jacdac-ts/src/jdom/device"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import DeviceCard from "./devices/DeviceCard"
import useGridBreakpoints from "./useGridBreakpoints"
import useChange from "../jacdac/useChange"
import useDevices from "./hooks/useDevices"
import { FlashDeviceButton } from "./firmware/FlashDeviceButton"

function UpdateDeviceCard(props: { device: JDDevice }) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { device } = props
    const blobs = useChange(bus, _ => _.firmwareBlobs)
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
    const gridBreakpoints = useGridBreakpoints(3)
    const safeBoot = useChange(bus, b => b.safeBoot)
    const devices = useDevices(
        {
            announced: true,
            ignoreInfrastructure: true,
            ignoreSimulators: true,
        },
        [safeBoot]
    )
        .filter(dev => safeBoot || !dev.hasService(SRV_BOOTLOADER))
        .sort(
            (l, r) => -(l.productIdentifier || 0) + (r.productIdentifier || 0)
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
