import { UIFlags } from "../../jacdac/providerbus"
import useStorage from "./useStorage"

const storage = (() => {
    try {
        if (UIFlags.transient) return undefined
        if (
            UIFlags.persistent &&
            typeof window !== "undefined" &&
            window.localStorage
        )
            return localStorage
        return typeof window !== "undefined" && window.sessionStorage
    } catch {
        return undefined
    }
})()
export default function useSessionStorage<T = string>(
    key: string,
    initialValue?: T
): [T, (value: T) => void] {
    return useStorage<T>(storage, key, initialValue)
}
