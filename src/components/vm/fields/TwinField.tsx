import React, { useContext } from "react"
import { ReactFieldJSON } from "./ReactField"
import { Grid, Typography } from "@material-ui/core"
import DashboardServiceWidget from "../../dashboard/DashboardServiceWidget"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"
import NoServiceAlert from "./NoServiceAlert"
import DeviceAvatar from "../../devices/DeviceAvatar"
import DeviceName from "../../devices/DeviceName"
import useServices from "../../hooks/useServices"
import { JDService } from "../../../../jacdac-ts/src/jdom/service"
import { PointerBoundary } from "./PointerBoundary"

function RoleBindingView(props: { roleService: JDService }) {
    const { roleService } = props
    const { device, serviceClass } = roleService
    const services = useServices({ ignoreSelf: true, serviceClass })

    if (services.length < 2) return null

    return (
        <Grid style={{ color: "white" }} item xs={12}>
            <PointerBoundary>
                <Typography variant="caption"> bound to</Typography>
                <DeviceAvatar device={device} />
                <DeviceName device={device} showShortId={true} />
            </PointerBoundary>
        </Grid>
    )
}

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
            <RoleBindingView roleService={roleService} />
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
