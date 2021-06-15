import { BlockSvg, Events, FieldVariable } from "blockly"
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
    OptionsInputDefinition,
    VariableInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import postTransformData from "./workers/data.proxy"
import { DataArrangeMessage } from "../../../workers/dist/node_modules/data.worker"

const DATA_ARRANGE_BLOCK = "data_arrange"
const DATA_ADD_VARIABLE_CALLBACK = "data_add_variable"
const DATA_DATAVARIABLE_READ_BLOCK = "data_dataset_read"
const DATA_DATAVARIABLE_WRITE_BLOCK = "data_dataset_write"
const DATA_DATASET_BUILTIN_BLOCK = "data_dataset_builtin"
const DATA_TABLE_TYPE = "DataTable"
const DATA_SHOW_TABLE_BLOCK = "data_show_table"

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
                return postTransformData(<DataArrangeMessage>{
                    type: "arrange",
                    column,
                    descending,
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
                    name: "dateset",
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
            message0: "data variable %1",
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
        },
        // only 1 allowed to prevent cycles
        <BlockDefinition>{
            kind: "block",
            type: DATA_DATAVARIABLE_WRITE_BLOCK,
            message0: "store in data variable %1",
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
                <LabelDefinition>{
                    kind: "label",
                    text: "Data variables",
                },
                <ButtonDefinition>{
                    kind: "button",
                    text: `Add dataset variable`,
                    callbackKey: DATA_ADD_VARIABLE_CALLBACK,
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
