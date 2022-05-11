import React, { lazy } from "react"
// tslint:disable-next-line: no-submodule-imports
import { Card, CardContent, Typography } from "@mui/material"
import { useRepository } from "../github"
import GithubRepositoryCardHeader from "./GithubRepositoryCardHeader"
import Suspense from "../ui/Suspense"
const MakeCodeDependencies = lazy(
    () => import("../makecode/MakeCodeDependencies")
)

export default function GithubRepositoryCard(props: {
    slug: string
    showRelease?: boolean
    showDescription?: boolean
    showDependencies?: boolean
    showMakeCodeButton?: boolean
    showMakeCodeImportButton?: boolean
}) {
    const {
        slug,
        showRelease,
        showDescription,
        showDependencies,
        showMakeCodeButton,
        showMakeCodeImportButton,
    } = props
    const { response: repo } = useRepository(slug)
    const description = showDescription && repo?.description

    return (
        <Card>
            <GithubRepositoryCardHeader
                slug={slug}
                showRelease={showRelease}
                showMakeCodeButton={showMakeCodeButton}
                showMakeCodeImportButton={showMakeCodeImportButton}
            />
            <CardContent>
                {description && <Typography>{description}</Typography>}
                {showDependencies && (
                    <Suspense>
                        <MakeCodeDependencies
                            slug={slug}
                            branch={repo?.default_branch || "master"}
                        />
                    </Suspense>
                )}
            </CardContent>
        </Card>
    )
}
