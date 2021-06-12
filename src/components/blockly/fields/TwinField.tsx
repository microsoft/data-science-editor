import React, { useContext } from "react"
import { ReactFieldJSON } from "./ReactField"
import { Grid } from "@material-ui/core"
import DashboardServiceWidget from "../../dashboard/DashboardServiceWidget"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"
import NoServiceAlert from "./NoServiceAlert"
import { PointerBoundary } from "./PointerBoundary"
import useBestRegister from "../../hooks/useBestRegister"
import { useEffect } from "react"
import { REPORT_UPDATE } from "../../../../jacdac-ts/src/jdom/constants"
import useBlockData from "../useBlockData"
import JacdacContext, { JacdacContextProps } from "../../../jacdac/Context"
import { toMap } from "../../../../jacdac-ts/src/jdom/utils"

const HORIZON = 10
function TwinWidget() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { roleService, flyout, sourceId, sourceBlock } =
        useContext(WorkspaceContext)
    // eslint-disable-next-line @typescript-eslint/ban-types
    const { data, setData } = useBlockData<object>(sourceBlock, [])

    // data collection
    const register = useBestRegister(roleService)
    useEffect(
        () =>
            register?.subscribe(REPORT_UPDATE, () => {
                const newValue = register.unpackedValue
                if (newValue !== undefined) {
                    const newRow = toMap(
                        register.fields,
                        f => f.name,
                        (f, i) => newValue[i]
                    )
                    const newData = [
                        ...(data || []),
                        {
                            ...{ time: bus.timestamp / 1000 },
                            ...newRow,
                        },
                    ].slice(-HORIZON)
                    setData(newData)
                }
            }),
        [register, sourceId, data]
    )

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
