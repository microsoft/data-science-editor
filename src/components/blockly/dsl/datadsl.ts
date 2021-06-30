/* eslint-disable @typescript-eslint/ban-types */
import { Block, BlockSvg, Events, FieldVariable, Variables } from "blockly"
import BuiltinDataSetField from "../fields/BuiltinDataSetField"
import DataColumnChooserField from "../fields/DataColumnChooserField"
import DataTableField from "../fields/DataTableField"
import {
    BlockDefinition,
    BlockReference,
    ButtonDefinition,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    DummyInputDefinition,
    identityTransformData,
    LabelDefinition,
    NumberInputDefinition,
    OptionsInputDefinition,
    VariableInputDefinition,
    TextInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import postTransformData from "./workers/data.proxy"
import {
    DataSelectRequest,
    DataDropRequest,
    DataArrangeRequest,
    DataFilterColumnsRequest,
    DataFilterStringRequest,
    DataSummarizeByGroupRequest,
    DataMutateColumnsRequest,
    DataMutateNumberRequest,
    DataRecordWindowRequest,
    DataBinRequest,
} from "../../../workers/data/dist/node_modules/data.worker"
import { BlockWithServices } from "../WorkspaceContext"

const DATA_ARRANGE_BLOCK = "data_arrange"
const DATA_SELECT_BLOCK = "data_select"
const DATA_DROP_BLOCK = "data_drop"
const DATA_FILTER_COLUMNS_BLOCK = "data_filter_columns"
const DATA_FILTER_STRING_BLOCK = "data_filter_string"
const DATA_MUTATE_COLUMNS_BLOCK = "data_mutate_columns"
const DATA_MUTATE_NUMBER_BLOCK = "data_mutate_number"
const DATA_SUMMARIZE_BY_GROUP_BLOCK = "data_summarize_by_group"
const DATA_ADD_VARIABLE_CALLBACK = "data_add_variable"
const DATA_DATAVARIABLE_READ_BLOCK = "data_dataset_read"
const DATA_DATAVARIABLE_WRITE_BLOCK = "data_dataset_write"
const DATA_DATASET_BUILTIN_BLOCK = "data_dataset_builtin"
const DATA_TABLE_TYPE = "DataTable"
const DATA_SHOW_TABLE_BLOCK = "data_show_table"
const DATA_RECORD_WINDOW_BLOCK = "data_record_window_block"
const DATA_BIN_BLOCK = "data_bin_block"

const colour = "#777"
const dataDsl: BlockDomainSpecificLanguage = {
    id: "dataScience",
    createBlocks: () => [
        {
            kind: "block",
            type: DATA_SHOW_TABLE_BLOCK,
            message0: "show table %1 %2",
            args0: [
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: DataTableField.KEY,
                    name: "table",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour,
            template: "meta",
            inputsInline: false,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: DATA_ARRANGE_BLOCK,
            message0: "arrange %1 %2",
            colour,
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "order",
                    options: [
                        ["ascending", "ascending"],
                        ["descending", "descending"],
                    ],
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const column = b.getFieldValue("column")
                const order = b.getFieldValue("order")
                const descending = order === "descending"
                return postTransformData(<DataArrangeRequest>{
                    type: "arrange",
                    column,
                    descending,
                    data,
                })
            },
            template: "meta",
        },
        {
            kind: "block",
            type: DATA_DROP_BLOCK,
            message0: "drop %1 %2 %3",
            colour,
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column1",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "column2",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "column3",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const columns = [1, 2, 3].map(column =>
                    b.getFieldValue(`column${column}`)
                )
                return postTransformData(<DataDropRequest>{
                    type: "drop",
                    columns,
                    data,
                })
            },
            template: "meta",
        },
        {
            kind: "block",
            type: DATA_SELECT_BLOCK,
            message0: "select %1 %2 %3",
            colour,
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column1",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "column2",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "column3",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const columns = [1, 2, 3].map(column =>
                    b.getFieldValue(`column${column}`)
                )
                return postTransformData(<DataSelectRequest>{
                    type: "select",
                    columns,
                    data,
                })
            },
            template: "meta",
        },
        {
            kind: "block",
            type: DATA_FILTER_COLUMNS_BLOCK,
            message0: "filter %1 %2 %3",
            colour,
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column1",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "logic",
                    options: [
                        [">", "gt"],
                        ["<", "lt"],
                        [">=", "ge"],
                        ["<=", "le"],
                        ["==", "eq"],
                        ["!=", "ne"],
                    ],
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "column2",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const columns = [1, 2].map(column => {
                    return b.getFieldValue(`column${column}`)
                })
                const logic = b.getFieldValue("logic")
                return postTransformData(<DataFilterColumnsRequest>{
                    type: "filter_columns",
                    columns,
                    logic,
                    data,
                })
            },
            template: "meta",
        },
        {
            kind: "block",
            type: DATA_FILTER_STRING_BLOCK,
            message0: "filter %1 %2 %3",
            colour,
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "logic",
                    options: [
                        [">", "gt"],
                        ["<", "lt"],
                        [">=", "ge"],
                        ["<=", "le"],
                        ["==", "eq"],
                        ["!=", "ne"],
                    ],
                },
                <TextInputDefinition>{
                    type: "field_input",
                    name: "rhs",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const column = b.getFieldValue("column")
                const logic = b.getFieldValue("logic")
                const rhs = b.getFieldValue("rhs")
                return postTransformData(<DataFilterStringRequest>{
                    type: "filter_string",
                    column,
                    logic,
                    rhs,
                    data,
                })
            },
            template: "meta",
        },
        {
            kind: "block",
            type: DATA_MUTATE_COLUMNS_BLOCK,
            message0: "mutate %1 %2 %3 %4",
            colour,
            args0: [
                <TextInputDefinition>{
                    type: "field_input",
                    name: "newcolumn",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "lhs",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "logic",
                    options: [
                        ["+", "plus"],
                        ["-", "minus"],
                        ["*", "mult"],
                        ["/", "div"],
                        [">", "gt"],
                        ["<", "lt"],
                        [">=", "ge"],
                        ["<=", "le"],
                        ["==", "eq"],
                        ["!=", "ne"],
                    ],
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "rhs",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const newcolumn = b.getFieldValue("newcolumn")
                const lhs = b.getFieldValue("lhs")
                const rhs = b.getFieldValue("rhs")
                const logic = b.getFieldValue("logic")
                return postTransformData(<DataMutateColumnsRequest>{
                    type: "mutate_columns",
                    newcolumn,
                    lhs,
                    rhs,
                    logic,
                    data,
                })
            },
            template: "meta",
        },
        {
            kind: "block",
            type: DATA_MUTATE_NUMBER_BLOCK,
            message0: "mutate %1 %2 %3 %4",
            colour,
            args0: [
                <TextInputDefinition>{
                    type: "field_input",
                    name: "newcolumn",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "lhs",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "logic",
                    options: [
                        ["+", "plus"],
                        ["-", "minus"],
                        ["*", "mult"],
                        ["/", "div"],
                        [">", "gt"],
                        ["<", "lt"],
                        [">=", "ge"],
                        ["<=", "le"],
                        ["==", "eq"],
                        ["!=", "ne"],
                    ],
                },
                <NumberInputDefinition>{
                    type: "field_number",
                    name: "rhs",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const newcolumn = b.getFieldValue("newcolumn")
                const lhs = b.getFieldValue("lhs")
                const rhs = b.getFieldValue("rhs")
                const logic = b.getFieldValue("logic")
                return postTransformData(<DataMutateNumberRequest>{
                    type: "mutate_number",
                    newcolumn,
                    lhs,
                    rhs,
                    logic,
                    data,
                })
            },
            template: "meta",
        },
        {
            kind: "block",
            type: DATA_SUMMARIZE_BY_GROUP_BLOCK,
            message0: "group %1 by %2 calculate %3",
            colour,
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "by",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "calc",
                    options: [
                        ["Mean", "mean"],
                        ["Median", "med"],
                        ["Min", "min"],
                        ["Max", "max"],
                    ],
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const column = b.getFieldValue("column")
                const by = b.getFieldValue("by")
                const calc = b.getFieldValue("calc")
                return postTransformData(<DataSummarizeByGroupRequest>{
                    type: "summarize_by_group",
                    column,
                    by,
                    calc,
                    data,
                })
            },
            template: "meta",
        },
        <BlockDefinition>{
            kind: "block",
            type: DATA_DATASET_BUILTIN_BLOCK,
            message0: "dataset %1",
            args0: [
                {
                    type: BuiltinDataSetField.KEY,
                    name: "dataset",
                },
            ],
            inputsInline: false,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour,
            template: "meta",
            transformData: identityTransformData,
        },
        <BlockDefinition>{
            kind: "block",
            type: DATA_DATAVARIABLE_READ_BLOCK,
            message0: "dataset variable %1",
            args0: [
                <VariableInputDefinition>{
                    type: "field_variable",
                    name: "data",
                    variable: "data",
                    variableTypes: [DATA_TABLE_TYPE],
                    defaultType: DATA_TABLE_TYPE,
                },
            ],
            inputsInline: false,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour,
            template: "meta",
            transformData: (block: BlockSvg) => {
                const services = (block as BlockWithServices).jacdacServices
                const data = services?.data
                return Promise.resolve(data)
            },
        },
        <BlockDefinition>{
            kind: "block",
            type: DATA_DATAVARIABLE_WRITE_BLOCK,
            message0: "store in dataset variable %1",
            args0: [
                <VariableInputDefinition>{
                    type: "field_variable",
                    name: "data",
                    variable: "data",
                    variableTypes: [DATA_TABLE_TYPE],
                    defaultType: DATA_TABLE_TYPE,
                },
            ],
            inputsInline: false,
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour,
            template: "meta",
            alwaysTransformData: true,
            transformData: (block: BlockSvg, data: object[]) => {
                // grab the variable from the block
                const variable = block.getFieldValue("data")
                if (!variable) return Promise.resolve(undefined)
                const readBlocks = block.workspace.getBlocksByType(
                    DATA_DATAVARIABLE_READ_BLOCK,
                    false
                )
                const readServices = readBlocks
                    .filter(b => b.isEnabled())
                    .filter(b => b.getFieldValue("data") === variable)
                    .map(b => (b as BlockWithServices).jacdacServices)
                    .filter(services => !!services)
                readServices.forEach(services => (services.data = data))
                return Promise.resolve(data)
            },
        },
        <BlockDefinition>{
            kind: "block",
            type: DATA_RECORD_WINDOW_BLOCK,
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
            colour,
            template: "meta",
            transformData: async (
                block: BlockSvg,
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
        <BlockDefinition>{
            kind: "block",
            type: DATA_BIN_BLOCK,
            message0: "bin %1",
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column",
                },
            ],
            inputsInline: false,
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour,
            template: "meta",
            transformData: async (block: BlockSvg, data: object[]) => {
                const column = block.getFieldValue("column")
                return postTransformData(<DataBinRequest>{
                    type: "bin",
                    column,
                    data,
                })
            },
        },
    ],
    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Data",
            colour,
            contents: [
                <LabelDefinition>{
                    kind: "label",
                    text: "Data sets",
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_DATASET_BUILTIN_BLOCK,
                },
                <LabelDefinition>{
                    kind: "label",
                    text: "Operators",
                },
                <BlockReference>{ kind: "block", type: DATA_SHOW_TABLE_BLOCK },
                <BlockReference>{
                    kind: "block",
                    type: DATA_ARRANGE_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_SELECT_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_DROP_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_FILTER_COLUMNS_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_FILTER_STRING_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_MUTATE_COLUMNS_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_MUTATE_NUMBER_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_SUMMARIZE_BY_GROUP_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_BIN_BLOCK,
                },
                <LabelDefinition>{
                    kind: "label",
                    text: "Live",
                },
                <BlockDefinition>{
                    kind: "block",
                    type: DATA_RECORD_WINDOW_BLOCK,
                },
                <LabelDefinition>{
                    kind: "label",
                    text: "Data variables",
                },
                <ButtonDefinition>{
                    kind: "button",
                    text: `Add dataset variable`,
                    callbackKey: DATA_ADD_VARIABLE_CALLBACK,
                    callback: workspace =>
                        Variables.createVariableButtonHandler(
                            workspace,
                            null,
                            DATA_TABLE_TYPE
                        ),
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_DATAVARIABLE_READ_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_DATAVARIABLE_WRITE_BLOCK,
                },
            ],
        },
    ],
    createWorkspaceChangeListener: () => (event: Events.Abstract) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { type, blockId } = event as any
        const isBlockChange =
            type === Events.BLOCK_CHANGE || type === Events.BLOCK_MOVE

        if (isBlockChange || type === Events.FINISHED_LOADING) {
            const workspace = event.getEventWorkspace_()
            if (isBlockChange) {
                const block = workspace.getBlockById(blockId)
                if (block?.type !== DATA_DATAVARIABLE_WRITE_BLOCK) return // nothing so see here
            }

            // collect set variables blocks,
            // and make sure only 1 of them is enabled
            const setvars = workspace
                .getBlocksByType(DATA_DATAVARIABLE_WRITE_BLOCK, true)
                .filter(b => b.isEnabled())

            // mark and sweep variables, leaving one 1 enabled per kind
            const marked = {}
            while (setvars.length) {
                const block = setvars.shift()
                const variable = (
                    block.getField("data") as FieldVariable
                ).getVariable()
                if (variable) {
                    const name = variable.name
                    if (marked[name]) {
                        if (block.isEnabled()) {
                            block.setEnabled(false)
                            block.unplug(true)
                        }
                    } else marked[name] = true
                }
            }
        }
    },
}
export default dataDsl

export function resolveUsedDataVariables(block: Block): {
    reads?: string[]
    write?: string
} {
    const { type } = block
    if (type === DATA_DATAVARIABLE_READ_BLOCK) {
        const field = block.getField("data") as FieldVariable
        const variable = field.getVariable()
        if (variable)
            return {
                reads: [variable.name],
            }
    } else if (type === DATA_DATAVARIABLE_WRITE_BLOCK) {
        const field = block.getField("data") as FieldVariable
        const variable = field.getVariable()
        if (variable)
            return {
                write: variable.name,
            }
    }

    return {}
}
