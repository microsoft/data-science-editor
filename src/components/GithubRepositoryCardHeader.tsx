import React from "react"
// tslint:disable-next-line: no-submodule-imports
import { Box, CardHeader, Typography } from "@material-ui/core"
import { useLatestRelease, useRepository } from "./github"
import GitHubIcon from "@material-ui/icons/GitHub"
import { Link } from "gatsby-theme-material-ui"
import LoadingProgress from "./ui/LoadingProgress"

export default function GithubRepositoryCardHeader(props: {
    slug: string
    showRelease?: boolean
}) {
    const { slug, showRelease } = props
    const { response: repo, loading: repoLoading, status } = useRepository(slug)
    const { response: release } = useLatestRelease(showRelease && slug)
    const target = "_blank" // always bounce out to github

    const title = repo ? (
        <>
            <Link href={repo.html_url} target={target}>
                <Typography component="span" variant="h6">
                    {repo.organization?.login}
                </Typography>
            </Link>
            <Box component="span" ml={0.5} mr={0.5}>
                /
            </Box>
            <Link href={repo.html_url} target={target}>
                <Typography component="span" variant="h5">
                    {repo.name}
                </Typography>
            </Link>
        </>
    ) : (
        <>
            <Link href={`https://github.com/${slug}`} target={target}>
                <Typography component="span" variant="h6">
                    {slug}
                </Typography>
            </Link>
            {repoLoading && <LoadingProgress />}
            {status !== 403 && !repoLoading && !repo && (
                <Typography component="p" variant="caption">
                    Unable to find repository.
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
