import { graphql, useStaticQuery } from "gatsby"
import React, { ReactNode, useMemo } from "react"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import { arrayify, unique } from "../../../jacdac-ts/src/jdom/utils"
import PageLinkList from "../ui/PageLinkList"

export default function MakeCodeExtensions(props: {
    header?: ReactNode
    serviceClass?: number | number[]
    serviceName?: string
}) {
    const { serviceName, serviceClass, header } = props
    const serviceNames = unique([
        ...(serviceName?.split(/\s*,\s*/gi).filter(s => !!s) || []),
        ...(arrayify(serviceClass)
            ?.map(sc => serviceSpecificationFromClassIdentifier(sc)?.shortId)
            .filter(s => !!s) || []),
    ])
    const query = useStaticQuery<{
        allMdx: {
            edges: {
                node: {
                    fields: {
                        slug: string
                    }
                    frontmatter: {
                        title?: string
                        description?: string
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
                            description
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
    const nodes = useMemo(() => {
        let nodes = query.allMdx.edges.map(edge => edge.node)

        // filter out
        if (serviceNames?.length)
            nodes = nodes.filter(node =>
                serviceNames.some(n => node.fields.slug.indexOf(n) > -1)
            )
        return nodes
    }, [serviceNames.join(",")])

    return (
        <PageLinkList
            header={header}
            nodes={nodes.map(({ fields, frontmatter, headings }) => ({
                slug: fields.slug,
                title: frontmatter.title || headings?.[0]?.value,
                order: frontmatter.order,
            }))}
        />
    )
}
