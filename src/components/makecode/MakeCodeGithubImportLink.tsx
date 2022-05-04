import React from "react"
// tslint:disable-next-line: no-submodule-imports
import { Typography } from "@mui/material"
import { Link } from "gatsby-theme-material-ui"

export default function MakeCodeGithubImportLink(props: { slug: string }) {
    const { slug } = props
    const importUrl = `https://makecode.microbit.org/beta#pub:github:${slug}`

    return (
        <Link href={importUrl} target="blank">
            <Typography component="span" variant="h5">
                {slug}
            </Typography>
        </Link>
    )
}
