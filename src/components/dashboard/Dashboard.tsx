import { Grid } from "@material-ui/core"
import React, { useContext } from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useSelectedNodes from "../../jacdac/useSelectedNodes"
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
import ConnectButtons from "../../jacdac/ConnectButtons"
import useRoleManager from "../services/useRoleManager"
import useMediaQueries from "../hooks/useMediaQueries"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { Alert } from "@material-ui/lab"
import { Button, IconButton } from "gatsby-theme-material-ui"
import {
    addServiceProvider,
    serviceProviderDefinitionFromServiceClass,
} from "../../../jacdac-ts/src/servers/servers"
import {
    SRV_BUTTON,
    SRV_LED,
    SRV_POTENTIOMETER,
    SRV_SERVO,
    SRV_TRAFFIC_LIGHT,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"

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
    showStartSimulators?: boolean
    showConnect?: boolean
    deviceFilter?: (d: JDDevice) => boolean
    deviceSort?: (l: JDDevice, r: JDDevice) => number
}

export default function Dashboard(props: DashboardProps) {
    const {
        showConnect,
        showStartSimulators,
        deviceSort = defaultDeviceSort,
        deviceFilter = defaultDeviceFilter,
        ...other
    } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { toggleShowDeviceHostsDialog } = useContext(AppContext)
    const devices = useDevices({ announced: true, ignoreSelf: true })
        .filter(deviceFilter)
        .sort(deviceSort)
    const { mobile } = useMediaQueries()
    const { selected, toggleSelected } = useSelectedNodes(mobile)
    const [simulators, physicals] = splitFilter(
        devices,
        d => !!bus.findServiceProvider(d.deviceId)
    )
    const roleManager = useRoleManager()
    const handleClearSimulators = () => {
        bus.serviceProviders().forEach(dev => bus.removeServiceProvider(dev))
    }
    const handleStartSimulators = () => roleManager?.startSimulators()
    const handleStartSimulator = (serviceClass: number) => () => {
        const provider = serviceProviderDefinitionFromServiceClass(serviceClass)
        addServiceProvider(bus, provider)
    }

    return (
        <>
            <DashboardDeviceGroup
                title="Simulators"
                action={
                    <>
                        {showStartSimulators && !!roleManager && (
                            <IconButtonWithTooltip
                                title="start missing simulators"
                                onClick={handleStartSimulators}
                            >
                                <DevicesIcon />
                            </IconButtonWithTooltip>
                        )}
                        <IconButtonWithTooltip
                            title="start simulator"
                            onClick={toggleShowDeviceHostsDialog}
                        >
                            <AddIcon />
                        </IconButtonWithTooltip>
                        <IconButtonWithTooltip
                            title="clear simulators"
                            onClick={handleClearSimulators}
                        >
                            <ClearIcon />
                        </IconButtonWithTooltip>{" "}
                    </>
                }
                devices={simulators}
                expanded={selected}
                toggleExpanded={toggleSelected}
                {...other}
            >
                {showStartSimulators && !simulators?.length && (
                    <Alert severity="info">
                        Simulate a{" "}
                        <IconButton
                            onClick={handleStartSimulator(SRV_BUTTON)}
                            title="button"
                            aria-label="start button simulator"
                        >
                            🔘
                        </IconButton>
                        , or a
                        <IconButton
                            onClick={handleStartSimulator(SRV_POTENTIOMETER)}
                            title="slider"
                            aria-label="start slider simulator"
                        >
                            🎚️
                        </IconButton>
                        , or a
                        <IconButton
                            onClick={handleStartSimulator(SRV_LED)}
                            title="LED"
                            aria-label="start LED simulator"
                        >
                            💡
                        </IconButton>
                        , or a
                        <IconButton
                            onClick={handleStartSimulator(SRV_TRAFFIC_LIGHT)}
                            title="traffic light"
                            aria-label="start traffic light simulator"
                        >
                            🚦
                        </IconButton>
                        ... or many more by clicking &nbsp;
                        <IconButtonWithTooltip
                            title="start simulator"
                            onClick={toggleShowDeviceHostsDialog}
                        >
                            <AddIcon />
                        </IconButtonWithTooltip>
                        .
                    </Alert>
                )}
            </DashboardDeviceGroup>
            <DashboardDeviceGroup
                title="Devices"
                action={
                    showConnect && (
                        <ConnectButtons full={false} transparent={true} />
                    )
                }
                devices={physicals}
                expanded={selected}
                toggleExpanded={toggleSelected}
                {...other}
            >
                {showConnect && !physicals.length && (
                    <Grid item xs={12}>
                        <ConnectAlert />
                    </Grid>
                )}
            </DashboardDeviceGroup>
        </>
    )
}
