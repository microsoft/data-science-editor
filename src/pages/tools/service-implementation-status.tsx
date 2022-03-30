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
import { withPrefix } from "gatsby"

function ServiceStatus(props: { service: jdspec.ServiceSpec }) {
    const { service } = props
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

    const available = (value: unknown) => (value ? "yes" : "")

    return (
        <tr>
            <td>
                <a href={withPrefix(`/services/${shortId}/`)}>{name}</a>
            </td>
            <td>{devices?.length || ""}</td>
            <td>{available(serviceProvider)}</td>
            <td>{testRule?.length || ""}</td>
            <td>{available(testCommand)}</td>
            <td>
                {makecode
                    ? makecode.client.generated
                        ? "generated"
                        : "custom"
                    : ""}
            </td>
        </tr>
    )
}

export default function Page() {
    const services = serviceSpecifications().sort(
        (l, r) => (isInfrastructure(l) ? 1 : 0) - (isInfrastructure(r) ? 1 : 0)
    )

    return (
        <>
            <h1>Service Implementation Status</h1>
            <table>
                <tr>
                    <th>name</th>
                    <th>devices</th>
                    <th>simulator</th>
                    <th>test rules</th>
                    <th>test commands</th>
                    <th>MakeCode</th>
                </tr>
                {services?.map(service => (
                    <ServiceStatus key={service.shortId} service={service} />
                ))}
            </table>
        </>
    )
}
