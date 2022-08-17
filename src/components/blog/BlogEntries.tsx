import { graphql, useStaticQuery } from "gatsby"
import React from "react"
import { ReactNode } from "react"
import PageLinkList, { PageQuery, pageQueryToNodes } from "../ui/PageLinkList"

export default function BlogEntries(props: { header?: ReactNode }) {
    const { header } = props
    const query = useStaticQuery<PageQuery>(graphql`
        {
            allMdx(filter: { fields: { slug: { glob: "/blog/*" } } }) {
                nodes {
                    excerpt
                    fields {
                        slug
                    }
                    frontmatter {
                        title
                        order
                        description
                        date
                    }
                }
            }
        }
    `)

    return <PageLinkList header={header} nodes={pageQueryToNodes(query)} />
}
