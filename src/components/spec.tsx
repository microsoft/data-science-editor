import React from "react"
import { graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PageTemplate(props: { data: { mdx: { body: any } } }) {
  const { data } = props;
  const { mdx } = data;
  return <MDXRenderer>{mdx.body}</MDXRenderer>
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