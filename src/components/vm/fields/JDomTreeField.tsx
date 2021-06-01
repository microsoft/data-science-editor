import React, { lazy, useContext, PointerEvent } from "react"
import { ReactFieldJSON } from "./ReactField"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"
import Suspense from "../../ui/Suspense"
import NoServiceAlert from "./NoServiceAlert"
const JDomServiceTreeView = lazy(
    () => import("../../tools/JDomServiceTreeView")
)

function JDomTreeWidget(props: { serviceClass: number }) {
    const { serviceClass } = props
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
            <NoServiceAlert serviceClass={serviceClass} />
            {roleService && (
                <Suspense>
                    <JDomServiceTreeView service={roleService} />
                </Suspense>
            )}
        </div>
    )
}

export default class JDomTreeField extends ReactInlineField {
    static KEY = "jacdac_jdom_service_tree"
    static EDITABLE = false
    protected serviceClass: number

    static fromJson(options: ReactFieldJSON) {
        return new JDomTreeField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
        this.serviceClass = options?.serviceClass
    }

    renderInlineField() {
        return <JDomTreeWidget serviceClass={this.serviceClass} />
    }
}
