import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Grid,
    TextField,
} from "@mui/material"
import React, { ChangeEvent, useState } from "react"
import useDevices from "../../components/hooks/useDevices"
import DeviceCardHeader from "../../components/devices/DeviceCardHeader"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import CmdButton from "../../components/CmdButton"
import { ControlCmd } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import ConnectAlert from "../../components/alert/ConnectAlert"
import GridHeader from "../../components/ui/GridHeader"
import ConnectButtons from "../../components/buttons/ConnectButtons"

function FloodCard(props: {
    device: JDDevice
    numResponses: number
    startCounter: number
    size: number
}) {
    const { device, numResponses, startCounter, size } = props
    const handleClick = async () => {
        const service = device.service(0)
        const data = jdpack<[number, number, number]>("u32 u32 u8", [
            numResponses,
            startCounter,
            size,
        ])
        await service.sendCmdAsync(ControlCmd.FloodPing, data)
    }
    return (
        <Card>
            <DeviceCardHeader device={device} />
            <CardActions>
                <CmdButton onClick={handleClick}>Flood</CmdButton>
            </CardActions>
        </Card>
    )
}

export default function Page() {
    const devices = useDevices({})
    const [numResponses, setNumResponses] = useState(100)
    const [startCounter, setStartCounter] = useState(0)
    const [size, setSize] = useState(32)

    const handleChangeNumberResponses = (ev: ChangeEvent<HTMLInputElement>) => {
        const i = parseInt(ev.target.value)
        if (!isNaN(i)) setNumResponses(i)
    }
    const handleChangeStartCounter = (ev: ChangeEvent<HTMLInputElement>) => {
        const i = parseInt(ev.target.value)
        if (!isNaN(i)) setStartCounter(Math.max(0, i))
    }
    const handleChangeSize = (ev: ChangeEvent<HTMLInputElement>) => {
        const i = parseInt(ev.target.value)
        if (!isNaN(i)) setSize(Math.max(1, i))
    }

    return (
        <>
            <h1>Flood Test</h1>
            <Card>
                <CardHeader title="Configuration" />
                <CardContent>
                    <Grid container spacing={1}>
                        <Grid item>
                            <TextField
                                label="number of responses"
                                value={numResponses}
                                onChange={handleChangeNumberResponses}
                                type="number"
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="start counter"
                                value={startCounter}
                                onChange={handleChangeStartCounter}
                                type="number"
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="size"
                                value={size}
                                onChange={handleChangeSize}
                                type="number"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Grid container spacing={1}>
                <GridHeader
                    action={<ConnectButtons transparent={true} />}
                    title={"Devices"}
                />
                {devices.map(device => (
                    <Grid key={device.id} item>
                        <FloodCard
                            device={device}
                            numResponses={numResponses}
                            startCounter={startCounter}
                            size={size}
                        />
                    </Grid>
                ))}
            </Grid>
            <ConnectAlert />
        </>
    )
}
