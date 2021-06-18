import React, { PointerEvent, ReactNode, useContext } from "react"
import WorkspaceContext from "../WorkspaceContext"

export function PointerBoundary(props: {
    className?: string
    children: ReactNode
}) {
    const { dragging } = useContext(WorkspaceContext)
    const { className, children } = props
    const onPointerStopPropagation = (event: PointerEvent<HTMLDivElement>) => {
        // make sure blockly does not handle drags when interacting with UI
        if (!dragging) event.stopPropagation()
    }
    return (
        <div
            className={className}
            style={dragging ? undefined : { cursor: "inherit" }}
            onPointerDown={dragging ? undefined : onPointerStopPropagation}
            onPointerUp={dragging ? undefined : onPointerStopPropagation}
            onPointerMove={dragging ? undefined : onPointerStopPropagation}
        >
            {children}
        </div>
    )
}
