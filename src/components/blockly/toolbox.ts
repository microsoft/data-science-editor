import { SMap } from "../../../jacdac-ts/src/jdom/utils"
import Blockly, { Block, Workspace } from "blockly"
import { BlockWithServices } from "./WorkspaceContext"
import { paletteColorByIndex } from "./dsl/palette"
import {
    CompileCommandToVMOptions,
    CompileEventToVMOptions,
    CompileEventToVMResult,
} from "./dsl/dsl"
import { CmdWithErrors } from "../jacscript/JacscriptGenerator"
import { JSONSchema4 } from "json-schema"

export const NEW_PROJET_XML = '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>'

export interface InputDefinition {
    type: string
    name?: string
}

export interface ValueInputDefinition extends InputDefinition {
    type: "input_value"
    check?: string | string[]
}

export interface DummyInputDefinition extends InputDefinition {
    type: "input_dummy"
}

export interface StatementInputDefinition extends InputDefinition {
    type: "input_statement"
    check?: string | string[]
}

export interface VariableInputDefinition extends InputDefinition {
    type: "field_variable"
    variable?: string
    variableTypes?: string[]
    defaultType?: string
}

export interface TextInputDefinition extends InputDefinition {
    type: "field_input"
    text?: string
    spellcheck?: boolean
}

export interface OptionsInputDefinition extends InputDefinition {
    type: "field_dropdown"
    options?: [string, string][]
}

export interface NumberInputDefinition extends InputDefinition {
    type: "field_number" | "field_angle" | "field_slider"
    min?: number
    max?: number
    precision?: number
}

export interface ColorInputDefinition extends InputDefinition {
    color?: string
}

export interface DataColumnInputDefinition extends InputDefinition {
    dataType?: "string" | "number" | "boolean"
    parentData?: boolean
}

export interface DataPreviewInputDefinition extends InputDefinition {
    compare?: boolean
}

export type EventTemplate = "event"

export type EventFieldTemplate = "event_field"

export type RegisterValueTemplate = "register_value"

export type RegisterTemplate =
    // client blocks
    | "register_change_event"
    | "register_set"
    | "register_get"
    // server blocks
    | "register_set_server" // register name, expr hole for return value
    | "register_get_server" // register name, special expr block

export type CommandTemplate = "command" | "server" | "raiseNo" | "raiseArgs"

export type BlockTemplate =
    | EventTemplate
    | EventFieldTemplate
    | RegisterTemplate
    | RegisterValueTemplate
    | CommandTemplate
    | "shadow"
    | "meta"
    | string

// eslint-disable-next-line @typescript-eslint/ban-types
export type BlockDataSet = object[]

export type BlockDataSetTransform = (
    block: BlockWithServices,
    data: BlockDataSet,
    previousData: BlockDataSet
) => Promise<BlockDataSet>

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
    dsl?: string

    // data transformation
    transformData?: BlockDataSetTransform

    // show data preview field
    dataPreviewField?: boolean | "after"

    // pass original data to the next node, ignoring transformed data
    passthroughData?: boolean
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const identityTransformData = async (block: Block, data: object[]) =>
    data

export interface ServiceBlockDefinition extends BlockDefinition {
    template: BlockTemplate
    service: jdspec.ServiceSpec
    group?: string
}

export interface ServiceBlockDefinitionFactory<T extends BlockDefinition> {
    jacdacDefinition: T
    init: () => void
}

export function resolveBlockDefinition<T extends BlockDefinition>(
    type: string
) {
    const b = Blockly.Blocks[type] as ServiceBlockDefinitionFactory<T>
    return b?.jacdacDefinition
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
    template: "custom"
    expression?: string
    compileEvent?: (options: CompileEventToVMOptions) => CompileEventToVMResult
    compileCommand?: (options: CompileCommandToVMOptions) => CmdWithErrors
}

export const JSON_TYPE = "JSON"
export const STRING_TYPE = "String"
export const BOOLEAN_TYPE = "Boolean"
export const NUMBER_TYPE = "Number"
export const DATA_TABLE_TYPE = "DataTable"

export const PRIMITIVE_TYPES = [STRING_TYPE, BOOLEAN_TYPE, NUMBER_TYPE]
export const BUILTIN_TYPES = ["", ...PRIMITIVE_TYPES]

export const CODE_STATEMENT_TYPE = "Code"
export const DATA_SCIENCE_STATEMENT_TYPE = "DataScienceStatement"

export const MODEL_BLOCK_CLASS_STATEMENT_TYPE = "ModelBlockClassStatement"
export const MODEL_BLOCK_PREPROCESS_STATEMENT_TYPE =
    "ModelBlockPreprocessStatement"
