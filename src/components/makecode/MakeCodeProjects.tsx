import { graphql, useStaticQuery } from "gatsby"
import { ReactNode, React } from "react"
import { serviceSpecificationFromName } from "../../../jacdac-ts/src/jdom/spec"
import PageLinkList from "../ui/PageLinkList"

export default function MakeCodeProjects(props: {
    header?: ReactNode
    serviceName?: string
}) {
    const { serviceName, header } = props
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
                        description?: string
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
                            description
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
    nodes = nodes.sort((l, r) => {
        const lo = Number(l.frontmatter?.order) || 50
        const ro = Number(r.frontmatter?.order) || 50
        const c = lo - ro
        if (c) return c
        return l.fields.slug.localeCompare(r.fields.slug)
    })

    return (
        <PageLinkList
            header={header}
            nodes={nodes.map(({ fields, frontmatter, headings }) => ({
                slug: fields.slug,
                title: frontmatter.title || headings?.[0]?.value,
                description: frontmatter.description,
                services: frontmatter.services,
            }))}
        />
    )
}
