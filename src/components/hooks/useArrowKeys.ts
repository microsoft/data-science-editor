import { KeyboardEvent } from "react"
import { keyCodeFromEvent } from "./useFireKey"

const LEFT_KEY = 37
const UP_KEY = 38
const RIGHT_KEY = 39
const DOWN_KEY = 40

export default function useArrowKeys(options: {
    onLeft?: () => void
    onRight?: () => void
    onUp?: () => void
    onDown?: () => void
    symmetric?: boolean
}) {
    const { onLeft, onUp, onRight, onDown, symmetric } = options

    if (!onLeft && !onUp && !onRight && !onDown) return undefined

    const handlers = {
        [LEFT_KEY]: onLeft,
        [RIGHT_KEY]: onRight,
        [UP_KEY]: onUp || (symmetric && onRight),
        [DOWN_KEY]: onDown || (symmetric && onLeft),
    }

    return (e: KeyboardEvent<Element>) => {
        const charCode = keyCodeFromEvent(e)
        const handler = handlers[charCode]
        if (handler) {
            e.preventDefault()
            handler()
        }
    }
}
