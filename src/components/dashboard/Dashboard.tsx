import { Grid } from "@mui/material"
import React from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { splitFilter } from "../../../jacdac-ts/src/jdom/utils"
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
import useBus from "../../jacdac/useBus"
import StartSimulatorButton from "../buttons/StartSimulatorButton"
import { defaultDeviceFilter, defaultDeviceSort } from "./filters"
import useHostedSimulators from "../HostedSimulatorsContext"

export interface DashboardDeviceProps {
    showHeader?: boolean
    showAvatar?: boolean
    showReset?: boolean
    showDeviceProxyAlert?: boolean
    serviceFilter?: (srv: JDService) => boolean
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
        deviceSort = defaultDeviceSort,
        deviceFilter = defaultDeviceFilter,
        ...other
    } = props
    const bus = useBus()
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
                                    title="start missing simulators"
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