export const MODEL_BLOCK_LAYER_STATEMENT_TYPE = "ModelBlockLayerStatement"

export const TWIN_BLOCK = "jacdac_tools_twin"
export const SENSOR_BLOCK = "jacdac_sensors_sensor"

export const toolsColour = "#303030"
export const analyzeColour = "#404040"
export const sensorsColour = paletteColorByIndex(0)

export const CHART_WIDTH = 468
export const CHART_HEIGHT = 240
export const CHART_SVG_MAX_ITEMS = 256
export const BAR_MAX_ITEMS = 1 << 10
export const SCATTER_MAX_ITEMS = 1 << 13
export const LINE_MAX_ITEMS = 1 << 10
export const BAR_CORNER_RADIUS = 2

export const TABLE_WIDTH = CHART_WIDTH
export const TABLE_HEIGHT = 480
export const SMALL_TABLE_HEIGHT = 136
export const TABLE_PREVIEW_MAX_ITEMS = 48

export const VM_WARNINGS_CATEGORY = "vm"
export const JSON_WARNINGS_CATEGORY = "json"
export const MB_WARNINGS_CATEGORY = "mb"
export const JACSCRIPT_WARNINGS_CATEGORY = "jcs"

export const WORKSPACE_FILENAME = `blocks.json`

export const chartSettingsSchema: JSONSchema4 = {
    type: "object",
    properties: {
        title: {
            type: "string",
            title: "Chart title",
        },
    },
}
export const axisSchema: JSONSchema4 = {
    type: "object",
    properties: {
        title: {
            type: "string",
            title: "Title",
        },
    },
}
export const scaleSchema: JSONSchema4 = {
    type: "object",
    properties: {
        domainMin: {
            type: "number",
            title: "minimum",
            description: "Sets the minimum value in the scale domain",
        },
        domainMax: {
            type: "number",
            title: "maximum",
            description: "Sets the maximum value in the scale domain",
        },
    },
}
export const encodingSettingsSchema: JSONSchema4 = {
    type: "object",
    properties: {
        axis: axisSchema,
    },
}
export const encodingNumberSettingsSchema: JSONSchema4 = {
    type: "object",
    properties: {
        scale: scaleSchema,
        axis: axisSchema,
    },
}
export const char2DSettingsSchema: JSONSchema4 = {
    type: "object",
    properties: {
        title: {
            type: "string",
            title: "Chart title",
        },
        encoding: {
            type: "object",
            properties: {
                x: {
                    title: "X",
                    ...encodingNumberSettingsSchema,
                },
                y: {
                    title: "Y",
                    ...encodingNumberSettingsSchema,
                },
            },
        },
    },
}
export const charMapSettingsSchema: JSONSchema4 = {
    type: "object",
    properties: {
        title: {
            type: "string",
            title: "Chart title",
        },
        encoding: {
            index: {
                title: "Index",
                ...encodingSettingsSchema,
            },
            value: {
                title: "Value",
                ...encodingNumberSettingsSchema,
            },
        },
    },
}

export interface ContentDefinition {
    kind: "category" | "sep" | "button" | "label" | "block"
    order?: number
    hidden?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BlockReference extends ContentDefinition {
    kind: "block"
    type: string
    values?: SMap<BlockReference>
    blockxml?: string

    value?: number
    min?: number
    max?: number
}

export interface CategoryDefinition extends ContentDefinition {
    kind: "category"
    name: string
    custom?: "VARIABLE" | "PROCEDURE"
    expanded?: boolean
    colour?: string
    categorystyle?: string
    contents?: ContentDefinition[]
}

export interface ButtonDefinition extends ContentDefinition {
    kind: "button"
    text: string
    callbackKey: string
    callback: (workspace: Workspace) => void
}

export interface SeparatorDefinition extends ContentDefinition {
    kind: "sep"
    gap?: number
}

export interface LabelDefinition extends ContentDefinition {
    kind: "label"
    text: string
}

export interface ToolboxConfiguration {
    kind: "categoryToolbox"
    contents: ContentDefinition[]
}

export const calcOptions = [
    "mean",
    "median",
    "min",
    "max",
    "sum",
    "deviation",
    "variance",
].map(n => [n, n])

export function visitToolbox(
    node: ToolboxConfiguration,
    visitor: {
        visitButton?: (button: ButtonDefinition) => void
    }
) {
    const visitContents = (contents: ContentDefinition[]) => {
        contents?.forEach(content => {
            const { kind } = content
            switch (kind) {
                case "button":
                    visitor.visitButton?.(content as ButtonDefinition)
                    break
                case "category": {
                    const cat = content as CategoryDefinition
                    visitContents(cat.contents)
                    break
                }
            }
        })
    }
    visitContents(node?.contents)
}
