import React, { PointerEvent, ReactNode } from "react"

export function PointerBoundary(props: {
    className?: string
    children: ReactNode
}) {
    const { className, children } = props
    const onPointerStopPropagation = (event: PointerEvent<HTMLDivElement>) => {
        // make sure blockly does not handle drags when interacting with UI
        event.stopPropagation()
    }
    return (
        <div
            className={className}
            style={{ cursor: "inherit" }}
            onPointerDown={onPointerStopPropagation}
            onPointerUp={onPointerStopPropagation}
            onPointerMove={onPointerStopPropagation}
        >
            {children}
        </div>
    )
}
