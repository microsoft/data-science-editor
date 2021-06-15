const path = require(`path`)
const fs = require(`fs-extra`)
const sharp = require(`sharp`)
const { slash } = require(`gatsby-core-utils`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const Papa = require("papaparse")
const {
    serviceSpecifications,
    identifierToUrlPath,
    serviceSpecificationToDTDL,
    DTMIToRoute,
} = require(`./jacdac-ts/dist/jacdac.cjs`)
const { IgnorePlugin } = require("webpack")
const AVATAR_SIZE = 64
const LAZY_SIZE = 96

async function createServicePages(graphql, actions, reporter) {
    console.log(`generating service pages`)
    const { createPage, createRedirect } = actions
    const result = await graphql(`
        {
            allServicesJson {
                nodes {
                    name
                    shortName
                    shortId
                    classIdentifier
                }
            }
            allServicesSourcesJson {
                nodes {
                    source
                    classIdentifier
                }
            }
        }
    `)

    if (result.errors) {
        reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query')
        return
    }

    // Create image post pages.
    const serviceTemplate = path.resolve(`src/templates/service.tsx`)
    const servicePlaygroundTemplate = path.resolve(
        `src/templates/service-playground.tsx`
    )
    const serviceTestTemplate = path.resolve(`src/templates/service-test.tsx`)
    result.data.allServicesJson.nodes.map(node => {
        const { classIdentifier, shortId } = node
        const p = `/services/${shortId}/`
        const pplay = `${p}playground/`
        const ptest = `${p}test/`
        const r = `/services/0x${classIdentifier.toString(16)}`

        const source = result.data.allServicesSourcesJson.nodes.find(
            node => node.classIdentifier === classIdentifier
        ).source

        createPage({
            path: p,
            component: slash(serviceTemplate),
            context: {
                classIdentifier,
                source,
            },
        })
        createPage({
            path: pplay,
            component: slash(servicePlaygroundTemplate),
            context: {
                node,
            },
        })
        createPage({
            path: ptest,
            component: slash(serviceTestTemplate),
            context: {
                node,
            },
        })
        //console.log(`service redirect`, { from: r, to: p })
        createRedirect({
            fromPath: r,
            toPath: p,
        })
    })
}

async function createDeviceQRPages(actions) {
    console.log(`generating device QR pages`)
    const { createRedirect } = actions
    const csv = fs.readFileSync(
        "./jacdac-ts/jacdac-spec/devices/microsoft/research/qr-url-device-map.csv",
        "utf-8"
    )
    const designidcol = "designid"
    const vanitycol = "vanityname"
    const csvData = Papa.parse(csv, { header: true })
    const data = csvData.data.filter(d => !!d[designidcol])
    for (const qr of data) {
        const vanity = qr[vanitycol].trim()
        const p = `/devices/codes/${vanity}/`
        const r = { fromPath: p, toPath: `/devices/microsoft/research/` }
        await createRedirect(r)
        console.log(r)
    }
    console.log(`devices qr code redirect created`)
}

async function createDevicePages(graphql, actions, reporter) {
    console.log(`generating device pages`)
    const { createPage, createRedirect } = actions
    const result = await graphql(`
        {
            allDevicesJson {
                nodes {
                    id
                    name
                    company
                    firmwares
                }
            }
        }
    `)

    if (result.errors) {
        reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query')
        return
    }

    // Create image post pages.
    const deviceTemplate = path.resolve(`src/templates/device.tsx`)
    const companyTemplate = path.resolve(`src/templates/device-company.tsx`)
    // We want to create a detailed page for each
    // Instagram post. Since the scraped Instagram data
    // already includes an ID field, we just use that for
    // each page's path.
    for (const node of result.data.allDevicesJson.nodes) {
        const p = `/devices/${node.id.replace(/-/g, "/")}/`
        createPage({
            path: p,
            component: slash(deviceTemplate),
            context: {
                node,
            },
        })
        // adding firmware identifier redirects
        if (node.firmwares)
            node.firmwares.forEach(fw => {
                const fp = `/firmwares/0x${fw.toString(16)}`
                const dp = `/devices/0x${fw.toString(16)}`
                //console.log(`firmware redirect`, { from: fp, to: p })
                //console.log(`device redirect`, { from: dp, to: p })
                createRedirect({
                    fromPath: fp,
                    toPath: p,
                })
                createRedirect({
                    fromPath: dp,
                    toPath: p,
                })
            })
        // copy device image to static
        const imgpath = identifierToUrlPath(node.id) + ".jpg"
        const imgsrc = `./jacdac-ts/jacdac-spec/devices/${imgpath}`
        await fs.copy(imgsrc, `./public/images/devices/${imgpath}`)
        await sharp(imgsrc)
            .resize(null, LAZY_SIZE, {
                fit: sharp.fit.cover,
            })
            .toFormat("jpeg")
            .toFile(
                `./public/images/devices/${
                    identifierToUrlPath(node.id) + ".lazy.jpg"
                }`
            )
        await sharp(imgsrc)
            .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: sharp.fit.cover })
            .toFormat("jpeg")
            .toFile(
                `./public/images/devices/${
                    identifierToUrlPath(node.id) + ".avatar.jpg"
                }`
            )
    }

    const snakify = name => {
        return name.replace(/([a-z])([A-Z])/g, (_, a, b) => a + "_" + b)
    }
    const escapeDeviceIdentifier = text => {
        if (!text) text = ""
        const escaped = text
            .trim()
            .toLowerCase()
            .replace(/([^a-z0-9\_-])+/gi, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "")
        const id = snakify(escaped)
        return id
    }

    // create device company routes
    const companies = new Set(
        result.data.allDevicesJson.nodes.map(node => node.company)
    )
    //console.log(companies)
    for (const company of companies.keys()) {
        const p = `/devices/${escapeDeviceIdentifier(company).replace(
            /-/g,
            "/"
        )}`
        //console.log(`device company page`, { p })
        createPage({
            path: p,
            component: slash(companyTemplate),
            context: {
                company,
            },
        })
    }
}

