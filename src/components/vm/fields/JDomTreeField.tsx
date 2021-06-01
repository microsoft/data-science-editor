import React, { lazy, useContext } from "react"
import { ReactFieldJSON } from "./ReactField"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"
import Suspense from "../../ui/Suspense"
const JDomServiceTreeView = lazy(
    () => import("../../tools/JDomServiceTreeView")
)

function JDomTreeWidget() {
    const { roleService } = useContext(WorkspaceContext)

    if (!roleService) return null

    return (
        <Suspense>
            <JDomServiceTreeView
                service={roleService}
                defaultExpanded={[roleService.id]}
            />
        </Suspense>
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
