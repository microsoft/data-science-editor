import {
    SRV_HID_KEYBOARD,
    SRV_LED,
    SRV_LED_MATRIX,
    SRV_SEVEN_SEGMENT_DISPLAY,
} from "../../../../jacdac-ts/src/jdom/constants"
import type { DataRecordWindowRequest } from "../../../workers/data/dist/node_modules/data.worker"

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
    NumberInputDefinition,
    OptionsInputDefinition,
    toolsColour,
    TWIN_BLOCK,
    ValueInputDefinition,
    VariableInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage, {
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
} from "./servicesbase"
import { humanify } from "../../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import { Block } from "blockly"
import postTransformData from "./workers/data.proxy"

const SET_STATUS_LIGHT_BLOCK = "jacdac_set_status_light"
const ROLE_BOUND_EVENT_BLOCK = "jacdac_role_bound_event"
const ROLE_BOUND_BLOCK = "jacdac_role_bound"
const RECORD_WINDOW_BLOCK = "jacdac_record_window"
const INSPECT_BLOCK = "jacdac_tools_inspect"
const commandColor = "#8c6a1d"

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
                        message0: `fade %1 to %2 at speed %3`,
                        args0: [
                            roleVariable(service),
                            {
                                type: "input_value",
                                name: "color",
                                check: "Number",
                            },
                            {
                                type: "input_value",
                                name: "speed",
                                check: "Number",
                            },
                        ],
                        values: {
                            color: {
                                kind: "block",
                                type: LEDColorField.SHADOW.type,
                            },
                            speed: {
                                kind: "block",
                                type: "jacdac_ratio",
                            },
                        },
                        colour: this.serviceColor(service),
                        inputsInline: true,
                        previousStatement: CODE_STATEMENT_TYPE,
                        nextStatement: CODE_STATEMENT_TYPE,
                        tooltip: `Fade LED color`,
                        helpUrl: serviceHelp(service),
                        service,
                        expression: `role.animate((color >> 16) & 0xff, (color >> 8) & 0xff, (color >> 0) & 0xff, speed * 0xff)`,
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
            ...resolveService(SRV_LED_MATRIX).map(
                service =>
                    <CustomBlockDefinition>{
                        kind: "block",
                        type: `show_leds`,
                        message0: `show %1 leds %2`,
                        args0: [
                            roleVariable(service),
                            {
                                type: LEDMatrixField.KEY,
                                name: "leds",
                            },
                        ],
                        colour: this.serviceColor(service),
                        inputsInline: true,
                        previousStatement: CODE_STATEMENT_TYPE,
                        nextStatement: CODE_STATEMENT_TYPE,
                        tooltip: `Display LEDs on the LED matrix`,
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
                        variable: "any",
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
                        variable: "any",
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
                message0: "set %1 status light to %2",
                args0: [
                    <VariableInputDefinition>{
                        type: "field_variable",
                        name: "role",
                        variable: "all",
                        variableTypes: [
                            "client",
                            ...supportedServices.map(srv => toRoleType(srv)),
                        ],
                        defaultType: "client",
                    },
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
                colour: toolsColour,
                inputsInline: false,
                tooltip: `Twin of the selected service`,
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
                colour: toolsColour,
                inputsInline: false,
                tooltip: `Inspect a service`,
                helpUrl: "",
                template: "meta",
            },
            <BlockDefinition>{
                kind: "block",
                type: RECORD_WINDOW_BLOCK,
                message0: "record last %1 s",
                args0: [
                    <NumberInputDefinition>{
                        type: "field_number",
                        name: "horizon",
                        value: 10,
                    },
                ],
                inputsInline: false,
                previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
                nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
                colour: toolsColour,
                template: "meta",
                dataPreviewField: true,
                transformData: async (
                    block: Block,
                    data: { time: number }[],
                    previousData: { time: number }[]
                ) => {
                    const horizon = block.getFieldValue("horizon") || 10
                    return postTransformData(<DataRecordWindowRequest>{
                        type: "record_window",
                        data,
                        previousData,
                        horizon,
                    })
                },
            },
        ]

        return [
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
            ],
        }

        const toolsCategory: CategoryDefinition = {
            kind: "category",
            name: "Tools",
            colour: toolsColour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: TWIN_BLOCK,
                },
                <BlockDefinition>{
                    kind: "block",
                    type: RECORD_WINDOW_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: INSPECT_BLOCK,
                },
            ],
        }

        return [...clientServicesCategories, commonCategory, toolsCategory]
    }
}
const servicesDSL = new ServicesBlockDomainSpecificLanguage()
export default servicesDSL
