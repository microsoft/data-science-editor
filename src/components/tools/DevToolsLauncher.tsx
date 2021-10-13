import React, { ChangeEvent, useState } from "react"
import { Grid, TextField } from "@material-ui/core"
import { Button } from "gatsby-theme-material-ui"
import SendIcon from "@material-ui/icons/Send"

export default function DevToolsLauncher() {
    const [text, setText] = useState("")

    const url = `https://microsoft.github.io/jacdac-docs/clients/javascript/devtools#${
        text || ""
    }`
    const handleChange = (ev: ChangeEvent<HTMLInputElement>) =>
        setText(ev.target.value)

    return (
        <Grid container spacing={1}>
            <Grid item xs>
                <TextField
                    type="url"
                    label="URL"
                    fullWidth={true}
                    helperText="Enter the URL to your web page using Jacdac"
                    value={text}
                    onChange={handleChange}
                />
            </Grid>
            <Grid item>
                <Button variant="outlined" href={url} startIcon={<SendIcon />}>
                    Open
                </Button>
            </Grid>
        </Grid>
    )
}
