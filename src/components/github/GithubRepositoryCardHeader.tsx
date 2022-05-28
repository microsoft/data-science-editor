import React from "react"
// tslint:disable-next-line: no-submodule-imports
import { CardHeader } from "@mui/material"
import { normalizeSlug, useLatestFirmwareRelease } from "../github"
import GitHubIcon from "@mui/icons-material/GitHub"
import { Link } from "gatsby-theme-material-ui"
import MakeCodeOpenSnippetButton from "../makecode/MakeCodeOpenSnippetButton"
import MakeCodeGithubImportLink from "../makecode/MakeCodeGithubImportLink"

export default function GithubRepositoryCardHeader(props: {
    slug: string
    showRelease?: boolean
    showMakeCodeButton?: boolean
    showMakeCodeImportButton?: boolean
}) {
    const { slug, showRelease, showMakeCodeButton, showMakeCodeImportButton } =
        props
    const { repoPath, name: repoName } = normalizeSlug(slug)
    const { response: release } = useLatestFirmwareRelease(showRelease && slug)

    return (
        <CardHeader
            title={
                showMakeCodeImportButton ? (
                    <MakeCodeGithubImportLink slug={slug} />
                ) : (
                    <>{slug}</>
                )
            }
            subheader={
                showRelease &&
                release && (
                    <Link
                        color="textSecondary"
                        target="_blank"
                        to={release.html_url}
                    >
                        {release.version}
                    </Link>
                )
            }
            avatar={
                <Link
                    target="_blank"
                    underline="hover"
                    title="Open repository in github.com"
                    href={`https://github.com/${repoPath}`}
                >
                    <GitHubIcon />
                </Link>
            }
            action={
                showMakeCodeButton && (
                    <MakeCodeOpenSnippetButton
                        name={`${repoName} with jacdac`}
                        slug={slug}
                    />
                )
            }
        />
    )
}
