import { humanify } from "../../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import {
    CategoryDefinition,
    CODE_STATEMENT_TYPE,
    CommandBlockDefinition,
    ContentDefinition,
    EventBlockDefinition,
    InputDefinition,
    LabelDefinition,
    SeparatorDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage, {
    CreateBlocksOptions,
    CreateCategoryOptions,
} from "./dsl"
import {
    createServiceColor,
    fieldsToFieldInputs,
    fieldsToMessage,
    fieldsToValues,
    getServiceInfo,
    roleVariable,
    serviceHelp,
    ServiceRegister,
    ServicesBaseDSL,
} from "./servicesbase"

export class ServerServicesBlockDomainSpecificLanguage
    extends ServicesBaseDSL
    implements BlockDomainSpecificLanguage
{
    id = "jacdacServerServices"
    supportedServices: jdspec.ServiceSpec[] = []

    makeRegisterGetSetRequestBlocks(
        registers: ServiceRegister[],
        isGet: boolean
    ) {
        return registers
            .filter(
                r =>
                    (isGet &&
                        (r.register.kind === "ro" ||
                            r.register.kind === "rw")) ||
                    (!isGet && r.register.kind == "rw")
            )
            .map<EventBlockDefinition>(({ service, register }) => ({
                kind: "block",
                type: `jacdac_register_${isGet ? "get" : "set"}_request_${
                    service.shortId
                }_${register.name}`,
                message0: `on register ${isGet ? "get" : "set"} %1 ${humanify(
                    register.name
                )}`,
                args0: [roleVariable(service, false)],
                colour: this.serviceColor(service),
                inputsInline: true,
                nextStatement: CODE_STATEMENT_TYPE,
                tooltip: register.description,
                helpUrl: serviceHelp(service),
                service,
                events: [register],
                template: "event",
            }))
    }

    createBlocks(options: CreateBlocksOptions) {
        const { theme } = options
        this.serviceColor = createServiceColor(theme)

        // pure service information here
        const {
            registers,
            events,
            commands,
            registerSimpleTypes,
            registerComposites,
            registerSimpleEnumTypes,
            registerCompositeEnumTypes,
        } = getServiceInfo()

        const eventServerBlocks = events.flatMap<CommandBlockDefinition>(
            ({ service, events }) => {
                const eventsNoArgs = events.filter(ev => ev.fields.length === 0)
                const retNoArgs: CommandBlockDefinition = {
                    kind: "block",
                    type: `jacdac_raise_event_${service.shortId}`,
                    message0: `raise %1 %2`,
                    args0: [
                        roleVariable(service, false),
                        <InputDefinition>{
                            type: "field_dropdown",
                            name: "event",
                            options: eventsNoArgs.map(event => [
                                humanify(event.name),
                                event.name,
                            ]),
                        },
                    ],
                    inputsInline: true,
                    colour: this.serviceColor(service),
                    tooltip: `Events for the ${service.name} service`,
                    helpUrl: serviceHelp(service),
                    service,
                    command: undefined,
                    previousStatement: CODE_STATEMENT_TYPE,
                    nextStatement: CODE_STATEMENT_TYPE,

                    template: "raiseNo",
                }
                const eventsArgs = events.filter(ev => ev.fields.length)
                const retArgs = eventsArgs.map<CommandBlockDefinition>(ev => {
                    return {
                        kind: "block",
                        type: `jacdac_raise_event_${service.shortId}_${ev.name}`,
                        message0: !ev.fields.length
                            ? `raise %1 ${humanify(ev.name)}`
                            : `raise %1 ${humanify(
                                  ev.name
                              )} with ${fieldsToMessage(ev)}`,
                        args0: [
                            roleVariable(service, false),
                            ...fieldsToFieldInputs(ev),
                        ],
                        values: fieldsToValues(service, ev),
                        inputsInline: true,
                        colour: this.serviceColor(service),
                        tooltip: ev.description,
                        helpUrl: serviceHelp(service),
                        service,
                        command: ev,
                        previousStatement: CODE_STATEMENT_TYPE,
                        nextStatement: CODE_STATEMENT_TYPE,

                        template: "raiseArgs",
                    }
                })
                return [retNoArgs, ...retArgs]
            }
        )

        const registerSimpleGetServerBlocks = this.makeRegisterSimpleGetBlocks(
            registerSimpleTypes,
            false
        )
        const registerEnumGetServerBlocks = this.makeRegisterEnumGetBlocks(
            [...registerSimpleEnumTypes, ...registerCompositeEnumTypes],
            false
        )
        const registerNumericsGetServerBlocks =
            this.makeRegisterNumericsGetBlocks(registerComposites, false)
        const registerSetServerBlocks = this.makeRegisterSetBlocks(
            registers,
            false
        )
        const registerSetRequestBlocks = this.makeRegisterGetSetRequestBlocks(
            registers,
            false
        )
        const registerGetRequestBlocks = this.makeRegisterGetSetRequestBlocks(
            registers,
            true
        )

        const commandServerBlocks = commands.map<EventBlockDefinition>(
            ({ service, command }) => ({
                kind: "block",
                type: `jacdac_command_server_${service.shortId}_${command.name}`,
                message0: `on ${humanify(command.name)} %1`,
                args0: [roleVariable(service, false)],
                colour: this.serviceColor(service),
                inputsInline: true,
                nextStatement: CODE_STATEMENT_TYPE,
                tooltip: command.description,
                helpUrl: serviceHelp(service),
                service,
                events: [command],
                template: "event",
            })
        )

        this._serviceBlocks = [
            ...eventServerBlocks,
            ...registerSimpleGetServerBlocks,
            ...registerEnumGetServerBlocks,
            ...registerNumericsGetServerBlocks,
            ...registerSetServerBlocks,
            ...commandServerBlocks,
            ...registerSetRequestBlocks,
            ...registerGetRequestBlocks,
        ]

        this._eventFieldBlocks = this.makeFieldBlocks(
            commands.map(p => ({ service: p.service, packets: [p.command] })),
            false
        )

        return [...this._serviceBlocks, ...this._eventFieldBlocks]
    }

    createCategory(options: CreateCategoryOptions) {
        const makeServicesCategories = this.createCategoryHelper(options)

        const serverServicesCategories = makeServicesCategories(
            this._serviceBlocks,
            this._eventFieldBlocks,
            false
        )

        if (!serverServicesCategories?.length) return []

        return [
            <SeparatorDefinition>{
                kind: "sep",
            },
            {
                kind: "category",
                name: "Servers",
                contents: serverServicesCategories,
            } as CategoryDefinition,
        ]
    }
}
const serverServicesDSL = new ServerServicesBlockDomainSpecificLanguage()
export default serverServicesDSL
