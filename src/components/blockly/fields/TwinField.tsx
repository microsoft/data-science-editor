import React, { lazy } from "react"
import Suspense from "../../ui/Suspense"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"
const TwinWidget = lazy(() => import("./TwinWidget"))

export default class TwinField extends ReactInlineField {
    static KEY = "jacdac_field_twin"
    EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new TwinField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return (
            <Suspense>
                <TwinWidget />
            </Suspense>
        )
    }
}
