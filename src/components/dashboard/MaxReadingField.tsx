import React, { ChangeEvent, useEffect, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { Grid, TextField } from "@material-ui/core"
import useRegister from "../hooks/useRegister"
import { useId } from "react-use-id-hook"
import CmdButton from "../CmdButton"
import SaveIcon from "@material-ui/icons/Save"
import { prettyUnit } from "../../../jacdac-ts/src/jdom/pretty"
import { humanify } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"

export default function MaxReadingField(
    props: { registerCode: number } & DashboardServiceProps
) {
    const { service, registerCode } = props
    const inputId = useId()
    const maxForceRegister = useRegister(service, registerCode)
    const spec = maxForceRegister?.specification
    const [maxForce] = useRegisterUnpackedValue<[number]>(
        maxForceRegister,
        props
    )
    const [text, setText] = useState<string>((maxForce || "") + "")
    const value = parseInt(text)
    const handleClick = async () => {
        if (!isNaN(value)) maxForceRegister.sendSetPackedAsync([value], true)
    }
    const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
        setText(event.target.value)
    const label = humanify(spec.name || "??")
    const disabled = !maxForceRegister
    const helperText = prettyUnit(spec.fields[0]?.unit) || ""

    useEffect(() => setText((maxForce || "") + ""), [maxForce])

    if (maxForce === undefined) return null

    return (
        <Grid item xs={12}>
            <Grid container spacing={1} direction="row">
                <Grid item>
                    <TextField
                        id={inputId}
                        spellCheck={false}
                        value={text}
                        label={label}
                        inputProps={{
                            "aria-label": label,
                            "aria-readonly": disabled,
                            readOnly: disabled,
                        }}
                        helperText={helperText}
                        onChange={handleChange}
                        type={"number"}
                    />
                </Grid>
                <Grid item>
                    <CmdButton
                        onClick={handleClick}
                        disabled={isNaN(value)}
                        icon={<SaveIcon />}
                    />
                </Grid>
            </Grid>
        </Grid>
    )
}
