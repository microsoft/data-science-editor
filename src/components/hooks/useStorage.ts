import { useCallback, useState } from "react"
import { UIFlags } from "../../jacdac/providerbus"

// enabled when storage=0
const memStorage: Record<string, unknown> = {}

const PREFIX = "jacdac:"
export default function useStorage<T>(
    storage: Storage,
    key: string,
    initialValue?: T
): [T, (value: T) => void] {
    const pkey = PREFIX + key
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (UIFlags.storage) {
            try {
                // Get from local storage by key
                const item = storage?.getItem(pkey)
                // Parse stored json or if none return initialValue
                return (item && JSON.parse(item)) || initialValue
            } catch (error) {
                console.log(error)
            }
        }

        // use in-memory
        const v = memStorage[key]
        return v !== undefined ? v : initialValue
    })

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = useCallback(
        (value: T) => {
            // keep in-memory cahed
            memStorage[key] = value
            // Allow value to be a function so we have same API as useState
            const valueToStore = value
            // Save state
            setStoredValue(valueToStore)
            // persistent storage
            if (UIFlags.storage) {
                try {
                    // Save to local storage
                    storage?.setItem(pkey, JSON.stringify(valueToStore))
                } catch (error) {
                    // A more advanced implementation would handle the error case
                    console.log(error)
                }
            }
        },
        [key]
    )

    return [storedValue, setValue]
}
