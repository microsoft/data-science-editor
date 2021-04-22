import { createStyles, makeStyles, Typography } from "@material-ui/core"
import React from "react"

const useStyles = makeStyles(theme =>
    createStyles({
        footer: {
            marginTop: theme.spacing(3),
            "& *": {
                fontSize: `${theme.typography.fontSize * 0.7}px`,
                textDecoration: "none",
                color: theme.palette.text.primary,
            },
            "& a:hover": {
                textDecoration: "underline",
            },
            "& a:visited": {
                color: theme.palette.text.hint,
            },
            "& a": {
                marginRight: theme.spacing(0.5),
            },
        },
    })
)

export default function Footer() {
    const classes = useStyles()
    const repo = process.env["GATSBY_GITHUB_REPOSITORY"]
    const sha = process.env["GATSBY_GITHUB_SHA"]

    console.log("footer", { repo, sha })

    return (
        <footer role="contentinfo" className={classes.footer}>
            <a
                href="https://privacy.microsoft.com/en-us/privacystatement"
                target="_blank"
                rel="noopener noreferrer"
            >
                Privacy
            </a>
            <a
                href="https://www.microsoft.com/en-us/legal/intellectualproperty/copyright"
                target="_blank"
                rel="noopener noreferrer"
            >
                Terms Of Use
            </a>
            <a
                href="https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general"
                target="_blank"
                rel="noopener noreferrer"
            >
                Trademarks
            </a>
            <Typography component="span" variant="inherit">
                © {new Date().getFullYear()} Microsoft Corporation
            </Typography>
            {repo && sha && (
                <a href={`https://github.com/${repo}/commit/${sha}`}>{sha}</a>
            )}
        </footer>
    )
}
