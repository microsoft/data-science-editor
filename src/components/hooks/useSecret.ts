import { useState } from "react"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useSecret(id: string) {
    const [value, setValue] = useState("")
    return {
        value,
        setValue,
    }
}
