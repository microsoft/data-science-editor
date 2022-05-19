import { List, ListItem, ListItemText } from "@mui/material"
import { Link } from "gatsby-theme-material-ui"
import React from "react"

export interface PageLinkListItemProps {
    slug: string
    title: string
    description?: string
}

function PageLinkListItem(props: PageLinkListItemProps) {
    const { slug, title, description } = props
    return (
        <ListItem key={slug} button={true}>
            <Link
                underline="hover"
                color="textPrimary"
                rel="noopener noreferrer"
                to={slug}
            >
                <ListItemText primary={title} secondary={description} />
            </Link>
        </ListItem>
    )
}

export default function PageLinkList(props: {
    nodes: PageLinkListItemProps[]
}) {
    const { nodes } = props
    return (
        !!nodes?.length && (
            <List>
                {nodes?.map(node => (
                    <PageLinkListItem key={node.slug} {...node} />
                ))}
            </List>
        )
    )
}
