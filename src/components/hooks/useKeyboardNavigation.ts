export default function useKeyboardNavigation(
    parentRef: Element,
    wrap = false
) {
    const query = '[tabindex="0"]'
    const onMove = (offset: number) => () => {
        const focusable = Array.from<SVGElement>(
            parentRef?.querySelectorAll(query) || []
        )
        if (focusable.length) {
            const me = focusable.findIndex(f => f === document.activeElement)
            // don't wrap
            if (
                !wrap &&
                ((me === 0 && offset < 0) ||
                    (me === focusable.length - 1 && offset > 0))
            )
                return
            const next = (me + offset + focusable.length) % focusable.length
            focusable[next].focus()
        }
    }
    return onMove
}
