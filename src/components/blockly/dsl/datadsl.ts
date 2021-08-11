/* eslint-disable @typescript-eslint/ban-types */
import {
    Block,
    Events,
    FieldVariable,
    Variables,
    Workspace,
    alert,
} from "blockly"
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
    DataColumnInputDefinition,
    DummyInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import postTransformData from "./workers/data.proxy"
import type {
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
    DataBinRequest,
    DataCorrelationRequest,
    DataLinearRegressionRequest,
} from "../../../workers/data/dist/node_modules/data.worker"
import {
    BlockWithServices,
    resolveBlockServices,
    resolveWorkspaceServices,
} from "../WorkspaceContext"
import FileSaveField from "../fields/FileSaveField"
import { saveCSV } from "./workers/csv.proxy"
import FileOpenField from "../fields/FileOpenField"
import palette from "./palette"
import {
    tidyResolveFieldColumn,
    tidyResolveFieldColumns,
    tidySlice,
} from "../fields/tidy"
import DataTableField from "../fields/DataTableField"
import DataPreviewField from "../fields/DataPreviewField"
import ScatterPlotField from "../fields/chart/ScatterPlotField"
import { importCSVFilesIntoWorkspace } from "../../fs/fs"

const DATA_ARRANGE_BLOCK = "data_arrange"
const DATA_SELECT_BLOCK = "data_select"
const DATA_DROP_BLOCK = "data_drop"
const DATA_FILTER_COLUMNS_BLOCK = "data_filter_columns"
const DATA_FILTER_STRING_BLOCK = "data_filter_string"
const DATA_MUTATE_COLUMNS_BLOCK = "data_mutate_columns"
const DATA_MUTATE_NUMBER_BLOCK = "data_mutate_number"
const DATA_SLICE_BLOCK = "data_slice"
const DATA_SUMMARIZE_BLOCK = "data_summarize"
const DATA_SUMMARIZE_BY_GROUP_BLOCK = "data_summarize_by_group"
const DATA_COUNT_BLOCK = "data_count"
const DATA_ADD_VARIABLE_CALLBACK = "data_add_variable"
const DATA_DATAVARIABLE_READ_BLOCK = "data_dataset_read"
const DATA_DATAVARIABLE_WRITE_BLOCK = "data_dataset_write"
const DATA_DATASET_BUILTIN_BLOCK = "data_dataset_builtin"
const DATA_ADD_DATASET_CALLBACK = "data_add_dataset_variable"
const DATA_TABLE_TYPE = "DataTable"
const DATA_BIN_BLOCK = "data_bin"
const DATA_CORRELATION_BLOCK = "data_correlation"
const DATA_LINEAR_REGRESSION_BLOCK = "data_linear_regression"
const DATA_LOAD_FILE_BLOCK = "data_load_file"
const DATA_SAVE_FILE_BLOCK = "data_save_file"
const DATA_COMMENT_BLOCK = "data_comment_block"

const [datasetColour, operatorsColour, computeColour, statisticsColour] =
    palette()
