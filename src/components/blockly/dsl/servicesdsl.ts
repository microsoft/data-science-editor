import {
    SRV_HID_KEYBOARD,
    SRV_DOT_MATRIX,
    SRV_SEVEN_SEGMENT_DISPLAY,
    SRV_CLOUD_ADAPTER,
} from "../../../../jacdac-ts/src/jdom/constants"

import KeyboardKeyField from "../fields/KeyboardKeyField"
import LEDMatrixField from "../fields/LEDMatrixField"
import {
    BlockDefinition,
    BlockReference,
    CategoryDefinition,
    CODE_STATEMENT_TYPE,
    CommandBlockDefinition,
    CustomBlockDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    EventBlockDefinition,
    identityTransformData,
    InputDefinition,
    LabelDefinition,
    OptionsInputDefinition,
    TextInputDefinition,
    TWIN_BLOCK,
    ValueInputDefinition,
    VariableInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage, {
    CompileCommandToVMOptions,
    CompileEventToVMResult,
    CreateBlocksOptions,
    CreateCategoryOptions,
} from "./dsl"
import JDomTreeField from "../fields/JDomTreeField"
import TwinField from "../fields/TwinField"
import {
    createServiceColor,
    fieldsToFieldInputs,
    fieldsToMessage,
    fieldsToValues,
    getServiceInfo,
    roleVariable,
    serviceHelp,
    ServicesBaseDSL,
    toRoleType,
    ROLE_BOUND_EVENT_BLOCK,
    ROLE_BOUND_BLOCK,
} from "./servicesbase"
import { humanify } from "../../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import jsep from "jsep"
import {
    toIdentifier,
    toMemberExpression,
} from "../../../../jacdac-ts/src/vm/compile"
import { makeVMBase } from "../../jacscript/JacscriptGenerator"
import { arrayConcatMany, toMap } from "../../../../jacdac-ts/src/jdom/utils"

const INSPECT_BLOCK = "jacdac_tools_inspect"
const commandColor = "#8c6a1d"
const JACSCRIPT_CLOUD_UPLOAD_ARGS = 3

export class ServicesBlockDomainSpecificLanguage
    extends ServicesBaseDSL
    implements BlockDomainSpecificLanguage
{
    id = "jacdacServices"
    // generic role blocks
    private _roleBlocks: BlockDefinition[]

    createBlocks(options: CreateBlocksOptions) {
        const { theme, clientSpecs } = options
        this.serviceColor = createServiceColor(theme)

        // pure service information here
        const {
            allServices,
            supportedServices,
            registers,
            events,
            commands,
            registerSimpleTypes,
            registerComposites,
            registerSimpleEnumTypes,
            registerCompositeEnumTypes,
        } = getServiceInfo()

        const resolveService = (cls: number): jdspec.ServiceSpec[] =>
            allServices.filter(srv => srv.classIdentifier === cls)

        const customClientBlockDefinitions: CustomBlockDefinition[] = [
            ...resolveService(SRV_CLOUD_ADAPTER).map(
                service =>
                    <CustomBlockDefinition>{
                        kind: "block",
                        type: "upload",
                        colour: this.serviceColor(service),
                        message0: `upload %1 %2 ${Array(
                            JACSCRIPT_CLOUD_UPLOAD_ARGS
                        )
                            .fill(0)
                            .map((_, i) => `%${i + 3}`)
                            .join(" ")}`,
                        args0: [
                            roleVariable(service),
                            <TextInputDefinition>{
                                type: "field_input",
                                name: "label",
                                spellcheck: false,
                                text: "data",
                            },
                            ...Array(JACSCRIPT_CLOUD_UPLOAD_ARGS)
                                .fill(0)
                                .map(
                                    (_, i) =>
                                        <ValueInputDefinition>{
                                            type: "input_value",
                                            name: `arg${i}`,
                                            check: "Number",
                                        }
                                ),
                        ],
                        values: {
                            ...toMap(
                                Array(1).fill(0),
                                (_, i) => `arg${i}`,
                                (_, i) => ({
                                    name: `arg${i}`,
                                    kind: "block",
                                    type: "math_number",
                                })
                            ),
                        },
                        previousStatement: CODE_STATEMENT_TYPE,
                        nextStatement: CODE_STATEMENT_TYPE,
                        inputsInline: true,
                        helpUrl: serviceHelp(service),
                        service,
                        tooltip: `Register a handler for a given cloud method`,
                        template: "custom",
                        compileCommand: options => {
                            const { block, blockToExpression } = options
                            const { inputs } = block
                            let label = inputs[0].fields["label"]
                                .value as string
                            if (label === undefined) label = ""
                            const { value: role } = inputs[0].fields["role"]
                            const exprsErrors = inputs
                                .filter(i => i.child)
                                .map(a => blockToExpression(undefined, a.child))
                            return {
                                cmd: makeVMBase(block, {
                                    type: "CallExpression",
                                    arguments: [
                                        <jsep.Literal>{
                                            type: "Literal",
                                            value: label,
                                            raw: `"${label}"`,
                                        },
                                        ...exprsErrors.map(e => e.expr),
                                    ],
                                    callee: toMemberExpression(
                                        role.toString(),
                                        "upload"
                                    ),
                                }),
                                errors: exprsErrors.flatMap(e => e.errors),
                            }
                        },
                    }
            ),
            ...resolveService(SRV_CLOUD_ADAPTER).map(
                service =>
                    <CustomBlockDefinition>{
                        kind: "block",
                        type: "on_method",
                        message0: `on %1 message %2`,
                        colour: this.serviceColor(service),
                        args0: [
                            roleVariable(service),
                            <TextInputDefinition>{
                                type: "field_input",
                                name: "label",
                                spellcheck: false,
                                text: "ping",
                            },
                        ],
                        nextStatement: CODE_STATEMENT_TYPE,
                        inputsInline: true,
                        helpUrl: serviceHelp(service),
                        service,
                        tooltip: `Register a handler for a given cloud method`,
                        template: "custom",
                        compileEvent: (options: CompileCommandToVMOptions) => {
                            const { block } = options
                            const { inputs } = block
                            const label = inputs[0].fields["label"]
                                .value as string
                            if (!label)
                                return <CompileEventToVMResult>{
                                    expression: <jsep.CallExpression>{
                                        type: "CallExpression",
                                        arguments: [],
                                        callee: toIdentifier("nop"),
                                    },
                                }

                            const { value: role } = inputs[0].fields["role"]
                            return <CompileEventToVMResult>{
                                expression: <jsep.CallExpression>{
                                    type: "CallExpression",
                                    arguments: [
                                        toIdentifier(role.toString()),
                                        <jsep.Literal>{
                                            type: "Literal",
                                            value: label,
                                            raw: `"${label}"`,
                                        },
                                    ],
                                    callee: toIdentifier("cloudMethod"),
                                },
                            }
                        },
                    }
            ),
            ...resolveService(SRV_HID_KEYBOARD).map(
                service =>
                    <CustomBlockDefinition>{
                        kind: "block",
                        type: `key`,
                        message0: `%1 %2 key %3`,
                        args0: [
                            roleVariable(service),
                            <OptionsInputDefinition>{
                                type: "field_dropdown",
                                name: "action",
                                options: [
                                    ["press", "press"],
                                    ["down", "down"],
                                    ["up", "up"],
                                ],
                            },
                            {
                                type: KeyboardKeyField.KEY,
                                name: "combo",
                            },
                        ],
                        colour: this.serviceColor(service),
                        inputsInline: true,
                        previousStatement: CODE_STATEMENT_TYPE,
                        nextStatement: CODE_STATEMENT_TYPE,
                        tooltip: `Send a keyboard key combo`,
                        helpUrl: serviceHelp(service),
                        service,
                        expression: `role.key(combo.selectors, combo.modifiers, action)`,
                        template: "custom",
                    }
            ),
            ...resolveService(SRV_SEVEN_SEGMENT_DISPLAY).map(
                service =>
                    <CustomBlockDefinition>{
                        kind: "block",
                        type: `set_digits`,
                        message0: `set %1 digits to %2`,
                        args0: [
                            roleVariable(service),
                            {
                                type: "input_value",
                                name: "digits",
                                check: "Number",
                            },
                        ],
                        values: {
                            digits: {
                                kind: "block",
                                type: "math_number",
                            },
                        },
                        colour: this.serviceColor(service),
                        inputsInline: true,
                        previousStatement: CODE_STATEMENT_TYPE,
                        nextStatement: CODE_STATEMENT_TYPE,
                        tooltip: `Display a number of the screen`,
                        helpUrl: serviceHelp(service),
                        service,
                        template: "custom",
                    }
            ),
            ...resolveService(SRV_DOT_MATRIX).map(
                service =>
                    <CustomBlockDefinition>{
                        kind: "block",
                        type: `show_dots`,
                        message0: `show %1 dots %2`,
                        args0: [
                            roleVariable(service),
                            {
                                type: LEDMatrixField.KEY,
                                name: "dots",
                            },
                        ],
                        colour: this.serviceColor(service),
                        inputsInline: true,
                        previousStatement: CODE_STATEMENT_TYPE,
                        nextStatement: CODE_STATEMENT_TYPE,
                        tooltip: `Display dots on the dot matrix`,
                        helpUrl: serviceHelp(service),
                        service,
                        // encode digits
                        template: "custom",
                        compileCommand: options => {
                            const { block, blockToExpression } = options
                            const { inputs } = block
                            const {
                                leds = "0",
                            }: {
                                leds: string
                                rows: number
                                columns: number
                            } = inputs[0].fields["dots"].value
                            const { value: role } = inputs[0].fields["role"]
                            const exprsErrors = inputs
                                .filter(i => i.child)
                                .map(a => blockToExpression(undefined, a.child))
                            return {
                                cmd: makeVMBase(block, {
                                    type: "CallExpression",
                                    arguments: [
                                        <jsep.Literal>{
                                            type: "Literal",
                                            value: leds,
                                            raw: `hex\`${leds}\``,
                                        },
                                        ...exprsErrors.map(e => e.expr),
                                    ],
                                    callee: toMemberExpression(
                                        role.toString(),
                                        "dots.write"
                                    ),
                                }),
                                errors: exprsErrors.flatMap(e => e.errors),
                            }
                        },
                    }
            ),
        ].map(def => {
            def.type = `jacdac_custom_${def.service.shortId.toLowerCase()}_${
                def.type
            }`
            return def
        })

        const eventSubscribeClientBlocks = events.map<EventBlockDefinition>(
            ({ service, events }) => ({
                kind: "block",
                type: `jacdac_events_${service.shortId}`,
                message0: `on %1 %2`,
                args0: [
                    roleVariable(service),
                    <InputDefinition>{
                        type: "field_dropdown",
                        name: "event",
                        options: events.map(event => [
                            humanify(event.name),
                            event.name,
                        ]),
                    },
                ],
                colour: this.serviceColor(service),
                inputsInline: true,
                nextStatement: CODE_STATEMENT_TYPE,
                tooltip: `Events for the ${service.name} service`,
                helpUrl: serviceHelp(service),
                service,
                events,
                template: "event",
            })
        )

        const eventWaitClientBlocks = events.map<EventBlockDefinition>(
            ({ service, events }) => ({
                kind: "block",
                type: `jacdac_events_wait_${service.shortId}`,
                message0: `wait %1 for %2`,
                args0: [
                    roleVariable(service),
                    <InputDefinition>{
                        type: "field_dropdown",
                        name: "event",
                        options: events.map(event => [
                            humanify(event.name),
                            event.name,
                        ]),
                    },
                ],
                colour: this.serviceColor(service),
                inputsInline: true,
                previousStatement: CODE_STATEMENT_TYPE,
                nextStatement: CODE_STATEMENT_TYPE,
                tooltip: `Wait for event for the ${service.name} service`,
                helpUrl: serviceHelp(service),
                service,
                events,
                template: "event",
            })
        )

        const registerChangeByEventClientBlocks =
            this.makeRegisterChangeByEventBlocks(registers)
        const registerSimpleGetClientBlocks =
            this.makeRegisterSimpleGetBlocks(registerSimpleTypes)
        const registerEnumGetClientBlocks = this.makeRegisterEnumGetBlocks([
            ...registerSimpleEnumTypes,
            ...registerCompositeEnumTypes,
        ])
        const registerNumericsGetClientBlocks =
            this.makeRegisterNumericsGetBlocks(registerComposites)
        const registerSetClientBlocks = this.makeRegisterSetBlocks(registers)

        const clientCommands = arrayConcatMany(
            clientSpecs?.map(spec =>
                spec.packets
                    .filter(pkt => pkt.kind === "command")
                    .map(command => ({
                        service: resolveService(spec.classIdentifier)[0],
                        command,
                    }))
            )
        )
        const allCommands = [...commands, ...(clientCommands || [])]

        const commandClientBlocks = allCommands.map<CommandBlockDefinition>(
            ({ service, command }) => ({
                kind: "block",
                type: `jacdac_command_${service.shortId}_${command.name}`,
                message0: !command.fields.length
                    ? `${humanify(command.name)} %1`
                    : `${humanify(command.name)} %1 with ${fieldsToMessage(
                          command
                      )}`,
                args0: [roleVariable(service), ...fieldsToFieldInputs(command)],
                values: fieldsToValues(service, command),
                inputsInline: true,
                colour: this.serviceColor(service),
                tooltip: command.description,
                helpUrl: serviceHelp(service),
                service,
                command,
                previousStatement: CODE_STATEMENT_TYPE,
                nextStatement: CODE_STATEMENT_TYPE,

                template: "command",
            })
        )

        this._serviceBlocks = [
            ...eventSubscribeClientBlocks,
            ...eventWaitClientBlocks,
            ...registerSimpleGetClientBlocks,
            ...registerEnumGetClientBlocks,
            ...registerNumericsGetClientBlocks,
            ...registerSetClientBlocks,
            ...commandClientBlocks,
            ...customClientBlockDefinitions,
            ...registerChangeByEventClientBlocks,
        ]

        this._eventFieldBlocks = this.makeFieldBlocks(
            events.map(p => ({ service: p.service, packets: p.events }))
        )

        // client only
        this._roleBlocks = [
            {
                kind: "block",
                type: ROLE_BOUND_EVENT_BLOCK,
                message0: "on %1 %2",
                args0: [
                    <VariableInputDefinition>{
                        type: "field_variable",
                        name: "role",
                        variable: "none",
                        variableTypes: [
                            "client",
                            ...supportedServices.map(srv => toRoleType(srv)),
                        ],
                        defaultType: "client",
                    },
                    <OptionsInputDefinition>{
                        type: "field_dropdown",
                        name: "event",
                        options: [
                            ["bound", "bound"],
                            ["unbound", "unbound"],
                        ],
                    },
                ],
                inputsInline: true,
                nextStatement: CODE_STATEMENT_TYPE,
                colour: commandColor,
                tooltip: "Runs code when a role is connected or disconnected",
                helpUrl: "",
                template: "role_binding_event",
            },
            {
                kind: "block",
                type: ROLE_BOUND_BLOCK,
                message0: "%1 bound",
                args0: [
                    <VariableInputDefinition>{
                        type: "field_variable",
                        name: "role",
                        variable: "none",
                        variableTypes: [
                            "client",
                            ...supportedServices.map(srv => toRoleType(srv)),
                        ],
                        defaultType: "client",
                    },
                ],
                output: "Boolean",
                inputsInline: true,
                colour: commandColor,
                tooltip: "Runs code when a role is connected or disconnected",
                helpUrl: "",
                template: "role_bound",
            },
        ]

        const toolsBlocks: BlockDefinition[] = [
            {
                kind: "block",
                type: TWIN_BLOCK,
                message0: `view %1 %2 %3`,
                args0: [
                    <VariableInputDefinition>{
                        type: "field_variable",
                        name: "role",
                        variable: "none",
                        variableTypes: [
                            "client",
                            ...supportedServices.map(srv => toRoleType(srv)),
                        ],
                        defaultType: "client",
                    },
                    {
                        type: "input_dummy",
                    },
                    <InputDefinition>{
                        type: TwinField.KEY,
                        name: "twin",
                    },
                ],
                colour: commandColor,
                inputsInline: false,
                tooltip: `Twin of role`,
                nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
                helpUrl: "",
                template: "meta",
                transformData: identityTransformData,
            },
            {
                kind: "block",
                type: INSPECT_BLOCK,
                message0: `inspect %1 %2 %3`,
                args0: [
                    <VariableInputDefinition>{
                        type: "field_variable",
                        name: "role",
                        variable: "none",
                        variableTypes: [
                            "client",
                            ...supportedServices.map(srv => toRoleType(srv)),
                        ],
                        defaultType: "client",
                    },
                    {
                        type: "input_dummy",
                    },
                    <InputDefinition>{
                        type: JDomTreeField.KEY,
                        name: "twin",
                    },
                ],
                colour: commandColor,
                inputsInline: false,
                tooltip: `Inspect a role`,
                helpUrl: "",
                template: "meta",
            },
        ]

        return <BlockDefinition[]>[
            ...this._serviceBlocks,
            ...this._eventFieldBlocks,
            ...this._roleBlocks,
            ...toolsBlocks,
        ]
    }

    createCategory(options: CreateCategoryOptions) {
        const makeServicesCategories = this.createCategoryHelper(options)

        const clientServicesCategories = makeServicesCategories(
            this._serviceBlocks,
            this._eventFieldBlocks
        )

        const commonCategory: CategoryDefinition = {
            kind: "category",
            name: "Roles",
            colour: commandColor,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: ROLE_BOUND_EVENT_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: ROLE_BOUND_BLOCK,
                },
                <LabelDefinition>{
                    kind: "label",
                    text: "Device Twins",
                },
                <BlockReference>{
                    kind: "block",
                    type: TWIN_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: INSPECT_BLOCK,
                },
            ],
        }

        return [...clientServicesCategories, commonCategory]
    }
}
const servicesDsl = new ServicesBlockDomainSpecificLanguage()
export default servicesDsl
