import React from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { Grid, TextField } from "@mui/material"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import RefreshIcon from "@mui/icons-material/Refresh"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import { toHex } from "../../../jacdac-ts/src/jdom/utils"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { RngReg } from "../../../jacdac-ts/src/jdom/constants"
import { useId } from "react-use-id-hook"
import useRegister from "../hooks/useRegister"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"

export default function DashboardRandomNumberGenerator(
    props: DashboardServiceProps
) {
    const { service } = props
    const randomRegister = useRegister(service, RngReg.Random)
    const [rnd] = useRegisterUnpackedValue<[Uint8Array]>(randomRegister, props)
    const textId = useId()

    const handleRefresh = () => randomRegister.refresh()

    if (!rnd)
        return <DashboardRegisterValueFallback register={randomRegister} />

    return (
        <Grid container spacing={2} direction="row">
            <Grid item xs>
                <TextField
                    id={textId}
                    fullWidth={true}
                    variant={"outlined"}
                    helperText={"generated random number"}
                    value={toHex(rnd?.slice(0, 8))}
                />
            </Grid>
            <Grid item>
                <IconButtonWithTooltip
                    title="generate new number"
                    onClick={handleRefresh}
                >
                    <RefreshIcon />
                </IconButtonWithTooltip>
            </Grid>
        </Grid>
    )
}
