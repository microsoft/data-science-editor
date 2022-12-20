const path = require(`path`)
const fs = require(`fs-extra`)
const process = require(`process`)
const sharp = require(`sharp`)
const { slash } = require(`gatsby-core-utils`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const Papa = require("papaparse")
const { IgnorePlugin } = require("webpack")
const AVATAR_SIZE = 64
const LAZY_SIZE = 96
const PREVIEW_WIDTH = 480
const PREVIEW_HEIGHT = 360
const DEVICE_LIST_WIDTH = 240
const DEVICE_LIST_HEIGHT = 180
const CATALOG_HEIGHT = 600
const CATALOG_WIDTH = 800
const FULL_HEIGHT = 768
const FULL_WIDTH = 1024


async function createVersions() {
    await fs.outputFile(
        `./public/version.json`,
        JSON.stringify({
            sha: process.env.GATSBY_GITHUB_SHA,
        })
    )
}

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programmatically
// create pages.
exports.createPages = async ({ graphql, actions, reporter }) => {
    await createVersions()
}

exports.onCreateNode = ({ node, actions, getNode }) => {
    const { createNodeField } = actions
    //console.log(`${node.internal.type} -> ${node.value}`)
    if (node.internal.type === `Mdx`) {
        const value = createFilePath({ node, getNode })
        createNodeField({
            name: `slug`,
            node,
            value,
        })
        if (node.frontmatter && !node.frontmatter.title) {
            const heading = /#\s*([^\n]+)/.exec(node.rawBody)
            if (heading) node.frontmatter.title = heading[1].trim()
        }
    }
}

exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
    const { setWebpackConfig, replaceWebpackConfig } = actions
    //console.log({ stage })
    const plugins = [
        new IgnorePlugin({
            resourceRegExp: /^canvas$/,
        }),
    ]
    const fallback = {
        crypto: false,
        util: require.resolve("util/"),
        assert: require.resolve("assert/"),
        fs: false,
        net: false,
        webusb: false,
    }
    if (stage.startsWith("develop")) {
        setWebpackConfig({
            resolve: {
                fallback,
            },
            plugins,
        })
    }
    if (stage === "build-javascript" || stage === "build-html") {
        console.log(`enabling ignore filters`)
        setWebpackConfig({
            node: {
                fs: "empty",
            },
            resolve: {
                fallback,
            },
            plugins,
        })
    }

    // enable verbose logging
    const config = getConfig()
    config.stats = "verbose"
    config.performance.hints = "warning"
    replaceWebpackConfig(config)

    // final webpack
    //console.log({ webpack: getConfig() })
}

// generate a full list of pages for compliance
exports.onPostBuild = async ({ graphql }) => {
    console.log(`compliance step`)
    const { data } = await graphql(`
        {
            pages: allSitePage {
                nodes {
                    path
                }
            }
        }
    `)

    await fs.writeFile(
        path.resolve(__dirname, ".cache/all-pages.csv"),
        data.pages.nodes
            .map(
                node =>
                    `${
                        "https://microsoft.github.io/data-science-editor" + node.path
                    }, ${node.path.slice(1)}`
            )
            .join("\n")
    )

    await fs.writeFile(
        path.resolve(__dirname, ".cache/top-pages.csv"),
        data.pages.nodes
            .filter(
                node =>
                    node.path.slice(1).replace(/\/$/, "").split(/\//g).length <
                        2 &&
                    node.path.indexOf("offline-plugin-app-shell-fallback") < 0
            )
            .map(
                node =>
                    `${
                        "https://microsoft.github.io/data-science-editor" + node.path
                    }, ${node.path.slice(1)}`
            )
            .join("\n")
    )
}