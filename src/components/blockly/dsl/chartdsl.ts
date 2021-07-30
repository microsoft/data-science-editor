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
    TextInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import DataColumnChooserField from "../fields/DataColumnChooserField"
import LinePlotField from "../fields/chart/LinePlotField"
import BarChartField from "../fields/chart/BarField"
import HistogramField from "../fields/chart/HistogramField"
import DataTableField from "../fields/DataTableField"
import { paletteColorByIndex } from "./palette"
import DataPreviewField from "../fields/DataPreviewField"
import BoxPlotField from "../fields/chart/BoxPlotField"
import VegaChartField from "../fields/chart/VegaChartField"
import type { VisualizationSpec } from "react-vega"
import type { AnyMark } from "vega-lite/build/src/mark"
import { tidyHeaders, tidyResolveFieldColumn } from "../fields/tidy"
import { Block } from "blockly"

const SCATTERPLOT_BLOCK = "chart_scatterplot"
const LINEPLOT_BLOCK = "chart_lineplot"
const BARCHART_BLOCK = "chart_bar"
const HISTOGRAM_BLOCK = "chart_histogram"
const BOX_PLOT_BLOCK = "chart_box_plot"
const CHART_SHOW_TABLE_BLOCK = "chart_show_table"

const VEGA_LAYER_BLOCK = "vega_layer"
const VEGA_ENCODING_BLOCK = "vega_encoding"
const VEGA_STATEMENT_TYPE = "vegaStatementType"

const colour = paletteColorByIndex(4)
const chartDsl: BlockDomainSpecificLanguage = {
    id: "chart",
    createBlocks: () => [
        {
            kind: "block",
            type: CHART_SHOW_TABLE_BLOCK,
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
            type: SCATTERPLOT_BLOCK,
            message0: "scatterplot x %1 y %2 %3 %4 %5",
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
                    type: DataPreviewField.KEY,
                    name: "preview",
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
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: BARCHART_BLOCK,
            message0: "bar index %1 value %2 %3 %4 %5",
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
                    type: DataPreviewField.KEY,
                    name: "preview",
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
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: LINEPLOT_BLOCK,
            message0: "line x %1 y %2 %3 %4 %5",
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
                    type: DataPreviewField.KEY,
                    name: "preview",
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
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: HISTOGRAM_BLOCK,
            message0: "histogram of %1 %2 %3 %4",
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "index",
                    dataType: "number",
                },
                {
                    type: DataPreviewField.KEY,
                    name: "preview",
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
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: BOX_PLOT_BLOCK,
            message0: "box plot of %1 by %2 %3 %4 %5",
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
                    type: DataPreviewField.KEY,
                    name: "preview",
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
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: VEGA_LAYER_BLOCK,
            message0: "chart %1 title %2 %3 %4 %5 %6 %7",
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
                <TextInputDefinition>{
                    type: "field_input",
                    name: "title",
                },
                {
                    type: DataPreviewField.KEY,
                    name: "preview",
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
            message0: "encoding %1 as %2 title %3",
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
                <TextInputDefinition>{
                    type: "field_input",
                    name: "title"
                }
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
