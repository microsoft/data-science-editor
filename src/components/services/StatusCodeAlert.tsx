import React from "react"
import { Alert, Typography } from "@mui/material"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { RegisterOptions } from "../../jacdac/useRegisterValue"
import useStatusCode from "./useStatusCode"
import { SystemStatusCodes } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { humanify } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"

export default function StatusCodeAlert(
    props: {
        service: JDService
    } & RegisterOptions
) {
    const { service, ...rest } = props
    const { code, vendorCode } = useStatusCode(service, rest)
    if (code === 0 && vendorCode === 0) return null

    return <Alert severity="warning">
        {!!code && <Typography variant="caption">
            {humanify(SystemStatusCodes[code] || "?")}
        </Typography> }
        {!!vendorCode && <Typography variant="caption">
            vendor error: 0x{vendorCode.toString(16)}
        </Typography> }
    </Alert>
}
