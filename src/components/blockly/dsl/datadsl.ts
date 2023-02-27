/* eslint-disable @typescript-eslint/ban-types */
import { Block } from "blockly"
import DataColumnChooserField, {
    declareColumns,
    resolveColumns,
} from "../fields/DataColumnChooserField"
import {
    BlockDefinition,
    BlockReference,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    NumberInputDefinition,
    OptionsInputDefinition,
    TextInputDefinition,
    DataColumnInputDefinition,
    calcOptions,
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
    DataReplaceNullyRequest,
    DataRenameRequest,
    DataDistinctRequest,
} from "../../../workers/data/dist/node_modules/data.worker"
import { operatorsColour, computeColour, cleaningColour } from "./palette"
import {
    tidyResolveFieldColumn,
    tidyResolveFieldColumns,
    tidyResolveHeaderType,
    tidySlice,
} from "../fields/tidy"

const DATA_ARRANGE_BLOCK = "data_arrange"
const DATA_SELECT_BLOCK = "data_select"
const DATA_DROP_BLOCK = "data_drop"
const DATA_DROP_DUPLICATES_BLOCK = "data_drop_duplicates"
const DATA_RENAME_COLUMN_BLOCK = "data_rename_column_block"
const DATA_FILTER_COLUMNS_BLOCK = "data_filter_columns"
const DATA_FILTER_STRING_BLOCK = "data_filter_string"
const DATA_MUTATE_COLUMNS_BLOCK = "data_mutate_columns"
const DATA_MUTATE_NUMBER_BLOCK = "data_mutate_number"
const DATA_REPLACE_NULLY_BLOCK = "data_replace_nully"
const DATA_SLICE_BLOCK = "data_slice"
const DATA_SUMMARIZE_BLOCK = "data_summarize"
const DATA_SUMMARIZE_BY_GROUP_BLOCK = "data_summarize_by_group"
const DATA_COUNT_BLOCK = "data_count"
const DATA_BIN_BLOCK = "data_bin"

