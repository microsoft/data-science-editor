import React, { createElement, FunctionComponent, lazy, useMemo } from "react"
import {
    SRV_ACCELEROMETER,
    SRV_BUTTON,
    SRV_BUZZER,
    SRV_CHARACTER_SCREEN,
    SRV_COLOR,
    SRV_COMPASS,
    SRV_GYROSCOPE,
    SRV_GAMEPAD,
    SRV_LED,
    SRV_DOT_MATRIX,
    SRV_LED_STRIP,
    SRV_LED_DISPLAY,
    SRV_MATRIX_KEYPAD,
    SRV_MOTION,
    SRV_POWER,
    SRV_RAIN_GAUGE,
    SRV_REAL_TIME_CLOCK,
    SRV_REFLECTED_LIGHT,
    SRV_RNG,
    SRV_ROLE_MANAGER,
    SRV_ROTARY_ENCODER,
    SRV_SERVO,
    SRV_SEVEN_SEGMENT_DISPLAY,
    SRV_SOIL_MOISTURE,
    SRV_SOLENOID,
    SRV_SOUND_LEVEL,
    SRV_SOUND_PLAYER,
    SRV_SOUND_SPECTRUM,
    SRV_SPEECH_SYNTHESIS,
    SRV_SWITCH,
    SRV_TRAFFIC_LIGHT,
    SRV_WATER_LEVEL,
    SRV_WIND_DIRECTION,
    SRV_BIT_RADIO,
    SystemReg,
    SRV_HID_KEYBOARD,
    SRV_HID_MOUSE,
    SRV_AZURE_IOT_HUB_HEALTH,
    SRV_WIFI,
    SRV_VIBRATION_MOTOR,
    SRV_CODAL_MESSAGE_BUS,
    SRV_RELAY,
    SRV_LIGHT_BULB,
    SRV_BRAILLE_DISPLAY,
    SRV_JACSCRIPT_MANAGER,
    SRV_HID_JOYSTICK,
} from "../../../jacdac-ts/src/jdom/constants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { isRegister } from "../../../jacdac-ts/src/jdom/spec"
import RegisterInput from "../RegisterInput"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import { CircularProgress, NoSsr } from "@mui/material"

// bundled
import DashboardButton from "./DashboardButton"
import DashboardRotaryEncoder from "./DashboardRotaryEncoder"
import DashboardSwitch from "./DashboardSwitch"
import useServiceServer from "../hooks/useServiceServer"
import Suspense from "../ui/Suspense"

