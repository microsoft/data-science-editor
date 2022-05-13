import jsep from "jsep"
import { Theme } from "@mui/material"
import { withPrefix } from "gatsby"
import {
    dashify,
    humanify,
    isNumericType,
} from "../../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import {
    GamepadReg,
    SRV_BOOTLOADER,
    SRV_CONTROL,
    SRV_DASHBOARD,
    SRV_GAMEPAD,
    SRV_INFRASTRUCTURE,
    SRV_JACSCRIPT_CONDITION,
    SRV_JACSCRIPT_MANAGER,
    SRV_LOGGER,
    SRV_PROTO_TEST,
    SRV_PROXY,
    SRV_ROLE_MANAGER,
    SRV_UNIQUE_BRAIN,
} from "../../../../jacdac-ts/src/jdom/constants"
import { Flags } from "../../../../jacdac-ts/src/jdom/flags"
import {
    isHighLevelEvent,
    isHighLevelRegister,
    isCommand,
    isSensor,
    serviceSpecifications,
    serviceSpecificationFromClassIdentifier,
    isReading,
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
import NoteField from "../fields/NoteField"
import {
    BlockDefinition,
    BlockReference,
    BOOLEAN_TYPE,
    ButtonDefinition,
    CategoryDefinition,
    CODE_STATEMENT_TYPE,
    CommandBlockDefinition,
    CustomBlockDefinition,
    EventBlockDefinition,
    EventFieldDefinition,
    InputDefinition,
    JSON_TYPE,
    LabelDefinition,
    NUMBER_TYPE,
    OptionsInputDefinition,
    RegisterBlockDefinition,
    resolveBlockDefinition,
    ServiceBlockDefinition,
    STRING_TYPE,
    VariableInputDefinition,
} from "../toolbox"
import {
    ExpressionWithErrors,
    makeVMBase,
} from "../../jacscript/JacscriptGenerator"
import {
    CompileCommandToVMOptions,
    CompileEventToVMOptions,
    CompileEventToVMResult,
    CompileExpressionToVMOptions,
    CreateCategoryOptions,
} from "./dsl"
import { Variables } from "blockly"
import { paletteColorByIndex } from "./palette"
import { VariableJSON } from "./workspacejson"
import { JDService } from "../../../../jacdac-ts/src/jdom/service"
import { groupBy } from "../../../../jacdac-ts/src/jdom/utils"

export const SET_STATUS_LIGHT_BLOCK = "jacdac_set_status_light"
export const ROLE_BOUND_EVENT_BLOCK = "jacdac_role_bound_event"
export const ROLE_BOUND_BLOCK = "jacdac_role_bound"

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
    SRV_INFRASTRUCTURE,
    SRV_DASHBOARD,
    SRV_PROXY,
    SRV_UNIQUE_BRAIN,
    SRV_JACSCRIPT_CONDITION,
    SRV_JACSCRIPT_MANAGER,
]

const customMessages = [
    {
        service: SRV_GAMEPAD,
        register: GamepadReg.Direction,
        field: "buttons",
        get: "is %1 %2 pressed",
    },
]

const fieldsSupported = (pkt: jdspec.PacketInfo) =>
    pkt.fields.every(toBlocklyType)

const fieldName = (reg: jdspec.PacketInfo, field: jdspec.PacketMember) =>
    field.name === "_" ? reg.name : field.name

const fieldToShadow = (
    service: jdspec.ServiceSpec,
    info: jdspec.PacketInfo,
    field: jdspec.PacketMember
): BlockReference =>
    isBooleanField(field)
        ? { kind: "block", type: "jacdac_on_off" }
        : field.unit === "AudHz"
        ? { kind: "block", type: NoteField.SHADOW.type }
        : field.unit === "ms"
        ? { kind: "block", type: "jacdac_time_picker_ms" }
        : field.unit === "s"
        ? { kind: "block", type: "jacdac_time_picker" }
        : field.unit === "°"
        ? {
              kind: "block",
              type: "jacdac_angle",
          }
        : field.unit === "/"
        ? { kind: "block", type: "jacdac_ratio" }
        : /^%/.test(field.unit)
        ? { kind: "block", type: "jacdac_percent" }
        : isStringField(field)
        ? { kind: "block", type: "text" }
        : field.type === "u8"
        ? { kind: "block", type: "jacdac_byte" }
        : {
              kind: "block",
              type: "math_number",
              value: field.defaultValue || 0,
              min: field.typicalMin || field.absoluteMin,
              max: field.typicalMax || field.absoluteMax,
          }

