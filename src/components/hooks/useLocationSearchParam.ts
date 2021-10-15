import { useMemo } from "react"

export function useLocationSearchParamString(key: string): string {
    return useMemo(() => {
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href)
            return url.searchParams.get(key)
        }
        return undefined
    }, [key])
}

export function useLocationSearchParamBoolean(
    key: string,
    defaultValue: boolean
): boolean {
    return useMemo(() => {
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href)
            const v = url.searchParams.get(key)
            if (v) {
                if (v === "1" || v === "true" || v === "yes") return true
                else if (v === "0" || v === "false" || v === "no") return false
                else return defaultValue
            }
            // empty value means true
            if (url.searchParams.has(key)) return true
            return defaultValue
        }
        return undefined
    }, [key, defaultValue])
}
