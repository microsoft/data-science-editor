import React, { lazy } from "react"
import Suspense from "../../ui/Suspense"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"
const LogViewWidget = lazy(() => import("./LogViewWidget"))

export default class LogViewField extends ReactInlineField {
    static KEY = "jacdac_field_log_view"
    EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new LogViewField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return (
            <Suspense>
                <LogViewWidget />
            </Suspense>
        )
    }
}
