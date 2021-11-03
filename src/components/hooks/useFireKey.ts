import { KeyboardEvent, PointerEvent } from "react"

const ENTER_KEY = 13
const SPACE_KEY = 32

export function keyCodeFromEvent(e: KeyboardEvent) {
    return typeof e.which == "number" ? e.which : e.keyCode
}

export default function useFireKey<TElement extends Element>(
    handler: (ev?: PointerEvent<TElement>) => void
): (e: KeyboardEvent<TElement>) => void {
    if (!handler) return undefined
    return (e: KeyboardEvent<Element>) => {
        const charCode = keyCodeFromEvent(e)
        if (charCode === ENTER_KEY || charCode === SPACE_KEY) {
            e.preventDefault()
            handler()
        }
    }
}
