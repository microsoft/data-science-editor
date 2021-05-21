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
import { toMap, unique, uniqueMap } from "../../../jacdac-ts/src/jdom/utils"
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockDefinition = any

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
function loadBlocks(): CachedBlockDefinitions {
    if (cachedBlocks) return cachedBlocks

    const variableName = (srv: jdspec.ServiceSpec) =>
        `${humanify(srv.camelName).toLowerCase()} 1`
    const fieldVariable = (service: jdspec.ServiceSpec) => ({
        type: "field_variable",
        name: "ROLE",
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

    // generate blocks
    const blocks: BlockDefinition[] = [
        ...events.map(({ service, events }) => ({
            type: `jacdac_${service.shortId}_events`,
            message0: `when %1 %2`,
            args0: [
                fieldVariable(service),
                {
                    type: "field_dropdown",
                    name: "EVENT",
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
        })),
        ...readings.map(({ service, reading }) => ({
            type: `jacdac_${service.shortId}_reading_change`,
            message0: `when %1 ${humanify(reading.name)} change`,
            args0: [fieldVariable(service)],
            inputsInline: true,
            nextStatement: "Statement",
            colour: HUE,
            tooltip: "",
            helpUrl: "",
            service,
            reading,
        })),
        ...readings.map(({ service, reading }) => ({
            type: `jacdac_${service.shortId}_reading`,
            message0: `%1 ${humanify(reading.name)}`,
            args0: [fieldVariable(service)],
            inputsInline: true,
            output: "Number",
            colour: HUE,
            tooltip: "",
            helpUrl: "",
            service,
            reading,
        })),
        ...intensities.map(({ service, intensity }) => ({
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
            values: toMap(
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
            intensity,
            previousStatement: "Statement",
            nextStatement: "Statement",
        })),
        ...values.map(({ service, value }) => ({
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
            value,
            previousStatement: "Statement",
            nextStatement: "Statement",
        })),
        ...values
            .filter(v => v.value.fields.length === 1)
            .map(({ service, value }) => ({
                type: `jacdac_${service.shortId}_value_get`,
                message0: `%1 ${humanify(value.name)}`,
                args0: [fieldVariable(service)],
                inputsInline: true,
                output: value.fields[0].type === "bool" ? "Boolean" : "Number",
                colour: HUE,
                tooltip: "",
                helpUrl: "",
                service,
                value,
            })),
        {
            type: "jacdac_await_condition",
            message0: "while %1",
            args0: [
                {
                    type: "input_value",
                    name: "CONDITION",
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
            type: "jacdac_wait_ms",
            message0: "wait %1 ms",
            args0: [
                {
                    type: "field_number",
                    name: "NAME",
                    value: 0,
                    min: 0,
                    max: 5000,
                },
            ],
            inputsInline: true,
            previousStatement: "Statement",
            nextStatement: "Statement",
            colour: 230,
            tooltip: "",
            helpUrl: "",
        },
        // shadow field editors
        {
            type: `jacdac_on_off`,
            message0: `%1`,
            args0: [
                {
                    type: "field_dropdown",
                    name: "VALUE",
                    options: [
                        ["on", "ON"],
                        ["off", "OFF"],
                    ],
                },
            ],
            colour: HUE,
            output: "Boolean",
        },
        {
            type: `jacdac_angle`,
            message0: `%1`,
            args0: [
                {
                    type: "field_angle",
                    name: "VALUE",
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
                {
                    type: "field_slider",
                    name: "VALUE",
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
                {
                    type: "field_slider",
                    name: "VALUE",
                    min: 0,
                    max: 1,
                    precision: 0.1,
                },
            ],
            colour: HUE,
            output: "Number",
        },
        // custom math blocks
        {
            type: "jacdac_math_arithmetic",
            message0: "%1 %2 %3",
            args0: [
                {
                    type: "input_value",
                    name: "A",
                    check: "Number",
                },
                {
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

        // Block for advanced math operators with single operand.
        {
            type: "jacdac_math_single",
            message0: "%1 %2",
            args0: [
                {
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

    console.log({ blocks })

    // register blocks with Blockly, happens once
    blocks.map(
        block =>
            (Blockly.Blocks[block.type] = {
                init: function () {
                    this.jsonInit(block)
                },
            })
    )
    const jdBlocks = blocks.filter(block => !!block.service)
    const services = uniqueMap(
        jdBlocks,
        block => block.service.shortId,
        block => block.service
    )

    cachedBlocks = {
        blocks,
        services,
    }

    return cachedBlocks
}

const builtinTypes = ["", "Boolean", "Number", "String"]
export function scanServices(workspace: Blockly.Workspace) {
    // blockly has the tendency to keep all variables around
    // make sure they are referencedin the workspace
    const variables = workspace
        .getAllVariables()
        .filter(v => builtinTypes.indexOf(v.type) < 0) // remove buildins
        .filter(v => !!workspace.getVariableUsesById(v.getId()).length)
    const services = variables.map(v => v.type)
    return services
}

export default function useToolbox(blockServices?: string[]): {
    toolboxCategories: CategoryDefinition[]
    newProjectXml: string
} {
    const { blocks, services } = useMemo(() => loadBlocks(), [])
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
                serviceBlocks: blocks.filter(
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
            name: "Logic",
            colour: "%{BKY_LOGIC_HUE}",
            blocks: [
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