// lazy devices
const DashboardServo = lazy(() => import("./DashboardServo"))
const DashboardAccelerometer = lazy(() => import("./DashboardAccelerometer"))
const DashboardBuzzer = lazy(() => import("./DashboardBuzzer"))
const DashboardLEDStrip = lazy(() => import("./DashboardLEDStrip"))
const DashboardLEDDisplay = lazy(() => import("./DashboardLEDDisplay"))
const DashboardRoleManager = lazy(() => import("./DashboardRoleManager"))
const DashboardTrafficLight = lazy(() => import("./DashboardTrafficLight"))
const DashboardCharacterScreen = lazy(
    () => import("./DashboardCharacterScreen")
)
const DashboardBrailleDisplay = lazy(() => import("./DashboardBrailleDisplay"))
const DashboardRainGauge = lazy(() => import("./DashboardRainGauge"))
const DashboardDotMatrix = lazy(() => import("./DashboardDotMatrix"))
const DashboardWindDirection = lazy(() => import("./DashboardWindDirection"))
const DashboardMatrixKeypad = lazy(() => import("./DashboardMatrixKeypad"))
const DashboardReflectedLight = lazy(() => import("./DashboardReflectedLight"))
const DashboardPower = lazy(() => import("./DashboardPower"))
const DashboardSpeechSynthesis = lazy(
    () => import("./DashboardSpeechSynthesis")
)
const DashboardSoilMoisture = lazy(() => import("./DashboardSoilMoisture"))
const DashboardRealTimeClock = lazy(() => import("./DashboardRealTimeClock"))
const DashboardLED = lazy(() => import("./DashboardLED"))
const DashboardGamepad = lazy(() => import("./DashboardGamepad"))
const DashboardSevenSegmentDisplay = lazy(
    () => import("./DashboardSevenSegmentDisplay")
)
const DashboardMotion = lazy(() => import("./DashboardMotion"))
const DashboardWaterLevel = lazy(() => import("./DashboardWaterLevel"))
const DashboardColor = lazy(() => import("./DashboardColor"))
const DashboardSoundPlayer = lazy(() => import("./DashboardSoundPlayer"))
const DashboardSoundLevel = lazy(() => import("./DashboardSoundLevel"))
const DashboardSoundSpectrum = lazy(() => import("./DashboardSoundSpectrum"))
const DashboardRandomNumberGenerator = lazy(
    () => import("./DashboardRandomNumberGenerator")
)
const DashboardCompass = lazy(() => import("./DashboardCompass"))
const DashboardGyroscope = lazy(() => import("./DashboardGyroscope"))
const DashboardSolenoid = lazy(() => import("./DashboardSolenoid"))
const DashboardBitRadio = lazy(() => import("./DashboardBitRadio"))
const DashboardHIDKeyboard = lazy(() => import("./DashboardHIDKeyboard"))
const DashboardHIDMouse = lazy(() => import("./DashboardHIDMouse"))
const DashboardHIDJoystick = lazy(() => import("./DashboardHIDJoystick"))
//const DashboardAzureIoTHub = lazy(() => import("./DashboardAzureIoTHub"))
const DashboardAzureIoTHubHealth = lazy(
    () => import("./DashboardAzureIoTHubHealth")
)
const DashboardWifi = lazy(() => import("./DashboardWifi"))
const DashboardVibrationMotor = lazy(() => import("./DashboardVibrationMotor"))
const DashboardCODALMessageBus = lazy(
    () => import("./DashboardCODALMessageBus")
)
const DashboardRelay = lazy(() => import("./DashboardRelay"))
const DashboardLightBulb = lazy(() => import("./DashboardLightBulb"))
const DashboardJacscriptManager = lazy(
    () => import("./DashboardJascriptManager")
)

export interface DashboardServiceProps {
    service: JDService
    expanded?: boolean
    // all widget services
    services?: JDService[]
    variant?: "icon" | ""
    // the dashboard html element is in the view
    visible?: boolean
}
export type DashboardServiceComponent = FunctionComponent<DashboardServiceProps>

