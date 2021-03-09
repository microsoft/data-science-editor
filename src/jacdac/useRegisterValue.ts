import React, { useEffect, useState } from "react";
import { REPORT_UPDATE } from "../../jacdac-ts/src/jdom/constants";
import { JDRegister } from "../../jacdac-ts/src/jdom/register";

export function useRegisterHumanValue(register: JDRegister): string {
    const [value, setValue] = useState<string>(register?.humanValue)
    // update value
    useEffect(() => register?.subscribe(REPORT_UPDATE, () => {
        setValue(register?.humanValue)
    }), [register])
    return value;
}

export function useRegisterIntValue(register: JDRegister): number {
    const [value, setValue] = useState<number>(register?.intValue)
    // update value
    useEffect(() => register?.subscribe(REPORT_UPDATE, () => {
        setValue(register?.intValue)
    }), [register])
    return value;
}

export function useRegisterUnpackedValue<T extends any[]>(register: JDRegister): T {
    const [value, setValue] = useState<T>(register?.unpackedValue as T)
    useEffect(() => register?.subscribe(REPORT_UPDATE, () => {
        setValue(register?.unpackedValue as T)
    }), [register])
    return value || ([] as T);
}

export function useRegisterStringValue(register: JDRegister): string {
    const [value, setValue] = useState<string>(register?.stringValue)
    // update value
    useEffect(() => register?.subscribe(REPORT_UPDATE, () => {
        setValue(register?.stringValue)
    }), [register])
    return value;
}

export function useRegisterBoolValue(register: JDRegister): boolean {
    const [value, setValue] = useState<boolean>(register?.boolValue)
    // update value
    useEffect(() => register?.subscribe(REPORT_UPDATE, () => {
        setValue(register?.boolValue)
    }), [register])
    return value;
}
