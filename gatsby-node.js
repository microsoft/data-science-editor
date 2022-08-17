const path = require(`path`)
const fs = require(`fs-extra`)
const process = require(`process`)
const sharp = require(`sharp`)
const { slash } = require(`gatsby-core-utils`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const Papa = require("papaparse")
const {
    serviceSpecifications,
    identifierToUrlPath,
    DeviceCatalog,
    isInfrastructure,
} = require(`./jacdac-ts/dist/jacdac.cjs`)
const {
    serviceSpecificationsWithServiceTwinSpecification,
    serviceSpecificationToServiceTwinSpecification,
} = require(`./jacdac-ts/dist/jacdac-azure-iot.cjs`)
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

const deviceCatalog = new DeviceCatalog()

async function createServicePages(graphql, actions, reporter) {
    console.log(`generating service pages`)
    const { createPage, createRedirect } = actions
    const result = await graphql(`
        {
            allMdx(
                filter: {
                    fields: { slug: { glob: "/clients/makecode/extensions/*" } }
                }
            ) {
                edges {
                    node {
                        fields {
                            slug
                        }
                    }
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

    const makecodeSlugs = result.data.allMdx.edges.map(
        edge => edge.node.fields.slug
    )

    // Create image post pages.
    const serviceTemplate = path.resolve(`src/templates/service.tsx`)
    const servicePlaygroundTemplate = path.resolve(
        `src/templates/service-playground.tsx`
    )
    serviceSpecifications().map(node => {
        const { classIdentifier, shortId } = node
        const p = `/services/${shortId}/`
        const pplay = `${p}playground/`
        const r = `/services/0x${classIdentifier.toString(16)}`

        const source = result.data.allServicesSourcesJson.nodes.find(
            node => node.classIdentifier === classIdentifier
        ).source
        const makecodeSlug = makecodeSlugs.find(
            slug => slug === `/clients/makecode/extensions/${shortId}/`
        )

        createPage({
            path: p,
            component: slash(serviceTemplate),
            context: {
                classIdentifier,
                source,
                makecodeSlug,
                title: node.name,
            },
        })
        createPage({
            path: pplay,
            component: slash(servicePlaygroundTemplate),
            context: {
                node,
                title: `${node.name} playground`,
            },
        })
        //console.log(`service redirect`, { from: r, to: p })
        createRedirect({
            fromPath: r,
            toPath: p,
        })
    })
}

async function createRedirects(actions) {
    const { createRedirect } = actions
    const rs = [
        {
            fromPath: `/tools/module-tester`,
            toPath: `/tools/device-tester`,
        },
        {
            fromPath: `/clients/p5js`,
            toPath: `/clients/javascript/p5js`,
        },
    ]
    rs.forEach(r => createRedirect(r))
}

async function createDeviceQRPages(actions) {
    console.log(`generating device QR pages`)
    // legacy CSV file
    const { createRedirect } = actions
    const csv = fs.readFileSync(
        "./jacdac-ts/jacdac-spec/devices/microsoft-research/qr-url-device-map.csv",
        "utf-8"
    )
    const designidcol = "designid"
    const productidcol = "productid"
    const vanitycol = "vanityname"
    const csvData = Papa.parse(csv, { header: true })
    const data = csvData.data.filter(d => !!d[designidcol])
    for (const qr of data) {
        const vanity = qr[vanitycol].trim()
        if (!vanity) continue
        const productid = parseInt(qr[productidcol], 16)
        const spec = deviceCatalog.specificationFromProductIdentifier(productid)
        const p = `/devices/codes/${vanity}/`
        const toPath = spec
            ? `/devices/0x${productid.toString(16)}/`
            : `/devices/microsoft-research/`
        const r = { fromPath: p, toPath }
        console.debug(`redirect ${r.fromPath} -> ${r.toPath}`)
        await createRedirect(r)
    }

    // new way using msr codes
    for (const spec of deviceCatalog
        .specifications({ company: "Microsoft Research" })
        .filter(
            spec =>
                spec.productIdentifiers?.length &&
                !isNaN(parseInt(spec.designIdentifier))
        )) {
        const di = parseInt(spec.designIdentifier)
        const vanity = `msr${di < 100 ? "0" : ""}${di < 10 ? "0" : ""}${di}`
        const p = `/devices/codes/${vanity}/`
        const toPath = `/devices/0x${spec.productIdentifiers[0].toString(16)}/`
        const r = { fromPath: p, toPath }
        console.debug(`redirect ${r.fromPath} -> ${r.toPath}`)
        await createRedirect(r)
    }

    console.log(`devices qr code redirect created`)
}

async function createDevicePages(graphql, actions, reporter) {
    console.log(`generating device pages`)
    const { createPage, createRedirect } = actions
    const devices = deviceCatalog.specifications({
        includeDeprecated: true,
        includeExperimental: true,
    })
    // Create image post pages.
    const deviceTemplate = path.resolve(`src/templates/device.tsx`)
    const companyTemplate = path.resolve(`src/templates/device-company.tsx`)
    for (const node of devices) {
        const p = `/devices/${identifierToUrlPath(node.id)}/`
        console.log(`${node.id} -> ${p}`)
        createPage({
            path: p,
            component: slash(deviceTemplate),
            context: {
                node,
                title: node.name,
            },
        })
        // adding firmware identifier redirects
        if (node.productIdentifiers)
            node.productIdentifiers.forEach(fw => {
                const dp = `/devices/0x${fw.toString(16)}`
                createRedirect({
                    fromPath: dp,
                    toPath: p,
                })
            })
        // copy device image to static
        const nodePath = identifierToUrlPath(node.id)
        const imgpath = nodePath + ".jpg"
        const imgsrc = `./jacdac-ts/jacdac-spec/devices/${imgpath}`
        //console.log(`image ${node.id} ${nodePath} -> ${imgpath}`)
        await fs.copy(imgsrc, `./public/images/devices/${imgpath}`)
        await sharp(imgsrc)
            .resize(CATALOG_WIDTH, CATALOG_HEIGHT, {
                fit: sharp.fit.cover,
            })
            .toFormat("jpeg")
            .toFile(`./public/images/devices/${nodePath}.catalog.jpg`)
        await sharp(imgsrc)
            .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, {
                fit: sharp.fit.cover,
            })
            .toFormat("jpeg")
            .toFile(`./public/images/devices/${nodePath}.preview.jpg`)
        await sharp(imgsrc)
            .resize(FULL_WIDTH, FULL_HEIGHT, {
                fit: sharp.fit.cover,
            })
            .toFormat("jpeg")
            .toFile(`./public/images/devices/${nodePath}.full.jpg`)
        await sharp(imgsrc)
            .resize(LAZY_SIZE, LAZY_SIZE, {
                fit: sharp.fit.cover,
            })
            .toFormat("jpeg")
            .toFile(`./public/images/devices/${nodePath}.lazy.jpg`)
        await sharp(imgsrc)
            .resize(DEVICE_LIST_WIDTH, DEVICE_LIST_HEIGHT, {
                fit: sharp.fit.cover,
            })
            .toFormat("jpeg")
            .toFile(`./public/images/devices/${nodePath}.list.jpg`)
        await sharp(imgsrc)
            .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: sharp.fit.cover })
            .toFormat("jpeg")
            .toFile(`./public/images/devices/${nodePath}.avatar.jpg`)
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
    const companies = {}
    devices.forEach(
        node => (companies[escapeDeviceIdentifier(node.company)] = node.company)
    )
    //console.log(companies)
    for (const cp of Object.keys(companies)) {
        const company = companies[cp]
        const p = `/devices/${cp}`
        console.log(`device company page`, { p })
        createPage({
            path: p,
            component: slash(companyTemplate),
            context: {
                company: company,
                title: `${company} devices`,
            },
        })
    }
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
        await fs.outputFile(f, JSON.stringify(srv, null, 2))
    }

    for (const srv of services) {
        const f = path.join(
            dir,
            "services",
            "lite",
            `x${srv.classIdentifier.toString(16)}.json`
        )
        const clone = JSON.parse(JSON.stringify(srv))
        delete clone.notes
        delete clone.enums
        delete clone.constants
        delete clone.extends
        delete clone.shortName
        delete clone.name
        delete clone.tags
        for (var pkt of clone.packets) {
            delete pkt.description
            delete pkt.derived
            delete pkt.identifierName
            if (pkt.fields.length <= 1) delete pkt.fields
            else pkt.fields = pkt.fields.map(f => f.name)
        }
        await fs.outputFile(f, JSON.stringify(clone, null, 2))
    }

    // DeviceTwins
    for (const srv of serviceSpecificationsWithServiceTwinSpecification()) {
        const f = path.join(
            dir,
            "services",
            "twin",
            `x${srv.classIdentifier.toString(16)}.json`
        )
        const devicetwin = serviceSpecificationToServiceTwinSpecification(srv)
        await fs.outputFile(f, JSON.stringify(devicetwin, null, 2))
    }
}

async function createWorkers() {
    // copy jacdac-worker.js to static
    // include version number to bust out caching
    const jacdacTsPackageJson = fs.readJsonSync(`./jacdac-ts/package.json`)
    await fs.copy(
        `./jacdac-ts/dist/jacdac-worker.js`,
        `./public/jacdac-worker-${jacdacTsPackageJson.version}.js`
    )
}

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
    await generateServicesJSON()
    await createServicePages(graphql, actions, reporter)
    await createDevicePages(graphql, actions, reporter)
    await createDeviceQRPages(actions, reporter)
    await createWorkers()
    await createVersions()
    await createRedirects(actions)
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