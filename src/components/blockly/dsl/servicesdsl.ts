import {
    SRV_HID_KEYBOARD,
    SRV_LED,
    SRV_DOT_MATRIX,
    SRV_SEVEN_SEGMENT_DISPLAY,
    SRV_JACSCRIPT_CLOUD,
} from "../../../../jacdac-ts/src/jdom/constants"

import KeyboardKeyField from "../fields/KeyboardKeyField"
import LEDColorField from "../fields/LEDColorField"
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
    SET_STATUS_LIGHT_BLOCK,
} from "./servicesbase"
import { humanify } from "../../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import jsep from "jsep"
import {
    toIdentifier,
    toMemberExpression,
} from "../../../../jacdac-ts/src/vm/compile"
import { makeVMBase } from "../../jacscript/JacscriptGenerator"
import { toMap } from "../../../../jacdac-ts/src/jdom/utils"

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
        const { theme } = options
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
            ...resolveService(SRV_JACSCRIPT_CLOUD).map(
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
            ...resolveService(SRV_JACSCRIPT_CLOUD).map(
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
            ...resolveService(SRV_LED).map(
                service =>
                    <CustomBlockDefinition>{
                        kind: "block",
                        type: `fade`,
                        message0: `set %1 to %2`,
                        args0: [
                            roleVariable(service),
                            {
                                type: "input_value",
                                name: "color",
                                check: "Number",
                            },
                        ],
                        values: {
                            color: {
                                kind: "block",
                                type: LEDColorField.SHADOW.type,
                            },
                        },
                        colour: this.serviceColor(service),
                        inputsInline: true,
                        previousStatement: CODE_STATEMENT_TYPE,
                        nextStatement: CODE_STATEMENT_TYPE,
                        tooltip: `Set LED color`,
                        helpUrl: serviceHelp(service),
                        service,
                        expression: `$role.animate(($color >> 16) & 0xff, ($color >> 8) & 0xff, ($color >> 0) & 0xff, 0)`,
                        template: "custom",
                        group: "",
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
                    }
            ),
        ].map(def => {
            def.type = `jacdac_custom_${def.service.shortId.toLowerCase()}_${
                def.type
            }`
            return def
        })

        const eventClientBlocks = events.map<EventBlockDefinition>(
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

        const commandClientBlocks = commands.map<CommandBlockDefinition>(
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
            ...eventClientBlocks,
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
            {
                kind: "block",
                type: SET_STATUS_LIGHT_BLOCK,
                message0: "set status light to %1",
                args0: [
                    <ValueInputDefinition>{
                        type: "input_value",
                        name: "color",
                        check: "Number",
                    },
                ],
                values: {
                    color: {
                        kind: "block",
                        type: LEDColorField.SHADOW.type,
                    },
                },
                inputsInline: true,
                previousStatement: CODE_STATEMENT_TYPE,
                nextStatement: CODE_STATEMENT_TYPE,
                colour: commandColor,
                tooltip: "Sets the color on the status light",
                helpUrl: "",
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
                            ...supportedServices.map(srv =>
                                toRoleType(srv, false)
                            ),
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
                <BlockReference>{
                    kind: "block",
                    type: SET_STATUS_LIGHT_BLOCK,
                    values: {
                        color: {
                            kind: "block",
                            type: LEDColorField.SHADOW.type,
                        },
                    },
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
const servicesDSL = new ServicesBlockDomainSpecificLanguage()
export default servicesDSL
