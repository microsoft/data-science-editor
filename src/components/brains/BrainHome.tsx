import { Grid, Typography } from "@mui/material"
import React, { useContext } from "react"
import BrainManagerContext from "./BrainManagerContext"
import BrainScriptGridItems from "./BrainScriptGridItems"
import BrainDeviceGridItems from "./BrainDeviceGridItems"

export default function BrainHome() {
    const { brainManager } = useContext(BrainManagerContext)
    if (!brainManager) return null
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle2">
                    connected to{" "}
                    <a href={`https://${brainManager.apiRoot}/swagger/`}>
                        {brainManager.apiRoot}
                    </a>
                </Typography>
            </Grid>
            <BrainScriptGridItems />
            <BrainDeviceGridItems />
        </Grid>
    )
}
