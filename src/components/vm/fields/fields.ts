import Blockly from "blockly"
import KeyboardKeyField from "./KeyboardKeyField"

let registered = false
export function registerFields() {
    if (registered) return

    registered = true
    Blockly.fieldRegistry.register(KeyboardKeyField.KEY, KeyboardKeyField)
}
