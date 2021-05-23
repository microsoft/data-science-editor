import Blockly from "blockly"
import { useMemo } from "react"
import {
    SRV_BOOTLOADER,
    SRV_CONTROL,
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
    isEvent,
    isRegister,
    serviceSpecifications,
} from "../../../jacdac-ts/src/jdom/spec"
import {
    SMap,
    toMap,
    unique,
    uniqueMap,
} from "../../../jacdac-ts/src/jdom/utils"
import useServices from "../hooks/useServices"

const NEW_PROJET_XML =
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="jacdac_configuration"></block></xml>'

const ignoredServices = [
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_ROLE_MANAGER,
    SRV_PROTO_TEST,
    SRV_SETTINGS,
    SRV_BOOTLOADER,
]
const ignoredEvents = [SystemEvent.StatusCodeChanged]

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BlockReference {
    type: string
    values?: SMap<BlockReference>
    shadow?: boolean
}

export type BlockCommand =
    | "event"
    | "reading_change_event"
    | "reading_get"
    | "value_get"
    | "value_set"
    | "intensity_set"

export interface BlockDefinition extends BlockReference {
    message0?: string
    args0?: InputDefinition[]
    colour?: number
    inputsInline?: boolean
    previousStatement?: string | string[]
    nextStatement?: string | string[]
    tooltip?: string
    helpUrl?: string
    style?: string
    output?: string
    extensions?: string[]
    command?: BlockCommand
}

export interface ServiceBlockDefinition extends BlockDefinition {
    service: jdspec.ServiceSpec
    command: BlockCommand
}

export interface EventBlockDefinition extends ServiceBlockDefinition {
    command: "event"
    events: jdspec.PacketInfo[]
}

export interface RegisterBlockDefinition extends ServiceBlockDefinition {
    command:
        | "reading_change_event"
        | "reading_get"
        | "value_get"
        | "value_set"
        | "intensity_set"
    register: jdspec.PacketInfo
}

export const WHILE_CONDITION_BLOCK = "jacdac_while_event"
export const WHILE_CONDITION_BLOCK_CONDITION = "condition"
export const WAIT_BLOCK = "jacdac_wait"

export interface CategoryDefinition {
    name: string
    custom?: string
    colour?: string
    categorystyle?: string
    blocks?: BlockDefinition[]
    button?: {
        text: string
        callbackKey: string
        service: jdspec.ServiceSpec
    }[]
}

type CachedBlockDefinitions = {
    blocks: BlockDefinition[]
    serviceBlocks: ServiceBlockDefinition[],
    services: jdspec.ServiceSpec[]
}

function isBooleanField(field: jdspec.PacketMember) {
    return field.type === "bool"
}
function isBoolean(pkt: jdspec.PacketInfo) {
    return pkt.fields.length === 1 && isBooleanField(pkt.fields[0])
}
function toBlocklyType(field: jdspec.PacketMember) {
    return isBooleanField(field) ? "Boolean" : "Number"
}