const dataDsl: BlockDomainSpecificLanguage = {
    id: "dataScience",
    createBlocks: () => [
        {
            kind: "block",
            type: DATA_ARRANGE_BLOCK,
            message0: "sort %1 %2",
            tooltip:
                "Sorts the dataset based on the selected column and order.",
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
        },
        {
            kind: "block",
            type: DATA_DROP_BLOCK,
            message0: "drop %1 %2 %3 %4",
            tooltip: "Removes the selected columns from the dataset",
            colour: cleaningColour,
            args0: [...declareColumns(4, { start: 1 })],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            transformData: (b: Block, data: object[]) => {
                const columns = resolveColumns(data, b, 4, { start: 1 })
                if (!columns?.length) return Promise.resolve(data)
                return postTransformData(<DataDropRequest>{
                    type: "drop",
                    columns,
                    data,
                })
            },
        },
        {
            kind: "block",
            type: DATA_DROP_DUPLICATES_BLOCK,
            message0: "filter duplicates in %1 %2 %3 %4",
            tooltip:
                "Removes rows with identical column values in the dataset.",
            colour: cleaningColour,
            args0: [...declareColumns(4, { start: 1 })],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            transformData: (b: Block, data: object[]) => {
                const columns = resolveColumns(data, b, 4, { start: 1 })
                return postTransformData(<DataDistinctRequest>{
                    type: "distinct",
                    columns,
                    data,
                })
            },
        },
        {
            kind: "block",
            type: DATA_RENAME_COLUMN_BLOCK,
            message0: "rename %1 to %2",
            tooltip: "Rename a columne",
            colour: cleaningColour,
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column",
                },
                <TextInputDefinition>{
                    type: "field_input",
                    name: "name",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            transformData: (b: Block, data: object[]) => {
                const column = tidyResolveFieldColumn(data, b, "column")
                const name = b.getFieldValue("name")
                if (!column || !name) return Promise.resolve(data)
                return postTransformData(<DataRenameRequest>{
                    type: "rename",
                    names: { [column]: name },
                    data,
                })
            },
        },
        {
            kind: "block",
            type: DATA_SELECT_BLOCK,
            message0: "select %1 %2 %3 %4",
            tooltip: "Keeps the selected columns and drops the others",
            colour: operatorsColour,
            args0: [...declareColumns(4, { start: 1 })],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            transformData: (b: Block, data: object[]) => {
                const columns = resolveColumns(data, b, 4, { start: 1 })
                if (!columns?.length) return Promise.resolve(data)
                return postTransformData(<DataSelectRequest>{
                    type: "select",
                    columns,
                    data,
                })
            },
        },
        {
            kind: "block",
            type: DATA_REPLACE_NULLY_BLOCK,
            message0: "replace missing %1 with %2 of type %3",
            tooltip: "Fills missing data cells with the given value.",
            colour: cleaningColour,
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column",
                },
                <TextInputDefinition>{
                    type: "field_input",
                    name: "rhs",
                    spellcheck: false,
                    text: "0",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "type",
                    options: [
                        ["number", "number"],
                        ["string", "string"],
                        ["boolean (yes/no, true/fales, 1/0)", "boolean"],
                    ],
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            transformData: (b: Block, data: object[]) => {
                const column = tidyResolveFieldColumn(data, b, "column")
                const rhs = b.getFieldValue("rhs")
                if (!column) return Promise.resolve(data)
                const type =
                    b.getFieldValue("type") || tidyResolveHeaderType(data, rhs)
                const iv = parseInt(rhs)
                const fv = parseFloat(rhs)
                const nv = isNaN(iv) ? fv : iv
                const v =
                    type === "number"
                        ? nv
                        : type === "boolean"
                        ? Boolean(rhs)
                        : rhs
                return postTransformData(<DataReplaceNullyRequest>{
                    type: "replace_nully",
                    data,
                    replacements: {
                        [column]: v,
                    },
                })
            },
        },
        {
            kind: "block",
            type: DATA_FILTER_COLUMNS_BLOCK,
            message0: "filter %1 %2 %3",
            tooltip: "Selects the rows for which the condition evaluates true",
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
                const columns = resolveColumns(data, b, 2, { start: 1 })
                const logic = b.getFieldValue("logic")
                if (columns.length !== 2) return Promise.resolve(data)
                return postTransformData(<DataFilterColumnsRequest>{
                    type: "filter_columns",
                    columns,
                    logic,
                    data,
                })
            },
        },
        {
            kind: "block",
            type: DATA_FILTER_STRING_BLOCK,
            message0: "filter %1 %2 %3",
            tooltip: "Selects the rows for which the condition evaluates true",
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
        },
        {
            kind: "block",
            type: DATA_MUTATE_COLUMNS_BLOCK,
            message0: "compute column %1 as %2 %3 %4",
            tooltip: "Adds a new column with the result of the computation.",
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
        },
        {
            kind: "block",
            type: DATA_MUTATE_NUMBER_BLOCK,
            message0: "compute column %1 as %2 %3 %4",
            tooltip: "Adds a new column with the result of the computation.",
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
                const columns = tidyResolveFieldColumns(
                    data,
                    b,
                    "column",
                    "number"
                )
                const calc = b.getFieldValue("calc")
                return postTransformData(<DataSummarizeRequest>{
                    type: "summarize",
                    columns,
                    calc,
                    data,
                })
            },
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
        },
        {
            kind: "block",
            type: DATA_SLICE_BLOCK,
            message0: "take %1 rows from %2",
            tooltip:
                "Select N rows from the sample, from the head, tail or a random sample.",
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
    ],
    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Cleanup",
            colour: cleaningColour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: DATA_REPLACE_NULLY_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_DROP_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_DROP_DUPLICATES_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_RENAME_COLUMN_BLOCK,
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
                    type: DATA_ARRANGE_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_SELECT_BLOCK,
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
    ],
}
export default dataDsl
