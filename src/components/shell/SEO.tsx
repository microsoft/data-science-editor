/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */
import React from "react"
import { Helmet } from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"

export default function SEO(props: {
    description?: string
    lang?: string
    meta?: { name: string; content: string }[]
    title?: string
    image?: string
}) {
    const {
        lang = "en",
        meta = [],
        description = "",
        title = "",
        image,
    } = props || {}
    const { site } = useStaticQuery(
        graphql`
            query {
                site {
                    siteMetadata {
                        title
                        description
                        author
                    }
                }
            }
        `
    )
    const metaTitle = title || site.siteMetadata.title
    const metaDescription = description || site.siteMetadata.description
    return (
        <Helmet
            htmlAttributes={{
                lang,
            }}
            title={metaTitle}
            meta={[
                {
                    name: `description`,
                    content: metaDescription,
                },
                {
                    name: "og:image",
                    content: image,
                },
                {
                    property: `og:title`,
                    content: metaTitle,
                },
                {
                    property: `og:description`,
                    content: metaDescription,
                },
                {
                    property: `og:type`,
                    content: `website`,
                },
                {
                    name: `twitter:card`,
                    content: `summary`,
                },
                {
                    name: `twitter:creator`,
                    content: site.siteMetadata.author,
                },
                {
                    name: `twitter:title`,
                    content: title,
                },
                {
                    name: `twitter:description`,
                    content: metaDescription,
                },
                ...meta,
            ].filter(({ content }) => !!content)}
        />
    )
}
