import Blockly from "blockly"
import { BlockDefinition } from "../toolbox"
import DataTableField from "./DataTableField"
import DataColumnChooserField from "./DataColumnChooserField"
import BuiltinDataSetField from "./BuiltinDataSetField"
import DataPreviewField from "./DataPreviewField"

import LinePlotField from "./chart/LinePlotField"
import ScatterPlotField from "./chart/ScatterPlotField"
import BarChartField from "./chart/BarField"
import HistogramField from "./chart/HistogramField"
import BoxPlotField from "./chart/BoxPlotField"
import HeatMapPlotField from "./chart/HeatMapField"
import VegaChartField from "./chart/VegaChartField"
import ScatterPlotMatrixField from "./chart/ScatterPlotMatrixField"
import CorrelationHeapMapField from "./chart/CorrelationHeapMapField"

import FileSaveField from "./FileSaveField"
import FileOpenField from "./FileOpenField"

import JSONSettingsField from "./JSONSettingsField"
import IFrameDataChooserField from "./IFrameDataChooserField"

let reactFieldShadows: BlockDefinition[]
export function registerFields() {
    if (reactFieldShadows) return

    reactFieldShadows = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerType = (fieldType: any) => {
        const key = fieldType.KEY
        try {
            Blockly.fieldRegistry.unregister(key) // hot reload issues
        } catch (e) {
            // ignore hot reload issues
        }
        Blockly.fieldRegistry.register(key, fieldType)
        if (fieldType.SHADOW) reactFieldShadows.push(fieldType.SHADOW)
    }
    const fieldTypes = [
        DataTableField,
        DataPreviewField,
        DataColumnChooserField,

        BuiltinDataSetField,

        ScatterPlotField,
        LinePlotField,
        BarChartField,
        HistogramField,
        BoxPlotField,
        HeatMapPlotField,
        CorrelationHeapMapField,
        ScatterPlotMatrixField,
        VegaChartField,

        FileSaveField,
        FileOpenField,

        JSONSettingsField,

        IFrameDataChooserField,
    ]
    fieldTypes.forEach(registerType)
}

export function fieldShadows() {
    registerFields()
    return reactFieldShadows.slice(0)
}
