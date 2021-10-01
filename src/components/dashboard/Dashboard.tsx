import { Grid } from "@material-ui/core"
import React, { useContext } from "react"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import { isReading, isValueOrIntensity } from "../../../jacdac-ts/src/jdom/spec"
import { splitFilter, strcmp } from "../../../jacdac-ts/src/jdom/utils"
import useDevices from "../hooks/useDevices"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import AppContext from "../AppContext"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import DashboardDeviceGroup from "./DashboardDeviceGroup"
import AddIcon from "@material-ui/icons/Add"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ClearIcon from "@material-ui/icons/Clear"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DevicesIcon from "@material-ui/icons/Devices"
import ConnectAlert from "../alert/ConnectAlert"
import ConnectButtons from "../buttons/ConnectButtons"
import useRoleManagerClient from "../services/useRoleManagerClient"
import JDService from "../../../jacdac-ts/src/jdom/service"
import SimulateDeviceAlert from "../alert/SimulateDeviceAlert"
import MakeCodeAddBlocksButton from "../makecode/MakeCodeAddBlocksButton"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import HostedSimulatorsContext from "../HostedSimulatorsContext"

function defaultDeviceSort(l: JDDevice, r: JDDevice): number {
    const srvScore = (srv: jdspec.ServiceSpec) =>
        srv.packets.reduce(
            (prev, pkt) =>
                prev + (isReading(pkt) ? 10 : isValueOrIntensity(pkt) ? 1 : 0),
            0
        ) || 0
    const score = (srvs: jdspec.ServiceSpec[]) =>
        srvs.reduce((prev, srv) => srvScore(srv), 0)

    const ls = score(
        l
            .services()
            .slice(1)
            .map(srv => srv.specification)
            .filter(spec => !!spec)
    )
    const rs = score(
        r
            .services()
            .slice(1)
            .map(srv => srv.specification)
            .filter(spec => !!spec)
    )
    if (ls !== rs) return -ls + rs
    return strcmp(l.deviceId, r.deviceId)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function defaultDeviceFilter(d: JDDevice): boolean {
    return true
}

export interface DashboardDeviceProps {
    showHeader?: boolean
    showAvatar?: boolean
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
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { isHostedSimulator, clearHostedSimulators } = useContext(
        HostedSimulatorsContext
    )
    const { toggleShowDeviceHostsDialog } = useContext(AppContext)
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
        bus.serviceProviders().forEach(dev => bus.removeServiceProvider(dev))
    }
    const handleStartSimulators = () => roleManager?.startSimulators()

    return (
        <>
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
                            <IconButtonWithTooltip
                                trackName="dashboard.simulators.start"
                                title="start simulator"
                                onClick={toggleShowDeviceHostsDialog}
                            >
                                <AddIcon />
                            </IconButtonWithTooltip>
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
                        <ConnectButtons full={false} transparent={true} />
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
            <MakeCodeAddBlocksButton />
        </>
    )
}
