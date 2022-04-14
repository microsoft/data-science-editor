import React from "react"
// tslint:disable-next-line: no-submodule-imports
import { Typography } from "@mui/material"
import { GithubRepository } from "../github"
import { Link } from "gatsby-theme-material-ui"

export default function MakeCodeGithubFolderLink(props: {
    folder: string
    repo: GithubRepository
}) {
    const { folder, repo } = props
    const branch = repo.default_branch
    return (
        <Link href={`${repo.html_url}/tree/${branch}/${folder}`} target="blank">
            <Typography component="span" variant="h5">
                {`${repo.name}/ ${folder}`}
            </Typography>
        </Link>
    )
}
