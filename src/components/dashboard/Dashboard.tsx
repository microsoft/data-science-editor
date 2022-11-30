import { Grid } from "@mui/material"
import React, { lazy } from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { splitFilter } from "../../../jacdac-ts/src/jdom/utils"
import useDevices from "../hooks/useDevices"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import DashboardDeviceGroup from "./DashboardDeviceGroup"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ClearIcon from "@mui/icons-material/Clear"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ConnectAlert from "../alert/ConnectAlert"
import ConnectButtons from "../buttons/ConnectButtons"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import SimulateDeviceAlert from "../alert/SimulateDeviceAlert"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"
import StartSimulatorButton from "../buttons/StartSimulatorButton"
import { defaultDeviceFilter, defaultDeviceSort } from "./filters"
import useHostedSimulators from "../HostedSimulatorsContext"
import StartMissingSimulatorsButton from "../buttons/StartMissingSimulatorsButton"
import useBusWithMode from "../../jacdac/useBusWithMode"
import useDeviceScript from "../devicescript/DeviceScriptContext"
import Suspense from "../ui/Suspense"
const DeviceScriptToolbar = lazy(() => import("../devicescript/DeviceScriptToolbar"))

export interface DashboardDeviceProps {
    showHeader?: boolean
    showAvatar?: boolean
    showReset?: boolean
    showDeviceProxyAlert?: boolean
    controlled?: boolean
    serviceFilter?: (srv: JDService) => boolean
    variant?: "icon" | ""
    alwaysVisible?: boolean
}
export interface DashboardProps extends DashboardDeviceProps {
    hideSimulators?: boolean
    showSimulatorHeader?: boolean
    showSimulatorAvatar?: boolean
    showDeviceHeader?: boolean
    showDeviceAvatar?: boolean
    showStartSimulators?: boolean
    showStartRoleSimulators?: boolean
    showConnect?: boolean
    showDeviceScript?: boolean
    deviceFilter?: (d: JDDevice) => boolean
    deviceSort?: (l: JDDevice, r: JDDevice) => number
}

export default function Dashboard(props: DashboardProps) {
    const {
        hideSimulators,
        showConnect,
        showStartSimulators,
        showStartRoleSimulators,
        showHeader,
        showAvatar,
        showSimulatorHeader,
        showSimulatorAvatar,
        showDeviceHeader,
        showDeviceAvatar,
        showDeviceScript,
        deviceSort = defaultDeviceSort,
        deviceFilter = defaultDeviceFilter,
        ...other
    } = props
    const { source: jacscriptSource } = useDeviceScript()
    const bus = useBusWithMode({ autoConnect: true })
    const { isHostedSimulator, clearHostedSimulators } = useHostedSimulators()
    const devices = useDevices({
        announced: true,
        ignoreInfrastructure: !Flags.diagnostics,
    })
        .filter(deviceFilter)
        .sort(deviceSort)
    const [simulators, physicals] = splitFilter(
        devices,
        d =>
            !!bus.findServiceProvider(d.deviceId) ||
            isHostedSimulator(d.deviceId)
    )
    const handleClearSimulators = () => {
        clearHostedSimulators()
        bus.clearServiceProviders()
    }

    return (
        <>
            {showDeviceScript && jacscriptSource !== undefined && (
                <Suspense>
                    <DeviceScriptToolbar />
                </Suspense>
            )}
            {!hideSimulators && (
                <DashboardDeviceGroup
                    title="Simulators"
                    action={
                        <>
                            {showStartRoleSimulators && (
                                <StartMissingSimulatorsButton trackName="dashboard.simulators.missing" />
                            )}
                            <StartSimulatorButton trackName="dashboard.simulators.start" />
                            <IconButtonWithTooltip
                                trackName="dashboard.simulators.clear"
                                title="clear simulators"
                                onClick={handleClearSimulators}
                            >
                                <ClearIcon />
                            </IconButtonWithTooltip>{" "}
                        </>
                    }
                    devices={simulators}
                    showHeader={showHeader || showSimulatorHeader}
                    showAvatar={showAvatar || showSimulatorAvatar}
                    {...other}
                >
                    {showStartSimulators && !simulators?.length && (
                        <Grid item xs={12}>
                            <SimulateDeviceAlert />
                        </Grid>
                    )}
                </DashboardDeviceGroup>
            )}
            <DashboardDeviceGroup
                title="Devices"
                action={
                    showConnect && (
                        <ConnectButtons
                            full={"disconnected"}
                            transparent={true}
                        />
                    )
                }
                devices={physicals}
                showHeader={showHeader || showDeviceHeader}
                showAvatar={showAvatar || showDeviceAvatar}
                {...other}
            >
                {showConnect && !physicals.length && (
                    <Grid item xs={12}>
                        <ConnectAlert closeable={true} />
                    </Grid>
                )}
            </DashboardDeviceGroup>
        </>
    )
}
