import {
    BlockDefinition,
    BlockReference,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    identityTransformData,
    InputDefinition,
    VariableInputDefinition,
    SENSOR_BLOCK,
    SeparatorDefinition,
    NumberInputDefinition,
    TextInputDefinition,
    DataColumnInputDefinition,
    OptionsInputDefinition,
    calcOptions,
    DummyInputDefinition,
    analyzeColour,
    LabelDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import TwinField from "../fields/TwinField"
import type {
    DataRecordWindowRequest,
    DataRollingSummaryRequest,
} from "../../../workers/data/dist/node_modules/data.worker"
import { Block } from "blockly"
import postTransformData from "./workers/data.proxy"
import DataColumnChooserField from "../fields/DataColumnChooserField"
import { tidyResolveFieldColumn } from "../fields/tidy"
import GaugeWidgetField from "../fields/GaugeWidgetField"
import LinePlotField from "../fields/chart/LinePlotField"

const DASHBOARD_GAUGE_BLOCK = "jacdac_widget_gauge"
const RECORD_WINDOW_BLOCK = "jacdac_analyze_record_window"
const ROLLING_SUMMARY_BLOCK = "jacdac_analyze_rolling_summary"

const SERIES_LINEPLOT_BLOCK = "series_chart_lineplot"

const colour = analyzeColour
const analyzeDsl: BlockDomainSpecificLanguage = {
    id: "analyze",

    createBlocks: (): BlockDefinition[] => {
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
            {
                kind: "block",
                type: DASHBOARD_GAUGE_BLOCK,
                message0: "gauge min %1 max %2 %3 %4 %5",
                args0: [
                    <NumberInputDefinition>{
                        type: "field_number",
                        name: "min",
                    },
                    <NumberInputDefinition>{
                        type: "field_number",
                        name: "max",
                        value: 100,
                    },
                    <NumberInputDefinition>{
                        type: DataColumnChooserField.KEY,
                        name: "field",
                        dataType: "number",
                    },
                    <DummyInputDefinition>{
                        type: "input_dummy",
                    },
                    {
                        type: GaugeWidgetField.KEY,
                        name: "widget",
                    },
                ],
                previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
                nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
                colour,
                template: "meta",
                inputsInline: false,
                transformData: identityTransformData,
            },
            <BlockDefinition>{
                kind: "block",
                type: SERIES_LINEPLOT_BLOCK,
                tooltip: "Renders the block data in a line chart",
                message0: "time series %1 %2 %3 %4 %5",
                args0: [
                    <DataColumnInputDefinition>{
                        type: DataColumnChooserField.KEY,
                        name: "y",
                        dataType: "number",
                    },
                    <DataColumnInputDefinition>{
                        type: DataColumnChooserField.KEY,
                        name: "y2",
                        dataType: "number",
                    },
                    <DataColumnInputDefinition>{
                        type: DataColumnChooserField.KEY,
                        name: "y3",
                        dataType: "number",
                    },
                    <DummyInputDefinition>{
                        type: "input_dummy",
                    },
                    {
                        type: LinePlotField.KEY,
                        name: "plot",
                    },
                ],
                previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
                nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
                colour,
                template: "meta",
                inputsInline: false,
                dataPreviewField: false,
                transformData: identityTransformData,
            },
        ]
    },

    createCategory: () => {
        return [
            <CategoryDefinition>{
                kind: "category",
                name: "Analyze",
                colour: analyzeColour,
                contents: [
                    <LabelDefinition>{
                        kind: "label",
                        text: "Aggregators",
                    },
                    <BlockReference>{
                        kind: "block",
                        type: RECORD_WINDOW_BLOCK,
                    },
                    <BlockReference>{
                        kind: "block",
                        type: ROLLING_SUMMARY_BLOCK,
                    },
                    <SeparatorDefinition>{
                        kind: "sep",
                    },
                    <LabelDefinition>{
                        kind: "label",
                        text: "Widgets",
                    },
                    <BlockReference>{
                        kind: "block",
                        type: SERIES_LINEPLOT_BLOCK,
                    },
                    <BlockReference>{
                        kind: "block",
                        type: DASHBOARD_GAUGE_BLOCK,
                    },
                    <SeparatorDefinition>{
                        kind: "sep",
                    },
                    <BlockReference>{
                        kind: "block",
                        type: SENSOR_BLOCK,
                    },
                ],
            },
        ]
    },
}
export default analyzeDsl