let cachedBlocks: CachedBlockDefinitions
export function loadBlocks(): CachedBlockDefinitions {
    if (cachedBlocks) return cachedBlocks

    const variableName = (srv: jdspec.ServiceSpec) =>
        `${humanify(srv.camelName).toLowerCase()} 1`
    const fieldVariable = (service: jdspec.ServiceSpec): InputDefinition => ({
        type: "field_variable",
        name: "role",
        variable: variableName(service),
        variableTypes: [service.shortId],
        defaultType: service.shortId,
    })

    const allServices = serviceSpecifications()
        .filter(service => !/^_/.test(service.shortId))
        .filter(service => ignoredServices.indexOf(service.classIdentifier) < 0)
    const readings = allServices
        .map(service => ({
            service,
            reading: service.packets.find(
                pkt =>
                    isRegister(pkt) &&
                    pkt.identifier === SystemReg.Reading &&
                    pkt.fields.length == 1 &&
                    isNumericType(pkt.fields[0])
            ),
        }))
        .filter(kv => !!kv.reading)
    const intensities = allServices
        .map(service => ({
            service,
            intensity: service.packets.find(
                pkt => isRegister(pkt) && pkt.identifier === SystemReg.Intensity
            ),
        }))
        .filter(kv => !!kv.intensity)
    const values = allServices
        .map(service => ({
            service,
            value: service.packets.find(
                pkt => isRegister(pkt) && pkt.identifier === SystemReg.Value
            ),
        }))
        .filter(kv => !!kv.value)
    const events = allServices
        .map(service => ({
            service,
            events: service.packets.filter(
                pkt => isEvent(pkt) && ignoredEvents.indexOf(pkt.identifier) < 0
            ),
        }))
        .filter(kv => !!kv.events.length)

    const HUE = 230

    const eventBlocks = events.map<EventBlockDefinition>(
        ({ service, events }) => ({
            type: `jacdac_${service.shortId}_events`,
            message0: `when %1 %2`,
            args0: [
                fieldVariable(service),
                <InputDefinition>{
                    type: "field_dropdown",
                    name: "event",
                    options: events.map(event => [event.name, event.name]),
                },
            ],
            colour: HUE,
            inputsInline: true,
            nextStatement: null,
            tooltip: "",
            helpUrl: "",
            service,
            events,
            command: "event",
        })
    )

    const readingChangeBlocks = readings.map<RegisterBlockDefinition>(
        ({ service, reading }) => ({
            type: `jacdac_${service.shortId}_reading_change`,
            message0: `when %1 ${humanify(reading.name)} change`,
            args0: [fieldVariable(service)],
            inputsInline: true,
            nextStatement: "Statement",
            colour: HUE,
            tooltip: "",
            helpUrl: "",
            service,
            register: reading,

            command: "reading_change_event",
        })
    )

    const readingGetBlocks = readings.map<RegisterBlockDefinition>(
        ({ service, reading }) => ({
            type: `jacdac_${service.shortId}_reading`,
            message0: `%1 ${humanify(reading.name)}`,
            args0: [fieldVariable(service)],
            inputsInline: true,
            output: "Number",
            colour: HUE,
            tooltip: "",
            helpUrl: "",
            service,
            register: reading,

            command: "reading_get",
        })
    )

    const intensitySetBlocks = intensities.map<RegisterBlockDefinition>(
        ({ service, intensity }) => ({
            type: `jacdac_${service.shortId}_intensity_set`,
            message0: isBoolean(intensity)
                ? `set %1 %2`
                : `set %1 ${intensity.name} to ${intensity.fields
                      .map(
                          (field, i) =>
                              `${field.name === "_" ? "" : `${field.name} `}%${
                                  i + 2
                              }`
                      )
                      .join(" ")}`,
            args0: [
                fieldVariable(service),
                ...intensity.fields.map(field => ({
                    type: "input_value",
                    name: field.name,
                    check: toBlocklyType(field),
                })),
            ],
            values: toMap<jdspec.PacketMember, BlockReference>(
                intensity.fields,
                field => field.name,
                field =>
                    field.type === "bool"
                        ? { type: "jacdac_on_off", shadow: true }
                        : { type: "jacdac_percent", shadow: true }
            ),
            inputsInline: true,
            colour: HUE,
            tooltip: "",
            helpUrl: "",
            service,
            register: intensity,
            previousStatement: "Statement",
            nextStatement: "Statement",

            command: "intensity_set",
        })
    )

    const valueSetBlocks = values.map<RegisterBlockDefinition>(
        ({ service, value }) => ({
            type: `jacdac_${service.shortId}_value_set`,
            message0: `set %1 ${humanify(value.name)} to ${value.fields
                .map((_, i) => `%${2 + i}`)
                .join(" ")}`,
            args0: [
                fieldVariable(service),
                ...value.fields.map(field => ({
                    type: "input_value",
                    name: field.name,
                    check: toBlocklyType(field),
                })),
            ],
            values: toMap(
                value.fields,
                field => field.name,
                field =>
                    field.type === "bool"
                        ? { type: "jacdac_on_off", shadow: true }
                        : field.unit == "°"
                        ? {
                              type: "jacdac_angle",
                              shadow: true,
                          }
                        : {
                              type: "math_number",
                              value: field.defaultValue || 0,
                              min: field.absoluteMin,
                              max: field.absoluteMax,
                              shadow: true,
                          }
            ),
            inputsInline: true,
            colour: HUE,
            tooltip: "",
            helpUrl: "",
            service,
            register: value,
            previousStatement: "Statement",
            nextStatement: "Statement",

            command: "value_set",
        })
    )

    const valueGetBlocks = values
        .filter(v => v.value.fields.length === 1)
        .map<RegisterBlockDefinition>(({ service, value }) => ({
            type: `jacdac_${service.shortId}_value_get`,
            message0: `%1 ${humanify(value.name)}`,
            args0: [fieldVariable(service)],
            inputsInline: true,
            output: value.fields[0].type === "bool" ? "Boolean" : "Number",
            colour: HUE,
            tooltip: "",
            helpUrl: "",
            service,
            register: value,

            command: "value_get",
        }))

    const shadowBlocks: BlockDefinition[] = [
        {
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
            colour: HUE,
            output: "Boolean",
        },
        {
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
            colour: HUE,
            output: "Number",
        },
        {
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
            colour: HUE,
            output: "Number",
        },
        {
            type: `jacdac_percent`,
            message0: `%1 %`,
            args0: [
                <NumberInputDefinition>{
                    type: "field_slider",
                    name: "value",
                    min: 0,
                    max: 100,
                    precision: 1,
                },
            ],
            colour: HUE,
            output: "Number",
        },
        {
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
            colour: HUE,
            output: "Number",
        },
    ]

    const commandBlocks: BlockDefinition[] = [
        {
            type: WHILE_CONDITION_BLOCK,
            message0: "while %1",
            args0: [
                {
                    type: "input_value",
                    name: WHILE_CONDITION_BLOCK_CONDITION,
                    check: "Boolean",
                },
            ],
            style: "logic_blocks",
            inputsInline: true,
            nextStatement: "Statement",
            tooltip: "",
            helpUrl: "",
        },
        {
            type: WAIT_BLOCK,
            message0: "wait %1 s",
            args0: [
                {
                    type: "input_value",
                    name: "TIME",
                    check: "Number",
                },
            ],
            inputsInline: true,
            previousStatement: "Statement",
            nextStatement: "Statement",
            colour: 230,
            tooltip: "",
            helpUrl: "",
        },
    ]

    const mathBlocks: BlockDefinition[] = [
        {
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

    const serviceBlocks: ServiceBlockDefinition[] = [
        ...eventBlocks,
        ...readingChangeBlocks,
        ...readingGetBlocks,
        ...intensitySetBlocks,
        ...valueSetBlocks,
        ...valueGetBlocks,
    ]
    const blocks: BlockDefinition[] = [
        ...serviceBlocks,
        ...commandBlocks,
        ...shadowBlocks,
        ...mathBlocks,
    ]

    // register blocks with Blockly, happens once
    blocks.map(
        block =>
            (Blockly.Blocks[block.type] = {
                init: function () {
                    this.jsonInit(block)
                },
            })
    )
    const jdBlocks = serviceBlocks.filter(block => !!block.service)
    const services = uniqueMap(
        jdBlocks,
        block => block.service.shortId,
        block => block.service
    )

    cachedBlocks = {
        blocks,
        serviceBlocks,
        services,
    }

    return cachedBlocks
}

export const BUILTIN_TYPES = ["", "Boolean", "Number", "String"]
export function scanServices(workspace: Blockly.Workspace) {
    const variables = Blockly.Variables.allUsedVarModels(workspace).filter(
        v => BUILTIN_TYPES.indexOf(v.type) < 0
    ) // remove buildins
    const services = variables.map(v => v.type)
    return services
}

export default function useToolbox(blockServices?: string[]): {
    toolboxCategories: CategoryDefinition[]
    newProjectXml: string
} {
    const { serviceBlocks, services } = useMemo(() => loadBlocks(), [])
    const liveServices = useServices({ specification: true })

    const toolboxServices = unique([
        ...blockServices,
        ...liveServices
            .filter(srv => ignoredServices.indexOf(srv.serviceClass) < 0)
            .map(service => service.specification?.shortId),
    ])
        .map(serviceShortId =>
            services.find(service => service.shortId === serviceShortId)
        )
        .filter(srv => !!srv)

    const toolboxCategories = [
        ...toolboxServices
            .map(service => ({
                service,
                serviceBlocks: serviceBlocks.filter(
                    block => block.service === service
                ),
            }))
            .map(({ service, serviceBlocks }) => ({
                name: service.name,
                colour: "#5CA699",
                blocks: serviceBlocks.map(block => ({
                    type: block.type,
                    values: block.values,
                })),
                button: Object.values(
                    uniqueMap(
                        serviceBlocks,
                        block => block.service.shortId,
                        block => block.service
                    )
                ).map(service => ({
                    text: `Add ${service.name}`,
                    callbackKey: `jacdac_add_role_callback_${service.shortId}`,
                    service,
                })),
            })),
        {
            name: "Commands",
            colour: "%{BKY_LISTS_HUE}",
            blocks: [
                {
                    type: WHILE_CONDITION_BLOCK,
                },
                {
                    type: "jacdac_wait",
                    values: {
                        TIME: { type: "jacdac_time_picker", shadow: true },
                    },
                },
            ],
        },
        {
            name: "Logic",
            colour: "%{BKY_LOGIC_HUE}",
            blocks: [
                { type: "dynamic_if" },
                {
                    type: "logic_compare",
                    values: {
                        A: { type: "math_number", shadow: true },
                        B: { type: "math_number", shadow: true },
                    },
                },
                {
                    type: "logic_operation",
                    values: {
                        A: { type: "logic_boolean", shadow: true },
                        B: { type: "logic_boolean", shadow: true },
                    },
                },
                {
                    type: "logic_negate",
                    values: {
                        BOOL: { type: "logic_boolean", shadow: true },
                    },
                },
                { type: "logic_boolean" },
            ],
        },
        {
            name: "Math",
            colour: "%{BKY_MATH_HUE}",
            blocks: [
                {
                    type: "jacdac_math_arithmetic",
                    values: {
                        A: { type: "math_number", shadow: true },
                        B: { type: "math_number", shadow: true },
                    },
                },
                {
                    type: "jacdac_math_single",
                    values: {
                        NUM: { type: "math_number", shadow: true },
                    },
                },
                { type: "math_number" },
            ],
        },
        {
            name: "Variables",
            colour: "%{BKY_VARIABLES_HUE}",
            custom: "VARIABLE",
        },
    ].filter(cat => !!cat.blocks?.length)

    return {
        toolboxCategories,
        newProjectXml: NEW_PROJET_XML,
    }
}
