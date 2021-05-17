import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { Link } from "gatsby-theme-material-ui"

function ErrorListItem(props: { slug: string; title: string }) {
    const { slug, title } = props
    return (
        <li>
            <Link to={slug}>{title}</Link>
        </li>
    )
}

export default function ErrorList() {
    const data = useStaticQuery(graphql`
        {
            allMdx(
                filter: { slug: { glob: "errors/**" } }
                sort: { fields: slug }
            ) {
                nodes {
                    slug
                    frontmatter {
                        title
                    }
                }
            }
        }
    `)

    console.log("data", { data })
    const nodes = data?.allMdx?.nodes?.filter(
        node => node.slug.indexOf("/") > -1 && node.frontmatter?.title
    )

    return (
        <>
            <h1>Errors</h1>
            <ol>
                {nodes?.map(node => (
                    <ErrorListItem
                        key={node.slug}
                        slug={node.slug}
                        title={node.frontmatter.title}
                    />
                ))}
            </ol>
        </>
    )
}
