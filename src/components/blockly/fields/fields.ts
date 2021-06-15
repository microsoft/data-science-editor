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
import ScatterPlotField from "./ScatterPlotField"
import DataColumnChooserField from "./DataColumnChooserField"
import LinePlotField from "./LinePlotField"
import GaugeWidgetField from "./GaugeWidgetField"
import BuiltinDataSetField from "./BuiltinDataSetField"
import BarChartField from "./BarField"
import PiePlotField from "./PieField"

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
        DataColumnChooserField,

        BuiltinDataSetField,

        ScatterPlotField,
        LinePlotField,
        BarChartField,
        PiePlotField,
    ]
    fieldTypes.forEach(registerType)
}

export function fieldShadows() {
    registerFields()
    return reactFieldShadows.slice(0)
}
