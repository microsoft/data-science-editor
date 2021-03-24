import React from "react"
import {
    Box,
    Button,
    createMuiTheme,
    responsiveFontSizes,
} from "@material-ui/core"
import ThemedLayout from "../../components/ui/ThemedLayout"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { isReading, isValueOrIntensity } from "../../../jacdac-ts/src/jdom/spec"
import {
    arrayConcatMany,
    strcmp,
    unique,
} from "../../../jacdac-ts/src/jdom/utils"
import {
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_POWER,
    SRV_PROTO_TEST,
    SRV_ROLE_MANAGER,
    SRV_SETTINGS,
} from "../../../jacdac-ts/src/jdom/constants"
import MakeCodeIcon from "../icons/MakeCodeIcon"
import Helmet from "react-helmet"
import { resolveMakecodeServiceFromClassIdentifier } from "../../../jacdac-ts/src/jdom/makecode"
import Dashboard from "../../components/dashboard/Dashboard"
import useDevices from "../hooks/useDevices"
import useRoleManager from "../services/useRoleManager"

function deviceSort(l: JDDevice, r: JDDevice): number {
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

// hide the makecode device itself and power devices
const ignoredServices = [
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_SETTINGS,
    SRV_ROLE_MANAGER,
    SRV_POWER,
    SRV_PROTO_TEST
]
const deviceFilter = (device: JDDevice) =>
    !!device.serviceClasses.filter(sc => ignoredServices.indexOf(sc) < 0).length

function Carousel() {
    const devices = useDevices({ announced: true, ignoreSelf: true }).filter(
        deviceFilter
    )
    const roleManager = useRoleManager()
    const extensions = unique(
        arrayConcatMany(
            devices.map(device =>
                device
                    .services()
                    .map(srv =>
                        resolveMakecodeServiceFromClassIdentifier(
                            srv.serviceClass
                        )
                    )
                    .map(info => info?.client.repo)
                    .filter(q => !!q)
            )
        )
    )
    const handleAdd = () => {
        // list all devices connected to the bus
        // and query for them, let makecode show the missing ones
        // send message to makecode
        window.parent.postMessage(
            {
                type: "addextensions",
                extensions,
                broadcast: true,
            },
            "*"
        )
    }

    return (
        <>
            <Dashboard
                showHeader={false}
                deviceSort={deviceSort}
                deviceFilter={deviceFilter}
                showStartSimulators={!!roleManager}
            />
            {!!extensions?.length && (
                <Box m={1}>
                    <Button
                        size="medium"
                        color="primary"
                        variant="contained"
                        startIcon={<MakeCodeIcon />}
                        onClick={handleAdd}
                        aria-label={"Add blocks"}
                    >
                        Add blocks
                    </Button>
                </Box>
            )}
        </>
    )
}

export default function Page() {
    const rawTheme = createMuiTheme({
        palette: {
            primary: {
                main: "#63c",
            },
            secondary: {
                main: "#ffc400",
            },
            contrastThreshold: 5.1,
        },
    })
    const theme = responsiveFontSizes(rawTheme)

    return (
        <ThemedLayout theme={theme}>
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
    )
}
