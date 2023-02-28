const maxImageWidth = 800
const siteUrl = "https://microsoft.github.io"
const pathPrefix = "/data-science-editor"

const SITE_TITLE = `Data Science Editor.`
const SITE_DESCRIPTION = `Data Science Editor.`

module.exports = {
    trailingSlash: "always",
    siteMetadata: {
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        author: `Microsoft`,
        siteUrl: siteUrl,
    },
    pathPrefix: pathPrefix,
    flags: {
        PRESERVE_FILE_DOWNLOAD_CACHE: true,
        DEV_WEBPACK_CACHE: true,
        FAST_DEV: true,
    },
    plugins: [
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `images`,
                path: `${__dirname}/src/images`,
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `pages`,
                path: `${__dirname}/src/pages`,
            },
        },
        `gatsby-theme-material-ui`,
        `gatsby-plugin-image`,
        `gatsby-plugin-sharp`,
        `gatsby-transformer-sharp`,
        {
            resolve: `gatsby-plugin-mdx`,
            options: {
                extensions: [`.mdx`, `.md`],
                mdxOptions: {
                    remarkPlugins: [require(`remark-gfm`)],
                },
                gatsbyRemarkPlugins: [
                    {
                        resolve: `gatsby-remark-autolink-headers`,
                        options: {
                            enableCustomId: true
                        }
                    },
                    "gatsby-remark-external-links",
                    {
                        resolve: `gatsby-remark-images`,
                        options: {
                            // It's important to specify the maxWidth (in pixels) of
                            // the content container as this plugin uses this as the
                            // base for generating different widths of each image.
                            maxWidth: maxImageWidth,
                            linkImagesToOriginal: false,
                        },
                    },
                    "gatsby-remark-static-images",
                    "gatsby-remark-copy-linked-files",
                ].filter(plugin => !!plugin),
            },
        },
        "gatsby-plugin-sitemap",
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                name: SITE_TITLE,
                short_name: `Data Science Editor`,
                description: SITE_DESCRIPTION,
                start_url: `/`,
                background_color: `#ffc400`,
                theme_color: `#ffc400`,
                display: `standalone`,
                cache_busting_mode: "none",
                icon: `src/images/favicon.svg`,
                crossOrigin: `use-credentials`,
            },
        },
        {
            resolve: `gatsby-plugin-offline`,
            options: {
                precachePages: [`/*`],
            },
        },
        "gatsby-plugin-robots-txt",
        "gatsby-plugin-meta-redirect",
        "gatsby-plugin-webpack-bundle-analyser-v2",
        {
            resolve: `gatsby-plugin-catch-links`,
        },
    ],
}
