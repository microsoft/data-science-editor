import React, { useEffect, useState, useContext } from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import { startServiceProviderFromServiceClass } from "../../../jacdac-ts/src/servers/servers"
import {
    BuzzerCmd,
    REPORT_UPDATE,
    SRV_ACCELEROMETER,
    SRV_BUZZER,
} from "../../../jacdac-ts/src/jdom/constants"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import Packet from "../../../jacdac-ts/src/jdom/packet"
import { throttle } from "../../../jacdac-ts/src/jdom/utils"
import useServices from "../../components/hooks/useServices"
import GridHeader from "../../components/ui/GridHeader"
import { Button } from "gatsby-theme-material-ui"
import {
    Card,
    CardActions,
    CardContent,
    Grid,
    Typography,
} from "@material-ui/core"
import ConnectAlert from "../../components/alert/ConnectAlert"
import DeviceCardHeader from "../../components/DeviceCardHeader"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import BuzzerServer, {
    BuzzerTone,
} from "../../../jacdac-ts/src/servers/buzzerserver"
import WebAudioContext from "../../components/ui/WebAudioContext"

function tonePayload(frequency: number, ms: number, volume: number) {
    const period = Math.round(1000000 / frequency)
    const duty = (period * volume) >> 11
    return jdpack("u16 u16 u16", [period, duty, ms])
}

const TONE_DURATION = 50
const TONE_THROTTLE = 100

export default function AccelerometerTheremin() {
    // collect accelerometers and buzzers on the bus
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const accelerometers = useServices({ serviceClass: SRV_ACCELEROMETER })
    const buzzers = useServices({ serviceClass: SRV_BUZZER })
    const [accelService, setAccelService] = useState<JDService>()
    const [buzzerServer, setBuzzerServer] = useState<BuzzerServer>()

    const { playTone, onClickActivateAudioContext, activated } =
        useContext(WebAudioContext)

    // listen for playTone commands from the buzzer
    useEffect(
        () =>
            buzzerServer?.subscribe<BuzzerTone>(
                BuzzerServer.PLAY_TONE,
                ({ frequency, duration, volume }) =>
                    playTone(frequency, duration, volume)
            ),
        [buzzerServer]
    )
    // make sure to clean out buzzer server
    useEffect(
        () => () =>
            buzzerServer?.device &&
            bus.removeServiceProvider(buzzerServer.device),
        [buzzerServer]
    )

    const handleSelectAccelerometerService = accel => () => {
        accelService == accel ? setAccelService(null) : setAccelService(accel)
    }

    const handleBrowserAudioEnable = () => {
        onClickActivateAudioContext()
        if (!buzzerServer) {
            const dev = startServiceProviderFromServiceClass(bus, SRV_BUZZER)
            const srv = dev
                .services()
                .find(s => s.serviceClass === SRV_BUZZER) as BuzzerServer
            setBuzzerServer(srv)
        } else {
            setBuzzerServer(undefined)
        }
    }

    // register for accelerometer data events
    useEffect(() => {
        const unsubs = accelService?.readingRegister.subscribe(
            REPORT_UPDATE,
            // don't trigger more than every 100ms
            throttle(async () => {
                const [x] = accelService.readingRegister.unpackedValue
                await Promise.all(
                    buzzers.map(async buzzer => {
                        const pkt = Packet.from(
                            BuzzerCmd.PlayTone,
                            tonePayload(1000 + x * 1000, TONE_DURATION, 1)
                        )
                        await buzzer.sendPacketAsync(pkt)
                    })
                )
            }, TONE_THROTTLE)
        )

        // cleanup callback
        return () => unsubs?.()
    }, [accelService, buzzers]) // re-register if accelerometers, buzzers change

    // TODO any specific rendering needed here?
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <GridHeader title="Audio controls" />
                <Button variant={"outlined"} onClick={handleBrowserAudioEnable}>
                    {activated && buzzerServer
                        ? "Stop browser audio"
                        : "Start browser audio"}
                </Button>
            </Grid>
            {!accelerometers.length && (
                <>
                    <GridHeader title="Connect a device" />
                    <Grid item xs>
                        <ConnectAlert serviceClass={SRV_ACCELEROMETER} />
                    </Grid>
                </>
            )}
            {accelerometers.length && (
                <>
                    <GridHeader title="Available accelerometers" />
                    {accelerometers.map(accelerometer => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            lg={4}
                            xl={3}
                            key={accelerometer.id}
                        >
                            <Card>
                                <DeviceCardHeader
                                    device={accelerometer.device}
                                    showAvatar={true}
                                    showMedia={true}
                                />
                                <CardContent>
                                    <Typography variant="h5">
                                        {(accelerometer === accelService
                                            ? "Streaming from "
                                            : "") +
                                            (accelerometer.device.physical
                                                ? "Physical "
                                                : "Virtual ") +
                                            `Accelerometer ${accelerometer.friendlyName}`}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        variant={"outlined"}
                                        onClick={handleSelectAccelerometerService(
                                            accelerometer
                                        )}
                                    >
                                        {accelerometer === accelService
                                            ? "Stop streaming"
                                            : "Start streaming"}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </>
            )}
        </Grid>
    )
}
