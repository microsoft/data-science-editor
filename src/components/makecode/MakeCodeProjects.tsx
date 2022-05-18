import { graphql, useStaticQuery } from "gatsby"
import React from "react"
import { serviceSpecificationFromName } from "../../../jacdac-ts/src/jdom/spec"
import PageLinkList from "../ui/PageLinkList"

export default function MakeCodeProjects(props: { serviceName?: string }) {
    const { serviceName } = props
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
                        services?: string
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
                            services
                        }
                        headings {
                            value
                        }
                    }
                }
            }
        }
    `)
    // grab the nodes
    let nodes = query.allMdx.edges.map(edge => edge.node)
    // filter out
    const spec = serviceSpecificationFromName(serviceName)
    if (spec)
        nodes = nodes.filter(
            node => node.frontmatter.services?.indexOf(spec.shortId) > -1
        )
    // order nodes
    nodes.sort((l, r) => {
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
