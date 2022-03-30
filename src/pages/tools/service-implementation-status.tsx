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
import { graphql, useStaticQuery, withPrefix } from "gatsby"
import CheckIcon from "@mui/icons-material/Check"
import ClearIcon from "@mui/icons-material/Clear"
import { Chip } from "@mui/material"
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
    const makecode = resolveMakecodeServiceFromClassIdentifier(classIdentifier)
    const makecodeExtension =
        makecode && makecodeExtensions.indexOf(shortId.toLowerCase()) > -1

    const available = (value: unknown) =>
        typeof value === "number" && value ? (
            <Chip icon={<CheckIcon color="success" />} label={value} />
        ) : value ? (
            <CheckIcon color="success" />
        ) : (
            <ClearIcon color="warning" />
        )

    return (
        <tr>
            <td>
                <a href={withPrefix(`/services/${shortId}/`)}>{name}</a>
            </td>
            <td>{available(devices?.length)}</td>
            <td>{available(serviceProvider)}</td>
            <td>{available(testRule?.length)}</td>
            <td>{available(testCommand)}</td>
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
                    headings: {
                        value: string
                    }[]
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
                        headings {
                            value
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
    console.log({ makecodeExtensions })

    const services = serviceSpecifications().sort(
        (l, r) => (isInfrastructure(l) ? 1 : 0) - (isInfrastructure(r) ? 1 : 0)
    )

    return (
        <>
            <h1>Service Implementation Status</h1>
            <table>
                <thead>
                    <tr>
                        <th>name</th>
                        <th>devices</th>
                        <th>simulator</th>
                        <th>test rules</th>
                        <th>test commands</th>
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
