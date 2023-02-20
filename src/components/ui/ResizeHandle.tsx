import clsx from "clsx"
import React from "react"
import { PanelResizeHandle } from "react-resizable-panels"

export default function ResizeHandle({
    className = "",
    collapsed = false,
    direction = "horizontal",
    id,
}: {
    className?: string
    collapsed?: boolean
    id?: string
    direction?: "horizontal" | "vertical"
}) {
    return (
        <PanelResizeHandle
            className={clsx("ResizeHandleOuter", className)}
            id={id}
        >
            <div
                className={"ResizeHandleInner"}
                data-collapsed={collapsed || undefined}
                data-direction={direction}
            >
                ⣿
            </div>
        </PanelResizeHandle>
    )
}
