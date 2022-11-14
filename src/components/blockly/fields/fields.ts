import Blockly from "blockly"
import NoteField from "./NoteField"
import KeyboardKeyField from "./KeyboardKeyField"
import LEDMatrixField from "./LEDMatrixField"
import { BlockDefinition } from "../toolbox"
import { assert } from "../../../../jacdac-ts/src/jdom/utils"
import LEDColorField from "./LEDColorField"
import TwinField from "./TwinField"
import JDomTreeField from "./JDomTreeField"
import ConsoleField from "./ConsoleField"
//import WatchValueField from "./WatchValueField"
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

import JSONSettingsField from "./JSONSettingsField"
import IFrameDataChooserField from "./IFrameDataChooserField"

import VideoPlayerField from "./VideoPlayerField"

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
        LEDColorField,

        TwinField,
        JDomTreeField,
        ConsoleField,

        GaugeWidgetField,

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

        FileSaveField,
        FileOpenField,

        JSONSettingsField,

        IFrameDataChooserField,
        VideoPlayerField,
    ]
    fieldTypes.forEach(registerType)
}

export function fieldShadows() {
    registerFields()
    return reactFieldShadows.slice(0)
}
