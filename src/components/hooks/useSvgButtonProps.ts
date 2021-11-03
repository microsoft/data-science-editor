import { SVGProps } from "react"
import useFireKey from "./useFireKey"

export default function useSvgButtonProps<T extends SVGElement>(
    label: string,
    onDown?: (event: React.PointerEvent<T>) => void,
    onUp?: (event: React.PointerEvent<T>) => void
): SVGProps<T> {
    const disabled = !onDown && !onUp
    const fireDownOnEnter = useFireKey(onDown)
    const fireUpOnEnter = useFireKey(onUp)

    const preventify = (handler: (event: React.PointerEvent<T>) => void) => {
        if (handler)
            return (event: React.PointerEvent<T>) => {
                event.preventDefault()
                handler(event)
            }
        else return undefined
    }

    return {
        className: disabled ? undefined : "clickeable",
        role: disabled ? undefined : "button",
        tabIndex: disabled ? undefined : 0,
        ["aria-label"]: label,
        onPointerDown: preventify(onDown),
        onPointerUp: preventify(onUp),
        onPointerLeave: preventify(onUp),
        onKeyDown: fireDownOnEnter,
        onKeyUp: fireUpOnEnter,
    }
}
