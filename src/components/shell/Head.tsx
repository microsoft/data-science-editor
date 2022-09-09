/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */
import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import type { HeadProps } from "gatsby"

export default function Head(
    props: HeadProps & {
        description?: string
        image?: string
        title?: string
        meta?: { name: string; content: string }[]
    }
) {
    const {
        pageContext,
        data,
        description,
        image,
        title,
        meta = [],
    }: {
        pageContext: { title?: string }
        data?: { page?: { description?: string } }
        description?: string
        image?: string
        title?: string
        meta?: { name: string; content: string }[]
    } = props
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
    let metaTitle = title || pageContext?.title || site?.siteMetadata?.title
    if (!/^Jacdac/i.test(metaTitle)) metaTitle = `Jacdac - ${metaTitle}`
    const metaDescription =
        description ||
        data?.page?.description ||
        site?.siteMetadata?.description
    return (
        <>
            <title key="title">{metaTitle}</title>
            {[
                {
                    name: `description`,
                    content: metaDescription,
                },
                {
                    name: "og:image",
                    content: image,
                },
                {
                    name: `og:title`,
                    content: metaTitle,
                },
                {
                    name: `og:description`,
                    content: metaDescription,
                },
                {
                    name: `og:type`,
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
            ]
                .filter(({ content }) => !!content)
                .map(({ name, content }) => (
                    <meta key={name} name={name} content={content} />
                ))}
            <link
                key="fontsgoogle"
                rel="preconnect"
                href="https://fonts.googleapis.com"
                crossOrigin="anonymous"
            />
            <link
                key="gitusercontent"
                rel="preconnect"
                href="https://raw.githubusercontent.com"
                crossOrigin="anonymous"
            />
            <meta
                key="viewport"
                name="viewport"
                content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
            />
        </>
    )
}
