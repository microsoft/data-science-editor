import Blockly from "blockly"
import { useMemo } from "react"
import {
    JoystickReg,
    SRV_BOOTLOADER,
    SRV_CONTROL,
    SRV_HID_KEYBOARD,
    SRV_JOYSTICK,
    SRV_LOGGER,
    SRV_PROTO_TEST,
    SRV_ROLE_MANAGER,
    SRV_SETTINGS,
    SystemEvent,
    SystemReg,
} from "../../../jacdac-ts/src/jdom/constants"
import {
    humanify,
    isNumericType,
} from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import {
    isCommand,
    isEvent,
    isRegister,
    isSensor,
    serviceSpecifications,
} from "../../../jacdac-ts/src/jdom/spec"
import {
    arrayConcatMany,
    SMap,
    splitFilter,
    toMap,
    uniqueMap,
} from "../../../jacdac-ts/src/jdom/utils"
import useServices from "../hooks/useServices"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { Theme, useTheme } from "@material-ui/core"
import { withPrefix } from "gatsby-link"
import { registerFields } from "./fields/fields"
import KeyboardKeyField from "./fields/KeyboardKeyField"

const NEW_PROJET_XML = '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>'

export interface InputDefinition {
    type: string
    name: string
    variable?: string
    variableTypes?: string[]
    defaultType?: string
    check?: string | string[]
}

export interface OptionsInputDefinition extends InputDefinition {
    options?: [string, string][]
}

export interface NumberInputDefinition extends InputDefinition {
    min?: number
    max?: number
    precision?: number
}

