import { UIFlags } from "../dom/providerbus"
import useStorage, { getStorageItem } from "./useStorage"

const _localStorage = (() => {
    try {
        return (
            typeof window !== "undefined" &&
            UIFlags.storage &&
            window.localStorage
        )
    } catch {
        return undefined
    }
})()

export function getLocalStorageItem<T = string>(key: string) {
    return getStorageItem<T>(_localStorage, key)
}

export default function useLocalStorage<T = string>(
    key: string,
    initialValue?: T
): [T, (value: T) => void] {
    return useStorage<T>(_localStorage, key, initialValue)
}