const serviceViews: {
    [serviceClass: number]: {
        component: DashboardServiceComponent
        bundled?: boolean
        weight?: (service: JDService) => number
    }
} = {
    [SRV_ROLE_MANAGER]: {
        component: DashboardRoleManager,
        weight: () => 2,
    },
    [SRV_BUZZER]: {
        component: DashboardBuzzer,
        weight: () => 4,
    },
    [SRV_LED_STRIP]: {
        component: DashboardLEDStrip,
        weight: () => 3,
    },
    [SRV_LED_DISPLAY]: {
        component: DashboardLEDDisplay,
        weight: () => 3,
    },
    [SRV_ACCELEROMETER]: {
        component: DashboardAccelerometer,
        weight: () => 3,
    },
    [SRV_ROTARY_ENCODER]: {
        component: DashboardRotaryEncoder,
        bundled: true,
        weight: () => 2,
    },
    [SRV_BUTTON]: {
        component: DashboardButton,
        bundled: true,
    },
    [SRV_SERVO]: {
        component: DashboardServo,
    },
    [SRV_SWITCH]: {
        component: DashboardSwitch,
        bundled: true,
    },
    [SRV_TRAFFIC_LIGHT]: {
        component: DashboardTrafficLight,
    },
    [SRV_CHARACTER_SCREEN]: {
        component: DashboardCharacterScreen,
        weight: () => 3,
    },
    [SRV_BRAILLE_DISPLAY]: {
        component: DashboardBrailleDisplay,
        weight: () => 3,
    },
    [SRV_RAIN_GAUGE]: {
        component: DashboardRainGauge,
    },
    [SRV_DOT_MATRIX]: {
        component: DashboardDotMatrix,
        weight: () => 3,
    },
    [SRV_WIND_DIRECTION]: {
        component: DashboardWindDirection,
    },
    [SRV_MATRIX_KEYPAD]: {
        component: DashboardMatrixKeypad,
    },
    [SRV_REFLECTED_LIGHT]: {
        component: DashboardReflectedLight,
    },
    [SRV_POWER]: {
        component: DashboardPower,
    },
    [SRV_SPEECH_SYNTHESIS]: {
        component: DashboardSpeechSynthesis,
    },
    [SRV_SOIL_MOISTURE]: {
        component: DashboardSoilMoisture,
    },
    [SRV_REAL_TIME_CLOCK]: {
        component: DashboardRealTimeClock,
    },
    [SRV_LED]: {
        component: DashboardLED,
    },
    [SRV_GAMEPAD]: {
        component: DashboardGamepad,
        weight: () => 3,
    },
    [SRV_SEVEN_SEGMENT_DISPLAY]: {
        component: DashboardSevenSegmentDisplay,
    },
    [SRV_MOTION]: {
        component: DashboardMotion,
    },
    [SRV_WATER_LEVEL]: {
        component: DashboardWaterLevel,
    },
    [SRV_COLOR]: {
        component: DashboardColor,
        weight: () => 2,
    },
    [SRV_SOUND_PLAYER]: {
        component: DashboardSoundPlayer,
        weight: () => 2,
    },
    [SRV_SOUND_LEVEL]: {
        component: DashboardSoundLevel,
        weight: () => 2,
    },
    [SRV_RNG]: {
        component: DashboardRandomNumberGenerator,
    },
    [SRV_COMPASS]: {
        component: DashboardCompass,
    },
    [SRV_GYROSCOPE]: {
        component: DashboardGyroscope,
        weight: () => 3,
    },
    [SRV_SOUND_SPECTRUM]: {
        component: DashboardSoundSpectrum,
        weight: () => 2,
    },
    [SRV_SOLENOID]: {
        component: DashboardSolenoid,
    },
    [SRV_BIT_RADIO]: {
        component: DashboardBitRadio,
        weight: () => 4,
    },
    [SRV_HID_KEYBOARD]: {
        component: DashboardHIDKeyboard,
        weight: () => 4,
    },
    [SRV_HID_MOUSE]: {
        component: DashboardHIDMouse,
        weight: () => 2,
    },
    [SRV_HID_JOYSTICK]: {
        component: DashboardHIDJoystick,
        weight: () => 2,
    },
    /*
    [SRV_AZURE_IOT_HUB]: {
        component: DashboardAzureIoTHub,
        weight: () => 3,
    },
    */
    [SRV_AZURE_IOT_HUB_HEALTH]: {
        component: DashboardAzureIoTHubHealth,
        weight: () => 2,
    },
    [SRV_WIFI]: {
        component: DashboardWifi,
        weight: () => 4,
    },
    [SRV_VIBRATION_MOTOR]: {
        component: DashboardVibrationMotor,
        weight: () => 3,
    },
    [SRV_CODAL_MESSAGE_BUS]: {
        component: DashboardCODALMessageBus,
        weight: () => 2,
    },
    [SRV_RELAY]: {
        component: DashboardRelay,
        weight: () => 2,
    },
    [SRV_LIGHT_BULB]: {
        component: DashboardLightBulb,
    },
    [SRV_JACSCRIPT_MANAGER]: {
        component: DashboardJacscriptManager,
    },
}

const collapsedRegisters = [
    SystemReg.Reading,
    SystemReg.Value,
    SystemReg.Intensity,
]