const dataVariablesColour = "%{BKY_VARIABLES_HUE}"
const calcOptions = [
    "mean",
    "median",
    "min",
    "max",
    "sum",
    "deviation",
    "variance",
].map(n => [n, n])
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
            transformData: (b: Block, data: any[]) => {
                const column = tidyResolveFieldColumn(data, b, "column")
                const order = b.getFieldValue("order")
                const descending = order === "descending"
                if (!column) return Promise.resolve(data)
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
            transformData: (b: Block, data: object[]) => {
                const columns = [1, 2, 3]
                    .map(column =>
                        tidyResolveFieldColumn(data, b, `column${column}`)
                    )
                    .filter(c => !!c)
                if (!columns?.length) return Promise.resolve(data)
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
            message0: "select %1 %2 %3 %4",
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
                {
                    type: DataColumnChooserField.KEY,
                    name: "column4",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            transformData: (b: Block, data: object[]) => {
                const columns = [1, 2, 3, 4]
                    .map(column =>
                        tidyResolveFieldColumn(data, b, `column${column}`)
                    )
                    .filter(c => !!c)
                if (!columns?.length) return Promise.resolve(data)
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
            transformData: (b: Block, data: object[]) => {
                const columns = [1, 2]
                    .map(column =>
                        tidyResolveFieldColumn(data, b, `column${column}`)
                    )
                    .filter(c => !!c)
                const logic = b.getFieldValue("logic")
                if (columns.length !== 2) return Promise.resolve(data)
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
                    spellcheck: false,
                    text: "0",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            transformData: (b: Block, data: object[]) => {
                const column = tidyResolveFieldColumn(data, b, "column")
                const logic = b.getFieldValue("logic")
                const rhs = b.getFieldValue("rhs")
                if (!column) return Promise.resolve(data)
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
            message0: "compute column %1 as %2 %3 %4",
            colour: computeColour,
            args0: [
                <TextInputDefinition>{
                    type: "field_input",
                    name: "newcolumn",
                    spellcheck: false,
                },
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "lhs",
                    dataType: "number",
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
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "rhs",
                    dataType: "number",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            transformData: (b: Block, data: object[]) => {
                const newcolumn = b.getFieldValue("newcolumn")
                const lhs = tidyResolveFieldColumn(data, b, "lhs", {
                    type: "number",
                })
                const rhs = tidyResolveFieldColumn(data, b, "rhs", {
                    type: "number",
                })
                const logic = b.getFieldValue("logic")
                if (!newcolumn || !lhs || !rhs) return Promise.resolve(data)
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
            message0: "compute column %1 as %2 %3 %4",
            colour: computeColour,
            args0: [
                <TextInputDefinition>{
                    type: "field_input",
                    name: "newcolumn",
                    spellcheck: false,
                },
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "lhs",
                    dataType: "number",
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
            transformData: (b: Block, data: object[]) => {
                const newcolumn = b.getFieldValue("newcolumn")
                const lhs = tidyResolveFieldColumn(data, b, "lhs", {
                    type: "number",
                })
                const rhs = b.getFieldValue("rhs")
                const logic = b.getFieldValue("logic")
                if (!newcolumn || !lhs) return Promise.resolve(data)
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
            colour: computeColour,
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column",
                    dataType: "number",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "calc",
                    options: calcOptions,
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: Block, data: any[]) => {
                const columns = tidyResolveFieldColumns(data, b, "column", {
                    type: "number",
                })
                const calc = b.getFieldValue("calc")
                return postTransformData(<DataSummarizeRequest>{
                    type: "summarize",
                    columns,
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
            colour: computeColour,
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
                    options: calcOptions,
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: Block, data: any[]) => {
                const column = tidyResolveFieldColumn(data, b, "column")
                const by = tidyResolveFieldColumn(data, b, "by")
                const calc = b.getFieldValue("calc")
                if (!by) return Promise.resolve([])
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
            type: DATA_SLICE_BLOCK,
            message0: "slice %1 rows from %2",
            colour: operatorsColour,
            args0: [
                <NumberInputDefinition>{
                    type: "field_number",
                    name: "count",
                    min: 1,
                    precision: 1,
                    value: 100,
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "operator",
                    options: [
                        ["head", "head"],
                        ["tail", "tail"],
                        ["sample", "sample"],
                    ],
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: Block, data: any[]) => {
                const count = b.getFieldValue("count")
                const operator = b.getFieldValue("operator")
                return tidySlice(data, {
                    sliceHead: operator === "head" ? count : undefined,
                    sliceTail: operator === "tail" ? count : undefined,
                    sliceSample: operator === "sample" ? count : undefined,
                })
            },
            template: "meta",
        },
        {
            kind: "block",
            type: DATA_COUNT_BLOCK,
            message0: "count distinct %1",
            colour: computeColour,
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
            transformData: (b: Block, data: any[]) => {
                const column = tidyResolveFieldColumn(data, b, "column")
                if (!column) return Promise.resolve([])
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
            tooltip: "Loads a builtin dataset",
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
            dataPreviewField: "after",
            transformData: (b: Block) => {
                const services = resolveBlockServices(b)
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
            dataPreviewField: "after",
            transformData: (b: Block, data: object[]) => {
                // grab the variable from the block
                const variable = b.getFieldValue("data")
                if (!variable) return Promise.resolve(undefined)
                const readBlocks = b.workspace.getBlocksByType(
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
            type: DATA_BIN_BLOCK,
            message0: "bin by %1",
            args0: [
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "column",
                    dataType: "number",
                },
            ],
            inputsInline: false,
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: computeColour,
            template: "meta",
            dataPreviewField: true,
            transformData: async (b: Block, data: object[]) => {
                const column = tidyResolveFieldColumn(data, b, "column", {
                    type: "number",
                })
                if (!column) return Promise.resolve([])
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
            message0: "correlation of %1 %2 %3 %4 %5",
            args0: [
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "x",
                    dataType: "number",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "y",
                    dataType: "number",
                },
                {
                    type: DataPreviewField.KEY,
                    name: "preview",
                    compare: true,
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: DataTableField.KEY,
                    name: "table",
                    transformed: true,
                    small: true,
                },
            ],
            inputsInline: false,
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: statisticsColour,
            template: "meta",
            dataPreviewField: false,
            passthroughData: true,
            transformData: async (b: Block, data: object[]) => {
                const column1 = tidyResolveFieldColumn(data, b, "x", {
                    type: "number",
                })
                const column2 = tidyResolveFieldColumn(data, b, "y", {
                    type: "number",
                })
                if (!column1 || !column2) return Promise.resolve([])
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
            message0: "linear regression of x %1 y %2 %3 %4 %5",
            args0: [
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "x",
                    dataType: "number",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "y",
                    dataType: "number",
                },
                {
                    type: DataPreviewField.KEY,
                    name: "preview",
                    compare: true,
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: ScatterPlotField.KEY,
                    name: "plot",
                    linearRegression: true,
                },
            ],
            inputsInline: false,
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: statisticsColour,
            template: "meta",
            dataPreviewField: false,
            passthroughData: true,
            transformData: async (b: Block, data: object[]) => {
                const column1 = tidyResolveFieldColumn(data, b, "x", {
                    type: "number",
                })
                const column2 = tidyResolveFieldColumn(data, b, "y", {
                    type: "number",
                })
                if (!column1 || !column2) return Promise.resolve([])
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
            dataPreviewField: "after",
            transformData: async (block, data) => {
                const file = block.getField("file") as FileSaveField
                if (file?.fileHandle && data)
                    await saveCSV(file.fileHandle, data)
                return data
            },
        },
        {
            kind: "block",
            type: DATA_COMMENT_BLOCK,
            message0: "comment %1 %2 %3",
            args0: [
                {
                    type: DataPreviewField.KEY,
                    name: "preview",
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: "field_multilinetext",
                    name: "text",
                    text: "And then...",
                    spellcheck: true,
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: operatorsColour,
            template: "meta",
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
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
                <ButtonDefinition>{
                    kind: "button",
                    text: "Import dataset",
                    callbackKey: DATA_ADD_DATASET_CALLBACK,
                    callback: (workspace: Workspace) => {
                        const services = resolveWorkspaceServices(workspace)
                        const directory = services?.workingDirectory
                        if (!directory)
                            alert(
                                "You need to open a directory to import a dataset."
                            )
                        else {
                            importCSVFilesIntoWorkspace(directory.handle)
                                .then(() => directory.sync())
                                .then(() => alert("Datasets imported!"))
                        }
                    },
                },
            ],
        },
        <CategoryDefinition>{
            kind: "category",
            name: "Organize",
            colour: operatorsColour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: DATA_COMMENT_BLOCK,
                },
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
                    type: DATA_SLICE_BLOCK,
                },
            ],
        },
        <CategoryDefinition>{
            kind: "category",
            name: "Compute",
            colour: computeColour,
            contents: [
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
