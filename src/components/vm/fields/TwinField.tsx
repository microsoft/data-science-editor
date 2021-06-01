import React, { PointerEvent, useContext } from "react"
import { ReactFieldJSON } from "./ReactField"
import { Grid } from "@material-ui/core"
import DashboardServiceWidget from "../../dashboard/DashboardServiceWidget"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"
import NoServiceAlert from "./NoServiceAlert"

function TwinWidget() {
    const { roleService, flyout } = useContext(WorkspaceContext)
    const onPointerStopPropagation = (event: PointerEvent<HTMLDivElement>) => {
        // make sure blockly does not handle drags when interacting with UI
        event.stopPropagation()
    }
    if (flyout) return null

    return (
        <Grid
            container
            alignItems="center"
            alignContent="center"
            justify="center"
            spacing={1}
        >
            <Grid item>
                <NoServiceAlert />
                {roleService && (
                    <div
                        style={{ cursor: "inherit" }}
                        onPointerDown={onPointerStopPropagation}
                        onPointerUp={onPointerStopPropagation}
                        onPointerMove={onPointerStopPropagation}
                    >
                        <DashboardServiceWidget
                            service={roleService}
                            visible={true}
                            variant="icon"
                        />
                    </div>
                )}
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