async function createSpecPages(graphql, actions, reporter) {
    console.log(`generating spec pages`)
    const { createPage } = actions
    const result = await graphql(`
        {
            allMdx {
                edges {
                    node {
                        id
                        fields {
                            slug
                        }
                        parent {
                            ... on File {
                                sourceInstanceName
                            }
                        }
                    }
                }
            }
        }
    `)
    if (result.errors) {
        reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query')
    }
    // Create pages.
    const specs = result.data.allMdx.edges
        .map(node => node.node)
        .filter(node => {
            return node.parent.sourceInstanceName == "specPages"
        })
    // you'll call `createPage` for each result
    specs.forEach(node => {
        createPage({
            // This is the slug you created before
            // (or `node.frontmatter.slug`)
            path: node.fields.slug,
            // This component will wrap our MDX content
            component: path.resolve(`./src/components/spec.tsx`),
            context: { id: node.id },
        })
    })
}

async function generateServicesJSON() {
    const dir = "./public"
    const services = serviceSpecifications()

    // JSON
    for (const srv of services) {
        const f = path.join(
            dir,
            "services",
            `x${srv.classIdentifier.toString(16)}.json`
        )
        //console.log(`json x${srv.classIdentifier.toString(16)} => ${f}`)
        await fs.outputFile(f, JSON.stringify(srv, null, 2))
    }

    // DTMI
    {
        const models = services
            .filter(srv => srv.shortId !== "_system")
            .map(serviceSpecificationToDTDL)
        for (const model of models) {
            const route = DTMIToRoute(model["@id"])
            const f = path.join(dir, route)
            //console.log(`dtml ${model["@id"]} => ${f}`)
            await fs.outputFile(f, JSON.stringify(model, null, 2))
        }
        await fs.outputFile(
            "./public/dtmi/jacdac/services.json",
            JSON.stringify(models, null, 2)
        )
    }
}

async function createWorkers() {
    // copy jacdac-serviceworker.js to static
    // include version number to bust out caching
    const jacdacTsPackageJson = fs.readJsonSync(`./jacdac-ts/package.json`)
    await fs.copy(
        `./jacdac-ts/dist/jacdac-serviceworker.js`,
        `./public/jacdac-serviceworker-${jacdacTsPackageJson.version}.js`
    )
}

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programmatically
// create pages.
exports.createPages = async ({ graphql, actions, reporter }) => {
    await createServicePages(graphql, actions, reporter)
    await createSpecPages(graphql, actions, reporter)
    await createDevicePages(graphql, actions, reporter)
    await createDeviceQRPages(actions, reporter)
    // generate JSON for Services/DTMI models
    await generateServicesJSON()
    await createWorkers()
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
    console.log({ stage })
    const plugins = [
        new IgnorePlugin({
            resourceRegExp: /^canvas|@axe-core\/react$/,
        }),
    ]
    if (stage.startsWith("develop")) {
        setWebpackConfig({
            resolve: {
                alias: {
                    "react-dom": "@hot-loader/react-dom",
                },
            },
            plugins,
        })
    }
    if (stage === "build-javascript" || stage === "build-html") {
        console.log(`enabling ignore filters`)
        setWebpackConfig({
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
                        "https://microsoft.github.io/jacdac-docs" + node.path
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
                        "https://microsoft.github.io/jacdac-docs" + node.path
                    }, ${node.path.slice(1)}`
            )
            .join("\n")
    )
}
