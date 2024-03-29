import { Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import React from "react"
import { UIFlags } from "../uiflags"
import clsx from "clsx"

const PREFIX = "Footer"

const classes = {
    footer: `${PREFIX}footer`,
    absolute: `${PREFIX}absolute`,
}

const Root = styled("footer")(({ theme }) => ({
    [`&.${classes.footer}`]: {
        textAlign: "center",
        "z-index": 1000,
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
            color: theme.palette.text.primary,
        },
        "& a": {
            marginRight: theme.spacing(0.5),
        },
    },
    [`&.${classes.absolute}`]: {
        position: "absolute",
        bottom: UIFlags.hosted ? "0.8rem" : "2rem",
        left: "9.5rem",
    },
}))

export default function Footer(props: { container?: boolean }) {
    const { container } = props
    const repo = process.env.GATSBY_GITHUB_REPOSITORY
    const sha = process.env.GATSBY_GITHUB_SHA

    return (
        <Root
            role="contentinfo"
            className={clsx(classes.footer, !container && classes.absolute)}
        >
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
            &nbsp;
            <Typography component="span" variant="inherit">
                © {new Date().getFullYear()} Microsoft Corporation
            </Typography>
        </Root>
    )
}
