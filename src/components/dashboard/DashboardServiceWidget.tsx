import React, {
    createElement,
    FunctionComponent,
    lazy,
    useMemo,
    Suspense,
} from "react"
import {
    SRV_ACCELEROMETER,
    SRV_ARCADE_GAMEPAD,
    SRV_BUTTON,
    SRV_BUZZER,
    SRV_CHARACTER_SCREEN,
    SRV_COLOR,
    SRV_COMPASS,
    SRV_GYROSCOPE,
    SRV_JOYSTICK,
    SRV_LED,
    SRV_LED_MATRIX,
    SRV_LED_PIXEL,
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
} from "../../../jacdac-ts/src/jdom/constants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { isRegister } from "../../../jacdac-ts/src/jdom/spec"
import RegisterInput from "../RegisterInput"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import { CircularProgress, NoSsr } from "@material-ui/core"

// bundled
import DashboardButton from "./DashboardButton"
import DashboardServo from "./DashboardServo"
import DashboardRotaryEncoder from "./DashboardRotaryEncoder"
import DashboardSwitch from "./DashboardSwitch"
import useServiceServer from "../hooks/useServiceServer"

// lazy devices
const DashboardAccelerometer = lazy(() => import("./DashboardAccelerometer"))
const DashboardBuzzer = lazy(() => import("./DashboardBuzzer"))
const DashboardLEDPixel = lazy(() => import("./DashboardLEDPixel"))
const DashboardRoleManager = lazy(() => import("./DashboardRoleManager"))
const DashboardTrafficLight = lazy(() => import("./DashboardTrafficLight"))
const DashboardCharacterScreen = lazy(
    () => import("./DashboardCharacterScreen")
)
const DashboardRainGauge = lazy(() => import("./DashboardRainGauge"))
const DashboardLEDMatrix = lazy(() => import("./DashboardLEDMatrix"))
const DashboardArcadeGamepad = lazy(() => import("./DashboardArcadeGamepad"))
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
const DashboardJoystick = lazy(() => import("./DashboardJoystick"))
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
        weight: () => 2,
    },
    [SRV_LED_PIXEL]: {
        component: DashboardLEDPixel,
        weight: () => 2,
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
        bundled: true,
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
    [SRV_RAIN_GAUGE]: {
        component: DashboardRainGauge,
    },
    [SRV_LED_MATRIX]: {
        component: DashboardLEDMatrix,
        weight: () => 3,
    },
    [SRV_ARCADE_GAMEPAD]: {
        component: DashboardArcadeGamepad,
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
    [SRV_JOYSTICK]: {
        component: DashboardJoystick,
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
        weight: () => 6,
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
    const intensity = useRegisterBoolValue(intensityRegister, others)
    const hasIntensity = intensity !== undefined
    const off = hasIntensity ? !intensity : undefined
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
            toggleOff={hasIntensity ? toggleOff : undefined}
            visible={visible}
        />
    )
}

function IntensityWidget(
    props: { intensityRegister: JDRegister } & DashboardServiceProps
) {
    const { intensityRegister, ...others } = props
    const { visible } = others
    const [intensity] = useRegisterUnpackedValue<[number | boolean]>(
        intensityRegister,
        others
    )
    const off = intensity !== undefined && !intensity

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

function DefaultWidget(props: DashboardServiceProps) {
    const { service, visible } = props
    const { specification } = service
    const register = useMemo(() => {
        const rspec = specification?.packets.find(
            pkt =>
                isRegister(pkt) &&
                collapsedRegisters.indexOf(pkt.identifier) > -1
        )
        return service.register(rspec?.identifier)
    }, [service])

    if (!register)
        // nothing to see here
        return null

    // if register is value, disable if enabled is 0.
    if (register.specification.identifier == SystemReg.Value) {
        const intensityRegister = register.service.register(SystemReg.Intensity)
        return (
            <ValueWidget
                valueRegister={register}
                intensityRegister={intensityRegister}
                {...props}
            />
        )
    }

    // case of no streaming,value just intensity, like a relay
    if (register.specification.identifier === SystemReg.Intensity)
        return <IntensityWidget intensityRegister={register} {...props} />

    return (
        <RegisterInput
            register={register}
            variant={"widget"}
            showServiceName={false}
            showRegisterName={false}
            hideMissingValues={true}
            visible={visible}
        />
    )
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
        <NoSsr>
            <Suspense
                fallback={
                    <CircularProgress
                        color={color}
                        disableShrink={true}
                        variant={"indeterminate"}
                        size={"3em"}
                    />
                }
            >
                {createElement(component, props)}
            </Suspense>
        </NoSsr>
    )
}

export function dashboardServiceWeight(service: JDService) {
    const view = serviceViews[service.serviceClass]
    return view?.weight?.(service)
}
