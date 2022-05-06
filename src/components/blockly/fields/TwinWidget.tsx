import React, { useContext, useRef } from "react"
import { Grid } from "@mui/material"
import DashboardServiceWidget from "../../dashboard/DashboardServiceWidget"
import WorkspaceContext from "../WorkspaceContext"
import NoServiceAlert from "./NoServiceAlert"
import { PointerBoundary } from "./PointerBoundary"
import useBestRegister from "../../hooks/useBestRegister"
import { useEffect } from "react"
import { REPORT_UPDATE } from "../../../../jacdac-ts/src/jdom/constants"
import useBlockData from "../useBlockData"
import { toMap } from "../../../../jacdac-ts/src/jdom/utils"
import useBus from "../../../jacdac/useBus"

const DEFAULT_HORIZON = 30 // 10 seconds
export default function TwinWidget() {
    const bus = useBus()
    const { twinService, flyout, sourceBlock } = useContext(WorkspaceContext)
    const { data, setData } = useBlockData(sourceBlock, [], 50)
    const currentDataRef = useRef<{ time: number }[]>([])

    // data collection
    const register = useBestRegister(twinService)
    const setRegisterData = () => {
        const newValue = register?.unpackedValue
        if (newValue !== undefined) {
            const newRow = toMap(
                register.fields,
                f => f.name,
                (f, i) => newValue[i]
            )
            const now = bus.timestamp / 1000
            const rowTime = register.lastDataTimestamp / 1000
            const outdated = now - DEFAULT_HORIZON
            const currentData = currentDataRef.current
            const newData = [
                ...(currentData || []).filter(d => d.time >= outdated),
                {
                    time: rowTime,
                    ...newRow,
                },
            ]
            currentDataRef.current = newData
            setData(newData)
        }
    }
    useEffect(
        () => register?.subscribe(REPORT_UPDATE, setRegisterData),
        [register]
    )
    useEffect(() => {
        currentDataRef.current = data
    }, [sourceBlock])

    if (flyout) return null
    if (!twinService) return <NoServiceAlert />

    return (
        <Grid
            container
            alignItems="center"
            alignContent="center"
            justifyContent="center"
            spacing={1}
        >
            <Grid item>
                <PointerBoundary>
                    <DashboardServiceWidget
                        service={twinService}
                        visible={true}
                        variant="icon"
                        controlled={true}
                    />
                </PointerBoundary>
            </Grid>
        </Grid>
    )
}
