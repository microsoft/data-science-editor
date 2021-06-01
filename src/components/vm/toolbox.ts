import { SMap } from "../../../jacdac-ts/src/jdom/utils"

export const NEW_PROJET_XML = '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>'

export interface InputDefinition {
    type: string
    name?: string
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

export type EventFieldTemplate = "event_field"

export type RegisterTemplate =
    | "register_change_event"
    | "register_set"
    | "register_get"

export type CommandTemplate = "command"

export type CustomTemplate = "custom"

export type BlockTemplate =
    | EventTemplate
    | EventFieldTemplate
    | RegisterTemplate
    | CommandTemplate
    | CustomTemplate
    | "shadow"
    | "twin"
    | "watch"

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

export interface ServiceBlockDefinitionFactory {
    jacdacDefinition: ServiceBlockDefinition
    init: () => void
}

export interface EventBlockDefinition extends ServiceBlockDefinition {
    template: EventTemplate
    events: jdspec.PacketInfo[]
}

export interface EventFieldDefinition extends ServiceBlockDefinition {
    template: EventFieldTemplate
    event: jdspec.PacketInfo
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
    expression?: string
}

export const WHILE_CONDITION_BLOCK = "jacdac_while_event"
export const WHILE_CONDITION_BLOCK_CONDITION = "condition"
export const WAIT_BLOCK = "jacdac_wait"
export const SET_STATUS_LIGHT_BLOCK = "jacdac_set_status_light"
export const START_SIMULATOR_CALLBACK_KEY = "jacdac_start_simulator"
export const INSPECT_BLOCK = "jacdac_inspect"
export const WATCH_BLOCK = "jacdac_watch"

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

export type ToolboxNode = SeparatorDefinition | CategoryDefinition | ButtonDefinition

export interface ToolboxConfiguration {
    kind: "categoryToolbox"
    contents: ToolboxNode[]
}
