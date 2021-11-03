export default function useKeyboardNavigation(parentRef: Element) {
    const query = '[tabindex="0"]'
    const onMove = (offset: number) => () => {
        console.log("keyboard move", { offset })
        const focusable = Array.from<SVGElement>(
            parentRef?.querySelectorAll(query) || []
        )
        if (focusable.length) {
            const me = focusable.findIndex(f => f === document.activeElement)
            const next = (me + offset + focusable.length) % focusable.length
            focusable[next].focus()
        }
    }
    return onMove
}
