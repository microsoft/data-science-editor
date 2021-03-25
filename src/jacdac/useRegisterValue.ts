import { useEffect, useState } from "react"
import { REPORT_UPDATE } from "../../jacdac-ts/src/jdom/constants"
import { PackedValues } from "../../jacdac-ts/src/jdom/pack"
import { JDRegister } from "../../jacdac-ts/src/jdom/register"
export interface RegisterOptions {
    // Indicates if the HTML element is visible in view. If not, updates may be slowed or stopped.
    visible?: boolean
}

export function useRegisterHumanValue(
    register: JDRegister,
    options?: RegisterOptions
): string {
    const [value, setValue] = useState<string>(register?.humanValue)
    const { visible } = options || { visible: true }
    // update value
    useEffect(
        () =>
            visible &&
            register?.subscribe(REPORT_UPDATE, () => {
                setValue(register?.humanValue)
            }),
        [register, visible]
    )
    return value
}

export function useRegisterUnpackedValue<T extends PackedValues>(
    register: JDRegister,
    options?: RegisterOptions
): T {
    const [value, setValue] = useState<T>(register?.unpackedValue as T)
    const { visible } = options || {}
    useEffect(
        () =>
            visible &&
            register?.subscribe(REPORT_UPDATE, () => {
                setValue(register?.unpackedValue as T)
            }),
        [register, visible]
    )
    return value || ([] as T)
}

export function useRegisterBoolValue(
    register: JDRegister,
    options?: RegisterOptions
): boolean {
    const [value, setValue] = useState<boolean>(register?.boolValue)
    const { visible } = options || {}
    // update value
    useEffect(
        () =>
            visible &&
            register?.subscribe(REPORT_UPDATE, () => {
                setValue(register?.boolValue)
            }),
        [register, visible]
    )
    return value
}
