import { graphql, useStaticQuery } from "gatsby"
import React from "react"
import PageLinkList, { PageQuery, pageQueryToNodes } from "../ui/PageLinkList"

export default function DotNetProjects() {
    const query = useStaticQuery<PageQuery>(graphql`
        {
            allMdx(
                filter: {
                    fields: { slug: { glob: "/clients/dotnet/projects/*" } }
                }
            ) {
                nodes {
                    excerpt
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
    `)
    return <PageLinkList nodes={pageQueryToNodes(query)} />
}
