import React from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { Grid, TextField } from "@material-ui/core"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import RefreshIcon from "@material-ui/icons/Refresh"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import { toHex } from "../../../jacdac-ts/src/jdom/utils"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { RngReg } from "../../../jacdac-ts/src/jdom/constants"
import { useId } from "react-use-id-hook"
import LoadingProgress from "../ui/LoadingProgress"

export default function DashboardRandomNumberGenerator(
    props: DashboardServiceProps
) {
    const { service } = props
    const randomRegister = service.register(RngReg.Random)
    const [rnd] = useRegisterUnpackedValue<[Uint8Array]>(randomRegister)
    const textId = useId()

    const handleRefresh = () => randomRegister.refresh()

    if (!rnd)
        return <LoadingProgress />

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
