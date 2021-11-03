import useArrowKeys from "./useArrowKeys"
import useKeyboardNavigation from "./useKeyboardNavigation"

export default function useKeyboardNavigationProps(
    parentRef: Element,
    vertical?: boolean
) {
    const onMove = useKeyboardNavigation(parentRef)

    const onKeyDown = useArrowKeys({
        onLeft: !vertical && onMove(-1),
        onRight: !vertical && onMove(1),
        onDown: vertical && onMove(1),
        onUp: vertical && onMove(-1),
    })

    return {
        onKeyDown: parentRef && onKeyDown,
    }
}
