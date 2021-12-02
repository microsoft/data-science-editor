import { useContext, useEffect, useState } from "react"
import WorkspaceContext from "./WorkspaceContext"

export default function useDragDebounce<T>(value: T): T {
    const { dragging } = useContext(WorkspaceContext)
    const [valueAtDragging, setValueAtDragging] = useState(value)

    // record value when starting to drag
    useEffect(() => {
        if (dragging) setValueAtDragging(value)
    }, [dragging])

    // return value at dragging until drag is completed
    return dragging ? valueAtDragging || value : value
}
