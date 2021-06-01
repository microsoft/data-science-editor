import React, { lazy, useContext } from "react"
import { ReactFieldJSON } from "./ReactField"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"
import Suspense from "../../ui/Suspense"
import { Alert } from "@material-ui/lab"
const JDomServiceTreeView = lazy(
    () => import("../../tools/JDomServiceTreeView")
)

function JDomTreeWidget() {
    const { roleService } = useContext(WorkspaceContext)
    const onPointerStopPropagation = (event: PointerEvent<HTMLDivElement>) => {
        // make sure blockly does not handle drags when interacting with UI
        event.stopPropagation()
    }

    return (
        <div
            style={{ cursor: "inherit" }}
            onPointerDown={onPointerStopPropagation}
            onPointerUp={onPointerStopPropagation}
            onPointerMove={onPointerStopPropagation}
        >
            {!roleService && <Alert severity="info">Select a role</Alert>}
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
    static KEY = "jacdac_jdom_service_tree"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new JDomTreeField(options)
    }

    renderInlineField() {
        return <JDomTreeWidget />
    }
}
