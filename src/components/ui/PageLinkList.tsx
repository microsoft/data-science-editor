import { List, ListItem, ListItemText } from "@material-ui/core"
import { Link } from "gatsby"
import React from "react"

export default function PageLinkList(props: {
    nodes: { slug: string; title: string }[]
}) {
    const { nodes } = props
    return (
        !!nodes?.length && (
            <List dense={true}>
                {nodes?.map(({ slug, title }) => (
                    <ListItem key={slug}>
                        <Link
                            color="textPrimary"
                            rel="noopener noreferrer"
                            to={slug}
                        >
                            <ListItemText primary={title} />
                        </Link>
                    </ListItem>
                ))}
            </List>
        )
    )
}
