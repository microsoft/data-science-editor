import React, { PointerEvent, useContext } from "react"
import { ReactFieldJSON } from "./ReactField"
import { Button, Grid } from "@material-ui/core"
import DashboardServiceWidget from "../../dashboard/DashboardServiceWidget"
import AddIcon from "@material-ui/icons/Add"
import { startServiceProviderFromServiceClass } from "../../../../jacdac-ts/src/servers/servers"
import JacdacContext, { JacdacContextProps } from "../../../jacdac/Context"
import Alert from "../../ui/Alert"
import { serviceSpecificationFromClassIdentifier } from "../../../../jacdac-ts/src/jdom/spec"
import WorkspaceContext from "../WorkspaceContext"

function TwinWidget(props: { serviceClass: number }) {
    const { serviceClass } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { roleService, flyout } = useContext(WorkspaceContext)
    const specification = serviceSpecificationFromClassIdentifier(serviceClass)
    const handleStartSimulator = () =>
        startServiceProviderFromServiceClass(bus, serviceClass)
    const onPointerStopPropagation = (event: PointerEvent<HTMLDivElement>) => {
        // make sure blockly does not handle drags when interacting with UI
        event.stopPropagation()
    }

    console.log(`twin`, { roleService, flyout })

    return (
        <Grid
            container
            alignItems="center"
            alignContent="center"
            justify="center"
            spacing={1}
        >
            {roleService ? (
                <Grid item>
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
                </Grid>
            ) : (
                <Grid item>
                    <Alert severity="info">
                        No {specification?.name || "service"}...
                    </Alert>
                    {!flyout && (
                        <Button
                            variant="contained"
                            color="default"
                            startIcon={<AddIcon />}
                            onClick={handleStartSimulator}
                        >
                            start simulator
                        </Button>
                    )}
                </Grid>
            )}
        </Grid>
    )
}

export default class TwinField extends ReactInlineField<number> {
    static KEY = "jacdac_field_twin"
    static EDITABLE = false
    protected serviceClass: number

    static fromJson(options: ReactFieldJSON) {
        return new TwinField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options?.value, undefined, options, { width: 240, height: 160 })
        this.serviceClass = options.serviceClass
    }

    renderInlineField() {
        return <TwinWidget serviceClass={this.serviceClass} />
    }
}
