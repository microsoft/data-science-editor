import { Theme } from "@material-ui/core"
import { withPrefix } from "gatsby"
import {
    humanify,
    isNumericType,
} from "../../../../jacdac-ts/jacdac-spec/spectool/jdspec"
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
    SRV_SEVEN_SEGMENT_DISPLAY,
    SystemEvent,
    SystemReg,
} from "../../../../jacdac-ts/src/jdom/constants"
import Flags from "../../../../jacdac-ts/src/jdom/flags"
import {
    isCommand,
    isEvent,
    isRegister,
    isSensor,
    serviceSpecificationFromName,
    serviceSpecifications,
} from "../../../../jacdac-ts/src/jdom/spec"
import {
    arrayConcatMany,
    splitFilter,
    toMap,
    uniqueMap,
} from "../../../../jacdac-ts/src/jdom/utils"
import {
    toIdentifier,
    toMemberExpression,
} from "../../../../jacdac-ts/src/vm/compile"
import { VMError } from "../../../../jacdac-ts/src/vm/ir"
import KeyboardKeyField from "../fields/KeyboardKeyField"
import LEDColorField from "../fields/LEDColorField"
import LEDMatrixField from "../fields/LEDMatrixField"
import NoteField from "../fields/NoteField"
import ServoAngleField from "../fields/ServoAngleField"
import {
    BlockDefinition,
    BlockReference,
    BOOLEAN_TYPE,
    CategoryDefinition,
    CODE_STATEMENT_TYPE,
    CommandBlockDefinition,
    CustomBlockDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    EventBlockDefinition,
    EventFieldDefinition,
    identityTransformData,
    InputDefinition,
    JSON_TYPE,
    NUMBER_TYPE,
    OptionsInputDefinition,
    RegisterBlockDefinition,
    resolveBlockDefinition,
    ServiceBlockDefinition,
    STRING_TYPE,
    toolsColour,
    ValueInputDefinition,
    VariableInputDefinition,
} from "../toolbox"
import { ExpressionWithErrors, makeVMBase } from "../../vm/VMgenerator"
import BlockDomainSpecificLanguage, {
    CompileCommandToVMOptions,
    CompileEventToVMOptions,
    CompileEventToVMResult,
    CompileExpressionToVMOptions,
    CreateBlocksOptions,
    CreateCategoryOptions,
} from "./dsl"
import JDomTreeField from "../fields/JDomTreeField"
import TwinField from "../fields/TwinField"

const SET_STATUS_LIGHT_BLOCK = "jacdac_set_status_light"
const ROLE_BOUND_EVENT_BLOCK = "jacdac_role_bound_event"
const ROLE_BOUND_BLOCK = "jacdac_role_bound"
const INSPECT_BLOCK = "jacdac_tools_inspect"
const TWIN_BLOCK = "jacdac_tools_twin"

