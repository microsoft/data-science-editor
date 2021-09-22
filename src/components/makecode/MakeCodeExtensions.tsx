import { List, ListItem, ListItemText } from "@material-ui/core"
import { graphql, Link, useStaticQuery } from "gatsby"
import React from "react"

export default function MakeCodeExtensions() {
    const query = useStaticQuery<{
        allMdx: {
            edges: {
                node: {
                    fields: {
                        slug: string
                    }
                    frontmatter: {
                        title?: string
                    }
                }
            }[]
        }
    }>(graphql`
        {
            allMdx(
                filter: {
                    fields: { slug: { glob: "/clients/makecode/extensions/*" } }
                }
            ) {
                edges {
                    node {
                        id
                        fields {
                            slug
                        }
                        frontmatter {
                            title
                        }
                    }
                }
            }
        }
    `)
    const nodes = query.allMdx.edges
        .map(edge => edge.node)
        .sort((l, r) => l.fields.slug.localeCompare(r.fields.slug))
    return (
        <List>
            {nodes?.map(({ fields, frontmatter }) => (
                <Link to={fields.slug} key={fields.slug}>
                    <ListItem>
                        <ListItemText primary={frontmatter.title} />
                    </ListItem>
                </Link>
            ))}
        </List>
    )
}
