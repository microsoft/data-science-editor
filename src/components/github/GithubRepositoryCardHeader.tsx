import React from "react"
// tslint:disable-next-line: no-submodule-imports
import { Box, CardHeader, Typography } from "@mui/material"
import {
    normalizeSlug,
    useLatestFirmwareRelease,
    useRepository,
} from "../github"
import GitHubIcon from "@mui/icons-material/GitHub"
import { Link } from "gatsby-theme-material-ui"
import LoadingProgress from "../ui/LoadingProgress"
import MakeCodeGithubFolderLink from "../makecode/MakeCodeGithubFolderLink"
import MakeCodeOpenSnippetButton from "../makecode/MakeCodeOpenSnippetButton"

export default function GithubRepositoryCardHeader(props: {
    slug: string
    showRelease?: boolean
    showMakeCodeButton?: boolean
}) {
    const { slug, showRelease, showMakeCodeButton } = props
    const { repoPath, folder } = normalizeSlug(slug)
    const {
        response: repo,
        loading: repoLoading,
        status,
    } = useRepository(repoPath)
    const { response: release } = useLatestFirmwareRelease(
        (showRelease || showMakeCodeButton) && slug
    )
    const title = repo ? (
        <>
            <Typography component="span" variant="h6">
                {repo.organization?.login || repo.owner?.login}
            </Typography>
            <Box component="span" ml={0.5} mr={0.5}>
                /
            </Box>
            {folder ? (
                <MakeCodeGithubFolderLink folder={folder} repo={repo} />
            ) : (
                <Link href={repo.html_url} target="_blank" underline="hover">
                    <Typography component="span" variant="h5">
                        {repo.name}
                    </Typography>
                </Link>
            )}
        </>
    ) : (
        <>
            <Link
                href={`https://github.com/${repoPath}`}
                target="_blank"
                underline="hover"
            >
                <Typography component="span" variant="h6">
                    {slug}
                </Typography>
            </Link>
            {repoLoading && <LoadingProgress />}
            {status === 403 && (
                <Typography component="p" variant="caption">
                    Github query throttled, please wait.
                </Typography>
            )}
            {status !== 403 && !repoLoading && !repo && (
                <Typography component="p" variant="caption">
                    Unable to find repository (status {status}).
                </Typography>
            )}
        </>
    )

    return (
        <CardHeader
            title={title}
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
            avatar={<GitHubIcon />}
            actions={
                <>
                    {showMakeCodeButton && release && (
                        <MakeCodeOpenSnippetButton
                            code=""
                            options={{
                                package: `github:${repoPath}#${release.version}`,
                            }}
                        />
                    )}
                </>
            }
        />
    )
}
