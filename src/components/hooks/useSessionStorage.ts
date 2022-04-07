import useStorage from "./useStorage"

const storage = (() => {
    try {
        typeof window !== "undefined" && window.sessionStorage
    } catch {
        return undefined
    }
})()
export default function useSessionStorage<T>(
    key: string,
    initialValue?: T
): [T, (value: T) => void] {
    return useStorage<T>(storage, key, initialValue)
}
