import React, { useEffect, useState } from "react"
import {
    REPORT_UPDATE,
    SRV_BUTTON,
    SRV_LIGHT_LEVEL,
    SRV_MICROPHONE,
    SRV_LIGHT_LEVEL,
    LightLevelVariant,
} from "../../../jacdac-ts/src/jdom/constants"
import { throttle } from "../../../jacdac-ts/src/jdom/utils"
import useServices from "../../components/hooks/useServices"
import GridHeader from "../../components/ui/GridHeader"
import { Button } from "gatsby-theme-material-ui"
import {
    Card,
    CardActions,
    CardContent,
    Grid,
    FormControl,
    FormControlLabel,
    FormLabel,
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
// for example, useServices is a hook that tracks the light level services,
// so it will render again and update the light array whenever the bus connects/disconnects
// a light sensor
export default function LightsensorAccessible() {
    const { playTone, toggleBrowserAudio, browserAudio } = usePlayTone()

    // identifiers for accessibility
    const sectionId = useId()

    // useServices accepts a number of filters and returns any services that match
    // get all led light sensor services
    // under the hood, it uses the bus and events.
    const lightSensors = useServices({ serviceClass: SRV_LIGHT_LEVEL})
    console.log("light sensors: "  + lightSensors)

    // create a state variable to hold the service selected as our light sensor
    // when using setLightService, React will render again this component
    const [lightService, setLightService] = useState<JDService>()

    //used to hold user selection of the property of the sound to vary. Default is the frequency.
    const [sonificationProperty, setSonificationProperty] = useState('frequency')

     //Used to store frequency modifier/offset for tones. 
     //Setting default state to 0 as this will eventually be set to the 
     //sensed light and be added to 1000 to be sonified.
    const [toneFrequencyOffset, setToneFrequencyOfset] = useState(0)

    const [volume, setVolume] = useState(1)

    const handleSelectLightService = light => () => {
        console.log(light)
        lightService == light ? setLightService(undefined) : setLightService(light)
    }
    //handler for property selection to sonify.
    const handlePropertySelectionChange = (event) => {
        setSonificationProperty(event.target.value)
    }

    // filter to only show light sensors in dashboard
    const dashboardDeviceFilter = (d: JDDevice) =>
        d.hasService(SRV_LIGHT_LEVEL)

    // register for light sensor data events
    useEffect(() => {
        // ?. checks that the callee is defined
        const unsubs = lightService?.readingRegister.subscribe(
            REPORT_UPDATE,
            // don't trigger more than every 100ms
            throttle(async () => {
                // get amount of light
                //console.log(lightService.readingRegister.unpackedValue)
                const [lightLevel] = lightService.readingRegister.unpackedValue
                if(sonificationProperty == 'frequency')
                {
                    setToneFrequencyOfset(lightLevel)
                } else{
                    setVolume(lightLevel%0.99)  
                }
                
                await playTone(1000 + toneFrequencyOffset * 1000, TONE_DURATION, volume)
            }, TONE_THROTTLE)
        )

        // cleanup callback
        return () => unsubs?.()
    }, [lightService, playTone]) // re-register if light sensor changes

    return (
        <>
            <section id={sectionId}>
                <Grid container spacing={2}>
                    <GridHeader title="Audio controls"/>
                    <Grid item xs={12}>
                        <Button variant={"outlined"}
                            onClick={toggleBrowserAudio}>
                            {browserAudio
                                ? "Stop browser audio"
                                : "Start browser audio"}
                        </Button>
                        {!lightSensors && (
                            <>
                            <GridHeader title="Connect a device" />
                            <Grid item xs>
                                <ConnectAlert serviceClass={SRV_LIGHT_LEVEL}/>
                            </Grid>
                            </>
                        )}
                        {lightSensors.length && (
                            <>
                            <GridHeader title="Available Lightsensors"/>
                            {lightSensors.map(lightSensor => (
                                <Grid item xs={12} sm={6} lg={4} xl={3} key={lightSensor.id}>
                                    <Card>
                                        <DeviceCardHeader device={lightSensor.device}
                                                           showAvatar={true}
                                                           showMedia={true}/>
                                        
                                    </Card>
                                    <CardContent>
                                        <Typography variant="h5">
                                            {(lightSensor === lightService ? "Streaming from " : "") +
                                                        (lightSensor.device.physical ? "Physical" : "Virtual") + 
                                                        `LightSensor ${lightSensor.friendlyName}` 
                                            }
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend">
                                                    Select property of sound to change
                                            </FormLabel>
                                                <RadioGroup
                                                    aria-label="sonification property"
                                                    name="soundProperty"
                                                    value={sonificationProperty}
                                                    onChange={
                                                        handlePropertySelectionChange
                                                    }>
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
                                            onClick={handleSelectLightService(lightSensor)}
                                        >
                                        {lightSensor === lightService ? "Stop streaming" : "Start streaming"}
                                        </Button>
                                    </CardActions>
                                </Grid>
                            ))}
                            </>
                        )}
                    </Grid>
                </Grid>
            </section>
            <Dashboard deviceFilter={dashboardDeviceFilter} />
        </>    
        )
}