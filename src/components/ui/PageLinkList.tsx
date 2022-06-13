import { Chip, List, ListItem, ListItemText, Typography } from "@mui/material"
import { Link } from "gatsby-theme-material-ui"
import React, { ReactNode, useMemo } from "react"
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
                ?.split(/\s*,\s*/gi)
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
                    <ChipList>
                        {description && (
                            <Typography component="span" variant="subtitle1">
                                {description}
                            </Typography>
                        )}
                        {specs?.map(({ shortId, name }) => (
                            <Chip
                                component="span"
                                key={shortId}
                                label={name}
                                size="small"
                            />
                        ))}
                    </ChipList>
                }
            />
        </ListItem>
    )
}

export default function PageLinkList(props: {
    header?: ReactNode
    nodes: PageLinkListItemProps[]
}) {
    const { header, nodes } = props
    return (
        !!nodes?.length && (
            <>
                {header}
                <List>
                    {nodes?.map(node => (
                        <PageLinkListItem key={node.slug} {...node} />
                    ))}
                </List>
            </>
        )
    )
}
