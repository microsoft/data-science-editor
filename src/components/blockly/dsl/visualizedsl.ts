import ScatterPlotField from "../fields/chart/ScatterPlotField";
import {
    BlockDefinition,
    BlockReference,
    CategoryDefinition,
    char2DSettingsSchema,
    charMapSettingsSchema,
    chartSettingsSchema,
    DataColumnInputDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    DummyInputDefinition,
    identityTransformData,
    InputDefinition,
    OptionsInputDefinition,
    SeparatorDefinition,
} from "../toolbox";
import BlockDomainSpecificLanguage from "./dsl";
import DataColumnChooserField, {
    declareColumns,
} from "../fields/DataColumnChooserField";
import BarChartField from "../fields/chart/BarField";
import DataTableField from "../fields/DataTableField";
import { visualizeColour } from "./palette";
import JSONSettingsField, {
    JSONSettingsInputDefinition,
} from "../fields/JSONSettingsField";
import PieChartField from "../fields/chart/PieChartField";
import HistogramField from "../fields/chart/HistogramField";
import BoxPlotField from "../fields/chart/BoxPlotField";

const CHART_SHOW_TABLE_BLOCK = "chart_show_table";
const SCATTERPLOT_BLOCK = "chart_scatterplot";
const BARCHART_BLOCK = "chart_bar";
const PIECHART_BLOCK = "chart_pie";
const HISTOGRAM_BLOCK = "chart_histogram";
const BOX_PLOT_BLOCK = "chart_box_plot";

const colour = visualizeColour;
const visualizeDsl: BlockDomainSpecificLanguage = {
    id: "visualize",
    createBlocks: () => [
        <BlockDefinition>{
            kind: "block",
            type: CHART_SHOW_TABLE_BLOCK,
            tooltip: "Displays the block data as a table",
            message0: "show table %1 %2 %3 %4 %5 %6 %7 %8",
            description: "Displays the dataset as a table with a summary header",
            args0: [
                ...declareColumns(6, { start: 0 }),
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: DataTableField.KEY,
                    name: "table",
                    selectColumns: true,
                    full: true,
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
            type: SCATTERPLOT_BLOCK,
            tooltip: "Renders the block data in a scatter plot",
            message0:
                "scatterplot of x %1 y %2 %3 %4 size %5 group %6 %7 %8 %9",
            description: "Renders the dataset in a scatter plot with optional grouping and size",
            args0: <InputDefinition[]>[
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "x",
                    dataType: "number",
                },
                ...declareColumns(3, { prefix: "y", dataType: "number" }),
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "size",
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
                    type: ScatterPlotField.KEY,
                    name: "plot",
                    ysLength: 3,
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
            type: BARCHART_BLOCK,
            tooltip: "Renders the block data in a bar chart",
            message0: "bar chart of index %1 y %2 of %3 group %4 %5 %6 %7 %8",
            args0: [
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "index",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "yAggregate",
                    options: [
                        "value",
                        "mean",
                        "median",
                        "variance",
                        "stdev",
                        "min",
                        "max",
                        "count",
                        "distinct",
                        "sum",
                    ].map(s => [s, s]),
                },
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "value",
                    dataType: "number",
                },
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "group",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "stack",
                    options: [
                        ["stacked", "stack"],
                        ["overlaped", "unstack"],
                        ["normalize", "normalize"],
                        ["grouped", "xOffset"],
                    ],
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
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
        },
        <BlockDefinition>{
            kind: "block",
            type: PIECHART_BLOCK,
            tooltip: "Renders the block data in a bar chart",
            message0: "pie chart of %1 %2 %3 %4",
            args0: [
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "value",
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
                    type: PieChartField.KEY,
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
            type: HISTOGRAM_BLOCK,
            tooltip: "Renders the block data as a histogram",
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
                    dataType: "string",
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
            inputsInline: false,
            dataPreviewField: false,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: BOX_PLOT_BLOCK,
            message0: "boxplot of %1 value %2 %3 %4 %5",
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
                    type: BoxPlotField.KEY,
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
    ],

    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Visualize",
            contents: [
                <BlockReference>{ kind: "block", type: SCATTERPLOT_BLOCK },
                <BlockReference>{ kind: "block", type: BARCHART_BLOCK },
                <BlockReference>{ kind: "block", type: PIECHART_BLOCK },
                <BlockReference>{ kind: "block", type: HISTOGRAM_BLOCK },
                <BlockReference>{ kind: "block", type: BOX_PLOT_BLOCK },
                <SeparatorDefinition>{ kind: "sep" },
                <BlockReference>{ kind: "block", type: CHART_SHOW_TABLE_BLOCK },
            ],
            colour,
        },
    ],
};

export default visualizeDsl;