function ValueWidget(
    props: {
        valueRegister: JDRegister
        intensityRegister: JDRegister
    } & DashboardServiceProps
) {
    const { valueRegister, intensityRegister, ...others } = props
    const { visible } = others
    const hasIntensityBool =
        intensityRegister?.specification?.fields[0]?.type === "bool"
    const intensity = useRegisterBoolValue(
        hasIntensityBool && intensityRegister,
        others
    )
    const off = hasIntensityBool ? !intensity : undefined
    const toggleOff = async () => {
        await intensityRegister.sendSetBoolAsync(off, true)
    }

    return (
        <RegisterInput
            register={valueRegister}
            variant={"widget"}
            showServiceName={false}
            showRegisterName={false}
            hideMissingValues={true}
            off={off}
            toggleOff={hasIntensityBool ? toggleOff : undefined}
            visible={visible}
        />
    )
}

function IntensityWidget(
    props: { intensityRegister: JDRegister } & DashboardServiceProps
) {
    const { intensityRegister, ...others } = props
    const { visible } = others

    const hasIntensityBool =
        intensityRegister?.specification?.fields[0]?.type === "bool"
    const [intensity] = useRegisterUnpackedValue<[number | boolean]>(
        intensityRegister,
        others
    )
    const off = hasIntensityBool ? !intensity : undefined

    return (
        <RegisterInput
            register={intensityRegister}
            variant={"widget"}
            showServiceName={false}
            showRegisterName={false}
            hideMissingValues={true}
            off={off}
            visible={visible}
        />
    )
}

function DefaultRegisterWidget(
    props: { register: JDRegister } & DashboardServiceProps
) {
    const { register, ...rest } = props
    if (register.specification.identifier == SystemReg.Value) {
        const intensityRegister = props.service.register(SystemReg.Intensity)
        return (
            <ValueWidget
                valueRegister={register}
                intensityRegister={intensityRegister}
                {...rest}
            />
        )
    } else if (register.specification.identifier === SystemReg.Intensity)
        return <IntensityWidget intensityRegister={register} {...rest} />
    else
        return (
            <RegisterInput
                register={register}
                variant={"widget"}
                showServiceName={false}
                showRegisterName={false}
                hideMissingValues={true}
                visible={props.visible}
            />
        )
}

function DefaultWidget(props: DashboardServiceProps) {
    const { service } = props
    const { specification } = service
    const registers = useMemo(
        () =>
            specification?.packets
                .filter(
                    pkt =>
                        isRegister(pkt) &&
                        collapsedRegisters.indexOf(pkt.identifier) > -1
                )
                // if value, skip bool intensity
                .filter(
                    (pkt, i, pkts) =>
                        !(
                            pkt.identifier === SystemReg.Intensity &&
                            pkt.fields.length == 1 &&
                            pkt.fields[0].type === "bool"
                        ) || !pkts.some(pk => pk.identifier === SystemReg.Value)
                )
                // map
                .map(rspec => service.register(rspec.identifier)),
        [service]
    )

    if (!registers?.length)
        // nothing to see here
        return null

    return (
        <>
            {registers.map(register => (
                <DefaultRegisterWidget
                    key={register.id}
                    register={register}
                    {...props}
                />
            ))}
        </>
    )
}

export function hasServiceView(serviceClass: number) {
    return !!serviceViews[serviceClass]
}

export default function DashboardServiceWidget(
    props: React.Attributes & DashboardServiceProps
): JSX.Element {
    const { service } = props
    const { specification } = service
    const { component, bundled } =
        serviceViews[specification.classIdentifier] || {}
    const server = useServiceServer(service)
    const color = server ? "secondary" : "primary"
    // no special support
    if (!component) return createElement(DefaultWidget, props)

    // precompiled
    if (bundled) return createElement(component, props)

    // lazy loading
    return (
        <Suspense
            fallback={
                <CircularProgress
                    aria-label={`loading widget...`}
                    color={color}
                    disableShrink={true}
                    variant={"indeterminate"}
                    size={"1rem"}
                />
            }
        >
            {createElement(component, props)}
        </Suspense>
    )
}

export function dashboardServiceWeight(service: JDService) {
    const view = serviceViews[service.serviceClass]
    return view?.weight?.(service)
}
