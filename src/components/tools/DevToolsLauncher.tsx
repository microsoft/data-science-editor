import React, { ChangeEvent, useState } from "react"
import { Grid, TextField } from "@mui/material"
import { Button } from "gatsby-theme-material-ui"
import SendIcon from "@mui/icons-material/Send"
import useBus from "../../jacdac/useBus"
import { injectDevTools } from "../../../jacdac-ts/src/jdom/devtools"
import { withPrefix } from "gatsby"

export default function DevToolsLauncher() {
    const [text, setText] = useState("")
    const bus = useBus()

    const url = `https://microsoft.github.io/jacdac-docs/clients/javascript/devtools#${
        text || ""
    }`
    const handleChange = (ev: ChangeEvent<HTMLInputElement>) =>
        setText(ev.target.value)
    const handleClick = () => window.open(url, "_blank")
    const handleEmbed = () =>
        injectDevTools(bus, {
            dashboardUrl: withPrefix("/dashboard/"),
        })

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
                <Button
                    variant="outlined"
                    onClick={handleClick}
                    startIcon={<SendIcon />}
                >
                    Open
                </Button>
            </Grid>
            <Grid item xs={12}>
                <Button
                    variant="outlined"
                    onClick={handleEmbed}
                    startIcon={<SendIcon />}
                >
                    Open Embedded
                </Button>
            </Grid>
        </Grid>
    )
}
