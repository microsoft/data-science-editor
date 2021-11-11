import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { groupBy } from "../../jacdac-ts/src/jdom/utils"
import PageLinkList from "./ui/PageLinkList"

export default function ErrorList() {
    const data = useStaticQuery<{
        allMdx: {
            nodes: {
                fields: {
                    slug: string
                }
                frontmatter: {
                    title?: string
                }
                headings: {
                    value: string
                }[]
            }[]
        }
    }>(graphql`
        {
            allMdx(
                filter: { slug: { glob: "reference/errors/**" } }
                sort: { fields: slug }
            ) {
                nodes {
                    fields {
                        slug
                    }
                    frontmatter {
                        title
                    }
                    headings {
                        value
                    }
                }
            }
        }
    `)

    const nodes: {
        slug: string
        title: string
    }[] = data?.allMdx?.nodes
        ?.filter(
            node =>
                node.fields?.slug.indexOf("/") > -1 && node.frontmatter?.title
        )
        .map(node => ({
            slug: node.fields?.slug,
            title: node.frontmatter.title || node.headings?.[0].value,
        }))

    const groups = groupBy(nodes, node => node.slug.split("/", 3)[2] || "")
    const groupNames = Object.keys(groups).filter(g => !!g)
    console.debug(groupNames)

    return (
        <>
            {groupNames.map(group => (
                <>
                    <h2 key={group}>{group}</h2>
                    <PageLinkList nodes={groups[group]} />
                </>
            ))}
        </>
    )
}
