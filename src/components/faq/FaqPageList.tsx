import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import PageLinkList, { PageQuery, pageQueryToNodes } from "../ui/PageLinkList"

export default function FaqPageList() {
    const query = useStaticQuery<PageQuery>(graphql`
        {
            allMdx(filter: { fields: { slug: { glob: "/faq/*" } } }) {
                nodes {
                    excerpt
                    fields {
                        slug
                    }
                    frontmatter {
                        title
                        description
                        order
                    }
                }
            }
        }
    `)

    return <PageLinkList nodes={pageQueryToNodes(query)} />
}
