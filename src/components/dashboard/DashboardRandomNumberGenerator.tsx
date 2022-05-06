import React, { useId } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { Grid, TextField } from "@mui/material"
import { toHex } from "../../../jacdac-ts/src/jdom/utils"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { RngReg } from "../../../jacdac-ts/src/jdom/constants"
import useRegister from "../hooks/useRegister"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"

export default function DashboardRandomNumberGenerator(
    props: DashboardServiceProps
) {
    const { service } = props
    const randomRegister = useRegister(service, RngReg.Random)
    const [rnd] = useRegisterUnpackedValue<[Uint8Array]>(randomRegister, props)
    const textId = useId()

    if (!rnd)
        return <DashboardRegisterValueFallback register={randomRegister} />

    return (
        <TextField
            id={textId}
            fullWidth={true}
            variant={"outlined"}
            helperText={"generated random number"}
            value={toHex(rnd?.slice(0, 8))}
        />
    )
}
