/* eslint-disable @typescript-eslint/ban-types */
import { Block } from "blockly";
import DataColumnChooserField, {
    declareColumns,
    resolveColumns,
} from "../fields/DataColumnChooserField";
import {
    BlockDefinition,
    BlockReference,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    DataColumnInputDefinition,
    DummyInputDefinition,
} from "../toolbox";
import BlockDomainSpecificLanguage from "./dsl";
import postTransformData from "./workers/data.proxy";
import type {
    DataCorrelationRequest,
    DataLinearRegressionRequest,
} from "../../../workers/data/dist/node_modules/data.worker";
import { statisticsColour } from "./palette";
import { tidyHeaders, tidyResolveFieldColumn } from "../fields/tidy";
import DataPreviewField from "../fields/DataPreviewField";
import ScatterPlotField from "../fields/chart/ScatterPlotField";
import CorrelationHeatMapField from "../fields/chart/CorrelationHeapMapField";

const DATA_CORRELATION_BLOCK = "data_correlation";
const DATA_LINEAR_REGRESSION_BLOCK = "data_linear_regression";

const statsDsl: BlockDomainSpecificLanguage = {
    id: "stats",
    createBlocks: () => [
        <BlockDefinition>{
            kind: "block",
            type: DATA_CORRELATION_BLOCK,
            message0: "correlation of %1 %2 %3 %4 %5 %6 %7 %8 %9 %10",
            description: "Displays a correlation matrix/heatmap.",
            args0: [
                ...declareColumns(6, { start: 1, dataType: "number" }),
                {
                    type: DataColumnChooserField.KEY,
                    name: "y",
                    dataType: "number",
                },
                {
                    type: DataPreviewField.KEY,
                    name: "preview",
                    compare: false,
                    transformed: true,
                    summary: false,
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: CorrelationHeatMapField.KEY,
                    name: "plot",
                },
            ],
            inputsInline: false,
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: statisticsColour,
            dataPreviewField: false,
            transformData: async (b: Block, data: object[]) => {
                const selectedColumns = resolveColumns(data, b, 6, {
                    start: 1,
                    dataType: "number",
                });
                const allColumns = tidyHeaders(data, "number").headers;
                const columns =
                    selectedColumns.length > 1 ? selectedColumns : allColumns;
                return postTransformData(<DataCorrelationRequest>{
                    type: "correlation",
                    columns,
                    data,
                });
            },
        },
        <BlockDefinition>{
            kind: "block",
            type: DATA_LINEAR_REGRESSION_BLOCK,
            message0: "linear regression of x %1 y %2 %3 %4 %5",
            description:
                "Displays a linear regression scatter plot and regression line.",
            args0: [
                <DataColumnInputDefinition>{
                    type: DataColumnChooserField.KEY,
                    name: "x",
                    dataType: "number",
                },
                ...declareColumns(1, { prefix: "y", dataType: "number" }),
                {
                    type: DataPreviewField.KEY,
                    name: "preview",
                    compare: false,
                    summary: false,
                    transformed: true,
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: ScatterPlotField.KEY,
                    name: "plot",
                    linearRegression: true,
                },
            ],
            inputsInline: false,
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: statisticsColour,
            dataPreviewField: false,
            passthroughData: true,
            transformData: async (b: Block, data: object[]) => {
                const column1 = tidyResolveFieldColumn(data, b, "x", {
                    type: "number",
                });
                const column2 = tidyResolveFieldColumn(data, b, "y1", {
                    type: "number",
                });
                if (!column1 || !column2) return Promise.resolve([]);
                return postTransformData(<DataLinearRegressionRequest>{
                    type: "linear_regression",
                    column1,
                    column2,
                    data,
                });
            },
        },
    ],
    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Statistics",
            colour: statisticsColour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: DATA_CORRELATION_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_LINEAR_REGRESSION_BLOCK,
                },
            ],
        },
    ],
};
export default statsDsl;
