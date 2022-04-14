import React from "react"
// tslint:disable-next-line: no-submodule-imports
import {
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material"
import { useRepository } from "../github"
import GithubRepositoryCardHeader from "./GithubRepositoryCardHeader"
import usePxtJson from "../makecode/usePxtJson"

function MakeCodeDependencies(props: { slug: string; branch: string }) {
    const { slug, branch } = props
    const pxt = usePxtJson(slug, branch)
    const dependencies: Record<string, string> = pxt?.dependencies || {}
    const jds = Object.entries(dependencies).filter(([, value]) =>
        /microsoft\/pxt-jacdac\/\w/i.test(value)
    )
    console.log({ dependencies, jds })
    if (!jds.length) return null

    return (
        <List dense={true}>
            {jds.map(([key, value]) => (
                <ListItem key={key} dense={true}>
                    <ListItemText primary={value} secondary={key} />
                </ListItem>
            ))}
        </List>
    )
}

export default function GithubRepositoryCard(props: {
    slug: string
    showRelease?: boolean
    showDescription?: boolean
    showDependencies?: boolean
}) {
    const { slug, showRelease, showDescription, showDependencies } = props
    const { response: repo } = useRepository(slug)
    const description = showDescription && repo?.description

    return (
        <Card>
            <GithubRepositoryCardHeader slug={slug} showRelease={showRelease} />
            <CardContent>
                {description && <Typography>{description}</Typography>}
                {showDependencies && (
                    <MakeCodeDependencies
                        slug={slug}
                        branch={repo?.default_branch || "master"}
                    />
                )}
            </CardContent>
        </Card>
    )
}
