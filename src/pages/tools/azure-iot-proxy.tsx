import React, { useContext } from "react"
import useClient from "../../components/hooks/useClient"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import DTDLProxy from "../../../jacdac-ts/src/azure-iot/dtdlproxy"
import useChange from "../../jacdac/useChange"
import { DTDLSnippet } from "../../components/azure/DTDLSnippet"
import { DTMIToRoute } from "../../../jacdac-ts/src/azure-iot/dtdlspec"
import useFetch from "../../components/useFetch"
import { DTDLInterface } from "../../../jacdac-ts/src/azure-iot/dtdl"
import Alert from "../../components/ui/Alert"
import { Link } from "gatsby-theme-material-ui"
import { Grid } from "@material-ui/core"

export default function Page() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const proxy = useClient(() => new DTDLProxy(bus))
    const dtdl = useChange(proxy, _ => _?.dtdl)
    const route = dtdl && DTMIToRoute(dtdl["@id"])
    const dtdlFetch = useFetch<DTDLInterface | DTDLInterface[]>(route)

    return (
        <>
            <h1>Azure IoT Proxy</h1>
            <h2>DTDL</h2>
            <Grid container spacing={1}>
                <Grid item xs={6}>
                    <h3>Generated</h3>
                    <DTDLSnippet node={dtdl} name={`proxy-generated`} />
                </Grid>
                <Grid item xs={6}>
                    <h3>
                        DTDL (from{" "}
                        <Link target="_blank" href={route}>
                            cloud
                        </Link>
                        )
                    </h3>
                    <DTDLSnippet
                        node={dtdlFetch?.response}
                        name={`proxy-cloud`}
                    />
                    {dtdlFetch?.error && (
                        <Alert severity="error">{dtdlFetch.error}</Alert>
                    )}
                </Grid>
            </Grid>
        </>
    )
}
