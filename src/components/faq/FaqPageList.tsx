import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import PageLinkList, { pageQueryToNodes } from "../ui/PageLinkList"

export default function FaqPageList() {
    const query = useStaticQuery<{
        allMdx: {
            nodes: {
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
            }[]
        }
    }>(graphql`
        {
            allMdx(
                filter: { slug: { glob: "faq/*" } }
            ) {
                nodes {
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
    `)

    return <PageLinkList nodes={pageQueryToNodes(query)} />
}
