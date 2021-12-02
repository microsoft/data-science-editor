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
} from "../toolbox"
import BlockDomainSpecificLanguage, {
    CreateBlocksOptions,
    CreateCategoryOptions,
} from "./dsl"
import TwinField from "../fields/TwinField"
import { ServicesBaseDSL } from "./servicesbase"
import type {
    DataRecordWindowRequest,
    DataMovingAverageRequest,
} from "../../../workers/data/dist/node_modules/data.worker"
import { Block } from "blockly"
import postTransformData from "./workers/data.proxy"
import DataColumnChooserField from "../fields/DataColumnChooserField"
import { tidyResolveFieldColumn } from "../fields/tidy"

const RECORD_WINDOW_BLOCK = "jacdac_record_window"
const MOVING_AVERAGE_BLOCK = "jacdac_moving_average"

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
                type: MOVING_AVERAGE_BLOCK,
                message0: "moving average %1 of %2 horizon %3",
                colour,
                args0: [
                    <TextInputDefinition>{
                        type: "field_input",
                        name: "newcolumn",
                        spellcheck: false,
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
                    if (!newcolumn || !column) return Promise.resolve(data)
                    return postTransformData(<DataMovingAverageRequest>{
                        type: "moving_average",
                        data,
                        newcolumn,
                        column,
                        horizon,
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
                        type: MOVING_AVERAGE_BLOCK,
                    },
                ],
            },
        ]
    }
}
const sensorsDsl = new SensorsBlockDomainSpecificLanguage()
export default sensorsDsl
