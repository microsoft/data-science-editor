import { createStyles, makeStyles, Typography } from "@material-ui/core"
import React from "react"

const useStyles = makeStyles(theme =>
    createStyles({
        footer: {
            textAlign: "center",
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
    const repo = process.env.GATSBY_GITHUB_REPOSITORY
    const sha = process.env.GATSBY_GITHUB_SHA

    return (
        <footer role="contentinfo" className={classes.footer}>
            <a
                href="https://github.com/microsoft/jacdac/discussions"
                target="_blank"
                rel="noopener noreferrer"
            >
                Contact Us
            </a>

            <a
                href="https://go.microsoft.com/fwlink/?LinkId=521839"
                target="_blank"
                rel="noopener noreferrer"
            >
                Privacy &amp; Cookies
            </a>|
            <a
                href="https://www.microsoft.com/en-us/legal/intellectualproperty/copyright"
                target="_blank"
                rel="noopener noreferrer"
            >
                Terms Of Use
            </a>|
            <a
                href="https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general"
                target="_blank"
                rel="noopener noreferrer"
            >
                Trademarks
            </a>|
            {repo && sha && (
                <a
                    href={`https://github.com/${repo}/commit/${sha}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {sha.slice(0, 8)}
                </a>
            )}
            <Typography component="span" variant="inherit">
                © {new Date().getFullYear()} Microsoft Corporation
            </Typography>
        </footer>
    )
}
