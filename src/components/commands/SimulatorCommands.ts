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

export const COMMAND_SIMULATOR_START = "simulator.start"

export default function SimulatorCommands() {
    const { addCommands } = useCommandPalette()
    useEffect(
        () =>
            addCommands([
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

* template names: ${serviceProviderDefinitions()
                        .map(s => `"${s.name}"`)
                        .join(", ")}
* service names: ${serviceSpecifications()
                        .filter(sc => !isInfrastructure(sc))
                        .map(s => `"${s.shortId}"`)
                        .join(", ")}
`,
                    handler: async (bus, args: { name: string }) => {
                        const { name } = args
                        const def = serviceProviderDefinitions().find(
                            d => d.name === name
                        )
                        if (def) addServiceProvider(bus, def)
                        else {
                            const srv = serviceSpecificationFromName(name)
                            if (srv)
                                startServiceProviderFromServiceClass(
                                    bus,
                                    srv.classIdentifier
                                )
                            else {
                                const id = parseIdentifier(name)
                                if (id)
                                    startServiceProviderFromServiceClass(
                                        bus,
                                        id
                                    )
                            }
                        }
                    },
                },
            ]),
        []
    )
    return null
}
