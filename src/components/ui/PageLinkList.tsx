import { Chip, List, ListItem, ListItemText, Typography } from "@mui/material"
import { Link } from "gatsby-theme-material-ui"
import React, { useMemo } from "react"
import { serviceSpecificationFromName } from "../../../jacdac-ts/src/jdom/spec"
import ChipList from "./ChipList"

export interface PageLinkListItemProps {
    slug: string
    title: string
    description?: string
    services?: string
}

function PageLinkListItem(props: PageLinkListItemProps) {
    const { slug, title, description, services } = props
    const specs = useMemo(
        () =>
            services
                ?.split(/,\s*/g)
                .map(serviceSpecificationFromName)
                .filter(s => !!s),
        [services]
    )
    return (
        <ListItem key={slug}>
            <ListItemText
                primary={
                    <Link
                        underline="hover"
                        color="textPrimary"
                        rel="noopener noreferrer"
                        to={slug}
                    >
                        {title}
                    </Link>
                }
                secondary={
                    <>
                        {description && (
                            <Typography variant="subtitle1">
                                {description}
                            </Typography>
                        )}
                        {specs && (
                            <ChipList>
                                {specs?.map(({ shortId, name }) => (
                                    <Chip
                                        key={shortId}
                                        label={name}
                                        size="small"
                                    />
                                ))}
                            </ChipList>
                        )}
                    </>
                }
            />
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
