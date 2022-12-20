import { humanify } from "../../jacdac-ts/jacdac-spec/spectool/jdspec"
import {
    BaseReg,
    DeviceScriptManagerReg,
    REPORT_UPDATE,
    SRV_DEVICE_SCRIPT_MANAGER,
    SystemStatusCodes,
} from "../../jacdac-ts/src/jdom/constants"
import { PackedValues } from "../../jacdac-ts/src/jdom/pack"
import { JDRegister } from "../../jacdac-ts/src/jdom/register"
import { ellipse } from "../../jacdac-ts/src/jdom/utils"
import useAnalytics, { EventProperties } from "../components/hooks/useAnalytics"
import useEventRaised from "./useEventRaised"
export interface RegisterOptions {
    // Indicates if the HTML element is visible in view. If not, updates may be slowed or stopped.
    visible?: boolean
}

function readRegisterValue<T>(
    register: JDRegister,
    reader: (reg: JDRegister) => T,
    defaultValue: T,
    trackError: (error: Error, properties?: EventProperties) => void
): T {
    try {
        const value = reader(register)
        return value
    } catch (e) {
        trackError(e, {
            dev: register?.service?.device?.anonymizedDeviceId,
            srv: register?.service?.name,
            reg: register?.name,
        })
        return defaultValue
    }
}

export interface HumanRegisterOptions extends RegisterOptions {
    maxLength?: number
}

function resolveRenderer(srv: number, reg: number) {
    if (reg === BaseReg.StatusCode)
        return (reg: JDRegister) => {
            const values = reg?.unpackedValue || []
            const [code, vendorCode] = values as [number, number]
            if (code === undefined) return "?"
            let r = `${humanify(
                SystemStatusCodes[code] || "?"
            )?.toLowerCase()} (0x${code.toString(16)})`
            if (vendorCode) {
                r += `, vendor: 0x${code.toString(16)}`
            }
            return r
        }

    if (
        srv === SRV_DEVICE_SCRIPT_MANAGER &&
        reg === DeviceScriptManagerReg.RuntimeVersion
    ) {
        return (reg: JDRegister) => {
            const values = reg?.unpackedValue || []
            const [patch, minor, major] = values as [number, number, number]
            if (patch === undefined) return "?"
            return `${major}.${minor}.${patch}`
        }
    }

    return undefined
}

export function useRegisterHumanValue(
    register: JDRegister,
    options?: HumanRegisterOptions
): string {
    const { visible, maxLength } = options || { visible: true }
    const { trackError } = useAnalytics()
    const renderer = register
        ? resolveRenderer(register.service.serviceClass, register.code)
        : undefined

    return useEventRaised(
        REPORT_UPDATE,
        visible ? register : undefined,
        _ =>
            readRegisterValue(
                _,
                __ =>
                    renderer
                        ? renderer(__)
                        : ellipse(__?.humanValue, maxLength),
                "???",
                trackError
            ),
        [visible, maxLength]
    )
}

export function useRegisterUnpackedValue<T extends PackedValues>(
    register: JDRegister,
    options?: RegisterOptions
): T {
    const { visible } = options || { visible: true }
    const { trackError } = useAnalytics()

    return useEventRaised(
        REPORT_UPDATE,
        visible ? register : undefined,
        _ =>
            readRegisterValue<T>(
                _,
                __ => (__?.unpackedValue || []) as T,
                [] as T,
                trackError
            ),
        [visible]
    )
}

export function useRegisterBoolValue(
    register: JDRegister,
    options?: RegisterOptions
): boolean {
    const { visible } = options || { visible: true }
    return useEventRaised(
        REPORT_UPDATE,
        visible ? register : undefined,
        _ => _?.boolValue,
        [visible]
    )
}
