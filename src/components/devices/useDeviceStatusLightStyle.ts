import { LedAnimationData, LedAnimationFrame } from "../../../jacdac-ts/src/hosts/ledservicehost";
import { ControlReg, SRV_BOOTLOADER } from "../../../jacdac-ts/src/jdom/constants";
import { JDDevice } from "../../../jacdac-ts/src/jdom/device";
import useChange from "../../jacdac/useChange";
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue";
import useLedAnimationStyle, { LedAnimationProps } from "../hooks/useLedAnimationStyle";

const statusHue = 32
const statusSaturation = 255

//Every 524ms it changes from 5.9% and 1.6% (i.e. 1 sec duty cycle)
const bootloaderAnimation: LedAnimationData = [
    0,
    [
        [statusHue, statusSaturation, 96, 524 / 8],
        [statusHue, statusSaturation, 96, 0.1],
        [statusHue, statusSaturation, 72, 524 / 8],
        [statusHue, statusSaturation, 72, 0.1],
    ]
];
// 50ms every 150ms (50 on, 100 off) seven times (i.e. for 1 second)
const identifyAnimation: LedAnimationData = [
    7,
    [
        [statusHue, statusSaturation, 255, 50 / 8],
        [statusHue, statusSaturation, 255, 0.1],
        [statusHue, statusSaturation, 0, 100 / 8],
        [statusHue, statusSaturation, 0, 0.1],
    ]
];
// lights at 100% for 270ms, then 5.9% for rest of 530ms, 
// then goes into application that turns it on full for 200ms
const startupAnimation: LedAnimationData = [
    1,
    [
        [statusHue, statusSaturation, 255, 270 / 8],
        [statusHue, statusSaturation, 255, 0.1],
        [statusHue, statusSaturation, 6 / 100 * 0xff, 530 / 8],
        [statusHue, statusSaturation, 6 / 100 * 0xff, 0.1],
        [statusHue, statusSaturation, 255, 200 / 8],
        [statusHue, statusSaturation, 255, 0.1],
        [statusHue, statusSaturation, 0, 0.1],
    ]
];
// Synchronized fast blink 50us every 500ms
const connectedAnimation: LedAnimationData = [
    0,
    [
        [statusHue, statusSaturation, 0, 500 / 8],
        [statusHue, statusSaturation, 0, 0.1],
        [statusHue, statusSaturation, 96, 24 / 8],
        [statusHue, statusSaturation, 96, 0.1],
        [statusHue, statusSaturation, 0, 0.1],
    ]
];
//5ms every 250ms
const disconnectedAnimation: LedAnimationData = [
    0,
    [
        [statusHue, statusSaturation, 128, 40 / 8],
        [statusHue, statusSaturation, 128, 0.1],
        [statusHue, statusSaturation, 16, 250 / 8],
        [statusHue, statusSaturation, 16, 0.1],
    ]
];
// fast blink 70ms on, 70ms off - 30 times (4.2 seconds) before a reboot
const panicFrames: LedAnimationData = [
    30,
    [
        [statusHue, statusSaturation, 128, 70 / 8],
        [statusHue, statusSaturation, 128, 0.1],
        [statusHue, statusSaturation, 16, 70 / 8],
        [statusHue, statusSaturation, 16, 0.1],
    ]
];

export type LEDStatus = "startup" | "identify" | "connected" | "disconnected" | "panic" | "bootloader";

export function statusAnimation(status: LEDStatus): LedAnimationData {
    switch (status) {
        case "startup": return startupAnimation;
        case "identify": return identifyAnimation;
        case "connected": return connectedAnimation;
        case "disconnected": return disconnectedAnimation;
        case "panic": return panicFrames;
        case "bootloader": return bootloaderAnimation;
        default: return [0, []];
    }
}

export default function useDeviceStatusLightStyle(device: JDDevice, options?: LedAnimationProps) {
    const register = useChange(device, d => d.service(0).register(ControlReg.StatusLight));
    const bootloader = useChange(device, d => d.hasService(SRV_BOOTLOADER));
    const identifying = useChange(device, d => d?.identifying)
    const registerAnimation = useRegisterUnpackedValue<LedAnimationData>(register) || [0, []];

    // pick animation step
    const animation: LedAnimationData = identifying ? identifyAnimation
        : bootloader ? bootloaderAnimation
            : registerAnimation;

    return useLedAnimationStyle(animation, options);
}