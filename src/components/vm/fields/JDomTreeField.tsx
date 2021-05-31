import React, { useContext } from "react"
import { ReactFieldJSON } from "./ReactField"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"

function JDomTreeWidget() {
    const { roleService } = useContext(WorkspaceContext)

    return <ServiceTreeItem service={roleService} />
}

export default class JDomTreeField extends ReactInlineField {
    static KEY = "jacdac_jdom_tree"
    static EDITABLE = false
    protected serviceClass: number

    static fromJson(options: ReactFieldJSON) {
        return new JDomTreeField(options)
    }

    renderInlineField() {
        return <JDomTreeWidget />
    }
}
