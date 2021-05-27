import Blockly from "blockly"
import NoteField from "./NoteField"
import KeyboardKeyField from "./KeyboardKeyField"

let registered = false
export function registerFields() {
    if (registered) return

    registered = true
    Blockly.fieldRegistry.register(KeyboardKeyField.KEY, KeyboardKeyField)
    Blockly.fieldRegistry.register(NoteField.KEY, NoteField)
}
