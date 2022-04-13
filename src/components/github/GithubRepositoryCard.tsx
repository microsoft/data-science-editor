import React from "react"
// tslint:disable-next-line: no-submodule-imports
import { Card, CardContent, Typography } from "@mui/material"
import { useRepository } from "../github"
import GithubRepositoryCardHeader from "./GithubRepositoryCardHeader"

export default function GithubRepositoryCard(props: {
    slug: string
    showRelease?: boolean
    showDescription?: boolean
}) {
    const { slug, showRelease, showDescription } = props
    const { response: repo } = useRepository(slug)
    const description = showDescription && repo?.description

    return (
        <Card>
            <GithubRepositoryCardHeader slug={slug} showRelease={showRelease} />
            {description && (
                <CardContent>
                    {description && <Typography>{description}</Typography>}
                </CardContent>
            )}
        </Card>
    )
}
