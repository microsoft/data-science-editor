import { useEffect, useState } from "react"
import { REPORT_UPDATE } from "../../jacdac-ts/src/jdom/constants"
import { PackedValues } from "../../jacdac-ts/src/jdom/pack"
import JDRegister from "../../jacdac-ts/src/jdom/register"
import useAnalytics, { EventProperties } from "../components/hooks/useAnalytics"
export interface RegisterOptions {
    // Indicates if the HTML element is visible in view. If not, updates may be slowed or stopped.
    visible?: boolean
}

function readRegisterValue<T>(
    register: JDRegister,
    reader: (reg: JDRegister) => T,
    defaultValue: T,
    trackError: (error: unknown, properties?: EventProperties) => void
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

export function useRegisterHumanValue(
    register: JDRegister,
    options?: RegisterOptions
): string {
    const [value, setValue] = useState<string>(register?.humanValue)
    const { visible } = options || { visible: true }
    const { trackError } = useAnalytics()

    // update value
    useEffect(() => {
        const readValue = () =>
            readRegisterValue(register, _ => _?.humanValue, "???", trackError)
        setValue(readValue)
        return (
            visible &&
            register?.subscribe(REPORT_UPDATE, () => setValue(readValue))
        )
    }, [register, visible])
    return value
}

export function useRegisterUnpackedValue<T extends PackedValues>(
    register: JDRegister,
    options?: RegisterOptions
): T {
    const [value, setValue] = useState<T>(register?.unpackedValue as T)
    const { visible } = options || { visible: true }
    const { trackError } = useAnalytics()

    useEffect(() => {
        const readValue = () =>
            readRegisterValue<T>(
                register,
                _ => _?.unpackedValue as T,
                undefined,
                trackError
            )
        setValue(readValue)
        return (
            visible &&
            register?.subscribe(REPORT_UPDATE, () => {
                setValue(readValue)
            })
        )
    }, [register, visible])
    return value || ([] as T)
}

export function useRegisterBoolValue(
    register: JDRegister,
    options?: RegisterOptions
): boolean {
    const [value, setValue] = useState<boolean>(register?.boolValue)
    const { visible } = options || { visible: true }
    // update value
    useEffect(() => {
        setValue(register?.boolValue)
        return (
            visible &&
            register?.subscribe(REPORT_UPDATE, () => {
                setValue(register?.boolValue)
            })
        )
    }, [register, visible])
    return value
}
