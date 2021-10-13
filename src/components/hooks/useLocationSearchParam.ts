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

export function useLocationSearchParamBoolean(key: string): boolean {
    return useMemo(() => {
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href)
            const v = url.searchParams.get(key)
            if (v) return v === "1" || v === "true"
            // empty value
            return url.searchParams.has(key)
        }
        return undefined
    }, [key])
}
