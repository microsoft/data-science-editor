import React from "react"
import { DTDL_DEVICE_MODELS_REPOSITORY } from "../../../jacdac-ts/src/azure-iot/dtdlproxy"
import { DTDLSnippet } from "../../components/azure/DTDLSnippet"
import { DTMIToRoute } from "../../../jacdac-ts/src/azure-iot/dtdlspec"
import useFetch from "../../components/useFetch"
import { DTDLInterface } from "../../../jacdac-ts/src/azure-iot/dtdl"
import Alert from "../../components/ui/Alert"

export default function DTMISnippet(props: { dtmi: string; name?: string }) {
    const { dtmi, name } = props
    const route = dtmi && DTDL_DEVICE_MODELS_REPOSITORY + DTMIToRoute(dtmi)
    const dtdl = useFetch<DTDLInterface | DTDLInterface[]>(route)

    return (
        <>
            <DTDLSnippet node={dtdl.response} name={name} />
            {dtdl?.error && <Alert severity="error">{dtdl.error + ""}</Alert>}
        </>
    )
}
