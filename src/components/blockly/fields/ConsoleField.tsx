import React, { lazy, useContext } from "react"
import { ConsoleProvider } from "../../console/ConsoleContext"
import Suspense from "../../ui/Suspense"
import WorkspaceContext from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"
const Console = lazy(() => import("../../console/Console"))

function ConsoleWidget() {
    const { flyout } = useContext(WorkspaceContext)
    if (flyout) return null
    return (
        <ConsoleProvider>
            <Suspense>
                <Console height="12rem" />
            </Suspense>
        </ConsoleProvider>
    )
}

export default class ConsoleField extends ReactInlineField {
    static KEY = "jacdac_console_field"
    EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new ConsoleField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <ConsoleWidget />
    }
}
