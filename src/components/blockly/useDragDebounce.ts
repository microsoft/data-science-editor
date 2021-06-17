import { useContext, useEffect, useRef, useState } from "react"
import { useDebounce } from "use-debounce"
import WorkspaceContext from "./WorkspaceContext"

export default function useDragDebounce<T>(value: T, delay?: number): T {
    const { dragging } = useContext(WorkspaceContext)
    const [debounced] = useDebounce(value, delay)
    const [valueAtDragging, setValueAtDragging] = useState(debounced)

    // record value when starting to drag
    useEffect(() => {
        if (dragging) setValueAtDragging(value)
    }, [dragging])

    // return value at dragging until drag is completed
    return dragging ? valueAtDragging : debounced
}
