import ScatterPlotField from "../fields/ScatterPlotField"
import {
    BlockReference,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    DummyInputDefinition,
    identityTransformData,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import DataColumnChooserField from "../fields/DataColumnChooserField"
import LinePlotField from "../fields/LinePlotField"
import BarChartField from "../fields/BarField"
import PiePlotField from "../fields/PieField"
import DataTableField from "../fields/DataTableField"
import { paletteColorByIndex } from "./palette"
import DataPreviewField from "../fields/DataPreviewField"

const SCATTERPLOT_BLOCK = "chart_scatterplot"
const LINEPLOT_BLOCK = "chart_lineplot"
const PIEPLOT_BLOCK = "chart_pieplot"
const BARCHART_BLOCK = "chart_bar"
const CHART_SHOW_TABLE_BLOCK = "chart_show_table"

const colour = paletteColorByIndex(3)
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
                    dataType: "number",
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
            type: PIEPLOT_BLOCK,
            message0: "pie name %1 value %2 %3 %4 %5",
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "id",
                    dataType: "string",
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
                    type: PiePlotField.KEY,
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
    ],

    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Charts",
            contents: [
                <BlockReference>{ kind: "block", type: SCATTERPLOT_BLOCK },
                <BlockReference>{ kind: "block", type: BARCHART_BLOCK },
                <BlockReference>{ kind: "block", type: LINEPLOT_BLOCK },
                <BlockReference>{ kind: "block", type: PIEPLOT_BLOCK },
                <BlockReference>{ kind: "block", type: CHART_SHOW_TABLE_BLOCK },
            ],
            colour,
        },
    ],
}

export default chartDsl
