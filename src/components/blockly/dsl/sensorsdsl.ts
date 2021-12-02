import {
    BlockDefinition,
    BlockReference,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    identityTransformData,
    InputDefinition,
    VariableInputDefinition,
    sensorsColour,
    SENSOR_BLOCK,
    SeparatorDefinition,
    NumberInputDefinition,
    TextInputDefinition,
    DataColumnInputDefinition,
    OptionsInputDefinition,
    calcOptions,
} from "../toolbox"
import BlockDomainSpecificLanguage, {
    CreateBlocksOptions,
    CreateCategoryOptions,
} from "./dsl"
import TwinField from "../fields/TwinField"
import { ServicesBaseDSL } from "./servicesbase"
import type {
    DataRecordWindowRequest,
    DataRollingSummaryRequest,
} from "../../../workers/data/dist/node_modules/data.worker"
import { Block } from "blockly"
import postTransformData from "./workers/data.proxy"
import DataColumnChooserField from "../fields/DataColumnChooserField"
import { tidyResolveFieldColumn } from "../fields/tidy"

const RECORD_WINDOW_BLOCK = "jacdac_record_window"
const ROLLING_SUMMARY_BLOCK = "jacdac_rolling_summary"

export class SensorsBlockDomainSpecificLanguage
    extends ServicesBaseDSL
    implements BlockDomainSpecificLanguage
{
    id = "jacdacSensors"

    createBlocks(options: CreateBlocksOptions): BlockDefinition[] {
        const colour = sensorsColour
        return [
            {
                kind: "block",
                type: SENSOR_BLOCK,
                message0: `sensor %1 %2 %3`,
                args0: [
                    <VariableInputDefinition>{
                        type: "field_variable",
                        name: "service",
                        variable: "none",
                        variableTypes: ["sensor"],
                        defaultType: "sensor",
                    },
                    {
                        type: "input_dummy",
                    },
                    <InputDefinition>{
                        type: TwinField.KEY,
                        name: "twin",
                    },
                ],
                colour,
                inputsInline: false,
                tooltip: `Twin of the selected servioce`,
                nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
                helpUrl: "",
                template: "meta",
                transformData: identityTransformData,
            },
            <BlockDefinition>{
                kind: "block",
                type: RECORD_WINDOW_BLOCK,
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
                dataPreviewField: true,
                transformData: async (
                    block: Block,
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
            {
                kind: "block",
                type: ROLLING_SUMMARY_BLOCK,
                message0:
                    "compute column %1 as rolling %2 of %3 with horizon %4",
                colour,
                args0: [
                    <TextInputDefinition>{
                        type: "field_input",
                        name: "newcolumn",
                        spellcheck: false,
                    },
                    <OptionsInputDefinition>{
                        type: "field_dropdown",
                        name: "calc",
                        options: calcOptions,
                    },
                    <DataColumnInputDefinition>{
                        type: DataColumnChooserField.KEY,
                        name: "column",
                        dataType: "number",
                    },
                    <NumberInputDefinition>{
                        type: "field_number",
                        name: "horizon",
                        min: 2,
                        precision: 1,
                    },
                ],
                previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
                nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
                dataPreviewField: true,
                transformData: (b: Block, data: object[]) => {
                    const newcolumn = b.getFieldValue("newcolumn")
                    const column = tidyResolveFieldColumn(data, b, "column", {
                        type: "number",
                    })
                    const horizon = Math.max(2, b.getFieldValue("horizon"))
                    const calc = b.getFieldValue("calc") || "mean"
                    if (!newcolumn || !column) return Promise.resolve(data)
                    return postTransformData(<DataRollingSummaryRequest>{
                        type: "rolling_summary",
                        data,
                        newcolumn,
                        column,
                        horizon,
                        calc,
                    })
                },
                template: "meta",
            },
        ]
    }

    createCategory(options: CreateCategoryOptions): CategoryDefinition[] {
        return [
            {
                kind: "category",
                name: "Sensors",
                colour: sensorsColour,
                contents: [
                    <BlockReference>{
                        kind: "block",
                        type: SENSOR_BLOCK,
                    },
                    <SeparatorDefinition>{
                        kind: "sep",
                    },
                    <BlockDefinition>{
                        kind: "block",
                        type: RECORD_WINDOW_BLOCK,
                    },
                    <BlockDefinition>{
                        kind: "block",
                        type: ROLLING_SUMMARY_BLOCK,
                    },
                ],
            },
        ]
    }
}
const sensorsDsl = new SensorsBlockDomainSpecificLanguage()
export default sensorsDsl
