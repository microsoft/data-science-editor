import React, { createElement, FunctionComponent, lazy } from "react"
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
    SRV_LED_SINGLE,
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
    SRV_CLOUD_ADAPTER,
    SRV_SAT_NAV,
    SRV_PLANAR_POSITION,
} from "../../../jacdac-ts/src/jdom/constants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { CircularProgress, SvgIconProps } from "@mui/material"

// bundled
import DashboardButton from "./DashboardButton"
import DashboardRotaryEncoder from "./DashboardRotaryEncoder"
import DashboardSwitch from "./DashboardSwitch"
import DashboardGamepad from "./DashboardGamepad"
import useServiceServer from "../hooks/useServiceServer"
import Suspense from "../ui/Suspense"
import DashboardServiceDefaultWidget from "./DashboardServiceDefaultWidget"

// lazy devices
const DashboardServo = lazy(() => import("./DashboardServo"))
const DashboardAccelerometer = lazy(() => import("./DashboardAccelerometer"))
const DashboardBuzzer = lazy(() => import("./DashboardBuzzer"))
const DashboardLED = lazy(() => import("./DashboardLED"))
const DashboardLEDStrip = lazy(() => import("./DashboardLEDStrip"))
const DashboardLEDSingle = lazy(() => import("./DashboardLEDSingle"))
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
const DashboardSatNav = lazy(() => import("./DashboardSatNav"))
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
    () => import("./DashboardJacscriptManager")
)
const DashboardCloudAdapter = lazy(() => import("./DashboardCloudAdapter"))
const DashboardPlanarPosition = lazy(() => import("./DashboardPlanarPosition"))

// icons
const PowerSettingsNewIcon = lazy(
    () => import("@mui/icons-material/PowerSettingsNew")
)
const MusicNoteIcon = lazy(() => import("@mui/icons-material/MusicNote"))
const AppsIcon = lazy(() => import("@mui/icons-material/Apps"))
const SensorsIcon = lazy(() => import("@mui/icons-material/Sensors"))
const MemoryIcon = lazy(() => import("@mui/icons-material/Memory"))
const CloudQueueIcon = lazy(() => import("@mui/icons-material/CloudQueue"))

export interface DashboardServiceProps {
    service: JDService
    expanded?: boolean
    // all widget services
    services?: JDService[]
    variant?: "icon" | ""
    // the dashboard html element is in the view
    visible?: boolean
    // a programming experience is controlling the device
    controlled?: boolean
    // show a button to toggle an advanced interaction mode
    expandable?: boolean
    icon?: DashboardIcon
}
export type DashboardServiceComponent = FunctionComponent<DashboardServiceProps>
export type DashboardIcon = FunctionComponent<SvgIconProps>

const serviceViews: {
    [serviceClass: number]: {
        component: DashboardServiceComponent
        bundled?: boolean
        weight?: (service: JDService) => number
        // show a button to toggle an advanced interaction mode
        expandable?: boolean
        icon?: DashboardIcon
    }
} = {
    [SRV_ROLE_MANAGER]: {
        component: DashboardRoleManager,
        weight: () => 2,
    },
    [SRV_BUZZER]: {
        component: DashboardBuzzer,
        weight: () => 4,
        expandable: true,
        icon: MusicNoteIcon,
    },
    [SRV_LED_STRIP]: {
        component: DashboardLEDStrip,
        weight: () => 3,
        expandable: true,
    },
    [SRV_LED]: {
        component: DashboardLED,
        weight: () => 3,
        expandable: true,
    },
    [SRV_ACCELEROMETER]: {
        component: DashboardAccelerometer,
        weight: () => 3,
        expandable: true,
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
        expandable: true,
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
        expandable: true,
    },
    [SRV_BRAILLE_DISPLAY]: {
        component: DashboardBrailleDisplay,
        weight: () => 2,
        expandable: true,
    },
    [SRV_RAIN_GAUGE]: {
        component: DashboardRainGauge,
    },
    [SRV_DOT_MATRIX]: {
        component: DashboardDotMatrix,
        weight: () => 3,
        expandable: true,
        icon: AppsIcon,
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
        expandable: true,
        icon: PowerSettingsNewIcon,
    },
    [SRV_SPEECH_SYNTHESIS]: {
        component: DashboardSpeechSynthesis,
    },
    [SRV_SOIL_MOISTURE]: {
        component: DashboardSoilMoisture,
    },
    [SRV_REAL_TIME_CLOCK]: {
        component: DashboardRealTimeClock,
        expandable: true,
    },
    [SRV_SAT_NAV]: {
        component: DashboardSatNav,
    },
    [SRV_LED_SINGLE]: {
        component: DashboardLEDSingle,
    },
    [SRV_GAMEPAD]: {
        component: DashboardGamepad,
        bundled: true,
        weight: () => 3,
    },
    [SRV_SEVEN_SEGMENT_DISPLAY]: {
        component: DashboardSevenSegmentDisplay,
        expandable: true,
    },
    [SRV_MOTION]: {
        component: DashboardMotion,
    },
    [SRV_WATER_LEVEL]: {
        component: DashboardWaterLevel,
    },
    [SRV_COLOR]: {
        component: DashboardColor,
        weight: () => 1,
    },
    [SRV_SOUND_PLAYER]: {
        component: DashboardSoundPlayer,
        weight: () => 1,
        expandable: true,
        icon: MusicNoteIcon,
    },
    [SRV_SOUND_LEVEL]: {
        component: DashboardSoundLevel,
        expandable: true,
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
        expandable: true,
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
        expandable: true,
        icon: SensorsIcon,
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
    [SRV_PLANAR_POSITION]: {
        component: DashboardPlanarPosition,
        weight: () => 1,
    },
    [SRV_JACSCRIPT_MANAGER]: {
        component: DashboardJacscriptManager,
        expandable: true,
        icon: MemoryIcon,
    },
    [SRV_CLOUD_ADAPTER]: {
        component: DashboardCloudAdapter,
        weight: () => 3,
        expandable: true,
        icon: CloudQueueIcon,
    },
}

export function isExpandableView(serviceClass: number) {
    return !!serviceViews[serviceClass]?.expandable
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
    if (!component) return createElement(DashboardServiceDefaultWidget, props)

    // precompiled
    if (bundled) return createElement(component, props)

    // lazy loading
    return (
        <Suspense
            fallback={
                <CircularProgress
                    aria-label={`loading...`}
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

export function dashboardServiceIcon(serviceClass: number) {
    return serviceViews[serviceClass]?.icon
}
