import ScatterPlotField from "../fields/ScatterPlotField"
import {
    BlockReference,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    DummyInputDefinition,
    identityTransformData,
    NumberInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import DataColumnChooserField from "../fields/DataColumnChooserField"
import LinePlotField from "../fields/LinePlotField"
import GaugeWidgetField from "../fields/GaugeWidgetField"
import BarChartField from "../fields/BarField"

const SCATTERPLOT_BLOCK = "chart_scatterplot"
const LINEPLOT_BLOCK = "chart_lineplot"
const BARCHART_BLOCK = "chart_bar"
const DASHBOARD_GAUGE_BLOCK = "jacdac_dashboard_gauge"

const colour = "#999"
const chartDSL: BlockDomainSpecificLanguage = {
    id: "chart",
    createBlocks: () => [
        {
            kind: "block",
            type: SCATTERPLOT_BLOCK,
            message0: "scatterplot x %1 y %2 %3 %4",
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "x",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "y",
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
            message0: "bar index %1 value %2 %3 %4",
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "index",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "value",
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
            message0: "line x %1 y %2 %3 %4",
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "x",
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "y",
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
                {
                    type: DataColumnChooserField.KEY,
                    name: "field",
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
    ],

    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Charts",
            contents: [
                <BlockReference>{ kind: "block", type: SCATTERPLOT_BLOCK },
                <BlockReference>{ kind: "block", type: BARCHART_BLOCK },
                <BlockReference>{ kind: "block", type: LINEPLOT_BLOCK },
                <BlockReference>{ kind: "block", type: DASHBOARD_GAUGE_BLOCK },
            ],
            colour,
        },
    ],
}

export default chartDSL
