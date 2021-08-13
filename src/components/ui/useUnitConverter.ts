// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../jacdac-ts/jacdac-spec/spectool/jdspec.d.ts" />
import useLocalStorage from "../hooks/useLocalStorage"

const adapters: Record<string, Record<string, (v: number) => number>> = {
    "°C": {
        "°C": v => v,
        "°F": v => (9 / 5) * v + 32,
    },
}

export function useUnitConverters() {
    const [settings, setSettings] = useLocalStorage("jacdac:unitconverters", {})
    return {
        converters: Object.keys(adapters).map(unit => ({
            unit,
            name: settings[unit] || unit,
            names: Object.keys(adapters[unit]),
        })),
        setConverter: (unit: string, name: string) => {
            const newSettings = { ...settings }
            newSettings[unit] = name
            setSettings(newSettings)
        },
    }
}
const identity = (v: number) => v

export default function useUnitConverter(unit: jdspec.Unit): {
    name?: string
    converter: (v: number) => number
    names?: string[]
} {
    if (!unit)
        return {
            converter: v => v,
        }

    const [settings] = useLocalStorage("jacdac:unitconverters", {})

    const adapter = adapters[unit]
    if (!adapter)
        return {
            converter: v => v,
        }

    const name = settings[unit]
    const converter = adapter[name] || identity
    const names = Object.keys(adapter)

    return {
        name,
        converter,
        names,
    }
}
