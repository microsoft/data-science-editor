import React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import { MDXRenderer } from "gatsby-plugin-mdx"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PageTemplate(props: {
    data: {
        mdx: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            body: any
            id: string
            frontmatter?: { title?: string; hideToc?: boolean }
        }
    }
}) {
    const { data } = props
    const { mdx } = data
    const { body, frontmatter } = mdx
    const title = frontmatter?.title
    return (
        <>
            {title && (
                <Helmet>
                    <title>{title}</title>
                </Helmet>
            )}
            <MDXRenderer>{body}</MDXRenderer>
        </>
    )
}

export const pageQuery = graphql`
    query SpecQuery($id: String) {
        mdx(id: { eq: $id }) {
            id
            body
            frontmatter {
                title
                hideToc
            }
        }
    }
`
