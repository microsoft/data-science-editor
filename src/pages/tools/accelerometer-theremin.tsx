import React, { useEffect, useState } from "react"
import {
    REPORT_UPDATE,
    SRV_ACCELEROMETER,
} from "../../../jacdac-ts/src/jdom/constants"
import { throttle } from "../../../jacdac-ts/src/jdom/utils"
import useServices from "../../components/hooks/useServices"
import GridHeader from "../../components/ui/GridHeader"
import { Button } from "gatsby-theme-material-ui"
import {
    Card,
    CardActions,
    CardContent,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    Radio,
    RadioGroup,
    Typography,
} from "@material-ui/core"
import ConnectAlert from "../../components/alert/ConnectAlert"
import DeviceCardHeader from "../../components/DeviceCardHeader"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { usePlayTone } from "../../components/hooks/usePlayTone"
import Dashboard from "../../components/dashboard/Dashboard"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { useId } from "react-use-id-hook"

const TONE_DURATION = 50
const TONE_THROTTLE = 100

// this is a React component that gets run numerous time,
// whenever a change is detected in the React state
// for example, useServices is a hook that tracks the accelerometer services,
// so it will render again and update the accelerometers array whenever the bus connects/disconnects
// an accelerometer
export default function AccelerometerTheremin() {
    const { playTone, toggleBrowserAudio, browserAudio } = usePlayTone()

    // identifiers for accessibility
    const sectionId = useId()

    // useServices accepts a number of filters and returns any services that match
    // get all accelerometer + buzzer services
    // under the hood, it uses the bus and events.
    const accelerometers = useServices({ serviceClass: SRV_ACCELEROMETER })

    // create a state variable to hold the service selected as our accelerometer
    // when using setAccelService, React will render again this component
    const [accelService, setAccelService] = useState<JDService>()
    // used to hold the value for the axis selected by the radio group. This is also used to set the axis of the accelerometer to sonify. Default value is X. meaning the X axis will be sonified by default.
    const [axisToSonify, setAxisToSonify] = useState<"x" | "y" | "z">("x")
    //used to hold user selection of the property of the sound to vary. Default is the frequency.
    const [sonificationProperty, setSonificationProperty] =
        useState("frequency")

    // event handeler for radio button selection change for axis to sonify
    const handleAccessChange = event => {
        setAxisToSonify(event.target.value)
        // todo: make sure an Aria alert gets generated indecating the access that has been selected when streaming starts, or when radio button selection changes.
    }

    //handler for property selection to sonify.
    const handelPropertySelectionChange = event => {
        setSonificationProperty(event.target.value)
    }
    // use a closure to capture accel variable
    // act as a toggle for the button the indicates streaming state.
    const handleSelectAccelerometerService = accel => () => {
        accelService == accel
            ? setAccelService(undefined)
            : setAccelService(accel)
    }

    // filter to only show accelerometers in dashboard
    const dashboardDeviceFilter = (d: JDDevice) =>
        d.hasService(SRV_ACCELEROMETER)

    // register for accelerometer data events
    useEffect(() => {
        // ?. checks that the callee is defined
        const unsubs = accelService?.readingRegister.subscribe(
            REPORT_UPDATE,
            // don't trigger more than every 100ms
            throttle(async () => {
                // get x acceleration data
                // const [x] = accelService.readingRegister.unpackedValue
                // get all acceleration data
                let volume = 1
                let toneFrequencyOffset = 0
                const [x, y, z] = accelService.readingRegister.unpackedValue
                if (sonificationProperty == "frequency") {
                    if (axisToSonify == "x") {
                        toneFrequencyOffset = x
                    } else if (axisToSonify == "y") {
                        toneFrequencyOffset = y
                    } else {
                        toneFrequencyOffset = z
                    }
                } else {
                    if (axisToSonify == "x") {
                        volume = (Math.abs(x) * 99) / 100.0
                    } else if (axisToSonify == "y") {
                        volume = (Math.abs(y) * 99) / 100.0
                    } else {
                        volume = (Math.abs(z) * 99) / 100.0
                    }
                }

                await playTone(
                    1000 + toneFrequencyOffset * 1000,
                    TONE_DURATION,
                    volume
                )
            }, TONE_THROTTLE)
        )

        // cleanup callback
        return () => unsubs?.()
    }, [accelService, playTone]) // re-register if accelerometers, buzzers change

    return (
        <>
            <section id={sectionId}>
                <Grid container spacing={2}>
                    <GridHeader title="Audio controls" />
                    <Grid item xs={12}>
                        <Button
                            variant={"outlined"}
                            onClick={toggleBrowserAudio}
                        >
                            {browserAudio
                                ? "Stop browser audio"
                                : "Start browser audio"}
                        </Button>
                    </Grid>
                    {!accelerometers.length && (
                        <>
                            <GridHeader title="Connect a device" />
                            <Grid item xs>
                                <ConnectAlert
                                    serviceClass={SRV_ACCELEROMETER}
                                />
                            </Grid>
                        </>
                    )}
                    {!!accelerometers.length && (
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
                                                    (accelerometer.device
                                                        .physical
                                                        ? "Physical "
                                                        : "Virtual ") +
                                                    `Accelerometer ${accelerometer.friendlyName}`}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <FormControl component="fieldset">
                                                <FormLabel component="legend">
                                                    Select axis of the
                                                    accelerometer to sonify
                                                </FormLabel>
                                                <RadioGroup
                                                    aria-label="axis"
                                                    name="axisToSonify"
                                                    value={axisToSonify}
                                                    onChange={
                                                        handleAccessChange
                                                    }
                                                >
                                                    <FormControlLabel
                                                        value="x"
                                                        control={<Radio />}
                                                        label="X axis"
                                                    />
                                                    <FormControlLabel
                                                        value="y"
                                                        control={<Radio />}
                                                        label="Y axis"
                                                    />
                                                    <FormControlLabel
                                                        value="z"
                                                        control={<Radio />}
                                                        label="Z axis"
                                                    />
                                                </RadioGroup>
                                                <FormLabel component="legend">
                                                    Select property of the sound
                                                    to change
                                                </FormLabel>
                                                <RadioGroup
                                                    aria-label="sonification property"
                                                    name="soundProperty"
                                                    value={sonificationProperty}
                                                    onChange={
                                                        handelPropertySelectionChange
                                                    }
                                                >
                                                    <FormControlLabel
                                                        value="frequency"
                                                        control={<Radio />}
                                                        label="buzzer frequency"
                                                    />
                                                    <FormControlLabel
                                                        value="volume"
                                                        control={<Radio />}
                                                        label="buzzer volume"
                                                    />
                                                </RadioGroup>
                                            </FormControl>
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
            </section>
            <Dashboard deviceFilter={dashboardDeviceFilter} />
        </>
    )
}
