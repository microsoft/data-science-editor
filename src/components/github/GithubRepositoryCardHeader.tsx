import React from "react"
// tslint:disable-next-line: no-submodule-imports
import { Box, CardHeader, Typography } from "@mui/material"
import {
    GithubRepository,
    normalizeSlug,
    useLatestFirmwareRelease,
    useRepository,
} from "../github"
import GitHubIcon from "@mui/icons-material/GitHub"
import { Link } from "gatsby-theme-material-ui"
import LoadingProgress from "../ui/LoadingProgress"

function MakeCodeFolderLink(props: { folder: string; repo: GithubRepository }) {
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

export default function GithubRepositoryCardHeader(props: {
    slug: string
    showRelease?: boolean
}) {
    const { slug, showRelease } = props
    const { repoPath, folder } = normalizeSlug(slug)
    const {
        response: repo,
        loading: repoLoading,
        status,
    } = useRepository(repoPath)
    const { response: release } = useLatestFirmwareRelease(showRelease && slug)
    const title = repo ? (
        <>
            <Typography component="span" variant="h6">
                {repo.organization?.login || repo.owner?.login}
            </Typography>
            <Box component="span" ml={0.5} mr={0.5}>
                /
            </Box>
            {folder ? (
                <MakeCodeFolderLink folder={folder} repo={repo} />
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
        />
    )
}
