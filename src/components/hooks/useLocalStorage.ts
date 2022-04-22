import useStorage from "./useStorage"

const storage = (() => {
    try {
        return typeof window !== "undefined" && window.localStorage
    } catch {
        return undefined
    }
})()
export default function useLocalStorage<T = string>(
    key: string,
    initialValue?: T
): [T, (value: T) => void] {
    return useStorage<T>(storage, key, initialValue)
}