function isBooleanField(field: jdspec.PacketMember) {
    return field.type === "bool"
}
function isStringField(field: jdspec.PacketMember) {
    return field.type === "string"
}
function toBlocklyType(field: jdspec.PacketMember) {
    return field.encoding === "JSON"
        ? JSON_TYPE
        : isBooleanField(field)
        ? BOOLEAN_TYPE
        : isStringField(field)
        ? STRING_TYPE
        : isNumericType(field)
        ? NUMBER_TYPE
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

const commandColor = "#8c6a1d"

export class ServicesBlockDomainSpecificLanguage
    implements BlockDomainSpecificLanguage
{
    id = "jacdacServices"
    supportedServices: jdspec.ServiceSpec[] = []
    private _serviceBlocks: ServiceBlockDefinition[]
    private _eventFieldBlocks: EventFieldDefinition[]
    private _runtimeBlocks: BlockDefinition[]

    private createServiceColor(theme: Theme) {
        const sensorColor = theme.palette.success.main
        const otherColor = theme.palette.info.main
        const serviceColor = (srv: jdspec.ServiceSpec) =>
            isSensor(srv) ? sensorColor : otherColor
        return serviceColor
    }

    createBlocks(options: CreateBlocksOptions) {
        const { theme } = options
        const serviceColor = this.createServiceColor(theme)
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
        const fieldName = (
            reg: jdspec.PacketInfo,
            field: jdspec.PacketMember
        ) => (field.name === "_" ? reg.name : field.name)
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
        this.supportedServices = allServices
            .filter(
                service =>
                    !/^_/.test(service.shortId) &&
                    service.status !== "deprecated"
            )
            .filter(
                service => ignoredServices.indexOf(service.classIdentifier) < 0
            )
        const resolveService = (cls: number): jdspec.ServiceSpec[] =>
            allServices.filter(srv => srv.classIdentifier === cls)
        const registers = arrayConcatMany(
            this.supportedServices.map(service =>
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
        const events = this.supportedServices
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
            this.supportedServices.map(service =>
                service.packets
                    .filter(
                        pkt =>
                            isCommand(pkt) &&
                            !pkt.lowLevel &&
                            fieldsSupported(pkt)
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
                        message0: `%1 %2 key %3`,
                        args0: [
                            fieldVariable(service),
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
                        colour: serviceColor(service),
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
                            },
                        },
                        colour: serviceColor(service),
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
                        previousStatement: CODE_STATEMENT_TYPE,
                        nextStatement: CODE_STATEMENT_TYPE,
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
                        type: `show_leds`,
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
                nextStatement: CODE_STATEMENT_TYPE,
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
                message0: `on %1 ${humanify(register.name)} change by %2`,
                args0: [
                    fieldVariable(service),
                    ...fieldsToFieldInputs(register),
                ].filter(v => !!v),
                values: fieldsToValues(service, register),
                inputsInline: true,
                nextStatement: CODE_STATEMENT_TYPE,
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
                        customMessage(service, register, register.fields[0])
                            ?.get || `%1 ${humanify(register.name)}`,
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
                ({ service, register }) =>
                    !!enumInfo(service, register.fields[0])
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
        ].map<RegisterBlockDefinition>(
            ({ service, register, field, einfo }) => ({
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
            })
        )

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
                args0: [
                    fieldVariable(service),
                    ...fieldsToFieldInputs(register),
                ],
                values: fieldsToValues(service, register),
                inputsInline: true,
                colour: serviceColor(service),
                tooltip: register.description,
                helpUrl: serviceHelp(service),
                service,
                register,
                previousStatement: CODE_STATEMENT_TYPE,
                nextStatement: CODE_STATEMENT_TYPE,

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
                args0: [
                    fieldVariable(service),
                    ...fieldsToFieldInputs(command),
                ],
                values: fieldsToValues(service, command),
                inputsInline: true,
                colour: serviceColor(service),
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
            ...eventBlocks,
            ...registerChangeByEventBlocks,
            ...registerSimplesGetBlocks,
            ...registerEnumGetBlocks,
            ...registerNumericsGetBlocks,
            ...registerSetBlocks,
            ...customBlockDefinitions,
            ...commandBlocks,
        ]

        const eventFieldGroups = [
            {
                output: NUMBER_TYPE,
                filter: isNumericType,
            },
            {
                output: BOOLEAN_TYPE,
                filter: isBooleanField,
            },
            {
                output: STRING_TYPE,
                filter: (f: jdspec.PacketMember) =>
                    isStringField(f) && f.encoding !== "JSON",
            },
            {
                output: JSON_TYPE,
                filter: (f: jdspec.PacketMember) =>
                    isStringField(f) && f.encoding === "JSON",
            },
        ]
        // generate accessor blocks for event data with numbers
        this._eventFieldBlocks = arrayConcatMany(
            arrayConcatMany(
                eventFieldGroups.map(({ output, filter }) =>
                    events.map(({ service, events }) =>
                        events
                            .filter(
                                event => event.fields.filter(filter).length > 0
                            )
                            .map(event => ({ service, event }))
                            .map(
                                ({ service, event }) =>
                                    <EventFieldDefinition>{
                                        kind: "block",
                                        type: `jacdac_event_field_${output.toLowerCase()}_${
                                            service.shortId
                                        }_${event.name}`,
                                        message0: `${event.name} %1`,
                                        args0: [
                                            <InputDefinition>{
                                                type: "field_dropdown",
                                                name: "field",
                                                options: event.fields.map(
                                                    field => [
                                                        humanify(field.name),
                                                        field.name,
                                                    ]
                                                ),
                                            },
                                        ],
                                        colour: serviceColor(service),
                                        inputsInline: true,
                                        tooltip: `Data fields of the ${event.name} event`,
                                        helpUrl: serviceHelp(service),
                                        service,
                                        event,
                                        output,
                                        template: "event_field",
                                    }
                            )
                    )
                )
            )
        )

        this._runtimeBlocks = [
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
                            ...this.supportedServices.map(
                                service => service.shortId
                            ),
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
                            ...this.supportedServices.map(
                                service => service.shortId
                            ),
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
                            ...this.supportedServices.map(
                                service => service.shortId
                            ),
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
                            ...servicesDSL.supportedServices.map(
                                service => service.shortId
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
                            ...servicesDSL.supportedServices.map(
                                service => service.shortId
                            ),
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
        ]

        return [
            ...this._serviceBlocks,
            ...this._eventFieldBlocks,
            ...this._runtimeBlocks,
            ...toolsBlocks,
        ]
    }

    createCategory(options: CreateCategoryOptions) {
        const { theme, source, liveServices } = options
        const serviceColor = this.createServiceColor(theme)

        const blockServices =
            source?.variables
                .map(v => v.type)
                .filter(type => !!serviceSpecificationFromName(type)) || []
        const usedEvents: Set<jdspec.PacketInfo> = new Set(
            source?.blocks
                ?.map(block => ({
                    block,
                    definition: resolveBlockDefinition(block.type),
                }))
                .filter(({ definition }) => definition?.template === "event")
                .map(({ block, definition }) => {
                    const eventName = block.inputs[0].fields["event"]
                        .value as string
                    return (definition as EventBlockDefinition).events.find(
                        ev => ev.name === eventName
                    )
                })
                .filter(ev => !!ev)
        )
        const jdBlocks = this._serviceBlocks.filter(block => !!block.service)
        const services = uniqueMap(
            jdBlocks,
            block => block.service.shortId,
            block => block.service
        )

        const toolboxServices: jdspec.ServiceSpec[] = uniqueMap(
            Flags.diagnostics
                ? services
                : [
                      ...blockServices
                          .map(srvid =>
                              services.find(
                                  service => service.shortId === srvid
                              )
                          )
                          .filter(srv => !!srv),
                      ...liveServices.map(srv => srv.specification),
                  ],
            srv => srv.shortId,
            srv => srv
        )
            .filter(
                srv => srv && ignoredServices.indexOf(srv.classIdentifier) < 0
            )
            .sort((l, r) => l.name.localeCompare(r.name))

        const servicesCategories: CategoryDefinition[] = toolboxServices
            .map(service => ({
                service,
                serviceBlocks: this._serviceBlocks.filter(
                    block => block.service === service
                ),
            }))
            .map<CategoryDefinition>(({ service, serviceBlocks }) => ({
                kind: "category",
                name: service.name,
                colour: serviceColor(service),
                contents: [
                    ...serviceBlocks.map<BlockReference>(block => ({
                        kind: "block",
                        type: block.type,
                        values: block.values,
                    })),
                    ...this._eventFieldBlocks
                        .filter(
                            ev =>
                                ev.service === service &&
                                usedEvents.has(ev.event)
                        )
                        .map<BlockReference>(block => ({
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
                <BlockReference>{
                    kind: "block",
                    type: INSPECT_BLOCK,
                },
            ],
        }

        return [...servicesCategories, commonCategory, toolsCategory]
    }

    compileEventToVM(options: CompileEventToVMOptions): CompileEventToVMResult {
        const makeAwaitEvent = (
            cmd: string,
            role: string,
            eventName: string
        ) => {
            return <CompileEventToVMResult>{
                expression: <jsep.CallExpression>{
                    type: "CallExpression",
                    arguments:
                        cmd == "awaitEvent"
                            ? [
                                  toMemberExpression(
                                      role.toString(),
                                      eventName.toString()
                                  ),
                              ]
                            : [
                                  toIdentifier(role.toString()),
                                  toIdentifier(eventName.toString()),
                              ],
                    callee: toIdentifier(cmd),
                },
                event: {
                    role: role.toString(),
                    event: eventName.toString(),
                },
            }
        }

        const { block, definition, blockToExpression } = options
        const { inputs } = block
        const { template } = definition

        switch (template) {
            case "event": {
                const { value: role } = inputs[0].fields["role"]
                const { value: eventName } = inputs[0].fields["event"]
                return makeAwaitEvent(
                    "awaitEvent",
                    role.toString(),
                    eventName.toString()
                )
            }
            case "register_change_event": {
                const { value: role } = inputs[0].fields["role"]
                const { register } = definition as RegisterBlockDefinition
                const { expr, errors } = blockToExpression(
                    undefined,
                    inputs[0].child
                )
                return <CompileEventToVMResult>{
                    expression: <jsep.CallExpression>{
                        type: "CallExpression",
                        arguments: [
                            toMemberExpression(role.toString(), register.name),
                            expr,
                        ],
                        callee: toIdentifier("awaitChange"),
                    },
                    errors,
                }
            }
            default: {
                const { type } = block
                switch (type) {
                    case ROLE_BOUND_EVENT_BLOCK: {
                        const { value: role } = inputs[0].fields["role"]
                        const { value: eventName } = inputs[0].fields["event"]
                        return makeAwaitEvent(
                            "roleBound",
                            role.toString(),
                            eventName.toString()
                        )
                    }
                }
            }
        }
        return undefined
    }

    compileExpressionToVM(
        options: CompileExpressionToVMOptions
    ): ExpressionWithErrors {
        const { event, definition, block } = options
        const { inputs, id } = block
        const { template } = definition
        switch (template) {
            case "register_get": {
                const { register } = definition as RegisterBlockDefinition
                const { value: role } = inputs[0].fields["role"]
                const field = inputs[0].fields["field"]
                return {
                    expr: toMemberExpression(
                        role as string,
                        field
                            ? toMemberExpression(
                                  register.name,
                                  field.value as string
                              )
                            : register.name
                    ),
                    errors: [],
                }
            }
            case "event_field": {
                const { event: eventInfo } = definition as EventFieldDefinition
                const errors: VMError[] = []
                if (event.event !== eventInfo.name) {
                    errors.push({
                        sourceId: id,
                        message: `Event ${eventInfo.name} is not available in this handler.`,
                    })
                }
                const field = inputs[0].fields["field"]
                return {
                    expr: toMemberExpression(
                        event.role,
                        toMemberExpression(event.event, field.value as string)
                    ),
                    errors,
                }
            }
            default: {
                const { type } = block
                const errors: VMError[] = []
                switch (type) {
                    case ROLE_BOUND_BLOCK: {
                        const { value: role } = inputs[0].fields["role"]
                        return {
                            expr: {
                                type: "CallExpression",
                                arguments: [toIdentifier(role.toString())],
                                callee: toMemberExpression(
                                    "$fun",
                                    "roleBoundExpression"
                                ),
                            } as jsep.Expression,
                            errors,
                        }
                    }
                }
            }
        }
        return undefined
    }

    compileCommandToVM(options: CompileCommandToVMOptions) {
        const { event, block, definition, blockToExpression } = options
        const { template } = definition
        const { inputs } = block
        switch (template) {
            case "register_set": {
                const { register } = definition as RegisterBlockDefinition
                const { expr, errors } = blockToExpression(
                    event,
                    inputs[0].child
                )
                const { value: role } = inputs[0].fields.role
                return {
                    cmd: makeVMBase(block, {
                        type: "CallExpression",
                        arguments: [
                            toMemberExpression(role as string, register.name),
                            expr,
                        ],
                        callee: toIdentifier("writeRegister"),
                    }),
                    errors,
                }
            }
            case "command": {
                const { command: serviceCommand } =
                    definition as CommandBlockDefinition
                const { value: role } = inputs[0].fields.role
                const exprsErrors = inputs.map(a =>
                    blockToExpression(event, a.child)
                )
                return {
                    cmd: makeVMBase(block, {
                        type: "CallExpression",
                        arguments: exprsErrors.map(p => p.expr),
                        callee: toMemberExpression(
                            role as string,
                            serviceCommand.name
                        ),
                    }),
                    errors: exprsErrors.flatMap(p => p.errors),
                }
            }
            default: {
                const { type } = block
                switch (type) {
                    case SET_STATUS_LIGHT_BLOCK: {
                        console.log("SET_STATUS")
                    }
                }
            }
        }

        return undefined
    }
}
const servicesDSL = new ServicesBlockDomainSpecificLanguage()
export default servicesDSL
