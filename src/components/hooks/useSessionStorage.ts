import useStorage from "./useStorage"

const storage = (() => {
    try {
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
