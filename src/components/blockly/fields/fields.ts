import Blockly from "blockly"
import NoteField from "./NoteField"
import KeyboardKeyField from "./KeyboardKeyField"
import LEDMatrixField from "./LEDMatrixField"
import ServoAngleField from "./ServoAngleField"
import { BlockDefinition } from "../toolbox"
import { assert } from "../../../../jacdac-ts/src/jdom/utils"
import LEDColorField from "./LEDColorField"
import TwinField from "./TwinField"
import JDomTreeField from "./JDomTreeField"
import WatchValueField from "./WatchValueField"
import LogViewField from "./LogViewField"
import VariablesField from "./VariablesFields"
import DataTableField from "./DataTableField"
import DataColumnChooserField from "./DataColumnChooserField"
import BuiltinDataSetField from "./BuiltinDataSetField"
import DataPreviewField from "./DataPreviewField"

import LinePlotField from "./chart/LinePlotField"
import GaugeWidgetField from "./GaugeWidgetField"
import ScatterPlotField from "./chart/ScatterPlotField"
import BarChartField from "./chart/BarField"
import HistogramField from "./chart/HistogramField"
import BoxPlotField from "./chart/BoxPlotField"
import HeatMapPlotField from "./chart/HeatMapField"
import VegaChartField from "./chart/VegaChartField"

import FileSaveField from "./FileSaveField"
import FileOpenField from "./FileOpenField"

import ExpandModelBlockField from "./mb/ExpandModelBlockField"
import DataSetBlockField from "./mb/DataSetBlockField"
import RecordingBlockField from "./mb/RecordingBlockField"
import SmoothingBlockField from "./mb/SmoothingBlockField"
import KNNBlockField from "./mb/KNNBlockField"
import NeuralNetworkBlockField from "./mb/NeuralNetworkBlockField"
import ConvLayerBlockField from "./mb/ConvLayerBlockField"
import PoolingLayerBlockField from "./mb/PoolingLayerBlockField"
import DropoutLayerBlockField from "./mb/DropoutLayerBlockField"
import FlattenLayerBlockField from "./mb/FlattenLayerBlockField"
import DenseLayerBlockField from "./mb/DenseLayerBlockField"

import JSONSettingsField from "./JSONSettingsField"

let reactFieldShadows: BlockDefinition[]
export function registerFields() {
    if (reactFieldShadows) return

    reactFieldShadows = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerType = (fieldType: any) => {
        const key = fieldType.KEY
        assert(!!key)
        try {
            Blockly.fieldRegistry.unregister(key) // hot reload issues
        } catch (e) {
            // ignore hot reload issues
        }
        Blockly.fieldRegistry.register(key, fieldType)
        if (fieldType.SHADOW) reactFieldShadows.push(fieldType.SHADOW)
    }
    const fieldTypes = [
        KeyboardKeyField,
        NoteField,
        LEDMatrixField,
        ServoAngleField,
        LEDColorField,

        TwinField,
        JDomTreeField,

        GaugeWidgetField,

        WatchValueField,
        LogViewField,

        VariablesField,
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
        VegaChartField,

        ExpandModelBlockField,
        DataSetBlockField,
        RecordingBlockField,
        SmoothingBlockField,
        KNNBlockField,
        NeuralNetworkBlockField,
        ConvLayerBlockField,
        PoolingLayerBlockField,
        DropoutLayerBlockField,
        FlattenLayerBlockField,
        DenseLayerBlockField,

        FileSaveField,
        FileOpenField,

        JSONSettingsField,
    ]
    fieldTypes.forEach(registerType)
}

export function fieldShadows() {
    registerFields()
    return reactFieldShadows.slice(0)
}
