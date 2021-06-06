import Blockly from "blockly"
import { useEffect, useMemo } from "react"
import {
    BuzzerCmd,
    JoystickReg,
    ServoReg,
    SRV_BOOTLOADER,
    SRV_BUZZER,
    SRV_CONTROL,
    SRV_HID_KEYBOARD,
    SRV_JOYSTICK,
    SRV_LED,
    SRV_LED_MATRIX,
    SRV_LOGGER,
    SRV_PROTO_TEST,
    SRV_ROLE_MANAGER,
    SRV_SERVO,
    SRV_SETTINGS,
    SRV_SEVEN_SEGMENT_DISPLAY,
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
    splitFilter,
    toMap,
    uniqueMap,
} from "../../../jacdac-ts/src/jdom/utils"
import useServices from "../hooks/useServices"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { Theme, useTheme } from "@material-ui/core"
import { withPrefix } from "gatsby-link"
import { fieldShadows, registerFields } from "./fields/fields"
import KeyboardKeyField from "./fields/KeyboardKeyField"
import LEDMatrixField from "./fields/LEDMatrixField"
import {
    BlockDefinition,
    BlockReference,
    ButtonDefinition,
    CategoryDefinition,
    ColorInputDefnition,
    CommandBlockDefinition,
    CONNECTED_BLOCK,
    CONNECTION_BLOCK,
    CustomBlockDefinition,
    DEVICE_TWIN_DEFINITION_BLOCK,
    DEVICE_TWIN_PROPERTY_BLOCK,
    DEVICE_TWIN_PROPERTY_TYPE,
    DEVICE_TWIN_TELEMETRY_BLOCK,
    DEVICE_TWIN_TELEMETRY_TYPE,
    DEVICE_TWIN_VALUE_TYPE,
    EventBlockDefinition,
    EventFieldDefinition,
    InputDefinition,
    INSPECT_BLOCK,
    NEW_PROJET_XML,
    NumberInputDefinition,
    OptionsInputDefinition,
    RegisterBlockDefinition,
    REPEAT_EVERY_BLOCK,
    resolveServiceBlockDefinition,
    SeparatorDefinition,
    ServiceBlockDefinition,
    ServiceBlockDefinitionFactory,
    SET_STATUS_LIGHT_BLOCK,
    StatementInputDefinition,
    ToolboxConfiguration,
    TWIN_BLOCK,
    ValueInputDefinition,
    VariableInputDefinition,
    WAIT_BLOCK,
    WATCH_BLOCK,
} from "./toolbox"
import NoteField from "./fields/NoteField"
import ServoAngleField from "./fields/ServoAngleField"
import LEDColorField from "./fields/LEDColorField"
import TwinField from "./fields/TwinField"
import JDomTreeField from "./fields/JDomTreeField"
import { WorkspaceJSON } from "./jsongenerator"
import { VMProgram } from "../../../jacdac-ts/src/vm/ir"
import WatchValueField from "./fields/WatchValueField"
import { DTDLUnits } from "../../../jacdac-ts/src/azure-iot/dtdl"

// overrides blockly emboss filter for svg elements
Blockly.BlockSvg.prototype.setHighlighted = function (highlighted) {
    if (!this.rendered) {
        return
    }
    if (highlighted) {
        this.addSelect()
    } else {
        this.removeSelect()
    }
}

type CachedBlockDefinitions = {
    blocks: BlockDefinition[]
    serviceBlocks: ServiceBlockDefinition[]
    eventFieldBlocks: EventFieldDefinition[]
    deviceTwinsBlocks: BlockDefinition[]
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
    const debuggerColor = theme.palette.grey[600]
    const deviceTwinColor = theme.palette.error.light
    const serviceColor = (srv: jdspec.ServiceSpec) =>
        isSensor(srv) ? sensorColor : otherColor
    return {
        serviceColor,
        sensorColor,
        commandColor,
        debuggerColor,
        otherColor,
        deviceTwinColor,
    }
}

const codeStatementType = "Code"
const deviceTwinContentType = "DeviceTwinContent"
const deviceTwinCommonOptionType = "DeviceTwinCommonOption"
const deviceTwinPropertyOptionType = "DeviceTwinPropertyOption"
const deviceTwinTelemetryOptionType = "DeviceTwinTelemetryOption"
const deviceTwinStatementType = [deviceTwinContentType]
const deviceTwinCommonOptionStatementType = [deviceTwinCommonOptionType]
const deviceTwinPropertyOptionStatementType = [
    deviceTwinPropertyOptionType,
    ...deviceTwinCommonOptionStatementType,
]
const deviceTwinTelemetryOptionStatementType = [
    deviceTwinTelemetryOptionType,
    ...deviceTwinCommonOptionStatementType,
]

