import React, { useContext } from "react"
import { ReactFieldJSON } from "./ReactField"
import { Grid } from "@material-ui/core"
import DashboardServiceWidget from "../../dashboard/DashboardServiceWidget"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"
import NoServiceAlert from "./NoServiceAlert"
import { PointerBoundary } from "./PointerBoundary"

function TwinWidget() {
    const { roleService, flyout } = useContext(WorkspaceContext)
    if (flyout) return null
    if (!roleService) return <NoServiceAlert />

    return (
        <Grid
            container
            alignItems="center"
            alignContent="center"
            justify="center"
            spacing={1}
        >
            <Grid item>
                <PointerBoundary>
                    <DashboardServiceWidget
                        service={roleService}
                        visible={true}
                        variant="icon"
                    />
                </PointerBoundary>
            </Grid>
        </Grid>
    )
}

export default class TwinField extends ReactInlineField {
    static KEY = "jacdac_field_twin"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new TwinField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <TwinWidget />
    }
}