export interface ColorInputDefnition extends InputDefinition {
    color?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BlockReference {
    kind: "block"
    type: string
    values?: SMap<BlockReference>
    blockxml?: string

    value?: number
    min?: number
    max?: number
}

export type EventTemplate = "event"

export type RegisterTemplate =
    | "register_change_event"
    | "register_set"
    | "register_get"

export type CommandTemplate = "command"

export type CustomTemplate = "custom"

export type BlockTemplate =
    | EventTemplate
    | RegisterTemplate
    | CommandTemplate
    | CustomTemplate

export interface BlockDefinition extends BlockReference {
    message0?: string
    args0?: InputDefinition[]
    colour?: number | string
    inputsInline?: boolean
    previousStatement?: string | string[]
    nextStatement?: string | string[]
    tooltip?: string
    helpUrl?: string
    style?: string
    output?: string
    extensions?: string[]
    template?: BlockTemplate
}

export interface ButtonDefinition {
    kind: "button"
    text: string
    callbackKey: string
    service: jdspec.ServiceSpec
}

export interface ServiceBlockDefinition extends BlockDefinition {
    template: BlockTemplate
    service: jdspec.ServiceSpec
}

export interface EventBlockDefinition extends ServiceBlockDefinition {
    template: EventTemplate
    events: jdspec.PacketInfo[]
}

export interface RegisterBlockDefinition extends ServiceBlockDefinition {
    template: RegisterTemplate
    register: jdspec.PacketInfo
    field?: jdspec.PacketMember
}

export interface CommandBlockDefinition extends ServiceBlockDefinition {
    kind: "block"
    template: CommandTemplate
    command: jdspec.PacketInfo
}

export interface CustomBlockDefinition extends ServiceBlockDefinition {
    kind: "block"
    template: CustomTemplate
    command: string
}

export const WHILE_CONDITION_BLOCK = "jacdac_while_event"
export const WHILE_CONDITION_BLOCK_CONDITION = "condition"
export const WAIT_BLOCK = "jacdac_wait"
export const SET_STATUS_LIGHT_BLOCK = "jacdac_set_status_light"

export interface CategoryDefinition {
    kind: "category"
    name: string
    custom?: string
    colour?: string
    categorystyle?: string
    contents?: (BlockDefinition | ButtonDefinition)[]
    button?: ButtonDefinition
}

export interface SeparatorDefinition {
    kind: "sep"
}

export type ToolboxNode = SeparatorDefinition | CategoryDefinition

export interface ToolboxConfiguration {
    kind: "categoryToolbox"
    contents: ToolboxNode[]
}

type CachedBlockDefinitions = {
    blocks: BlockDefinition[]
    serviceBlocks: ServiceBlockDefinition[]
    services: jdspec.ServiceSpec[]
}

function isBooleanField(field: jdspec.PacketMember) {
    return field.type === "bool"
}
function isStringField(field: jdspec.PacketMember) {
    return field.type === "string"
}
function toBlocklyType(field: jdspec.PacketMember) {
    return isBooleanField(field)
        ? "Boolean"
        : isStringField(field)
        ? "String"
        : isNumericType(field)
        ? "Number"
        : undefined
}
function enumInfo(srv: jdspec.ServiceSpec, field: jdspec.PacketMember) {
    const e = srv.enums?.[field.type]
    return e
}

const ignoredServices = [
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_ROLE_MANAGER,
    SRV_PROTO_TEST,
    SRV_SETTINGS,
    SRV_BOOTLOADER,
]
const ignoredEvents = [SystemEvent.StatusCodeChanged]
const includedRegisters = [
    SystemReg.Reading,
    SystemReg.Value,
    SystemReg.Intensity,
]

const customMessages = [
    {
        service: SRV_JOYSTICK,
        register: JoystickReg.Direction,
        field: "buttons",
        get: "is %1 %2 pressed",
    },
]

function createBlockTheme(theme: Theme) {
    const sensorColor = theme.palette.success.main
    const otherColor = theme.palette.info.main
    const commandColor = theme.palette.warning.main
    const serviceColor = (srv: jdspec.ServiceSpec) =>
        isSensor(srv) ? sensorColor : otherColor
    return { serviceColor, sensorColor, commandColor, otherColor }
}

function loadBlocks(
    serviceColor: (srv: jdspec.ServiceSpec) => string,
    commandColor: string
): CachedBlockDefinitions {
    const serviceHelp = (service: jdspec.ServiceSpec) =>
        withPrefix(`/services/${service.shortId}`)
    const fieldsSupported = (pkt: jdspec.PacketInfo) =>
        pkt.fields.every(toBlocklyType)
    const fieldName = (reg: jdspec.PacketInfo, field: jdspec.PacketMember) =>
        field.name === "_" ? reg.name : field.name
    const fieldToShadow = (field: jdspec.PacketMember): BlockReference =>
        isBooleanField(field)
            ? { kind: "block", type: "jacdac_on_off" }
            : isStringField(field)
            ? { kind: "block", type: "text" }
            : field.unit === "°"
            ? {
                  kind: "block",
                  type: "jacdac_angle",
              }
            : field.unit === "/"
            ? { kind: "block", type: "jacdac_ratio" }
            : /^%/.test(field.unit)
            ? { kind: "block", type: "jacdac_percent" }
            : field.type === "u8"
            ? { kind: "block", type: "jacdac_byte" }
            : {
                  kind: "block",
                  type: "math_number",
                  value: field.defaultValue || 0,
                  min: field.typicalMin || field.absoluteMin,
                  max: field.typicalMax || field.absoluteMax,
              }
    const variableName = (srv: jdspec.ServiceSpec) =>
        `${humanify(srv.camelName).toLowerCase()} 1`
    const fieldVariable = (service: jdspec.ServiceSpec): InputDefinition => ({
        type: "field_variable",
        name: "role",
        variable: variableName(service),
        variableTypes: [service.shortId],
        defaultType: service.shortId,
    })
    const fieldsToFieldInputs = (info: jdspec.PacketInfo) =>
        info.fields.map(field => ({
            type: "input_value",
            name: fieldName(info, field),
            check: toBlocklyType(field),
        }))
    const fieldsToValues = (info: jdspec.PacketInfo) =>
        toMap<jdspec.PacketMember, BlockReference | BlockDefinition>(
            info.fields,
            field => fieldName(info, field),
            field => fieldToShadow(field)
        )
    const fieldsToMessage = (info: jdspec.PacketInfo) =>
        info.fields
            .map((field, i) => `${humanify(field.name)} %${2 + i}`)
            .join(" ")
    const isEnabledRegister = (info: jdspec.PacketInfo) =>
        info.fields.length === 1 &&
        info.fields[0].type === "bool" &&
        info.name === "enabled"
    const customMessage = (
        srv: jdspec.ServiceSpec,
        reg: jdspec.PacketInfo,
        field: jdspec.PacketMember
    ) =>
        customMessages.find(
            m =>
                m.service === srv.classIdentifier &&
                m.register === reg.identifier &&
                m.field === field.name
        )

    const allServices = serviceSpecifications()
        .filter(
            service =>
                !/^_/.test(service.shortId) && service.status !== "deprecated"
        )
        .filter(service => ignoredServices.indexOf(service.classIdentifier) < 0)
    const resolveService = (cls: number): jdspec.ServiceSpec[] =>
        allServices.filter(srv => srv.classIdentifier === cls)
    const registers = allServices
        .map(service => ({
            service,
            register: service.packets.find(
                pkt =>
                    isRegister(pkt) &&
                    includedRegisters.indexOf(pkt.identifier) > -1
            ),
        }))
        .filter(kv => !!kv.register)
    const events = allServices
        .map(service => ({
            service,
            events: service.packets.filter(
                pkt => isEvent(pkt) && ignoredEvents.indexOf(pkt.identifier) < 0
            ),
        }))
        .filter(kv => !!kv.events.length)
    const commands = arrayConcatMany(
        allServices.map(service =>
            service.packets
                .filter(pkt => isCommand(pkt) && fieldsSupported(pkt))
                .map(pkt => ({
                    service,
                    command: pkt,
                }))
        )
    )

    const customBlockDefinitions: CustomBlockDefinition[] = [
        ...resolveService(SRV_HID_KEYBOARD).map(
            service =>
                <CustomBlockDefinition>{
                    kind: "block",
                    type: ``, // filled up later
                    message0: `send %1 key %2`,
                    args0: [
                        fieldVariable(service),
                        {
                            type: KeyboardKeyField.KEY,
                            name: "key",
                        },
                    ],
                    colour: serviceColor(service),
                    inputsInline: true,
                    previousStatement: null,
                    nextStatement: null,
                    tooltip: `Send a keyboard key combo`,
                    helpUrl: serviceHelp(service),
                    service,
                    command: "send_key",
                    template: "custom",
                }
        ),
    ].map(def => {
        def.type = `jacdac_custom_${def.service.shortId}_${def.command}`
        return def
    })

    const eventBlocks = events.map<EventBlockDefinition>(
        ({ service, events }) => ({
            kind: "block",
            type: `jacdac_events_${service.shortId}`,
            message0: `when %1 %2`,
            args0: [
                fieldVariable(service),
                <InputDefinition>{
                    type: "field_dropdown",
                    name: "event",
                    options: events.map(event => [
                        humanify(event.name),
                        event.name,
                    ]),
                },
            ],
            colour: serviceColor(service),
            inputsInline: true,
            nextStatement: null,
            tooltip: `Events for the ${service.name} service`,
            helpUrl: serviceHelp(service),
            service,
            events,
            template: "event",
        })
    )

    const registerChangeByEventBlocks = registers
        .filter(
            ({ service }) =>
                !service.packets.some(
                    pkt =>
                        isEvent(pkt) &&
                        ignoredEvents.indexOf(pkt.identifier) < 0
                )
        )
        .filter(
            ({ register }) =>
                register.fields.length === 1 &&
                isNumericType(register.fields[0]) &&
                register.identifier !== SystemReg.Intensity
        )
        .map<RegisterBlockDefinition>(({ service, register }) => ({
            kind: "block",
            type: `jacdac_change_by_events_${service.shortId}_${register.name}`,
            message0: `when %1 ${humanify(register.name)} change by %2`,
            args0: [
                fieldVariable(service),
                ...fieldsToFieldInputs(register),
            ].filter(v => !!v),
            values: fieldsToValues(register),
            inputsInline: true,
            nextStatement: null,
            colour: serviceColor(service),
            tooltip: `Event raised when ${register.name} changes`,
            helpUrl: serviceHelp(service),
            service,
            register,

            template: "register_change_event",
        }))

    const [registerSimples, registerComposites] = splitFilter(
        registers,
        reg => reg.register.fields.length == 1
    )
    const [registerSimpleTypes, registerSimpleOthers] = splitFilter(
        registerSimples,
        ({ register }) => !!toBlocklyType(register.fields[0])
    )
    const registerSimplesGetBlocks =
        registerSimpleTypes.map<RegisterBlockDefinition>(
            ({ service, register }) => ({
                kind: "block",
                type: `jacdac_get_simple_${service.shortId}_${register.name}`,
                message0:
                    customMessage(service, register, register.fields[0])?.get ||
                    `%1 ${humanify(register.name)}`,
                args0: [fieldVariable(service)],
                inputsInline: true,
                output: toBlocklyType(register.fields[0]),
                colour: serviceColor(service),
                tooltip: register.description,
                helpUrl: serviceHelp(service),
                service,
                register,
                field: register.fields[0],

                template: "register_get",
            })
        )
    const registerSimpleEnumTypes = registerSimpleOthers
        .filter(
            ({ service, register }) => !!enumInfo(service, register.fields[0])
        )
        .map(({ service, register }) => ({
            service,
            register,
            field: register.fields[0],
            einfo: enumInfo(service, register.fields[0]),
        }))
    const registerCompositeEnumTypes = arrayConcatMany(
        registerComposites.map(({ service, register }) =>
            register.fields
                .map(field => ({
                    service,
                    register,
                    field,
                    einfo: enumInfo(service, field),
                }))
                .filter(({ einfo }) => !!einfo)
        )
    )
    const registerEnumGetBlocks = [
        ...registerSimpleEnumTypes,
        ...registerCompositeEnumTypes,
    ].map<RegisterBlockDefinition>(({ service, register, field, einfo }) => ({
        kind: "block",
        type: `jacdac_get_enum_${service.shortId}_${register.name}_${field.name}`,
        message0:
            customMessage(service, register, field)?.get ||
            `%1 ${humanify(register.name)}${
                field.name === "_" ? "" : ` ${field.name}`
            } %2`,
        args0: [
            fieldVariable(service),
            <OptionsInputDefinition>{
                type: "field_dropdown",
                name: field.name,
                options: Object.keys(einfo.members).map(member => [
                    humanify(member),
                    member,
                ]),
            },
        ],
        inputsInline: true,
        output: "Boolean",
        colour: serviceColor(service),
        tooltip: register.description,
        helpUrl: serviceHelp(service),
        service,
        register,
        field,

        template: "register_get",
    }))

    const registerNumericsGetBlocks = registerComposites
        .filter(re => re.register.fields.some(isNumericType))
        .map<RegisterBlockDefinition>(({ service, register }) => ({
            kind: "block",
            type: `jacdac_get_numerics_${service.shortId}_${register.name}`,
            message0: `%1 ${humanify(register.name)}${
                register.fields.length > 1 ? ` %2` : ""
            }`,
            args0: [
                fieldVariable(service),
                register.fields.length > 1
                    ? <OptionsInputDefinition>{
                          type: "field_dropdown",
                          name: "field",
                          options: register.fields
                              .filter(f => isNumericType(f))
                              .map(field => [
                                  humanify(field.name),
                                  fieldName(register, field),
                              ]),
                      }
                    : undefined,
            ].filter(v => !!v),
            inputsInline: true,
            output: "Number",
            colour: serviceColor(service),
            tooltip: register.description,
            helpUrl: serviceHelp(service),
            service,
            register,

            template: "register_get",
        }))

    const registerSetBlocks = registers
        .filter(({ register }) => register.kind === "rw")
        .filter(({ register }) => fieldsSupported(register))
        .map<RegisterBlockDefinition>(({ service, register }) => ({
            kind: "block",
            type: `jacdac_set_${service.shortId}_${register.name}`,
            message0: isEnabledRegister(register)
                ? `set %1 %2`
                : `set %1 ${register.name} to ${
                      register.fields.length === 1
                          ? "%2"
                          : fieldsToMessage(register)
                  }`,
            args0: [fieldVariable(service), ...fieldsToFieldInputs(register)],
            values: fieldsToValues(register),
            inputsInline: true,
            colour: serviceColor(service),
            tooltip: register.description,
            helpUrl: serviceHelp(service),
            service,
            register,
            previousStatement: null,
            nextStatement: null,

            template: "register_set",
        }))

    const commandBlocks = commands.map<CommandBlockDefinition>(
        ({ service, command }) => ({
            kind: "block",
            type: `jacdac_command_${service.shortId}_${command.name}`,
            message0: !command.fields.length
                ? `${humanify(command.name)} %1`
                : `${humanify(command.name)} %1 with ${fieldsToMessage(
                      command
                  )}`,
            args0: [fieldVariable(service), ...fieldsToFieldInputs(command)],
            values: fieldsToValues(command),
            inputsInline: true,
            colour: serviceColor(service),
            tooltip: command.description,
            helpUrl: serviceHelp(service),
            service,
            command,
            previousStatement: null,
            nextStatement: null,

            template: "command",
        })
    )

    const serviceBlocks: ServiceBlockDefinition[] = [
        ...eventBlocks,
        ...registerChangeByEventBlocks,
        ...registerSimplesGetBlocks,
        ...registerEnumGetBlocks,
        ...registerNumericsGetBlocks,
        ...registerSetBlocks,
        ...customBlockDefinitions,
        ...commandBlocks,
    ]

    const shadowBlocks: BlockDefinition[] = [
        {
            kind: "block",
            type: `jacdac_on_off`,
            message0: `%1`,
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "value",
                    options: [
                        ["on", "on"],
                        ["off", "off"],
                    ],
                },
            ],
            style: "logic_blocks",
            output: "Boolean",
        },
        {
            kind: "block",
            type: `jacdac_time_picker`,
            message0: `%1`,
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "value",
                    options: [
                        ["0.1", "0.1"],
                        ["1", "1"],
                        ["5", "5"],
                        ["30", "30"],
                        ["60", "60"],
                    ],
                },
            ],
            style: "math_blocks",
            output: "Number",
        },
        {
            kind: "block",
            type: `jacdac_angle`,
            message0: `%1`,
            args0: [
                <NumberInputDefinition>{
                    type: "field_angle",
                    name: "value",
                    min: 0,
                    max: 360,
                    precision: 10,
                },
            ],
            style: "math_blocks",
            output: "Number",
        },
        {
            kind: "block",
            type: `jacdac_percent`,
            message0: `%1`,
            args0: [
                <NumberInputDefinition>{
                    type: "field_slider",
                    name: "value",
                    min: 0,
                    max: 100,
                    precision: 1,
                },
            ],
            style: "math_blocks",
            output: "Number",
        },
        {
            kind: "block",
            type: `jacdac_byte`,
            message0: `%1`,
            args0: [
                <NumberInputDefinition>{
                    type: "field_slider",
                    name: "value",
                    min: 0,
                    max: 255,
                    precision: 1,
                },
            ],
            style: "math_blocks",
            output: "Number",
        },
        {
            kind: "block",
            type: `jacdac_ratio`,
            message0: `%1`,
            args0: [
                <NumberInputDefinition>{
                    type: "field_slider",
                    name: "value",
                    min: 0,
                    max: 1,
                    precision: 0.1,
                },
            ],
            style: "math_blocks",
            output: "Number",
        },
        {
            kind: "block",
            type: `jacdac_color`,
            message0: `%1`,
            args0: [
                <ColorInputDefnition>{
                    type: "field_colour",
                    name: "col",
                    colour: "#ff0000",
                    colourOptions: [
                        "#ff0000",
                        "#ff8000",
                        "#ffff00",
                        "#ff9da5",
                        "#00ff00",
                        "#b09eff",
                        "#00ffff",
                        "#007fff",
                        "#65471f",
                        "#0000ff",
                        "#7f00ff",
                        "#ff0080",
                        "#ff00ff",
                        "#ffffff",
                        "#999999",
                        "#000000",
                    ],
                    columns: 4,
                },
            ],
            style: "math_blocks",
            output: "Color",
        },
    ]

    const runtimeBlocks: BlockDefinition[] = [
        {
            kind: "block",
            type: WHILE_CONDITION_BLOCK,
            message0: "while %1",
            args0: [
                {
                    type: "input_value",
                    name: WHILE_CONDITION_BLOCK_CONDITION,
                    check: "Boolean",
                },
            ],
            colour: commandColor,
            inputsInline: true,
            nextStatement: "Statement",
            tooltip: "",
            helpUrl: "",
        },
        {
            kind: "block",
            type: WAIT_BLOCK,
            message0: "wait %1 s",
            args0: [
                {
                    type: "input_value",
                    name: "time",
                    check: "Number",
                },
            ],
            inputsInline: true,
            previousStatement: "Statement",
            nextStatement: "Statement",
            colour: commandColor,
            tooltip: "Wait the desired time",
            helpUrl: "",
        },
        {
            kind: "block",
            type: SET_STATUS_LIGHT_BLOCK,
            message0: "set %1 status to %2",
            args0: [
                {
                    type: "field_variable",
                    name: "role",
                    variable: "all",
                    variableTypes: [
                        "client",
                        ...allServices.map(service => service.shortId),
                    ],
                    defaultType: "client",
                },
                {
                    type: "input_value",
                    name: "color",
                    check: "Color",
                },
            ],
            inputsInline: true,
            previousStatement: "Statement",
            nextStatement: "Statement",
            colour: commandColor,
            tooltip: "Sets the color on the status light",
            helpUrl: "",
        },
    ]

    const mathBlocks: BlockDefinition[] = [
        {
            kind: "block",
            type: "jacdac_math_arithmetic",
            message0: "%1 %2 %3",
            args0: [
                {
                    type: "input_value",
                    name: "A",
                    check: "Number",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "OP",
                    options: [
                        ["%{BKY_MATH_ADDITION_SYMBOL}", "ADD"],
                        ["%{BKY_MATH_SUBTRACTION_SYMBOL}", "MINUS"],
                        ["%{BKY_MATH_MULTIPLICATION_SYMBOL}", "MULTIPLY"],
                        ["%{BKY_MATH_DIVISION_SYMBOL}", "DIVIDE"],
                    ],
                },
                {
                    type: "input_value",
                    name: "B",
                    check: "Number",
                },
            ],
            inputsInline: true,
            output: "Number",
            style: "math_blocks",
            helpUrl: "%{BKY_MATH_ARITHMETIC_HELPURL}",
            extensions: ["math_op_tooltip"],
        },
        {
            kind: "block",
            type: "jacdac_math_single",
            message0: "%1 %2",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "OP",
                    options: [
                        ["-", "NEG"],
                        ["%{BKY_MATH_SINGLE_OP_ABSOLUTE}", "ABS"],
                    ],
                },
                {
                    type: "input_value",
                    name: "NUM",
                    check: "Number",
                },
            ],
            output: "Number",
            style: "math_blocks",
            helpUrl: "%{BKY_MATH_SINGLE_HELPURL}",
            extensions: ["math_op_tooltip"],
        },
    ]

    const blocks: BlockDefinition[] = [
        ...serviceBlocks,
        ...runtimeBlocks,
        ...shadowBlocks,
        ...mathBlocks,
    ]

    // register field editors
    registerFields()
    // re-register blocks with blocklys
    blocks.map(
        block =>
            (Blockly.Blocks[block.type] = {
                init: function () {
                    this.jsonInit(block)
                },
            })
    )

    // final mapping
    const jdBlocks = serviceBlocks.filter(block => !!block.service)
    const services = uniqueMap(
        jdBlocks,
        block => block.service.shortId,
        block => block.service
    )

    return {
        blocks,
        serviceBlocks,
        services,
    }
}

