import React, { ChangeEvent, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { CodalMessageBusCmd } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { useId } from "react-use-id-hook"
import { Grid, TextField } from "@material-ui/core"
import SendIcon from "@material-ui/icons/Send"
import CmdButton from "../CmdButton"

export default function DashboardCODALMessageBus(props: DashboardServiceProps) {
    const { service } = props
    const sourceId = useId()
    const valueId = useId()
    const [source, setSource] = useState("")
    const [value, setValue] = useState("")

    const nsource = parseInt(source)
    const nvalue = parseInt(value)

    const disabled = isNaN(nsource) || isNaN(nvalue)

    const handleSourceChange = (ev: ChangeEvent<HTMLInputElement>) =>
        setSource(ev.target.value.trim())
    const handleValueChange = (ev: ChangeEvent<HTMLInputElement>) =>
        setValue(ev.target.value.trim())
    const handleSend = async () =>
        await service.sendCmdPackedAsync(
            CodalMessageBusCmd.Send,
            [nsource, nvalue],
            true
        )

    return (
        <Grid container spacing={1} direction="row">
            <Grid item xs={12} md={5}>
                <TextField
                    type="number"
                    id={sourceId}
                    label="Source"
                    value={source}
                    onChange={handleSourceChange}
                    error={!!source && isNaN(nsource)}
                    helperText={
                        isNaN(nsource)
                            ? "source must be an unsigned number"
                            : "source of the message"
                    }
                />
            </Grid>
            <Grid item xs={12} md={5}>
                <TextField
                    type="number"
                    id={valueId}
                    label="Value"
                    value={value}
                    onChange={handleValueChange}
                    error={!!value && isNaN(nvalue)}
                    helperText={
                        isNaN(nvalue)
                            ? "value must be an unsigned number"
                            : "value of the message"
                    }
                />
            </Grid>
            <Grid item>
                <CmdButton
                    title="send message"
                    disabled={disabled}
                    onClick={handleSend}
                >
                    <SendIcon />
                </CmdButton>
            </Grid>
        </Grid>
    )
}
