/* eslint-disable @typescript-eslint/ban-types */
import { Block, BlockSvg, Events, FieldVariable, Variables } from "blockly"
import BuiltinDataSetField from "../fields/BuiltinDataSetField"
import DataColumnChooserField from "../fields/DataColumnChooserField"
import {
    BlockDefinition,
    BlockReference,
    ButtonDefinition,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    identityTransformData,
    NumberInputDefinition,
    OptionsInputDefinition,
    VariableInputDefinition,
    TextInputDefinition,
    SeparatorDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import postTransformData from "./workers/data.proxy"
import {
    DataSelectRequest,
    DataDropRequest,
    DataArrangeRequest,
    DataFilterColumnsRequest,
    DataFilterStringRequest,
    DataSummarizeRequest,
    DataSummarizeByGroupRequest,
    DataMutateColumnsRequest,
    DataMutateNumberRequest,
    DataCountRequest,
    DataRecordWindowRequest,
    DataBinRequest,
    DataCorrelationRequest,
    DataLinearRegressionRequest,
} from "../../../workers/data/dist/node_modules/data.worker"
import { BlockWithServices } from "../WorkspaceContext"
import FileSaveField from "../fields/FileSaveField"
import { saveCSV } from "./workers/csv.proxy"
import FileOpenField from "../fields/FileOpenField"
import palette from "./palette"

const DATA_ARRANGE_BLOCK = "data_arrange"
const DATA_SELECT_BLOCK = "data_select"
const DATA_DROP_BLOCK = "data_drop"
const DATA_FILTER_COLUMNS_BLOCK = "data_filter_columns"
const DATA_FILTER_STRING_BLOCK = "data_filter_string"
const DATA_MUTATE_COLUMNS_BLOCK = "data_mutate_columns"
const DATA_MUTATE_NUMBER_BLOCK = "data_mutate_number"
const DATA_SUMMARIZE_BLOCK = "data_summarize"
const DATA_SUMMARIZE_BY_GROUP_BLOCK = "data_summarize_by_group"
const DATA_COUNT_BLOCK = "data_count"
const DATA_ADD_VARIABLE_CALLBACK = "data_add_variable"
const DATA_DATAVARIABLE_READ_BLOCK = "data_dataset_read"
const DATA_DATAVARIABLE_WRITE_BLOCK = "data_dataset_write"
const DATA_DATASET_BUILTIN_BLOCK = "data_dataset_builtin"
const DATA_TABLE_TYPE = "DataTable"
const DATA_RECORD_WINDOW_BLOCK = "data_record_window"
const DATA_BIN_BLOCK = "data_bin"
const DATA_CORRELATION_BLOCK = "data_correlation"
const DATA_LINEAR_REGRESSION_BLOCK = "data_linear_regression"
const DATA_LOAD_FILE_BLOCK = "data_load_file"
const DATA_SAVE_FILE_BLOCK = "data_save_file"

const [datasetColour, operatorsColour, statisticsColour] = palette()
const dataVariablesColour = "%{BKY_VARIABLES_HUE}"

const dataDsl: BlockDomainSpecificLanguage = {
    id: "dataScience",
    createBlocks: () => [
        {
            kind: "block",
            type: DATA_ARRANGE_BLOCK,
            message0: "arrange %1 %2",
            colour: operatorsColour,
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
            dataPreviewField: true,
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
            colour: operatorsColour,
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
            dataPreviewField: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const columns = [1, 2, 3]
                    .map(column => b.getFieldValue(`column${column}`))
                    .filter(c => !!c)
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
            colour: operatorsColour,
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
            dataPreviewField: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const columns = [1, 2, 3]
                    .map(column => b.getFieldValue(`column${column}`))
                    .filter(c => !!c)
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
            colour: operatorsColour,
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
            dataPreviewField: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const columns = [1, 2]
                    .map(column => b.getFieldValue(`column${column}`))
                    .filter(c => !!c)
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
            colour: operatorsColour,
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
            dataPreviewField: true,
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
            colour: operatorsColour,
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
            dataPreviewField: true,
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
            colour: operatorsColour,
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
            dataPreviewField: true,
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
            type: DATA_SUMMARIZE_BLOCK,
            message0: "summarize %1 calculate %2",
            colour: operatorsColour,
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "calc",
                    options: [
                        ["mean", "mean"],
                        ["median", "med"],
                        ["min", "min"],
                        ["max", "max"],
                    ],
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const column = b.getFieldValue("column")
                const calc = b.getFieldValue("calc")
                return postTransformData(<DataSummarizeRequest>{
                    type: "summarize",
                    column,
                    calc,
                    data,
                })
            },
            template: "meta",
        },
        {
            kind: "block",
            type: DATA_SUMMARIZE_BY_GROUP_BLOCK,
            message0: "group %1 by %2 calculate %3",
            colour: operatorsColour,
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
            dataPreviewField: true,
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
        {
            kind: "block",
            type: DATA_COUNT_BLOCK,
            message0: "count %1",
            colour: operatorsColour,
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const column = b.getFieldValue("column")
                return postTransformData(<DataCountRequest>{
                    type: "count",
                    column,
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
            colour: datasetColour,
            template: "meta",
            dataPreviewField: true,
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
            colour: dataVariablesColour,
            template: "meta",
            dataPreviewField: true,
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
            colour: dataVariablesColour,
            template: "meta",
            dataPreviewField: true,
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
            colour: operatorsColour,
            template: "meta",
            dataPreviewField: true,
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
            colour: operatorsColour,
            template: "meta",
            dataPreviewField: true,
            transformData: async (block: BlockSvg, data: object[]) => {
                const column = block.getFieldValue("column")
                return postTransformData(<DataBinRequest>{
                    type: "bin",
                    column,
                    data,
                })
            },
        },
        <BlockDefinition>{
            kind: "block",
            type: DATA_CORRELATION_BLOCK,
            message0: "correlation %1 %2",
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column1",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "column2",
                },
            ],
            inputsInline: false,
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: statisticsColour,
            template: "meta",
            dataPreviewField: true,
            transformData: async (block: BlockSvg, data: object[]) => {
                const column1 = block.getFieldValue("column1")
                const column2 = block.getFieldValue("column2")
                return postTransformData(<DataCorrelationRequest>{
                    type: "correlation",
                    column1,
                    column2,
                    data,
                })
            },
        },
        <BlockDefinition>{
            kind: "block",
            type: DATA_LINEAR_REGRESSION_BLOCK,
            message0: "linear regression %1 %2",
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column1",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "column2",
                },
            ],
            inputsInline: false,
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: statisticsColour,
            template: "meta",
            dataPreviewField: true,
            transformData: async (block: BlockSvg, data: object[]) => {
                const column1 = block.getFieldValue("column1")
                const column2 = block.getFieldValue("column2")
                return postTransformData(<DataLinearRegressionRequest>{
                    type: "linear_regression",
                    column1,
                    column2,
                    data,
                })
            },
        },
        {
            kind: "block",
            type: DATA_LOAD_FILE_BLOCK,
            message0: "load dataset from file %1",
            args0: [
                {
                    type: FileOpenField.KEY,
                    name: "file",
                },
            ],
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: datasetColour,
            template: "meta",
            inputsInline: false,
            dataPreviewField: true,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: DATA_SAVE_FILE_BLOCK,
            message0: "save dataset to file %1",
            args0: [
                {
                    type: FileSaveField.KEY,
                    name: "file",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: datasetColour,
            template: "meta",
            inputsInline: false,
            dataPreviewField: true,
            transformData: async (block, data) => {
                const file = block.getField("file") as FileSaveField
                if (file?.fileHandle && data)
                    await saveCSV(file.fileHandle, data)
                return data
            },
        },
    ],
    createCategory: () => [
        <SeparatorDefinition>{
            kind: "sep",
        },
        <CategoryDefinition>{
            kind: "category",
            name: "Data sets",
            colour: datasetColour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: DATA_DATASET_BUILTIN_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_LOAD_FILE_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_SAVE_FILE_BLOCK,
                },
            ],
        },
        <CategoryDefinition>{
            kind: "category",
            name: "Operators",
            colour: operatorsColour,
            contents: [
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
                    type: DATA_SUMMARIZE_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_SUMMARIZE_BY_GROUP_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_COUNT_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_BIN_BLOCK,
                },
                <BlockDefinition>{
                    kind: "block",
                    type: DATA_RECORD_WINDOW_BLOCK,
                },
            ],
        },
        <CategoryDefinition>{
            kind: "category",
            name: "Statistics",
            colour: statisticsColour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: DATA_CORRELATION_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_LINEAR_REGRESSION_BLOCK,
                },
            ],
        },
        <CategoryDefinition>{
            kind: "category",
            name: "Data variables",
            colour: dataVariablesColour,
            contents: [
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
