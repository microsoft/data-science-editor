import React from "react"
// tslint:disable-next-line: no-submodule-imports
import { Box, CardHeader, Typography } from "@material-ui/core"
import {
    GithubRepository,
    normalizeSlug,
    useFetchJSON,
    useLatestRelease,
    useRepository,
} from "./github"
import GitHubIcon from "@material-ui/icons/GitHub"
import { Link } from "gatsby-theme-material-ui"
import LoadingProgress from "./ui/LoadingProgress"

function MakeCodeFolderLink(props: {
    slug: string
    folder: string
    repo: GithubRepository
}) {
    const { slug, folder, repo } = props
    const { response: pxtJson } = useFetchJSON<{
        name: string
        description: string
    }>(slug, repo.default_branch, "pxt.json", "application/json")
    return (
        <Link
            href={`${repo.html_url}/tree/${repo.default_branch}/${folder}`}
            target="blank"
        >
            <Typography component="span" variant="h5">
                {pxtJson?.name || `${repo.name}/ ${folder}`}
            </Typography>
        </Link>
    )
}

export default function GithubRepositoryCardHeader(props: {
    slug: string
    showRelease?: boolean
}) {
    const { slug, showRelease } = props
    const { response: repo, loading: repoLoading, status } = useRepository(slug)
    const { response: release } = useLatestRelease(showRelease && slug)
    const { folder } = normalizeSlug(slug)

    const title = repo ? (
        <>
            <Typography component="span" variant="h6">
                {repo.organization?.login}
            </Typography>
            <Box component="span" ml={0.5} mr={0.5}>
                /
            </Box>
            {folder ? (
                <MakeCodeFolderLink slug={slug} folder={folder} repo={repo} />
            ) : (
                <Link href={repo.html_url} target="_blank">
                    <Typography component="span" variant="h5">
                        {repo.name}
                    </Typography>
                </Link>
            )}
        </>
    ) : (
        <>
            <Link href={`https://github.com/${slug}`} target="_blank">
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
