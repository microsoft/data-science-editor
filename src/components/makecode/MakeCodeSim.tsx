import React, { useContext, useEffect } from "react"
import { Button, createMuiTheme, responsiveFontSizes } from "@material-ui/core";
import ThemedLayout from "../../components/ui/ThemedLayout";
import { Grid } from "@material-ui/core";
import { JDDevice } from "../../../jacdac-ts/src/jdom/device";
import { isReading, isValueOrIntensity } from "../../../jacdac-ts/src/jdom/spec";
import { arrayConcatMany, strcmp, unique } from "../../../jacdac-ts/src/jdom/utils";
import useDevices from "../hooks/useDevices";
import { SRV_CONTROL, SRV_LOGGER, SRV_POWER, SRV_ROLE_MANAGER, SRV_SETTINGS } from "../../../jacdac-ts/src/jdom/constants";
import MakeCodeIcon from "../icons/MakeCodeIcon"
import DashboardDeviceItem from "../dashboard/DashboardDeviceItem";
import Helmet from "react-helmet"
import DarkModeContext from "../ui/DarkModeContext";
import KindIcon from "../KindIcon";
import AppContext from "../AppContext";
import { VIRTUAL_DEVICE_NODE_NAME } from "../../../jacdac-ts/src/jdom/constants";
import { resolveMakecodeServiceFromClassIdentifier } from "../../../jacdac-ts/src/jdom/makecode";

function deviceSort(l: JDDevice, r: JDDevice): number {
    const srvScore = (srv: jdspec.ServiceSpec) => srv.packets
        .reduce((prev, pkt) => prev + (isReading(pkt) ? 10 : isValueOrIntensity(pkt) ? 1 : 0), 0) || 0;
    const score = (srvs: jdspec.ServiceSpec[]) => srvs.reduce((prev, srv) => srvScore(srv), 0)

    const ls = score(l.services().slice(1).map(srv => srv.specification).filter(spec => !!spec))
    const rs = score(r.services().slice(1).map(srv => srv.specification).filter(spec => !!spec))
    if (ls !== rs)
        return -ls + rs;
    return strcmp(l.deviceId, r.deviceId);
}

// hide the makecode device itself and power devices
const ignoredServices = [
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_SETTINGS,
    SRV_ROLE_MANAGER,
    SRV_POWER
]

function Carousel() {
    const { toggleShowDeviceHostsDialog } = useContext(AppContext)
    const devices = useDevices({ announced: true, ignoreSelf: true })
        // ignore MakeCode device (role manager) and power devices
        .filter(device => device.serviceClasses.filter(sc => ignoredServices.indexOf(sc) < 0).length)
        // show best in front
        .sort(deviceSort);
    const handleAdd = () => {
        // list all devices connected to the bus
        // and query for them, let makecode show the missing ones
        const extensions = unique(
            arrayConcatMany(
                devices.map(device => device.services()
                    .map(srv => resolveMakecodeServiceFromClassIdentifier(srv.serviceClass))
                    .map(info => info?.client.repo)
                    .filter(q => !!q)
                )
            )
        );
        if (extensions?.length) {
            // send message to makecode
            window.parent.postMessage({
                type: "addextensions",
                extensions,
                broadcast: true
            }, "*")
        }
    }

    return <Grid container alignItems="flex-start" spacing={1}>
        {devices.map(device => <DashboardDeviceItem key={device.id}
            device={device} showAvatar={true} showHeader={true} />)}
        <Grid item>
            <Grid container spacing={1} direction="row">
                <Grid item>
                    <Button size="medium" variant="contained" startIcon={<KindIcon kind={VIRTUAL_DEVICE_NODE_NAME} />}
                        onClick={toggleShowDeviceHostsDialog} aria-label={"Start Simulator"}>Start simulator</Button>
                </Grid>
                {!!devices?.length && <Grid item>
                    <Button size="medium" color="primary" variant="contained" startIcon={<MakeCodeIcon />}
                        onClick={handleAdd} aria-label={"Add blocks"}>Add blocks</Button>
                </Grid>}
            </Grid>
        </Grid>
    </Grid>
}

export default function Page() {
    const { toggleDarkMode } = useContext(DarkModeContext);
    const rawTheme = createMuiTheme({
        palette: {
            primary: {
                main: '#63c',
            },
            secondary: {
                main: '#ffc400',
            },
            contrastThreshold: 5.1,
            type: "dark"
        },
    })
    const theme = responsiveFontSizes(rawTheme);

    useEffect(() => toggleDarkMode('dark'), []); // always dark mode

    return <ThemedLayout theme={theme}>
        <Helmet>
            <style>
                {`
html {
    margin-right: 4px;
    overflow-y: auto !important;
}
html, body {
    background: transparent !important;
}
`}
            </style>
        </Helmet>
        <Carousel />
    </ThemedLayout>
}
