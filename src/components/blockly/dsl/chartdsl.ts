import ScatterPlotField from "../fields/chart/ScatterPlotField"
import {
    BlockReference,
    CategoryDefinition,
    DataColumnInputDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    DummyInputDefinition,
    identityTransformData,
    LabelDefinition,
    OptionsInputDefinition,
    SeparatorDefinition,
    StatementInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import DataColumnChooserField from "../fields/DataColumnChooserField"
import LinePlotField from "../fields/chart/LinePlotField"
import BarChartField from "../fields/chart/BarField"
import HistogramField from "../fields/chart/HistogramField"
import DataTableField from "../fields/DataTableField"
import { paletteColorByIndex } from "./palette"
import BoxPlotField from "../fields/chart/BoxPlotField"
import VegaChartField from "../fields/chart/VegaChartField"
import type { VisualizationSpec } from "react-vega"
import type { AnyMark } from "vega-lite/build/src/mark"
import { tidyHeaders, tidyResolveFieldColumn } from "../fields/tidy"
import { Block } from "blockly"
import type { JSONSchema4 } from "json-schema"
import JSONSettingsField, {
    JSONSettingsInputDefinition,
} from "../fields/JSONSettingsField"
import HeatMapPlotField from "../fields/chart/HeatMapField"

const SCATTERPLOT_BLOCK = "chart_scatterplot"
const LINEPLOT_BLOCK = "chart_lineplot"
const HEATMAP_BLOCK = "chart_heatmap"
const BARCHART_BLOCK = "chart_bar"
const HISTOGRAM_BLOCK = "chart_histogram"
const BOX_PLOT_BLOCK = "chart_box_plot"
const CHART_SHOW_TABLE_BLOCK = "chart_show_table"

const VEGA_LAYER_BLOCK = "vega_layer"
const VEGA_ENCODING_BLOCK = "vega_encoding"
const VEGA_STATEMENT_TYPE = "vegaStatementType"

const chartSettingsSchema: JSONSchema4 = {
    type: "object",
    properties: {
        title: {
            type: "string",
            title: "Chart title",
        },
    },
}
const axisSchema: JSONSchema4 = {
    type: "object",
    properties: {
        title: {
            type: "string",
            title: "Title",
        },
    },
}
const scaleSchema: JSONSchema4 = {
    type: "object",
    properties: {
        domainMin: {
            type: "number",
            title: "minimum",
            description: "Sets the minimum value in the scale domain",
        },
        domainMax: {
            type: "number",
            title: "maximum",
            description: "Sets the maximum value in the scale domain",
        },
    },
}
const encodingSettingsSchema: JSONSchema4 = {
    type: "object",
    properties: {
        axis: axisSchema,
    },
}
const encodingNumberSettingsSchema: JSONSchema4 = {
    type: "object",
    properties: {
        scale: scaleSchema,
        axis: axisSchema,
    },
}
const char2DSettingsSchema: JSONSchema4 = {
    type: "object",
    properties: {
        title: {
            type: "string",
            title: "Chart title",
        },
        encoding: {
            type: "object",
            properties: {
                x: {
                    title: "X",
                    ...encodingNumberSettingsSchema,
                },
                y: {
                    title: "Y",
                    ...encodingNumberSettingsSchema,
                },
            },
        },
    },
}
const charMapSettingsSchema: JSONSchema4 = {
    type: "object",
    properties: {
        title: {
            type: "string",
            title: "Chart title",
        },
        encoding: {
            index: {
                title: "Index",
                ...encodingSettingsSchema,
            },
            value: {
                title: "Value",
                ...encodingNumberSettingsSchema,
            },
        },
    },
}

const colour = paletteColorByIndex(4)
const chartDsl: BlockDomainSpecificLanguage = {
    id: "chart",
    createBlocks: () => [
        {
            kind: "block",
            type: CHART_SHOW_TABLE_BLOCK,
            message0: "show table %1 %2 %3 %4 %5 %6",
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column0",
                },
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
            dataPreviewField: false,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: SCATTERPLOT_BLOCK,
            message0: "scatterplot of x %1 y %2 size %3 group %4 %5 %6 %7",
            args0: [
                {
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
                    type: DataColumnChooserField.KEY,
                    name: "size",
                    dataType: "number",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "group",
                },
                <JSONSettingsInputDefinition>{
                    type: JSONSettingsField.KEY,
                    name: "settings",
                    schema: char2DSettingsSchema,
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: ScatterPlotField.KEY,
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
        {
            kind: "block",
            type: BARCHART_BLOCK,
            message0: "bar chart of index %1 value %2 %3 %4 %5",
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "index",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "value",
                    dataType: "number",
                },
                <JSONSettingsInputDefinition>{
                    type: JSONSettingsField.KEY,
                    name: "settings",
                    schema: charMapSettingsSchema,
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: BarChartField.KEY,
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
        {
            kind: "block",
            type: LINEPLOT_BLOCK,
            message0: "line chart of x %1 y %2 group %3 %4 %5 %6",
            args0: [
                {
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
                    type: DataColumnChooserField.KEY,
                    name: "group",
                },
                <JSONSettingsInputDefinition>{
                    type: JSONSettingsField.KEY,
                    name: "settings",
                    schema: char2DSettingsSchema,
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
        {
            kind: "block",
            type: HEATMAP_BLOCK,
            message0: "heatmap of x %1 y %2 color %3 %4 %5 %6",
            args0: [
                {
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
                    type: DataColumnChooserField.KEY,
                    name: "color",
                },
                <JSONSettingsInputDefinition>{
                    type: JSONSettingsField.KEY,
                    name: "settings",
                    schema: char2DSettingsSchema,
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: HeatMapPlotField.KEY,
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
        {
            kind: "block",
            type: HISTOGRAM_BLOCK,
            message0: "histogram of %1 group %2 %3 %4 %5",
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "index",
                    dataType: "number",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "group",
                },
                <JSONSettingsInputDefinition>{
                    type: JSONSettingsField.KEY,
                    name: "settings",
                    schema: chartSettingsSchema,
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: HistogramField.KEY,
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
        {
            kind: "block",
            type: BOX_PLOT_BLOCK,
            message0: "boxplot of index %1 value %2 group %3 %4 %5 %6",
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "index",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "value",
                    dataType: "number",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "group",
                },
                <JSONSettingsInputDefinition>{
                    type: JSONSettingsField.KEY,
                    name: "settings",
                    schema: charMapSettingsSchema,
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: BoxPlotField.KEY,
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
        {
            kind: "block",
            type: VEGA_LAYER_BLOCK,
            message0: "chart %1 %2 %3 %4 %5 %6",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    options: [
                        "arc",
                        "area",
                        "bar",
                        "boxplot",
                        "circle",
                        "errorband",
                        "errorbar",
                        "line",
                        "point",
                        "rect",
                        "rule",
                        "square",
                        "text",
                        "tick",
                        "trail",
                    ].map(s => [s, s]),
                    name: "mark",
                },
                <JSONSettingsInputDefinition>{
                    type: JSONSettingsField.KEY,
                    name: "settings",
                    schema: chartSettingsSchema,
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                <StatementInputDefinition>{
                    type: "input_statement",
                    name: "fields",
                    check: VEGA_STATEMENT_TYPE,
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: VegaChartField.KEY,
                    name: "chart",
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
        {
            kind: "block",
            type: VEGA_ENCODING_BLOCK,
            message0: "encoding %1 as %2",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    options: [
                        "x",
                        "y",
                        "x2",
                        "y2",
                        "xError",
                        "yError",
                        "xError2",
                        "yError2",
                        "theta",
                        "theta2",
                        "radius",
                        "radius2",
                    ].map(s => [s, s]),
                    name: "channel",
                },
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "field",
                },
            ],
            previousStatement: VEGA_STATEMENT_TYPE,
            nextStatement: VEGA_STATEMENT_TYPE,
            colour,
            template: "meta",
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
        },
    ],

    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Charts",
            contents: [
                <BlockReference>{ kind: "block", type: SCATTERPLOT_BLOCK },
                <BlockReference>{ kind: "block", type: HISTOGRAM_BLOCK },
                <BlockReference>{ kind: "block", type: BOX_PLOT_BLOCK },
                <BlockReference>{ kind: "block", type: BARCHART_BLOCK },
                <BlockReference>{ kind: "block", type: LINEPLOT_BLOCK },
                <BlockReference>{ kind: "block", type: HEATMAP_BLOCK },
                <BlockReference>{ kind: "block", type: CHART_SHOW_TABLE_BLOCK },
                <SeparatorDefinition>{
                    kind: "sep",
                },
                <LabelDefinition>{
                    kind: "label",
                    text: "Custom",
                },
                <BlockReference>{
                    kind: "block",
                    type: VEGA_LAYER_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: VEGA_ENCODING_BLOCK,
                },
            ],
            colour,
        },
    ],
}

export default chartDsl

export function blockToVisualizationSpec(
    sourceBlock: Block,
    // eslint-disable-next-line @typescript-eslint/ban-types
    data: object[]
): VisualizationSpec {
    const { headers, types } = tidyHeaders(data)
    const mark: AnyMark = sourceBlock.getFieldValue("mark")
    const title: string = sourceBlock.getFieldValue("title")
    const spec: VisualizationSpec = {
        title,
        mark,
        encoding: {},
        data: { name: "values" },
    }

    let child = sourceBlock.getInputTargetBlock("fields")
    while (child) {
        switch (child.type) {
            case VEGA_ENCODING_BLOCK: {
                const channel: string = child.getFieldValue("channel")
                const field = tidyResolveFieldColumn(data, child, "field")
                const title: string = child.getFieldValue("title")
                console.log({ child, channel, field })
                if (channel && field) {
                    const type = types[headers.indexOf(field)]
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const encoding: any = (spec.encoding[channel] = {
                        field,
                        type: type === "number" ? "quantitative" : "nominal",
                    })
                    if (title) {
                        encoding.axis = {
                            title,
                        }
                    }
                }
                break
            }
        }

        child = child.getNextBlock()
    }

    return spec
}