export const BUILTIN_TYPES = ["", "Boolean", "Number", "String"]
export function scanServices(workspace: Blockly.Workspace) {
    const variables = Blockly.Variables.allUsedVarModels(workspace).filter(
        v => BUILTIN_TYPES.indexOf(v.type) < 0
    ) // remove buildins
    const services = variables.map(v => v.type)
    return services
}

function patchCategoryJSONtoXML(cat: CategoryDefinition): CategoryDefinition {
    if (cat.button) {
        if (!cat.contents) cat.contents = []
        cat.contents.unshift(cat.button)
    }
    cat.contents
        ?.filter(node => node.kind === "block")
        .map(node => <BlockReference>node)
        .filter(block => !!block.values && Blockly.Blocks[block.type]) // avoid broken blocks
        .forEach(block => {
            // yup, this suck but we have to go through it
            block.blockxml = `<block type="${block.type}">${Object.keys(
                block.values
            )
                .map(name => {
                    const { type } = block.values[name]
                    return `<value name="${name}"><shadow type="${type}" /></value>`
                })
                .join("\n")}</block>`
            delete block.type
        })
    return cat
}

export default function useToolbox(blockServices?: string[]): {
    serviceBlocks: BlockDefinition[]
    toolboxConfiguration: ToolboxConfiguration
    newProjectXml: string
} {
    const theme = useTheme()
    const { serviceColor, commandColor } = createBlockTheme(theme)
    const { serviceBlocks, services } = useMemo(
        () => loadBlocks(serviceColor, commandColor),
        [theme]
    )
    const liveServices = useServices({ specification: true })

    const toolboxServices: jdspec.ServiceSpec[] = uniqueMap(
        Flags.diagnostics
            ? services
            : [
                  ...blockServices
                      .map(srvid =>
                          services.find(service => service.shortId === srvid)
                      )
                      .filter(srv => !!srv),
                  ...liveServices.map(srv => srv.specification),
              ],
        srv => srv.shortId,
        srv => srv
    )
        .filter(srv => srv && ignoredServices.indexOf(srv.classIdentifier) < 0)
        .sort((l, r) => l.name.localeCompare(r.name))

    const servicesCategories: CategoryDefinition[] = toolboxServices
        .map(service => ({
            service,
            serviceBlocks: serviceBlocks.filter(
                block => block.service === service
            ),
        }))
        .map<CategoryDefinition>(({ service, serviceBlocks }) => ({
            kind: "category",
            name: service.name,
            colour: serviceColor(service),
            contents: serviceBlocks.map(block => ({
                kind: "block",
                type: block.type,
                values: block.values,
            })),
            button: {
                kind: "button",
                text: `Add ${service.name}`,
                callbackKey: `jacdac_add_role_callback_${service.shortId}`,
                service,
            },
        }))
        .filter(cat => !!cat.contents?.length)

    const commandsCategory: CategoryDefinition = {
        kind: "category",
        name: "Commands",
        colour: commandColor,
        contents: [
            <BlockDefinition>{
                kind: "block",
                type: WHILE_CONDITION_BLOCK,
            },
            <BlockDefinition>{
                kind: "block",
                type: WAIT_BLOCK,
                values: {
                    time: { kind: "block", type: "jacdac_time_picker" },
                },
            },
            !!toolboxServices.length &&
                <BlockDefinition>{
                    kind: "block",
                    type: SET_STATUS_LIGHT_BLOCK,
                    values: {
                        color: { kind: "block", type: "jacdac_color" },
                    },
                },
        ].filter(b => !!b),
    }

    const logicCategory: CategoryDefinition = {
        kind: "category",
        name: "Logic",
        colour: "%{BKY_LOGIC_HUE}",
        contents: [
            {
                kind: "block",
                type: "dynamic_if",
            },
            {
                kind: "block",
                type: "logic_compare",
                values: {
                    A: { kind: "block", type: "math_number" },
                    B: { kind: "block", type: "math_number" },
                },
            },
            {
                kind: "block",
                type: "logic_operation",
                values: {
                    A: { kind: "block", type: "logic_boolean" },
                    B: { kind: "block", type: "logic_boolean" },
                },
            },
            {
                kind: "block",
                type: "logic_negate",
                values: {
                    BOOL: { kind: "block", type: "logic_boolean" },
                },
            },
            {
                kind: "block",
                type: "logic_boolean",
            },
        ],
    }

    const mathCategory: CategoryDefinition = {
        kind: "category",
        name: "Math",
        colour: "%{BKY_MATH_HUE}",
        contents: [
            {
                kind: "block",
                type: "jacdac_math_arithmetic",
                values: {
                    A: { kind: "block", type: "math_number" },
                    B: { kind: "block", type: "math_number" },
                },
            },
            {
                kind: "block",
                type: "jacdac_math_single",
                values: {
                    NUM: {
                        kind: "block",
                        type: "math_number",
                    },
                },
            },
            { kind: "block", type: "math_number" },
        ],
    }

    const variablesCategory: CategoryDefinition = {
        kind: "category",
        name: "Variables",
        colour: "%{BKY_VARIABLES_HUE}",
        custom: "VARIABLE",
    }

    const toolboxConfiguration: ToolboxConfiguration = {
        kind: "categoryToolbox",
        contents: [
            commandsCategory,
            servicesCategories?.length &&
                <SeparatorDefinition>{
                    kind: "sep",
                },
            ...servicesCategories,
            <SeparatorDefinition>{
                kind: "sep",
            },
            logicCategory,
            mathCategory,
            variablesCategory,
        ]
            .filter(cat => !!cat)
            .map(node =>
                node.kind === "category"
                    ? patchCategoryJSONtoXML(node as CategoryDefinition)
                    : node
            ),
    }

    return {
        serviceBlocks,
        toolboxConfiguration,
        newProjectXml: NEW_PROJET_XML,
    }
}
