import {
    addServiceProvider,
    serviceProviderDefinitions,
    startServiceProviderFromServiceClass,
} from "../../../jacdac-ts/src/servers/servers"
import { useEffect } from "react"
import { useCommandPalette } from "./CommandPaletteContext"
import { parseIdentifier } from "../../../jacdac-ts/src/jdom/utils"
import {
    isInfrastructure,
    serviceSpecificationFromName,
    serviceSpecifications,
} from "../../../jacdac-ts/src/jdom/spec"
import useHostedSimulators, {
    hostedSimulatorDefinitions,
} from "../HostedSimulatorsContext"

export const COMMAND_BUS_CONNECT = "bus.connect"
export const COMMAND_BUS_DISCONNECT = "bus.disconnect"
export const COMMAND_SIMULATOR_START = "simulator.start"

export default function SimulatorCommands() {
    const { addCommands } = useCommandPalette()
    const { addHostedSimulator } = useHostedSimulators()

    useEffect(
        () =>
            addCommands([
                {
                    id: COMMAND_BUS_CONNECT,
                    description: "start connecting the bus",
                    handler: bus => bus.connect(),
                },
                {
                    id: COMMAND_BUS_DISCONNECT,
                    description: "disconnect the bus",
                    handler: bus => bus.disconnect(),
                },
                {
                    id: COMMAND_SIMULATOR_START,
                    description:
                        "Starts a simulator from a named template, service name or service class",
                    help: () => `
This command launches a simulator from the list of existing simulator templates.

\`\`\`typescript
    ...
    args: {
        // template name, service name or service class
        name: string 
    }
\`\`\`

* hosted names: ${hostedSimulatorDefinitions()
                        .map(s => `\`"${s.name}"\``)
                        .join(", ")}
* simulator names: ${serviceProviderDefinitions()
                        .map(s => `\`"${s.name}"\``)
                        .join(", ")}
* service names: ${serviceSpecifications()
                        .filter(sc => !isInfrastructure(sc))
                        .map(s => `\`"${s.shortId}"\``)
                        .join(", ")}
`,
                    handler: async (bus, args: { name: string }) => {
                        const { name } = args
                        const hdef = hostedSimulatorDefinitions().find(
                            h => h.name === name
                        )
                        if (hdef) {
                            addHostedSimulator(hdef)
                            return
                        }
                        const def = serviceProviderDefinitions().find(
                            d => d.name === name
                        )
                        if (def) {
                            addServiceProvider(bus, def)
                            return
                        }

                        const srv = serviceSpecificationFromName(name)
                        if (srv) {
                            startServiceProviderFromServiceClass(
                                bus,
                                srv.classIdentifier
                            )
                            return
                        }
                        const id = parseIdentifier(name)
                        if (id) {
                            startServiceProviderFromServiceClass(bus, id)
                            return
                        }
                        throw new Error(`simulator ${name} not found`)
                    },
                },
            ]),
        []
    )
    return null
}
