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
} from "../toolbox"
import BlockDomainSpecificLanguage, {
    CreateBlocksOptions,
    CreateCategoryOptions,
} from "./dsl"
import TwinField from "../fields/TwinField"
import { ServicesBaseDSL } from "./servicesbase"
import type { DataRecordWindowRequest } from "../../../workers/data/dist/node_modules/data.worker"
import { Block } from "blockly"
import postTransformData from "./workers/data.proxy"

const RECORD_WINDOW_BLOCK = "jacdac_record_window"

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
                ],
            },
        ]
    }
}
const sensorsDsl = new SensorsBlockDomainSpecificLanguage()
export default sensorsDsl
