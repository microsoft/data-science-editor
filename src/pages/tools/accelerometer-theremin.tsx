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

// this is a React component that gets run numerous time,
// whenever a change is detected in the React state
// for example, useServices is a hook that tracks the accelerometer services,
// so it will render again and update the accelerometers array whenever the bus connects/disconnects
// an accelerometer
export default function AccelerometerTheremin() {
    // bus is a variable that is shared across the entire site.
    // it represents the transport to the physical Jacdac bus (USB/BLE)
    const { bus } = useContext<JacdacContextProps>(JacdacContext)

    // useServices accepts a number of filters and returns any services that match
    // get all accelerometer + buzzer services
    // under the hood, it uses the bus and events.
    const accelerometers = useServices({ serviceClass: SRV_ACCELEROMETER })
    const buzzers = useServices({ serviceClass: SRV_BUZZER })

    // create two state variables to hold the service selected as our accelerometer
    // and the virtual buzzerServer created when someone turns audio on on the page
    // when using setAccelService/setBuzzerServer, React will render again this component
    const [accelService, setAccelService] = useState<JDService>()
    const [buzzerServer, setBuzzerServer] = useState<BuzzerServer>()

    const { playTone, onClickActivateAudioContext, activated } =
        useContext(WebAudioContext)

    // useEffect invokes a function call whenever the variables
    // (passed as an array) change.
    // if clean up is required, return a clean up callback
    //
    // listen for playTone commands from the buzzer via subscribe
    // subscribe returns a clean up function that is invoked when the user
    // browses away from the page.
    // playtone uses the audio context set in handleBrowserAudioEnable
    useEffect(
        () =>
            buzzerServer?.subscribe<BuzzerTone>(
                BuzzerServer.PLAY_TONE,
                ({ frequency, duration, volume }) =>
                    playTone(frequency, duration, volume)
            ),
        [buzzerServer]
    )
    // clean out buzzer server on page close.
    // defines an empty function that returns a function.
    // invoked each time buzzerServer changes
    useEffect(
        () => () =>
            buzzerServer?.device &&
            bus.removeServiceProvider(buzzerServer.device),
        [buzzerServer]
    )

    // use a closure to capture accel variable
    // act as a toggle for the button the indicates streaming state.
    const handleSelectAccelerometerService = accel => () => {
        accelService == accel ? setAccelService(undefined) : setAccelService(accel)
    }

    // when start browser audio button is clicked:
    // get a browser audio context
    // spin up a virtual buzzer that we latermap to the browser audio engine
    const handleBrowserAudioEnable = () => {
        // browser security dictates that the audio context be used within a click event
        // must be done once to allow background sounds
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
        // ?. checks that the callee is defined
        const unsubs = accelService?.readingRegister.subscribe(
            REPORT_UPDATE,
            // don't trigger more than every 100ms
            throttle(async () => {
                // get x acceleration data
                const [x] = accelService.readingRegister.unpackedValue
                // get all acceleration data
                // const [x, y, z] = accelService.readingRegister.unpackedValue
                await Promise.all(
                    // for each buzzer, map x acceleration to buzzer output
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
