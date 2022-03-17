import React, { useContext } from "react"
import {
    SRV_BUTTON,
    SRV_BUZZER,
    SRV_CHARACTER_SCREEN,
    SRV_HUMIDITY,
    SRV_GAMEPAD,
    SRV_LED,
    SRV_POTENTIOMETER,
    SRV_SOIL_MOISTURE,
    SRV_TEMPERATURE,
    SRV_TRAFFIC_LIGHT,
} from "../../../jacdac-ts/src/jdom/constants"
import { startServiceProviderFromServiceClass } from "../../../jacdac-ts/src/servers/servers"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import AddIcon from "@mui/icons-material/Add"
import Alert from "../ui/Alert"
import SimulatorDialogsContext from "../SimulatorsDialogContext"
import useBus from "../../jacdac/useBus"

export function SimulateDeviceHint() {
    const bus = useBus()
    const handleStartSimulator = (serviceClass: number) => () =>
        startServiceProviderFromServiceClass(bus, serviceClass)
    const { toggleShowDeviceHostsDialog } = useContext(SimulatorDialogsContext)
    const handleShowStartSimulator = () => toggleShowDeviceHostsDialog()
    return (
        <>
            Simulate
            <IconButtonWithTooltip
                trackName="simulator.hint.button"
                onClick={handleStartSimulator(SRV_BUTTON)}
                title="button"
                aria-label="start button simulator"
            >
                <span aria-label="button emoji" role="img">
                    🔘
                </span>
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
                trackName="simulator.hint.humidity"
                onClick={handleStartSimulator(SRV_HUMIDITY)}
                title="humidity"
                aria-label="start humidity sensor"
            >
                <span aria-label="umbrella emoji" role="img">
                    ☂️
                </span>
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
                trackName="simulator.hint.thermometer"
                onClick={handleStartSimulator(SRV_TEMPERATURE)}
                title="thermometer"
                aria-label="start thermometer"
            >
                <span aria-label="thermometer emoji" role="img">
                    🌡️
                </span>
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
                trackName="simulator.hint.soilmoisture"
                onClick={handleStartSimulator(SRV_SOIL_MOISTURE)}
                title="soil moisture"
                aria-label="start soil moisture simulator"
            >
                <span aria-label="sprout emoji" role="img">
                    🌱
                </span>
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
                trackName="simulator.hint.buzzer"
                onClick={handleStartSimulator(SRV_BUZZER)}
                title="buzzer"
                aria-label="start buzzer simulator"
            >
                <span aria-label="piano emoji" role="img">
                    🎹
                </span>
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
                trackName="simulator.hint.potentiometer"
                onClick={handleStartSimulator(SRV_POTENTIOMETER)}
                title="slider"
                aria-label="start slider simulator"
            >
                <span aria-label="slider emoji" role="img">
                    🎚️
                </span>
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
                trackName="simulator.hint.joystick"
                onClick={handleStartSimulator(SRV_GAMEPAD)}
                title="joystick"
                aria-label="start joystick simulator"
            >
                <span aria-label="joystick emoji" role="img">
                    🕹️
                </span>
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
                trackName="simulator.hint.characterscreen"
                onClick={handleStartSimulator(SRV_CHARACTER_SCREEN)}
                title="character screen"
                aria-label="start character screen simulator"
            >
                <span aria-label="pager emoji" role="img">
                    📟
                </span>
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
                trackName="simulator.hint.led"
                onClick={handleStartSimulator(SRV_LED)}
                title="LED"
                aria-label="start LED simulator"
            >
                <span aria-label="lightbulb emoji" role="img">
                    💡
                </span>
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
                trackName="simulator.hint.traffic"
                onClick={handleStartSimulator(SRV_TRAFFIC_LIGHT)}
                title="traffic light"
                aria-label="start traffic light simulator"
            >
                <span aria-label="traffic light emoji" role="img">
                    🚦
                </span>
            </IconButtonWithTooltip>
            or click &nbsp;
            <IconButtonWithTooltip
                trackName="simulator.hint.start"
                title="start simulator"
                onClick={handleShowStartSimulator}
            >
                <AddIcon />
            </IconButtonWithTooltip>
            .
        </>
    )
}

export default function SimulateDeviceAlert() {
    return (
        <Alert severity="info">
            <SimulateDeviceHint />
        </Alert>
    )
}
