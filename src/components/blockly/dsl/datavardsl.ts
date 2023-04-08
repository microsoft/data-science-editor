/* eslint-disable @typescript-eslint/ban-types */
import { Block, Events, FieldVariable, Variables } from "blockly";
import {
    BlockDefinition,
    BlockReference,
    ButtonDefinition,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    VariableInputDefinition,
    DATA_TABLE_TYPE,
} from "../toolbox";
import BlockDomainSpecificLanguage from "./dsl";
import { BlockWithServices, resolveBlockServices } from "../WorkspaceContext";

const DATA_ADD_VARIABLE_CALLBACK = "data_add_variable";
const DATA_DATAVARIABLE_READ_BLOCK = "data_dataset_read";
const DATA_DATAVARIABLE_WRITE_BLOCK = "data_dataset_write";

const dataVariablesColour = "%{BKY_VARIABLES_HUE}";
const dataVarDsl: BlockDomainSpecificLanguage = {
    id: "dataVariables",
    createBlocks: () => [
        <BlockDefinition>{
            kind: "block",
            type: DATA_DATAVARIABLE_READ_BLOCK,
            message0: "dataset variable %1",
            description:
                "Loads the dataset stored in a variable and starts a new data pipeline.",
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
            dataPreviewField: "after",
            transformData: (b: Block) => {
                const services = resolveBlockServices(b);
                const data = services?.data;
                return Promise.resolve(data);
            },
        },
        <BlockDefinition>{
            kind: "block",
            type: DATA_DATAVARIABLE_WRITE_BLOCK,
            message0: "store in dataset variable %1",
            description:
                "Stores the current dataset in a variable and distaches it to all 'dataset variable` blocks.",
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
            dataPreviewField: "after",
            transformData: (b: Block, data: object[]) => {
                // grab the variable from the block
                const variable = b.getFieldValue("data");
                if (!variable) return Promise.resolve(undefined);
                const readBlocks = b.workspace.getBlocksByType(
                    DATA_DATAVARIABLE_READ_BLOCK,
                    false
                );
                const readServices = readBlocks
                    .filter(b => b.isEnabled())
                    .filter(b => b.getFieldValue("data") === variable)
                    .map(b => (b as BlockWithServices).blockServices)
                    .filter(services => !!services);
                readServices.forEach(services => (services.data = data));
                return Promise.resolve(data);
            },
        },
    ],
    createCategory: () => [
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
        const { type, blockId } = event as any;
        const isBlockChange =
            type === Events.BLOCK_CHANGE || type === Events.BLOCK_MOVE;

        if (isBlockChange || type === Events.FINISHED_LOADING) {
            const workspace = event.getEventWorkspace_();
            if (isBlockChange) {
                const block = workspace.getBlockById(blockId);
                if (block?.type !== DATA_DATAVARIABLE_WRITE_BLOCK) return; // nothing so see here
            }

            // collect set variables blocks,
            // and make sure only 1 of them is enabled
            const setvars = workspace
                .getBlocksByType(DATA_DATAVARIABLE_WRITE_BLOCK, true)
                .filter(b => b.isEnabled());

            // mark and sweep variables, leaving one 1 enabled per kind
            const marked = {};
            while (setvars.length) {
                const block = setvars.shift();
                const variable = (
                    block.getField("data") as FieldVariable
                ).getVariable();
                if (variable) {
                    const name = variable.name;
                    if (marked[name]) {
                        if (block.isEnabled()) {
                            block.setEnabled(false);
                            block.unplug(true);
                        }
                    } else marked[name] = true;
                }
            }
        }
    },
};
export default dataVarDsl;

export function resolveUsedDataVariables(block: Block): {
    reads?: string[];
    write?: string;
} {
    const { type } = block;
    if (type === DATA_DATAVARIABLE_READ_BLOCK) {
        const field = block.getField("data") as FieldVariable;
        const variable = field.getVariable();
        if (variable)
            return {
                reads: [variable.name],
            };
    } else if (type === DATA_DATAVARIABLE_WRITE_BLOCK) {
        const field = block.getField("data") as FieldVariable;
        const variable = field.getVariable();
        if (variable)
            return {
                write: variable.name,
            };
    }

    return {};
}