function loadBlocks(
    serviceColor: (srv: jdspec.ServiceSpec) => string,
    commandColor: string,
    debuggerColor: string,
    deviceTwinColor: string
): CachedBlockDefinitions {
    // blocks
    const customShadows = [
        {
            serviceClass: SRV_SERVO,
            kind: "rw",
            identifier: ServoReg.Angle,
            field: "_",
            shadow: <BlockDefinition>{
                kind: "block",
                type: ServoAngleField.SHADOW.type,
            },
        },
        {
            serviceClass: SRV_BUZZER,
            kind: "command",
            identifier: BuzzerCmd.PlayNote,
            field: "frequency",
            shadow: <BlockDefinition>{
                kind: "block",
                type: NoteField.SHADOW.type,
            },
        },
    ]
    const lookupCustomShadow = (
        service: jdspec.ServiceSpec,
        info: jdspec.PacketInfo,
        field: jdspec.PacketMember
    ) =>
        customShadows.find(
            cs =>
                cs.serviceClass === service.classIdentifier &&
                cs.kind == info.kind &&
                cs.identifier === info.identifier &&
                cs.field == field.name
        )?.shadow

    const serviceHelp = (service: jdspec.ServiceSpec) =>
        withPrefix(`/services/${service.shortId}`)
    const fieldsSupported = (pkt: jdspec.PacketInfo) =>
        pkt.fields.every(toBlocklyType)
    const fieldName = (reg: jdspec.PacketInfo, field: jdspec.PacketMember) =>
        field.name === "_" ? reg.name : field.name
    const fieldToShadow = (
        service: jdspec.ServiceSpec,
        info: jdspec.PacketInfo,
        field: jdspec.PacketMember
    ): BlockReference =>
        lookupCustomShadow(service, info, field) ||
        (isBooleanField(field)
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
              })
    const variableName = (srv: jdspec.ServiceSpec) =>
        `${humanify(srv.camelName).toLowerCase()} 1`
    const fieldVariable = (
        service: jdspec.ServiceSpec
    ): VariableInputDefinition => ({
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
    const fieldsToValues = (
        service: jdspec.ServiceSpec,
        info: jdspec.PacketInfo
    ) =>
        toMap<jdspec.PacketMember, BlockReference | BlockDefinition>(
            info.fields,
            field => fieldName(info, field),
            field => fieldToShadow(service, info, field)
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
    const registers = arrayConcatMany(
        allServices.map(service =>
            service.packets
                .filter(
                    pkt =>
                        isRegister(pkt) &&
                        !pkt.lowLevel &&
                        includedRegisters.indexOf(pkt.identifier) > -1
                )
                .map(register => ({
                    service,
                    register,
                }))
        )
    )
    const events = allServices
        .map(service => ({
            service,
            events: service.packets.filter(
                pkt =>
                    isEvent(pkt) &&
                    !pkt.lowLevel &&
                    ignoredEvents.indexOf(pkt.identifier) < 0
            ),
        }))
        .filter(kv => !!kv.events.length)
    const commands = arrayConcatMany(
        allServices.map(service =>
            service.packets
                .filter(
                    pkt =>
                        isCommand(pkt) && !pkt.lowLevel && fieldsSupported(pkt)
                )
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
                    type: `key`,
                    message0: `send %1 key %2`,
                    args0: [
                        fieldVariable(service),
                        {
                            type: KeyboardKeyField.KEY,
                            name: "combo",
                        },
                    ],
                    colour: serviceColor(service),
                    inputsInline: true,
                    previousStatement: codeStatementType,
                    nextStatement: codeStatementType,
                    tooltip: `Send a keyboard key combo`,
                    helpUrl: serviceHelp(service),
                    service,
                    expression: `role.key(combo.selectors, combo.modifiers)`,
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
                        fieldVariable(service),
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
                            shadow: true,
                        },
                    },
                    colour: serviceColor(service),
                    inputsInline: true,
                    previousStatement: codeStatementType,
                    nextStatement: codeStatementType,
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
                        fieldVariable(service),
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
                    colour: serviceColor(service),
                    inputsInline: true,
                    previousStatement: codeStatementType,
                    nextStatement: codeStatementType,
                    tooltip: `Display a number of the screen`,
                    helpUrl: serviceHelp(service),
                    service,
                    // encode digits
                    template: "custom",
                }
        ),
        ...resolveService(SRV_LED_MATRIX).map(
            service =>
                <CustomBlockDefinition>{
                    kind: "block",
                    type: `_show_leds`,
                    message0: `show %1 leds %2`,
                    args0: [
                        fieldVariable(service),
                        {
                            type: LEDMatrixField.KEY,
                            name: "leds",
                        },
                    ],
                    colour: serviceColor(service),
                    inputsInline: true,
                    previousStatement: codeStatementType,
                    nextStatement: codeStatementType,
                    tooltip: `Display LEDs on the LED matrix`,
                    helpUrl: serviceHelp(service),
                    service,
                    // encode digits
                    template: "custom",
                }
        ),
    ].map(def => {
        def.type = `jacdac_custom_${def.service.shortId}_${def.type}`
        return def
    })

    const eventBlocks = events.map<EventBlockDefinition>(
        ({ service, events }) => ({
            kind: "block",
            type: `jacdac_events_${service.shortId}`,
            message0: `on %1 %2`,
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
            nextStatement: codeStatementType,
            tooltip: `Events for the ${service.name} service`,
            helpUrl: serviceHelp(service),
            service,
            events,
            template: "event",
        })
    )

    // generate accessor blocks for event data with numbers
    const eventFieldBlocks = arrayConcatMany(
        events.map(({ service, events }) =>
            events
                .filter(event => event.fields.filter(isNumericType).length > 0)
                .map(event => ({ service, event }))
                .map(
                    ({ service, event }) =>
                        <EventFieldDefinition>{
                            kind: "block",
                            type: `jacdac_event_field_${service.shortId}_${event.name}`,
                            message0: `${event.name} %1`,
                            args0: [
                                <InputDefinition>{
                                    type: "field_dropdown",
                                    name: "field",
                                    options: event.fields.map(field => [
                                        humanify(field.name),
                                        field.name,
                                    ]),
                                },
                            ],
                            colour: serviceColor(service),
                            inputsInline: true,
                            tooltip: `Data fields of the ${event.name} event`,
                            helpUrl: serviceHelp(service),
                            service,
                            event,
                            output: "Number",
                            template: "event_field",
                        }
                )
        )
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
            values: fieldsToValues(service, register),
            inputsInline: true,
            nextStatement: codeStatementType,
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
            values: fieldsToValues(service, register),
            inputsInline: true,
            colour: serviceColor(service),
            tooltip: register.description,
            helpUrl: serviceHelp(service),
            service,
            register,
            previousStatement: codeStatementType,
            nextStatement: codeStatementType,

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
            values: fieldsToValues(service, command),
            inputsInline: true,
            colour: serviceColor(service),
            tooltip: command.description,
            helpUrl: serviceHelp(service),
            service,
            command,
            previousStatement: codeStatementType,
            nextStatement: codeStatementType,

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
        ...fieldShadows(),
        {
            kind: "block",
            type: `jacdac_on_off`,
            message0: `%1`,
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "value",
                    options: [
                        ["enabled", "on"],
                        ["disabled", "off"],
                    ],
                },
            ],
            style: "logic_blocks",
            output: "Boolean",
        },
        {
            kind: "block",
            type: `jacdac_yes_no`,
            message0: `%1`,
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "value",
                    options: [
                        ["yes", "on"],
                        ["no", "off"],
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
            type: WAIT_BLOCK,
            message0: "wait %1 s",
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "time",
                    check: "Number",
                },
            ],
            inputsInline: true,
            previousStatement: codeStatementType,
            nextStatement: codeStatementType,
            colour: commandColor,
            tooltip: "Wait the desired time",
            helpUrl: "",
        },
        {
            kind: "block",
            type: CONNECTION_BLOCK,
            message0: "when %1 %2",
            args0: [
                <VariableInputDefinition>{
                    type: "field_variable",
                    name: "role",
                    variable: "any",
                    variableTypes: [
                        "client",
                        ...allServices.map(service => service.shortId),
                    ],
                    defaultType: "client",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "event",
                    options: [
                        ["connected", "connected"],
                        ["disconnected", "disconnected"],
                    ],
                },
            ],
            inputsInline: true,
            nextStatement: codeStatementType,
            colour: commandColor,
            tooltip: "Runs code when a role is connected or disconnected",
            helpUrl: "",
            template: "connection",
        },
        {
            kind: "block",
            type: CONNECTED_BLOCK,
            message0: "%1 connected",
            args0: [
                <VariableInputDefinition>{
                    type: "field_variable",
                    name: "role",
                    variable: "any",
                    variableTypes: [
                        "client",
                        ...allServices.map(service => service.shortId),
                    ],
                    defaultType: "client",
                },
            ],
            output: "Boolean",
            inputsInline: true,
            colour: commandColor,
            tooltip: "Runs code when a role is connected or disconnected",
            helpUrl: "",
            template: "connected",
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
                        ...allServices.map(service => service.shortId),
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
            previousStatement: codeStatementType,
            nextStatement: codeStatementType,
            colour: commandColor,
            tooltip: "Sets the color on the status light",
            helpUrl: "",
        },
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
                        ...allServices.map(service => service.shortId),
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
            colour: debuggerColor,
            inputsInline: false,
            tooltip: `Twin of the selected service`,
            helpUrl: "",
            template: "twin",
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
                        ...allServices.map(service => service.shortId),
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
            colour: debuggerColor,
            inputsInline: false,
            tooltip: `Inspect a service`,
            helpUrl: "",
            template: "twin",
        },
        {
            kind: "block",
            type: WATCH_BLOCK,
            message0: `watch %1 %2`,
            args0: [
                <InputDefinition>{
                    type: "input_value",
                    name: "value",
                    check: ["Number", "Boolean", "String"],
                },
                <InputDefinition>{
                    type: WatchValueField.KEY,
                    name: "watch",
                },
            ],
            colour: debuggerColor,
            inputsInline: true,
            tooltip: `Watch a value in the editor`,
            helpUrl: "",
            template: "watch",
        },
        {
            kind: "block",
            type: REPEAT_EVERY_BLOCK,
            message0: `repeat every %1s`,
            args0: [
                <InputDefinition>{
                    type: "input_value",
                    name: "interval",
                    check: "Number",
                },
            ],
            colour: commandColor,
            inputsInline: true,
            tooltip: `Repeats code at a given interval in seconds`,
            helpUrl: "",
            template: "every",
            nextStatement: codeStatementType,
        },
    ]

    const mathBlocks: BlockDefinition[] = [
        {
            kind: "block",
            type: "jacdac_math_arithmetic",
            message0: "%1 %2 %3",
            args0: [
                <ValueInputDefinition>{
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
                <ValueInputDefinition>{
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
                <ValueInputDefinition>{
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
        {
            kind: "block",
            type: "jacdac_math_random",
            message0: "random",
            args0: [],
            output: "Number",
            style: "math_blocks",
        },
        {
            kind: "block",
            type: "jacdac_math_random_range",
            message0: "random from %1 to %2",
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "min",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "max",
                    check: "Number",
                },
            ],
            output: "Number",
            style: "math_blocks",
            inputsInline: true,
        },
        {
            kind: "block",
            type: "jacdac_math_map",
            message0: "map %1 from [%2, %3] to [%4, %5]",
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "value",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "fromMin",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "fromMax",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "toMin",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "toMax",
                    check: "Number",
                },
            ],
            output: "Number",
            style: "math_blocks",
        },
    ]

    const deviceTwinsBlocks: BlockDefinition[] = [
        {
            kind: "block",
            type: DEVICE_TWIN_DEFINITION_BLOCK,
            message0: "device twin id %1",
            args0: [
                {
                    type: "field_input",
                    name: "id",
                },
            ],
            inputsInline: true,
            nextStatement: deviceTwinStatementType,
            template: "dtdl",
            colour: deviceTwinColor,
        },
        {
            kind: "block",
            type: DEVICE_TWIN_PROPERTY_BLOCK,
            message0: "property %1 %2",
            args0: [
                <VariableInputDefinition>{
                    type: "field_variable",
                    name: "name",
                    variable: "property 1",
                    variableTypes: [DEVICE_TWIN_PROPERTY_TYPE],
                    defaultType: DEVICE_TWIN_PROPERTY_TYPE,
                },
                <StatementInputDefinition>{
                    type: "input_statement",
                    name: "options",
                    check: deviceTwinPropertyOptionStatementType,
                },
            ],
            previousStatement: deviceTwinStatementType,
            nextStatement: deviceTwinStatementType,
            template: "dtdl",
            colour: deviceTwinColor,
        },
        {
            kind: "block",
            type: DEVICE_TWIN_TELEMETRY_BLOCK,
            message0: "telemetry %1 %2",
            args0: [
                <VariableInputDefinition>{
                    type: "field_variable",
                    name: "name",
                    variable: "telemetry 1",
                    variableTypes: [DEVICE_TWIN_TELEMETRY_TYPE],
                    defaultType: DEVICE_TWIN_TELEMETRY_TYPE,
                },
                <StatementInputDefinition>{
                    type: "input_statement",
                    name: "options",
                    check: deviceTwinTelemetryOptionStatementType,
                },
            ],
            previousStatement: deviceTwinStatementType,
            nextStatement: deviceTwinStatementType,
            template: "dtdl",
            colour: deviceTwinColor,
        },
        // options
        {
            kind: "block",
            type: "device_twin_option_writeable",
            message0: "writeable %1",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "value",
                    options: [
                        ["yes", "on"],
                        ["no", "off"],
                    ],
                },
            ],
            previousStatement: deviceTwinPropertyOptionStatementType,
            nextStatement: deviceTwinPropertyOptionStatementType,
            template: "dtdlOption",
            colour: deviceTwinColor,
            inputsInline: false,
        },
        {
            kind: "block",
            type: "device_twin_option_value",
            message0: "value %1 %2 %3 %4",
            args0: [
                <VariableInputDefinition>{
                    type: "field_variable",
                    name: "variable",
                    variable: "value 1",
                    variableTypes: [DEVICE_TWIN_VALUE_TYPE],
                    defaultType: DEVICE_TWIN_VALUE_TYPE,
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "type",
                    options: ["float", "boolean", "string", "integer"].map(
                        unit => [unit, unit]
                    ),
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "unit",
                    options: DTDLUnits().map(unit => [unit, unit]),
                },
                {
                    type: "input_value",
                    name: "value",
                },
            ],
            previousStatement: deviceTwinCommonOptionStatementType,
            nextStatement: deviceTwinCommonOptionStatementType,
            template: "dtdlOption",
            colour: deviceTwinColor,
            inputsInline: false,
        },
        {
            kind: "block",
            type: "device_twin_option_comment",
            message0: "%1 %2",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "type",
                    options: [
                        ["comment", "comment"],
                        ["description", "description"],
                        ["display name", "displayName"],
                    ],
                },
                {
                    type: "field_multilinetext",
                    name: "text",
                },
            ],
            previousStatement: deviceTwinCommonOptionStatementType,
            nextStatement: deviceTwinCommonOptionStatementType,
            template: "dtdlOption",
            colour: deviceTwinColor,
            inputsInline: false,
        },
    ]

    const blocks: BlockDefinition[] = [
        ...serviceBlocks,
        ...eventFieldBlocks,
        ...runtimeBlocks,
        ...shadowBlocks,
        ...mathBlocks,
        ...deviceTwinsBlocks,
    ]

    // register field editors
    registerFields()
    // re-register blocks with blocklys
    blocks.forEach(
        block =>
            (Blockly.Blocks[block.type] = <ServiceBlockDefinitionFactory>{
                jacdacDefinition: block,
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

    console.debug("vmblocks", { blocks, serviceBlocks, services })
    return {
        blocks,
        serviceBlocks,
        eventFieldBlocks,
        deviceTwinsBlocks,
        services,
    }
}

function patchCategoryJSONtoXML(cat: CategoryDefinition): CategoryDefinition {
    if (cat.button) {
        if (!cat.contents) cat.contents = []
        cat.contents.unshift(cat.button)
    }
    cat.contents
        ?.filter(node => node.kind === "block")
        .map(node => <BlockReference>node)
        .filter(block => {
            const exists = Blockly.Blocks[block.type]
            if (!exists && Flags.diagnostics)
                console.warn(
                    `block type '${block.type}' not found, consider refreshing page...`
                )
            return !!block.values && exists
        }) // avoid broken blocks
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

export default function useToolbox(props: {
    blockServices?: string[]
    serviceClass?: number
    source?: WorkspaceJSON
    program?: VMProgram
}): {
    serviceBlocks: BlockDefinition[]
    toolboxConfiguration: ToolboxConfiguration
    newProjectXml: string
} {
    const { serviceClass, source, program } = props

    const theme = useTheme()
    const { serviceColor, commandColor, debuggerColor, deviceTwinColor } =
        createBlockTheme(theme)
    const { serviceBlocks, eventFieldBlocks, deviceTwinsBlocks, services } =
        useMemo(
            () =>
                loadBlocks(
                    serviceColor,
                    commandColor,
                    debuggerColor,
                    deviceTwinColor
                ),
            [theme]
        )
    const blockServices =
        program?.roles.map(r => r.serviceShortId) ||
        source?.variables.map(v => v.type) ||
        []
    const liveServices = useServices({ specification: true })
    const usedEvents: Set<jdspec.PacketInfo> = new Set(
        source?.blocks
            ?.map(block => ({
                block,
                definition: resolveServiceBlockDefinition(block.type),
            }))
            .filter(({ definition }) => definition.template === "event")
            .map(({ block, definition }) => {
                const eventName = block.inputs[0].fields["event"]
                    .value as string
                return (definition as EventBlockDefinition).events.find(
                    ev => ev.name === eventName
                )
            })
            .filter(ev => !!ev)
    )

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
              ].filter(
                  srv => !serviceClass || srv.classIdentifier === serviceClass
              ),
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
            contents: [
                ...serviceBlocks.map<BlockDefinition>(block => ({
                    kind: "block",
                    type: block.type,
                    values: block.values,
                })),
                ...eventFieldBlocks
                    .filter(
                        ev => ev.service === service && usedEvents.has(ev.event)
                    )
                    .map<BlockDefinition>(block => ({
                        kind: "block",
                        type: block.type,
                        values: block.values,
                    })),
            ],
            button: {
                kind: "button",
                text: `Add ${service.name} role`,
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
                type: REPEAT_EVERY_BLOCK,
                values: {
                    interval: { kind: "block", type: "jacdac_time_picker" },
                },
            },
            <BlockDefinition>{
                kind: "block",
                type: WAIT_BLOCK,
                values: {
                    time: { kind: "block", type: "jacdac_time_picker" },
                },
            },
            <BlockDefinition>{
                kind: "block",
                type: CONNECTION_BLOCK,
            },
            <BlockDefinition>{
                kind: "block",
                type: CONNECTED_BLOCK,
            },
            <BlockDefinition>{
                kind: "block",
                type: SET_STATUS_LIGHT_BLOCK,
                values: {
                    color: {
                        kind: "block",
                        type: LEDColorField.SHADOW.type,
                    },
                },
            },
        ].filter(b => !!b),
    }

    const toolsCategory: CategoryDefinition = {
        kind: "category",
        name: "Tools",
        colour: debuggerColor,
        contents: [
            <BlockDefinition>{
                kind: "block",
                type: WATCH_BLOCK,
            },
            <BlockDefinition>{
                kind: "block",
                type: TWIN_BLOCK,
            },
            <BlockDefinition>{
                kind: "block",
                type: INSPECT_BLOCK,
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
            { kind: "block", type: "jacdac_math_random" },
            { kind: "block", type: "jacdac_math_random_range" },
            { kind: "block", type: "jacdac_math_map" },
            { kind: "block", type: "math_number" },
        ],
    }

    const variablesCategory: CategoryDefinition = {
        kind: "category",
        name: "Variables",
        colour: "%{BKY_VARIABLES_HUE}",
        custom: "VARIABLE",
    }

    const deviceTwinsCategory: CategoryDefinition = {
        kind: "category",
        name: "Device Twin",
        colour: deviceTwinColor,
        contents: [
            ...deviceTwinsBlocks.map(
                ({ type }) =>
                    <BlockDefinition>{
                        kind: "block",
                        type,
                    }
            ),
        ],
    }

    const toolboxConfiguration: ToolboxConfiguration = {
        kind: "categoryToolbox",
        contents: [
            deviceTwinsCategory,
            ...servicesCategories,
            servicesCategories?.length &&
                <SeparatorDefinition>{
                    kind: "sep",
                },
            commandsCategory,
            logicCategory,
            mathCategory,
            variablesCategory,
            <SeparatorDefinition>{
                kind: "sep",
            },
            toolsCategory,
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

export function useToolboxButtons(
    workspace: Blockly.WorkspaceSvg,
    toolboxConfiguration: ToolboxConfiguration
) {
    // track workspace changes and update callbacks
    useEffect(() => {
        if (!workspace) return

        // collect buttons
        const buttons: ButtonDefinition[] = toolboxConfiguration?.contents
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map(cat => (cat as CategoryDefinition).button)
            .filter(btn => !!btn)
        buttons?.forEach(button =>
            workspace.registerButtonCallback(button.callbackKey, () =>
                Blockly.Variables.createVariableButtonHandler(
                    workspace,
                    null,
                    button.service.shortId
                )
            )
        )
    }, [workspace, JSON.stringify(toolboxConfiguration)])
}
