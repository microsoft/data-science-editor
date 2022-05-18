import { graphql, useStaticQuery } from "gatsby"
import React from "react"
import PageLinkList from "../ui/PageLinkList"

export default function MakeCodeProjects() {
    const query = useStaticQuery<{
        allMdx: {
            edges: {
                node: {
                    fields: {
                        slug: string
                    }
                    frontmatter: {
                        title?: string
                        order?: number
                    }
                    headings: {
                        value: string
                    }[]
                }
            }[]
        }
    }>(graphql`
        {
            allMdx(
                filter: {
                    fields: { slug: { glob: "/clients/makecode/projects/*" } }
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
                            order
                        }
                        headings {
                            value
                        }
                    }
                }
            }
        }
    `)
    const nodes = query.allMdx.edges
        .map(edge => edge.node)
        .sort((l, r) => {
            const c =
                -(Number(l.frontmatter?.order) || 0) +
                (Number(r.frontmatter?.order) || 0)
            if (c) return c
            return l.fields.slug.localeCompare(r.fields.slug)
        })
    return (
        <PageLinkList
            nodes={nodes.map(({ fields, frontmatter, headings }) => ({
                slug: fields.slug,
                title: frontmatter.title || headings?.[0]?.value,
            }))}
        />
    )
}
