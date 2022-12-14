import React, { useContext, lazy } from "react"
import { Grid, NoSsr } from "@mui/material"
import BrainManagerToolbar from "../brains/BrainManagerToolbar"
import BrainManagerContext from "../brains/BrainManagerContext"
import useBrainScript from "../brains/useBrainScript"
import Suspense from "../ui/Suspense"
import useDeviceScriptVm from "./useDeviceScriptVm"
import DeviceScriptToolbar from "./DeviceScriptToolbar"
import GridHeader from "../ui/GridHeader"
import DeviceScriptStats from "./DeviceScriptStats"
import ConnectButtons from "../buttons/ConnectButtons"
import useRoleManagerClient from "../services/useRoleManagerClient"
import useChange from "../../jacdac/useChange"
const Console = lazy(() => import("../console/Console"))
const Dashboard = lazy(() => import("../dashboard/Dashboard"))

function DeviceScriptDevToolsWithContext() {
    const { scriptId } = useContext(BrainManagerContext)
    const script = useBrainScript(scriptId)

    useDeviceScriptVm()
    const roleManager = useRoleManagerClient()
    useChange(roleManager, _ => _?.startSimulators())

    return (
        <Grid spacing={1} container>
            {script && (
                <Grid item xs={12}>
                    <BrainManagerToolbar script={script} />
                </Grid>
            )}
            <Grid item xs={12}>
                <GridHeader
                    title="DeviceScript"
                    action={<ConnectButtons transparent={true} />}
                />
            </Grid>
            <Grid item xs={12}>
                <DeviceScriptToolbar />
            </Grid>
            <Grid item xs={12}>
                <DeviceScriptStats />
            </Grid>
            <Grid item xs={12}>
                <Suspense>
                    <Console
                        showToolbar={true}
                        showFiles={false}
                        showLevel={true}
                        showPopout={false}
                        showSerial={false}
                        height="8rem"
                    />
                </Suspense>
            </Grid>
            <Grid item xs={12}>
                <Suspense>
                    <Dashboard
                        showAvatar={true}
                        showHeader={true}
                        showConnect={false}
                        showStartSimulators={false}
                        showStartRoleSimulators={true}
                        showDeviceProxyAlert={true}
                    />
                </Suspense>
            </Grid>
            <Grid item xs={12}>
                <GridHeader title="Console" />
            </Grid>
        </Grid>
    )
}

export default function DeviceScriptDevTools() {
    return (
        <NoSsr>
            <DeviceScriptDevToolsWithContext />
        </NoSsr>
    )
}
