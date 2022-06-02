import React from "react"
import { AlertTitle } from "@mui/material"
import Alert from "../ui/Alert"
import { Link } from "gatsby-theme-material-ui"

export default function HelpAlert() {
    return (
        <Alert sx={{ mt: 2 }} severity="info">
            <AlertTitle>Need help?</AlertTitle>
            Start a{" "}
            <Link
                target="_blank"
                href="https://github.com/microsoft/jacdac/discussions"
            >
                Discussion
            </Link>{" "}
            on GitHub or send us an email at jacdac@microsoft.com.
        </Alert>
    )
}
