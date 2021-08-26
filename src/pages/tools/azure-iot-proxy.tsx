import React, { useContext } from "react"
import useClient from "../../components/hooks/useClient"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import DTDLProxy, {
    DTDL_DEVICE_MODELS_REPOSITORY,
} from "../../../jacdac-ts/src/azure-iot/dtdlproxy"
import useChange from "../../jacdac/useChange"
import { DTDLSnippet } from "../../components/azure/DTDLSnippet"
import { Grid } from "@material-ui/core"
import DTMISnippet from "../../components/azure/DTMISnippet"

export default function Page() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const proxy = useClient(() => new DTDLProxy(bus))
    const dtdl = useChange(proxy, _ => _?.dtdl)

    return (
        <>
            <h1>Azure IoT Proxy</h1>
            <h2>DTDL</h2>
            <Grid container spacing={1}>
                <Grid item xs={6}>
                    <h3>Generated</h3>
                    <DTDLSnippet node={dtdl} name={`proxy-generated`} />
                </Grid>
                {dtdl && (
                    <Grid item xs={6}>
                        <h3>{DTDL_DEVICE_MODELS_REPOSITORY}</h3>
                        <DTMISnippet dtmi={dtdl["@id"]} name={`proxy-cloud`} />
                    </Grid>
                )}
                {dtdl?.contents?.map(content => (
                    <Grid item xs={6} key={content["@id"]}>
                        <DTDLSnippet node={content} />
                    </Grid>
                ))}
            </Grid>
        </>
    )
}
