import React, { useContext } from "react"
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
    strcmp,
} from "../../../jacdac-ts/src/jdom/utils"
import MakeCodeIcon from "../icons/MakeCodeIcon"
import Helmet from "react-helmet"
import Dashboard from "../../components/dashboard/Dashboard"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"

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

function Carousel() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { iframeBridge } = bus;
    const { deviceFilter } = iframeBridge;
    const extensions = useChange(iframeBridge, _ => _?.candidateExtensions)
    const handleAdd = () => iframeBridge?.postAddExtensions();

    return (
        <>
            <Dashboard
                showHeader={false}
                deviceSort={deviceSort}
                deviceFilter={deviceFilter}
                showStartSimulators={false}
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
}
html, body {
    background: transparent !important;
    overflow: hidden !important;
}
`}
                </style>
            </Helmet>
            <Carousel />
        </ThemedLayout>
    )
}
