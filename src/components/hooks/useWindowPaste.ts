import { useCallback } from "react"
import useWindowEvent from "./useWindowEvent"

export default function useWindowPaste(onPaste: (text: string) => void) {
    const cb = useCallback(
        (e: ClipboardEvent) => {
            e.preventDefault()
            const text = e.clipboardData.getData("text")
            onPaste(text)
        },
        [onPaste]
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useWindowEvent(<any>"paste", cb)
}
