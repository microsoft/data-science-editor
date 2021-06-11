import React, { lazy, useContext, PointerEvent } from "react"
import { ReactFieldJSON } from "./ReactField"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"
import Suspense from "../../ui/Suspense"
import NoServiceAlert from "./NoServiceAlert"

const JDomServiceTreeView = lazy(
    () => import("../../tools/JDomServiceTreeView")
)

function JDomTreeWidget() {
    const { roleService, flyout } = useContext(WorkspaceContext)
    const onPointerStopPropagation = (event: PointerEvent<HTMLDivElement>) => {
        // make sure blockly does not handle drags when interacting with UI
        event.stopPropagation()
    }

    if (flyout) return null
    if (!roleService) return <NoServiceAlert />

    return (
        <div
            style={{ minWidth: "12rem", cursor: "inherit" }}
            onPointerDown={onPointerStopPropagation}
            onPointerUp={onPointerStopPropagation}
            onPointerMove={onPointerStopPropagation}
        >
            {roleService && (
                <Suspense>
                    <JDomServiceTreeView
                        service={roleService}
                        defaultExpanded={[roleService.id]}
                    />
                </Suspense>
            )}
        </div>
    )
}

export default class JDomTreeField extends ReactInlineField {
    static KEY = "jacdac_field_jdom_service_tree"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new JDomTreeField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <JDomTreeWidget />
    }
}
