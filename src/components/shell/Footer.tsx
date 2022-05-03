import { Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { Link } from "gatsby-theme-material-ui"
import React from "react"
import TraceSaveButton from "../trace/TraceSaveButton"

const PREFIX = "Footer"

const classes = {
    footer: `${PREFIX}footer`,
}

const Root = styled("footer")(({ theme }) => ({
    [`&.${classes.footer}`]: {
        textAlign: "center",
        "& *": {
            fontSize: `${theme.typography.fontSize * 0.8}px`,
            textDecoration: "none",
            color: theme.palette.text.primary,
        },
        "& .note": {
            fontSize: `${theme.typography.fontSize * 0.9}px`,
        },
        "& a:hover": {
            textDecoration: "underline",
        },
        "& a:visited": {
            color: theme.palette.grey[400],
        },
        "& a": {
            marginRight: theme.spacing(0.5),
        },
    },
}))

export default function Footer() {
    const repo = process.env.GATSBY_GITHUB_REPOSITORY
    const sha = process.env.GATSBY_GITHUB_SHA

    return (
        <Root role="contentinfo" className={classes.footer}>
            <div className="note">
                This web site collects anonymous usage analytics.{" "}
                <Link to="/privacy/">Learn more...</Link>
            </div>
            <a
                href="https://github.com/microsoft/jacdac/discussions"
                target="_blank"
                rel="noopener noreferrer"
            >
                Contact Us
            </a>
            |
            <a
                href="https://go.microsoft.com/fwlink/?LinkId=521839"
                target="_blank"
                rel="noopener noreferrer"
            >
                Privacy &amp; Cookies
            </a>
            |
            <a
                href="https://www.microsoft.com/en-us/legal/intellectualproperty/copyright"
                target="_blank"
                rel="noopener noreferrer"
            >
                Terms Of Use
            </a>
            |
            <a
                href="https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general"
                target="_blank"
                rel="noopener noreferrer"
            >
                Trademarks
            </a>
            {repo && sha && (
                <>
                    |
                    <a
                        href={`https://github.com/${repo}/commit/${sha}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {sha.slice(0, 8)}
                    </a>
                </>
            )}
            | <TraceSaveButton variant="link" />
            &nbsp;
            <Typography component="span" variant="inherit">
                © {new Date().getFullYear()} Microsoft Corporation
            </Typography>
        </Root>
    )
}
