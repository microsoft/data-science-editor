import { Grid } from "@mui/material"
import React, { useContext } from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { isReading, isValueOrIntensity } from "../../../jacdac-ts/src/jdom/spec"
import { splitFilter, strcmp } from "../../../jacdac-ts/src/jdom/utils"
import useDevices from "../hooks/useDevices"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import DashboardDeviceGroup from "./DashboardDeviceGroup"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ClearIcon from "@mui/icons-material/Clear"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DevicesIcon from "@mui/icons-material/Devices"
import ConnectAlert from "../alert/ConnectAlert"
import ConnectButtons from "../buttons/ConnectButtons"
import useRoleManagerClient from "../services/useRoleManagerClient"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import SimulateDeviceAlert from "../alert/SimulateDeviceAlert"
import MakeCodeAddBlocksButton from "../makecode/MakeCodeAddBlocksButton"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"
import HostedSimulatorsContext from "../HostedSimulatorsContext"
import useBus from "../../jacdac/useBus"
import StartSimulatorButton from "../buttons/StartSimulatorButton"
import { defaultDeviceFilter, defaultDeviceSort } from "./filters"

export interface DashboardDeviceProps {
    showHeader?: boolean
    showAvatar?: boolean
    showReset?: boolean
    serviceFilter?: (srv: JDService) => boolean
}

export interface DashboardProps extends DashboardDeviceProps {
    hideSimulators?: boolean
    showStartSimulators?: boolean
    showStartRoleSimulators?: boolean
    showConnect?: boolean
    deviceFilter?: (d: JDDevice) => boolean
    deviceSort?: (l: JDDevice, r: JDDevice) => number
}

export default function Dashboard(props: DashboardProps) {
    const {
        hideSimulators,
        showConnect,
        showStartSimulators,
        showStartRoleSimulators,
        deviceSort = defaultDeviceSort,
        deviceFilter = defaultDeviceFilter,
        ...other
    } = props
    const bus = useBus()
    const { isHostedSimulator, clearHostedSimulators } = useContext(
        HostedSimulatorsContext
    )
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
    const roleManager = useRoleManagerClient()
    const handleClearSimulators = () => {
        clearHostedSimulators()
        bus.clearServiceProviders()
    }
    const handleStartSimulators = () => roleManager?.startSimulators()

    return (
        <>
            <MakeCodeAddBlocksButton />
            {!hideSimulators && (
                <DashboardDeviceGroup
                    title="Simulators"
                    action={
                        <>
                            {showStartRoleSimulators && (
                                <IconButtonWithTooltip
                                    trackName="dashboard.simulators.missing"
                                    title="start missing simulators for roles"
                                    onClick={handleStartSimulators}
                                    disabled={!roleManager}
                                >
                                    <DevicesIcon />
                                </IconButtonWithTooltip>
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
