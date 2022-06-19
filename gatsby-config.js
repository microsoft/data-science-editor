const { identifierToUrlPath } = require(`./jacdac-ts/dist/jacdac.cjs`)

const maxImageWidth = 800
const siteUrl = "https://microsoft.github.io"
const pathPrefix = "/jacdac-docs"

const wsl = !!process.env.WSL_DISTRO_NAME || !!process.env.CODESPACE_NAME
const offline = !!process.env.JACDAC_OFFLINE

const SITE_TITLE = `Jacdac - plug-n-play for microcontrollers`
const SITE_DESCRIPTION = `Jacdac is a plug-and-play hardware and software stack for microcontrollers and their peripherals such as sensors and actuators. Jacdac is primarily designed for “modular electronics” scenarios that support rapid prototyping, creative exploration, making and learning through physical computing. Jacdac is designed to be cheap, flexible and extensible.`

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
        `gatsby-transformer-json`,
        `gatsby-transformer-csv`,
        `gatsby-transformer-plaintext`,
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
                name: `images`,
                path: `${__dirname}/jacdac-ts/jacdac-spec/devices`,
                ignore: [`**/*.json`],
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `pages`,
                path: `${__dirname}/src/pages`,
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `services`,
                path: `${__dirname}/jacdac-ts/jacdac-spec/dist/services.json`,
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `serviceSources`,
                path: `${__dirname}/jacdac-ts/jacdac-spec/dist/services-sources.json`,
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `devices`,
                path: `${__dirname}/jacdac-ts/jacdac-spec/dist/devices.json`,
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `akalinks`,
                path: `${__dirname}/jacdac-ts/jacdac-spec/devices/microsoft-research/qr-url-device-map.csv`,
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `traces`,
                path: `${__dirname}/jacdac-ts/jacdac-spec/traces`,
            },
        },
        `gatsby-transformer-javascript-frontmatter`,
        `gatsby-theme-material-ui`,
        `gatsby-plugin-react-helmet`,
        `gatsby-plugin-image`,
        `gatsby-plugin-sharp`,
        {
            resolve: `gatsby-remark-images`,
            options: {
                linkImagesToOriginal: false,
            },
        },
        `gatsby-transformer-sharp`,
        {
            resolve: `gatsby-plugin-mdx`,
            options: {
                defaultLayouts: {
                    extensions: [`.mdx`, `.md`],
                    default: require.resolve("./src/components/Page.tsx"),
                },
                gatsbyRemarkPlugins: [
                    wsl || offline
                        ? undefined
                        : {
                              resolve: "gatsby-remark-makecode",
                              options: {
                                  editorUrl:
                                      "https://makecode.microbit.org/",
                              },
                          },
                    "gatsby-remark-autolink-headers",
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
                    "gatsby-remark-embed-snippet",
                ].filter(plugin => !!plugin),
            },
        },
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    wsl || offline
                        ? undefined
                        : {
                              resolve: "gatsby-remark-makecode",
                              options: {
                                  editorUrl:
                                      "https://makecode.microbit.org/",
                              },
                          },
                    "gatsby-remark-autolink-headers",
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
                    "gatsby-remark-embed-snippet",
                ].filter(plugin => !!plugin),
            },
        },
        {
            resolve: `@gatsby-contrib/gatsby-plugin-elasticlunr-search`,
            options: {
                fields: [`title`, `description`, `body`, `tags`],
                resolvers: {
                    Mdx: {
                        title: node => node.frontmatter.title,
                        description: node => node.frontmatter.description,
                        body: node => node.rawBody,
                        tags: node => node.frontmatter.tags || "",
                        url: node => node.frontmatter.path || node.fields.slug,
                    },
                    JavascriptFrontmatter: {
                        title: node => node.frontmatter?.title,
                        description: node => node.frontmatter?.description,
                        tags: node => node.frontmatter?.tags || "",
                        url: node => node.frontmatter?.path || node.fields?.slug || node.node?.relativePath,
                    },
                    ServicesJson: {
                        title: node => node.name,
                        description: node => node.notes["short"],
                        body: node => node.source,
                        tags: node => node.tags,
                        url: node => `/services/${node.shortId}/`,
                    },
                    DevicesJson: {
                        title: node => node.name,
                        description: node => node.description,
                        body: node => node.company,
                        tags: node => node.tags,
                        url: node =>
                            `/devices/${identifierToUrlPath(node.jsonId)}/`,
                    },
                }, // filter: (node, getNode) => node.frontmatter.tags !== "exempt",
            },
        },
        /*    
    {
      resolve: 'gatsby-plugin-flexsearch',
      options: {
        // L
        languages: ['en'],
        type: 'Mdx', // Filter the node types you want to index
        // Fields to index.
        fields: [
          {
            name: 'title',
            indexed: true, // If indexed === true, the field will be indexed.
            resolver: 'frontmatter.title',
            // Attributes for indexing logic. Check https://github.com/nextapps-de/flexsearch#presets for details.
            attributes: {
              encode: "extra",
              tokenize: "full",
              threshold: 1,
              resolution: 3
            },
            store: true, // In case you want to make the field available in the search results.
          },
          {
            name: 'description',
            indexed: true,
            resolver: 'frontmatter.description',
            attributes: {
              encode: 'balance',
              tokenize: 'strict',
              threshold: 6,
              depth: 3,
            },
            store: false,
          },
          {
            name: 'body',
            indexed: true, // If indexed === true, the field will be indexed.
            resolver: 'rawBody',
            // Attributes for indexing logic. Check https://github.com/nextapps-de/flexsearch#presets for details.
            attributes: {
              encode: "casei",
              tokenize: "forward",
              threshold: 2,
              resolution: 4,
              depth: 3
            },
            store: false, // In case you want to make the field available in the search results.
          },
          {
            name: 'url',
            indexed: false,
            resolver: 'fields.slug',
            store: true,
          },
        ],
      },
    },
    */
        "gatsby-plugin-sitemap",
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                name: SITE_TITLE,
                short_name: `Jacdac`,
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
                precachePages: [
                    `/*`,
                    `/reference/**`,
                    `/services/**`,
                    `/devices/**`,
                    `/tools/**`,
                ],
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