const variableName = (srv: jdspec.ServiceSpec, client: boolean) =>
    `${humanify(srv.camelName).toLowerCase()}${client ? "" : " server"} 1`

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

type ServicePackets = {
    service: jdspec.ServiceSpec
    packets: jdspec.PacketInfo[]
}

// exports
export function toServiceName(service: JDService) {
    let name = ""
    const instanceName = service.instanceName
    if (instanceName) name += humanify(dashify(instanceName))
    else {
        name += humanify(dashify(service.specification.shortName))
        if (
            service.device.services({
                serviceClass: service.serviceClass,
            }).length > 1
        )
            name += `[${service.serviceIndex.toString(16)}]`
    }
    name += ` (${service.device.shortId})`
    return name
}

export function toServiceType(service: JDService) {
    return isSensor(service.specification) ? "sensor" : "service"
}

export function toRoleType(service: jdspec.ServiceSpec, client = true) {
    return `${service.classIdentifier}:${client ? "client" : "server"}`
}

export function parseRoleType(v: VariableJSON) {
    const split = v.type.split(":")
    return {
        role: v.name,
        serviceClass: parseInt(split[0]),
        client: split.length === 2 ? split[1] === "client" : true,
    }
}

export const fieldsToFieldInputs = (info: jdspec.PacketInfo) =>
    info.fields.map(field => ({
        type: "input_value",
        name: fieldName(info, field),
        check: toBlocklyType(field),
    }))

export const fieldsToValues = (
    service: jdspec.ServiceSpec,
    info: jdspec.PacketInfo
) =>
    toMap<jdspec.PacketMember, BlockReference | BlockDefinition>(
        info.fields,
        field => fieldName(info, field),
        field => fieldToShadow(service, info, field)
    )

export const fieldsToMessage = (info: jdspec.PacketInfo) =>
    info.fields.map((field, i) => `${humanify(field.name)} %${2 + i}`).join(" ")

export interface ServiceRegister {
    service: jdspec.ServiceSpec
    register: jdspec.PacketInfo
}

interface ServiceRegisterField extends ServiceRegister {
    field: jdspec.PacketMember
    einfo: jdspec.EnumInfo
}

export const serviceHelp = (service: jdspec.ServiceSpec) => {
    return withPrefix(`/services/${service.shortId}`)
}

const sensorColor = paletteColorByIndex(1)
const otherColor = paletteColorByIndex(3)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createServiceColor = (theme: Theme) => {
    const serviceColor = (srv: jdspec.ServiceSpec) =>
        isSensor(srv) ? sensorColor : otherColor
    return serviceColor
}

export const roleVariable = (
    service: jdspec.ServiceSpec,
    client = true
): VariableInputDefinition => {
    return {
        type: "field_variable",
        name: "role",
        variable: variableName(service, client),
        variableTypes: [toRoleType(service, client)],
        defaultType: toRoleType(service, client),
    }
}

