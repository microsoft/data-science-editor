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
    order?: number
    date?: string
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

export function pageQueryToNodes(data: {
    allMdx: {
        nodes: {
            fields: {
                slug: string
            }
            frontmatter: {
                title?: string
                description?: string
                order?: number
                date?: string
            }
            headings?: {
                value: string
            }[]
        }[]
    }
}) {
    const nodes = data?.allMdx?.nodes.map(
        ({ frontmatter, fields, headings }) => ({
            slug: fields?.slug,
            title: frontmatter.title || headings?.[0].value,
            description: frontmatter.description,
            order: frontmatter.order,
            date: frontmatter.date,
        })
    )
    return nodes
}

export default function PageLinkList(props: {
    header?: ReactNode
    nodes: PageLinkListItemProps[]
}) {
    const { header, nodes } = props
    const sorted = nodes?.sort((l, r) => {
        const ld = Date.parse(l?.date) || 0
        const rd = Date.parse(r?.date) || 0
        const dc = ld - rd
        if (dc) return dc

        const lo = Number(l?.order) || 50
        const ro = Number(r?.order) || 50
        const c = lo - ro
        if (c) return c
        return l.slug.localeCompare(r.slug)
    })
    return (
        !!sorted?.length && (
            <>
                {header}
                <List>
                    {sorted?.map(node => (
                        <PageLinkListItem key={node.slug} {...node} />
                    ))}
                </List>
            </>
        )
    )
}
