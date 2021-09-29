import { graphql, useStaticQuery } from "gatsby"
import React from "react"
import PageLinkList from "../ui/PageLinkList"

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
        <PageLinkList
            nodes={nodes.map(({ fields, frontmatter }) => ({
                slug: fields.slug,
                title: frontmatter.title,
            }))}
        />
    )
}