export const getServiceInfo = () => {
    const allServices = serviceSpecifications()
    const supportedServices = allServices
        .filter(
            service =>
                !/^_/.test(service.shortId) && service.status !== "deprecated"
        )
        .filter(service => ignoredServices.indexOf(service.classIdentifier) < 0)
    const registers = arrayConcatMany(
        supportedServices.map(service =>
            service.packets.filter(isHighLevelRegister).map(register => ({
                service,
                register,
            }))
        )
    )
    const [registerSimples, registerComposites] = splitFilter(
        registers,
        reg => reg.register.fields.length == 1
    )
    const [registerSimpleTypes, registerSimpleOthers] = splitFilter(
        registerSimples,
        ({ register }) => !!toBlocklyType(register.fields[0])
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

    return {
        allServices,
        supportedServices,
        registers,
        registerSimpleTypes,
        registerComposites,
        registerSimpleEnumTypes,
        registerCompositeEnumTypes,
        events: supportedServices
            .map(service => ({
                service,
                events: service.packets.filter(isHighLevelEvent),
            }))
            .filter(kv => !!kv.events.length),

        commands: arrayConcatMany(
            supportedServices.map(service =>
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
        ),
    }
}

export class ServicesBaseDSL {
    // only state required across methods of class
    protected _serviceBlocks: ServiceBlockDefinition[] = []
    protected _eventFieldBlocks: EventFieldDefinition[] = []
    protected serviceColor: (srv: jdspec.ServiceSpec) => string

    protected assignGroup(register: jdspec.PacketInfo) {
        return register?.kind === "const" ? "Configuration" : ""
    }

    protected makeRegisterSimpleGetBlocks(
        registers: ServiceRegister[],
        client = true
    ) {
        return registers.map<RegisterBlockDefinition>(
            ({ service, register }) => ({
                kind: "block",
                type: `jacdac_get_simple_${service.shortId}_${register.name}${
                    client ? "" : "_server"
                }`,
                message0:
                    customMessage(service, register, register.fields[0])?.get ||
                    `%1 ${humanify(register.name)}`,
                args0: [roleVariable(service, client)],
                inputsInline: true,
                output: toBlocklyType(register.fields[0]),
                colour: this.serviceColor(service),
                tooltip: register.description,
                helpUrl: serviceHelp(service),
                service,
                register,
                field: register.fields[0],
                group: this.assignGroup(register),
                template: "register_get",
            })
        )
    }

    protected makeRegisterSetBlocks(
        registers: ServiceRegister[],
        client = true
    ) {
        return registers
            .filter(({ register }) => !client || register.kind === "rw")
            .filter(({ register }) => fieldsSupported(register))
            .map<RegisterBlockDefinition>(({ service, register }) => ({
                kind: "block",
                type: `jacdac_set_${service.shortId}_${register.name}${
                    client ? "" : "_server"
                }`,
                message0: isEnabledRegister(register)
                    ? `set %1 %2`
                    : `set %1 ${register.name} to ${
                          register.fields.length === 1
                              ? "%2"
                              : fieldsToMessage(register)
                      }`,
                args0: [
                    roleVariable(service, client),
                    ...fieldsToFieldInputs(register),
                ],
                values: fieldsToValues(service, register),
                inputsInline: true,
                colour: this.serviceColor(service),
                tooltip: register.description,
                helpUrl: serviceHelp(service),
                service,
                register,
                previousStatement: CODE_STATEMENT_TYPE,
                nextStatement: CODE_STATEMENT_TYPE,
                group: this.assignGroup(register),
                template: "register_set",
            }))
    }

    protected makeRegisterChangeByEventBlocks(
        registers: ServiceRegister[],
        client = true
    ) {
        return registers
            .filter(({ service }) => !service.packets.some(isHighLevelEvent))
            .filter(
                ({ register }) =>
                    register.fields.length === 1 &&
                    isNumericType(register.fields[0]) &&
                    isReading(register)
            )
            .map<RegisterBlockDefinition>(({ service, register }) => ({
                kind: "block",
                type: `jacdac_change_by_events_${service.shortId}_${
                    register.name
                }${client ? "" : "_server"}`,
                message0: `on %1 ${humanify(register.name)} change by %2`,
                args0: [
                    roleVariable(service, client),
                    ...fieldsToFieldInputs(register),
                ].filter(v => !!v),
                values: fieldsToValues(service, register),
                inputsInline: true,
                nextStatement: CODE_STATEMENT_TYPE,
                colour: this.serviceColor(service),
                tooltip: `Event raised when ${register.name} changes`,
                helpUrl: serviceHelp(service),
                service,
                register,

                template: "register_change_event",
            }))
    }

    protected makeRegisterNumericsGetBlocks(
        registers: ServiceRegister[],
        client = true
    ) {
        return registers
            .filter(re => re.register.fields.some(isNumericType))
            .map<RegisterBlockDefinition>(({ service, register }) => ({
                kind: "block",
                type: `jacdac_get_numerics_${service.shortId}_${register.name}${
                    client ? "" : "_server"
                }`,
                message0: `%1 ${humanify(register.name)}${
                    register.fields.length > 1 ? ` %2` : ""
                }`,
                args0: [
                    roleVariable(service, client),
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
                colour: this.serviceColor(service),
                tooltip: register.description,
                helpUrl: serviceHelp(service),
                service,
                register,
                group: this.assignGroup(register),
                template: "register_get",
            }))
    }

    protected makeRegisterEnumGetBlocks(
        registers: ServiceRegisterField[],
        client = true
    ) {
        return registers.map<RegisterBlockDefinition>(
            ({ service, register, field, einfo }) => ({
                kind: "block",
                type: `jacdac_get_enum_${service.shortId}_${register.name}_${
                    field.name
                }${client ? "" : "_server"}`,
                message0:
                    customMessage(service, register, field)?.get ||
                    `%1 ${humanify(register.name)}${
                        field.name === "_" ? "" : ` ${field.name}`
                    } %2`,
                args0: [
                    roleVariable(service, client),
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
                colour: this.serviceColor(service),
                tooltip: register.description,
                helpUrl: serviceHelp(service),
                service,
                register,
                field,
                group: this.assignGroup(register),
                template: "register_get",
            })
        )
    }

    // generate accessor blocks for event/command data with numbers
    protected makeFieldBlocks(sps: ServicePackets[], client = true) {
        const worker = (
            sp: ServicePackets,
            output: string,
            filter: (field: jdspec.PacketMember) => boolean
        ) => {
            const { service, packets } = sp
            return packets
                .filter(pkt => pkt.fields.filter(filter).length > 0)
                .map(pkt => ({ service, pkt }))
                .map(
                    ({ service, pkt }) =>
                        <EventFieldDefinition>{
                            kind: "block",
                            type: `jacdac_event_field_${output.toLowerCase()}_${
                                service.shortId
                            }_${pkt.name}${client ? "" : "_server"}`,
                            message0: `${pkt.name} %1`,
                            args0: [
                                <InputDefinition>{
                                    type: "field_dropdown",
                                    name: "field",
                                    options: pkt.fields.map(field => [
                                        humanify(field.name),
                                        field.name,
                                    ]),
                                },
                            ],
                            colour: this.serviceColor(service),
                            inputsInline: true,
                            tooltip: `Data fields of the ${pkt.name} ${
                                client ? "event" : "command"
                            }`,
                            helpUrl: serviceHelp(service),
                            service,
                            event: pkt,
                            output,
                            template: "event_field",
                        }
                )
        }

        return arrayConcatMany(
            arrayConcatMany(
                eventFieldGroups.map(({ output, filter }) =>
                    sps.map(sp => worker(sp, output, filter))
                )
            )
        )
    }

    protected createCategoryHelper(options: CreateCategoryOptions) {
        const { theme, source, liveServices } = options
        this.serviceColor = createServiceColor(theme)

        const blockServices: { serviceClass: number }[] =
            source?.variables
                .map(parseRoleType)
                .filter(
                    vt =>
                        !!serviceSpecificationFromClassIdentifier(
                            vt.serviceClass
                        )
                ) || []
        const usedEvents: Set<jdspec.PacketInfo> = new Set(
            source?.blocks
                ?.map(block => ({
                    block,
                    definition: resolveBlockDefinition(block.type),
                }))
                .filter(({ definition }) => definition?.template === "event")
                .map(({ block, definition }) => {
                    const { events } = definition as EventBlockDefinition
                    if (events.length === 1) return events[0]
                    else {
                        const eventName = block.inputs[0].fields["event"]
                            .value as string
                        return events.find(ev => ev.name === eventName)
                    }
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
                          .map(pair =>
                              services.find(
                                  service =>
                                      service.classIdentifier ===
                                      pair.serviceClass
                              )
                          )
                          .filter(srv => !!srv),
                      ...liveServices.map(s => s.specification),
                  ],
            srv => srv.shortId,
            srv => srv
        )
            .filter(
                srv => srv && ignoredServices.indexOf(srv.classIdentifier) < 0
            )
            .sort((l, r) => l.name.localeCompare(r.name))

        const getFieldBlocks = (
            service: jdspec.ServiceSpec,
            fieldBlocks: EventFieldDefinition[]
        ) =>
            fieldBlocks
                .filter(
                    ev => ev.service === service && usedEvents.has(ev.event)
                )
                .map<BlockReference>(block => ({
                    kind: "block",
                    type: block.type,
                    values: block.values,
                    group: "Events",
                }))

        const makeCategory = (
            service: jdspec.ServiceSpec,
            isClient: boolean,
            serviceBlocks: ServiceBlockDefinition[],
            eventFieldBLocks: EventFieldDefinition[]
        ) => {
            const fieldBlocks = getFieldBlocks(service, eventFieldBLocks)
            const groupedServiceBlocks = groupBy(
                <ServiceBlockDefinition[]>[...serviceBlocks, ...fieldBlocks],
                b => b.group || ""
            )
            return {
                kind: "category",
                name: service.name + (isClient ? "" : " Server"),
                colour: this.serviceColor(service),
                contents: [
                    <ButtonDefinition>{
                        kind: "button",
                        text: `Add ${service.name} ${
                            isClient ? "role" : "server"
                        }`,
                        callbackKey: `jacdac_add_role_callback_${toRoleType(
                            service,
                            isClient
                        )}`,
                        callback: workspace =>
                            Variables.createVariableButtonHandler(
                                workspace,
                                null,
                                toRoleType(service, isClient)
                            ),
                    },
                    ...arrayConcatMany(
                        Object.keys(groupedServiceBlocks).map(group => [
                            group
                                ? <LabelDefinition>{
                                      kind: "label",
                                      text: group,
                                  }
                                : undefined,
                            ...groupedServiceBlocks[group],
                        ])
                    ),
                ].filter(b => !!b),
            }
        }

        return (
            serviceBlocks: ServiceBlockDefinition[],
            eventFieldBlocks: EventFieldDefinition[],
            client = true
        ) =>
            toolboxServices
                .map(serviceClient => ({
                    serviceClient,
                    serviceBlocks: serviceBlocks.filter(
                        block => block.service === serviceClient
                    ),
                }))
                .map<CategoryDefinition>(
                    sc =>
                        makeCategory(
                            sc.serviceClient,
                            client,
                            sc.serviceBlocks,
                            eventFieldBlocks
                        ) as CategoryDefinition
                )
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
            case "custom": {
                const { compileEvent } = definition as CustomBlockDefinition
                return compileEvent(options)
            }
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
                        if (role === "none")
                            return <CompileEventToVMResult>{
                                expression: <jsep.CallExpression>{
                                    type: "CallExpression",
                                    arguments: [],
                                    callee: toIdentifier("nop"),
                                },
                            }
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
            case "custom": {
                const { compileCommand } = definition as CustomBlockDefinition
                return compileCommand(options)
            }
            case "register_set": {
                // TODO: need to handle the case of writing a register with fields
                const { register } = definition as RegisterBlockDefinition
                const exprsErrors = inputs.map(a =>
                    blockToExpression(event, a.child)
                )
                const { value: role } = inputs[0].fields.role
                return {
                    cmd: makeVMBase(block, {
                        type: "CallExpression",
                        arguments: [
                            toMemberExpression(role as string, register.name),
                            ...exprsErrors.map(p => p.expr),
                        ],
                        callee: toIdentifier("writeRegister"),
                    }),
                    errors: exprsErrors.flatMap(p => p.errors),
                }
            }
            case "raiseNo":
            case "raiseArgs":
            case "command": {
                const { command: serviceCommand } =
                    definition as CommandBlockDefinition
                const { value: role } = inputs[0].fields.role
                const eventName =
                    template === "raiseNo"
                        ? inputs[0].fields["event"].value.toString()
                        : ""
                const exprsErrors =
                    template === "raiseNo"
                        ? []
                        : inputs.map(a => {
                              return blockToExpression(event, a.child)
                          })
                return {
                    cmd: makeVMBase(block, {
                        type: "CallExpression",
                        arguments: exprsErrors.map(p => p.expr),
                        callee: toMemberExpression(
                            role as string,
                            eventName ? eventName : serviceCommand.name
                        ),
                    }),
                    errors: exprsErrors.flatMap(p => p.errors),
                }
            }
            case "server": {
                return {
                    cmd: makeVMBase(block, {
                        type: "CallExpression",
                        arguments: [],
                        callee: toIdentifier("nop"),
                    }),
                    errors: [],
                }
            }
            default: {
                const { type } = block
                switch (type) {
                    case SET_STATUS_LIGHT_BLOCK: {
                        const { expr, errors } = blockToExpression(
                            undefined,
                            inputs[0].child
                        )
                        return {
                            cmd: makeVMBase(block, {
                                type: "CallExpression",
                                arguments: [expr],
                                callee: <jsep.Literal>{
                                    type: "Literal",
                                    raw: "control.setStatusLight",
                                },
                            }),
                            errors,
                        }
                    }
                    default:
                        console.log(type)
                        break
                }
            }
        }

        console.log(options)
        return undefined
    }
}
