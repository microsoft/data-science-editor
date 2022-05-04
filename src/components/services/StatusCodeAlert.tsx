import React from "react"
import { Typography } from "@mui/material"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { RegisterOptions } from "../../jacdac/useRegisterValue"
import useStatusCode from "./useStatusCode"
import {
    SRV_WIFI,
    SystemStatusCodes,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { humanify } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import Alert from "../ui/Alert"

const codes: Record<number, Record<number, (srv: JDService) => string>> = {
    [SRV_WIFI]: {
        [SystemStatusCodes.WaitingForInput]: () =>
            "Waiting for WiFi credentials.",
    },
}
const severities: Record<number, "error" | "warning" | "info"> = {
    [SystemStatusCodes.Sleeping]: "info",
    [SystemStatusCodes.Initializing]: "info",
    [SystemStatusCodes.Calibrating]: "info",
}

export default function StatusCodeAlert(
    props: {
        service: JDService
    } & RegisterOptions
) {
    const { service, ...rest } = props
    const { serviceClass } = service
    const { code, vendorCode } = useStatusCode(service, rest)
    if (
        (code === SystemStatusCodes.Ready ||
            code === SystemStatusCodes.Sleeping ||
            code === SystemStatusCodes.Initializing) &&
        vendorCode === 0
    )
        return null
    const severity = severities[code] || "warning"
    return (
        <Alert severity={severity}>
            {!!code && (
                <Typography variant="caption">
                    {humanify(
                        codes[serviceClass]?.[code]?.(service) ||
                            SystemStatusCodes[code] ||
                            "?"
                    )}
                </Typography>
            )}
            {!!vendorCode && (
                <Typography variant="caption">
                    vendor error: 0x{vendorCode.toString(16)}
                </Typography>
            )}
        </Alert>
    )
}
