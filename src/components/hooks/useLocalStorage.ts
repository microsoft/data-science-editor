import { UIFlags } from "../dom/providerbus"
import useStorage, { getStorageItem } from "./useStorage"

const storage = (() => {
    try {
        if (UIFlags.transient) return undefined
        return typeof window !== "undefined" && window.localStorage
    } catch {
        return undefined
    }
})()

export function getLocalStorageItem<T = string>(key: string) {
    return getStorageItem<T>(storage, key)
}

export default function useLocalStorage<T = string>(
    key: string,
    initialValue?: T
): [T, (value: T) => void] {
    return useStorage<T>(storage, key, initialValue)
}
