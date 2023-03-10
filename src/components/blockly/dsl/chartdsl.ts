import {
    BlockDefinition,
    BlockReference,
    BooleanInputDefinition,
    CategoryDefinition,
    char2DSettingsSchema,
    chartSettingsSchema,
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
import DataColumnChooserField, {
    declareColumns,
} from "../fields/DataColumnChooserField"
import LinePlotField from "../fields/chart/LinePlotField"
import { chartColour } from "./palette"
import VegaChartField from "../fields/chart/VegaChartField"
import type { VisualizationSpec } from "react-vega"
import type { Mark } from "vega-lite/build/src/mark"
import { tidyResolveFieldColumn } from "../fields/tidy"
import { Block } from "blockly"
import JSONSettingsField, {
    JSONSettingsInputDefinition,
} from "../fields/JSONSettingsField"
import HeatMapPlotField from "../fields/chart/HeatMapField"
import { resolveBlockServices } from "../WorkspaceContext"
import ScatterPlotMatrixField from "../fields/chart/ScatterPlotMatrixField"

const LINEPLOT_BLOCK = "chart_lineplot"
const HEATMAP_BLOCK = "chart_heatmap"
const SCATTERPLOTMATRIX_BLOCK = "chart_scatterplot_matrix"

const VEGA_LAYER_BLOCK = "vega_layer"
const VEGA_ENCODING_BLOCK = "vega_encoding"
const VEGA_STATEMENT_TYPE = "vegaStatementType"
const VEGA_ENCODING_STATEMENT_TYPE = "vegaEncodingStatementType"
const VEGA_ENCODING_TYPE_BLOCK = "vega_encoding_type"
const VEGA_ENCODING_AGGREGATE_BLOCK = "vega_encoding_aggregate"
const VEGA_ENCODING_TIME_UNIT_BLOCK = "vega_encoding_time_unit"
const VEGA_ENCODING_BIN_BLOCK = "vega_encoding_bin"
const VEGA_ENCODING_SORT_BLOCK = "vega_encoding_sort"
const VEGA_ENCODING_SORT_FIELD_BLOCK = "vega_encoding_sort_field"

const vegaChannels = [
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
    "color",
    "angle",
    "opacity",
    "fillOpacity",
    "strokeOpacity",
    "shape",
    "size",
    "strokeDash",
    "strokeWidth",
    "text",
].map(s => [s, s])
const vegaAggregates = [
    "mean",
    "median",
    "variance",
    "stdev",
    "min",
    "max",
    "count",
    "distinct",
    "sum",
].map(s => [s, s])

const colour = chartColour
const chartDsl: BlockDomainSpecificLanguage = {
    id: "chart",
    createBlocks: () => [
        <BlockDefinition>{
            kind: "block",
            type: LINEPLOT_BLOCK,
            tooltip: "Renders the block data in a line chart",
            message0: "line chart of x %1 y %2 %3 %4 group %5 %6 %7 %8",
            args0: [
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "x",
                    dataType: "number",
                },
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
                <DataColumnInputDefinition>{
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
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
        },
        <BlockDefinition>{
            kind: "block",
            type: HEATMAP_BLOCK,
            tooltip: "Renders the block data in a 2D heatmap",
            message0: "heatmap of x %1 y %2 color %3 %4 %5 %6",
            args0: [
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "x",
                    dataType: "number",
                },
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "y",
                    dataType: "number",
                },
                <DataColumnInputDefinition>{
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
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
        },
        <BlockDefinition>{
            kind: "block",
            type: SCATTERPLOTMATRIX_BLOCK,
            tooltip: "Renders pairwize scatter plots",
            message0: "scatterplot matrix %1 %2 %3 %4 group %5 %6 %7",
            args0: [
                ...declareColumns(4, { dataType: "number" }),
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "index",
                    dataType: "string",
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: ScatterPlotMatrixField.KEY,
                    name: "plot",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour,
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
                        "bar",
                        "line",
                        "area",
                        "boxplot",
                        "circle",
                        "errorband",
                        "errorbar",
                        "point",
                        "rect",
                        "rule",
                        "square",
                        "text",
                        "tick",
                        "trail",
                        "arc",
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
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: VEGA_ENCODING_BLOCK,
            message0: "encoding %1 field %2 %3 %4",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    options: vegaChannels,
                    name: "channel",
                },
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "field",
                    parentData: true,
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                <StatementInputDefinition>{
                    type: "input_statement",
                    name: "fields",
                    check: VEGA_ENCODING_STATEMENT_TYPE,
                },
            ],
            previousStatement: VEGA_STATEMENT_TYPE,
            nextStatement: VEGA_STATEMENT_TYPE,
            colour,
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: VEGA_ENCODING_TYPE_BLOCK,
            message0: "type %1",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    options: [
                        "quantitative",
                        "ordinal",
                        "nominal",
                        "temporal",
                    ].map(s => [s, s]),
                    name: "type",
                },
            ],
            previousStatement: VEGA_ENCODING_STATEMENT_TYPE,
            nextStatement: VEGA_ENCODING_STATEMENT_TYPE,
            colour,
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: VEGA_ENCODING_AGGREGATE_BLOCK,
            message0: "aggregate %1",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    options: vegaAggregates,
                    name: "aggregate",
                },
            ],
            previousStatement: VEGA_ENCODING_STATEMENT_TYPE,
            nextStatement: VEGA_ENCODING_STATEMENT_TYPE,
            colour,
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: VEGA_ENCODING_TIME_UNIT_BLOCK,
            message0: "time unit %1",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    options: [
                        "year",
                        "quarter",
                        "month",
                        "date",
                        "week",
                        "day",
                        "dayofyear",
                        "hours",
                        "minutes",
                        "seconds",
                        "milliseconds",
                    ].map(s => [s, s]),
                    name: "timeunit",
                },
            ],
            previousStatement: VEGA_ENCODING_STATEMENT_TYPE,
            nextStatement: VEGA_ENCODING_STATEMENT_TYPE,
            colour,
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: VEGA_ENCODING_BIN_BLOCK,
            message0: "bin %1",
            args0: [
                <BooleanInputDefinition>{
                    type: "field_checkbox",
                    checked: true,
                    name: "enabled",
                },
            ],
            previousStatement: VEGA_ENCODING_STATEMENT_TYPE,
            nextStatement: VEGA_ENCODING_STATEMENT_TYPE,
            colour,
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: VEGA_ENCODING_SORT_BLOCK,
            message0: "sort %1",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    options: ["ascending", "descending"].map(s => [s, s]),
                    name: "order",
                },
            ],
            previousStatement: VEGA_ENCODING_STATEMENT_TYPE,
            nextStatement: VEGA_ENCODING_STATEMENT_TYPE,
            colour,
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: VEGA_ENCODING_SORT_FIELD_BLOCK,
            message0: "sort by %1 of %2 %3",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    options: vegaAggregates,
                    name: "aggregate",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "field",
                    parentData: 2,
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    options: ["", "ascending", "descending"].map(s => [s, s]),
                    name: "order",
                },
            ],
            previousStatement: VEGA_ENCODING_STATEMENT_TYPE,
            nextStatement: VEGA_ENCODING_STATEMENT_TYPE,
            colour,
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
                <BlockReference>{ kind: "block", type: LINEPLOT_BLOCK },
                <BlockReference>{ kind: "block", type: HEATMAP_BLOCK },
                <BlockReference>{
                    kind: "block",
                    type: SCATTERPLOTMATRIX_BLOCK,
                },
                <SeparatorDefinition>{
                    kind: "sep",
                },
                <LabelDefinition>{
                    kind: "label",
                    text: "Advanced",
                },
                <BlockReference>{
                    kind: "block",
                    type: VEGA_LAYER_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: VEGA_ENCODING_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: VEGA_ENCODING_TYPE_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: VEGA_ENCODING_SORT_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: VEGA_ENCODING_SORT_FIELD_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: VEGA_ENCODING_AGGREGATE_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: VEGA_ENCODING_TIME_UNIT_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: VEGA_ENCODING_BIN_BLOCK,
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
    const mark: Mark = sourceBlock.getFieldValue("mark")
    const title: string = sourceBlock.getFieldValue("title")
    const spec = {
        title,
        mark: { type: mark, tooltip: true },
        encoding: {},
        data: { name: "values" },
    }

    if (data) encodingToSpec()

    return spec

    function encodingToSpec() {
        let child = sourceBlock.getInputTargetBlock("fields")
        while (child) {
            const blockServices = resolveBlockServices(child)
            blockServices?.setDataWarning(undefined)
            switch (child.type) {
                case VEGA_ENCODING_BLOCK: {
                    const channel: string = child.getFieldValue("channel")
                    const field = tidyResolveFieldColumn(data, child, "field")
                    if (channel) {
                        const encoding =
                            spec.encoding[channel] ||
                            (spec.encoding[channel] = {})
                        if (field) {
                            encoding.field = field
                        }
                        encodingFieldsToSpec(child, encoding)
                    }
                    break
                }
            }

            child = child.getNextBlock()
        }
    }

    function encodingFieldsToSpec(encodingBlock: Block, encoding: any) {
        let child = encodingBlock.getInputTargetBlock("fields")
        while (child) {
            const blockServices = resolveBlockServices(child)
            blockServices?.setDataWarning(undefined)
            switch (child.type) {
                case VEGA_ENCODING_TYPE_BLOCK: {
                    const type: string = child.getFieldValue("type")
                    if (type) encoding.type = type
                    break
                }
                case VEGA_ENCODING_AGGREGATE_BLOCK: {
                    const aggregate: string = child.getFieldValue("aggregate")
                    if (aggregate) encoding.aggregate = aggregate
                    break
                }
                case VEGA_ENCODING_TIME_UNIT_BLOCK: {
                    const timeUnit: string = child.getFieldValue("timeunit")
                    if (timeUnit) {
                        encoding.timeUnit = timeUnit
                        encoding.type = "temporal"
                    }
                    break
                }
                case VEGA_ENCODING_BIN_BLOCK: {
                    const enabled: boolean = child.getFieldValue(
                        "enabled"
                    ) as boolean
                    encoding.bin = !!enabled
                    break
                }
                case VEGA_ENCODING_SORT_BLOCK: {
                    const order: string = child.getFieldValue("order")
                    encoding.sort = order
                    break
                }
                case VEGA_ENCODING_SORT_FIELD_BLOCK: {
                    const op: string = child.getFieldValue("aggregate")
                    const field = tidyResolveFieldColumn(data, child, "field")
                    const order: string = child.getFieldValue("order")
                    const sort: any = (encoding.sort = {})
                    if (op) sort.op = op
                    if (field) sort.field = field
                    if (order) sort.order = order
                    break
                }
            }
            child = child.getNextBlock()
        }
    }
}
