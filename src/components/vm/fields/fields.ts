import Blockly from "blockly"
import NoteField from "./NoteField"
import KeyboardKeyField from "./KeyboardKeyField"
import LEDMatrixField from "./LEDMatrixField"
import ServoAngleField from "./ServoAngleField"

let registered = false
export function registerFields() {
    if (registered) return

    registered = true
    Blockly.fieldRegistry.register(KeyboardKeyField.KEY, KeyboardKeyField)
    Blockly.fieldRegistry.register(NoteField.KEY, NoteField)
    Blockly.fieldRegistry.register(LEDMatrixField.KEY, LEDMatrixField)
    Blockly.fieldRegistry.register(ServoAngleField.KEY, ServoAngleField)
}
