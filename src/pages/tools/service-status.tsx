import {
    resolveTestRules,
    resolveServiceCommandTest,
} from "../../../jacdac-ts/src/testdom/testrules"
import React from "react"
import {
    isInfrastructure,
    serviceSpecifications,
} from "../../../jacdac-ts/src/jdom/spec"
import { serviceProviderDefinitionFromServiceClass } from "../../../jacdac-ts/src/servers/servers"
import useDeviceCatalog from "../../components/devices/useDeviceCatalog"
import useChange from "../../jacdac/useChange"
import { resolveMakecodeServiceFromClassIdentifier } from "../../components/makecode/services"
import { graphql, useStaticQuery } from "gatsby"
import CheckIcon from "@mui/icons-material/Check"
import ClearIcon from "@mui/icons-material/Clear"
import { Chip } from "@mui/material"
import { Link } from "gatsby-theme-material-ui"

const statuses: Record<jdspec.StabilityStatus, string> = {
    stable: "Stable",
    rc: "Release Candidate",
    experimental: "Experimental",
    deprecated: "Deprecated",
}

function ServiceStatus(props: {
    service: jdspec.ServiceSpec
    makecodeExtensions: string[]
}) {
    const { service, makecodeExtensions } = props
    const { shortId, name, classIdentifier } = service
    const catalog = useDeviceCatalog()
    const devices = useChange(catalog, _ =>
        _.specificationsForService(classIdentifier, { includeDeprecated: true })
    )
    const serviceProvider =
        serviceProviderDefinitionFromServiceClass(classIdentifier)
    const testRule = resolveTestRules(classIdentifier)
    const testCommand = resolveServiceCommandTest(classIdentifier)
    const customTest = !!testRule?.length || testCommand
    const makecode = resolveMakecodeServiceFromClassIdentifier(classIdentifier)
    const makecodeExtension =
        makecode && makecodeExtensions.indexOf(shortId.toLowerCase()) > -1

    const available = (value: unknown, allowMissing = false) =>
        typeof value === "number" && value ? (
            <Chip icon={<CheckIcon color="success" />} label={value} />
        ) : value ? (
            <CheckIcon color="success" />
        ) : allowMissing ? null : (
            <ClearIcon color="warning" />
        )

    return (
        <tr>
            <td>
                <Link to={`/services/${shortId}/`}>{name}</Link>
            </td>
            <td>{available(devices?.length)}</td>
            <td>{available(serviceProvider)}</td>
            <td>{available(customTest, true)}</td>
            <td>
                {makecode
                    ? makecode.client.generated
                        ? "generated"
                        : "custom"
                    : ""}
            </td>
            <td>{available(makecodeExtension)}</td>
        </tr>
    )
}

function ServiceStatusSection(props: {
    status: jdspec.StabilityStatus
    services: jdspec.ServiceSpec[]
    makecodeExtensions: string[]
}) {
    const { status, services, makecodeExtensions } = props
    return (
        <>
            <h2>{statuses[status]}</h2>
            <table>
                <thead>
                    <tr>
                        <th>name</th>
                        <th>devices</th>
                        <th>simulator</th>
                        <th>custom tests</th>
                        <th>MakeCode Extension</th>
                        <th>MakeCode Docs</th>
                    </tr>
                </thead>
                <tbody>
                    {services?.map(service => (
                        <ServiceStatus
                            key={service.shortId}
                            service={service}
                            makecodeExtensions={makecodeExtensions}
                        />
                    ))}
                </tbody>
            </table>
        </>
    )
}

export const frontmatter = {
    title: "Service Status",
    description: "Implementation status of services in clients, tests, firmware.",
}
import CoreHead from "../../components/shell/Head"
export const Head = (props) => <CoreHead {...props} {...frontmatter} />

export default function Page() {
    const query = useStaticQuery<{
        allMdx: {
            edges: {
                node: {
                    fields: {
                        slug: string
                    }
                    frontmatter: {
                        title?: string
                    }
                }
            }[]
        }
    }>(graphql`
        {
            allMdx(
                filter: {
                    fields: { slug: { glob: "/clients/makecode/extensions/*" } }
                }
            ) {
                edges {
                    node {
                        id
                        fields {
                            slug
                        }
                        frontmatter {
                            title
                        }
                    }
                }
            }
        }
    `)
    const makecodeExtensions = query.allMdx.edges
        .map(edge => edge.node)
        .sort((l, r) => l.fields.slug.localeCompare(r.fields.slug))
        .map(({ fields }) =>
            fields.slug.slice("/clients/makecode/extensions/".length, -1)
        )
        .map(p => p.toLowerCase())

    const services = serviceSpecifications().filter(
        srv => !isInfrastructure(srv)
    )

    return (
        <>
            <h1>Service Implementation Status</h1>
            {Object.keys(statuses).map((status: jdspec.StabilityStatus) => (
                <ServiceStatusSection
                    key={status}
                    status={status}
                    services={services.filter(srv => srv.status === status)}
                    makecodeExtensions={makecodeExtensions}
                />
            ))}
        </>
    )
}
