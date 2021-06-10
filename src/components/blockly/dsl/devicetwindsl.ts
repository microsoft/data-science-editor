import { DTDLUnits } from "../../../../jacdac-ts/src/azure-iot/dtdl"
import {
    BlockDefinition,
    BlockReference,
    CategoryDefinition,
    CODE_STATEMENT_TYPE,
    OptionsInputDefinition,
    StatementInputDefinition,
    VariableInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"

export const DEVICE_TWIN_SEND_TELEMETRY = "device_twin_send_telemetry"
export const DEVICE_TWIN_DEFINITION_BLOCK = "device_twin_definition"
export const DEVICE_TWIN_PROPERTY_BLOCK = "device_twin_property"

export const DEVICE_TWIN_PROPERTY_TYPE = "DeviceTwinProperty"
export const DEVICE_TWIN_VALUE_TYPE = "DeviceTwinValue"

const colour = "#843ed0"
const deviceTwinContentType = "DeviceTwinContent"
const deviceTwinCommonOptionType = "DeviceTwinCommonOption"
const deviceTwinPropertyOptionType = "DeviceTwinPropertyOption"
const deviceTwinStatementType = [deviceTwinContentType]
const deviceTwinCommonOptionStatementType = [deviceTwinCommonOptionType]
const deviceTwinPropertyOptionStatementType = [
    deviceTwinPropertyOptionType,
    ...deviceTwinCommonOptionStatementType,
]

class DeviceTwinBlockDomainSpecificLanguage
    implements BlockDomainSpecificLanguage
{
    id = "devicetwin"
    private _blocks: BlockDefinition[]
    createBlocks() {
        return (this._blocks = [
            {
                kind: "block",
                type: DEVICE_TWIN_DEFINITION_BLOCK,
                message0: "device twin",
                args0: [],
                inputsInline: true,
                nextStatement: deviceTwinStatementType,
                colour,
            },
            {
                kind: "block",
                type: DEVICE_TWIN_PROPERTY_BLOCK,
                message0: "property %1 %2 %3",
                args0: [
                    <VariableInputDefinition>{
                        type: "field_variable",
                        name: "name",
                        variable: "property 1",
                        variableTypes: [DEVICE_TWIN_PROPERTY_TYPE],
                        defaultType: DEVICE_TWIN_PROPERTY_TYPE,
                    },
                    {
                        type: "input_dummy",
                    },
                    <StatementInputDefinition>{
                        type: "input_statement",
                        name: "options",
                        check: deviceTwinPropertyOptionStatementType,
                    },
                ],
                previousStatement: deviceTwinStatementType,
                nextStatement: deviceTwinStatementType,
                colour,
                inputsInline: false,
            },
            // options
            {
                kind: "block",
                type: "device_twin_option_property_field",
                message0: "field %1 %2 %3",
                args0: [
                    <VariableInputDefinition>{
                        type: "field_variable",
                        name: "variable",
                        variable: "value 1",
                        variableTypes: [DEVICE_TWIN_VALUE_TYPE],
                        defaultType: DEVICE_TWIN_VALUE_TYPE,
                    },
                    <OptionsInputDefinition>{
                        type: "field_dropdown",
                        name: "unit",
                        options: DTDLUnits().map(unit => [unit, unit]),
                    },
                    {
                        type: "input_value",
                        name: "value",
                    },
                ],
                previousStatement: deviceTwinCommonOptionStatementType,
                nextStatement: deviceTwinCommonOptionStatementType,
                colour,
                inputsInline: false,
            },
            // events
            {
                kind: "block",
                type: "device_twin_property_change",
                message0: "on property %1 change",
                args0: [
                    <VariableInputDefinition>{
                        type: "field_variable",
                        name: "name",
                        variable: "property 1",
                        variableTypes: [DEVICE_TWIN_PROPERTY_TYPE],
                        defaultType: DEVICE_TWIN_PROPERTY_TYPE,
                    },
                ],
                nextStatement: CODE_STATEMENT_TYPE,
                colour,
            },
        ])
    }
    createCategory(): CategoryDefinition[] {
        return [
            {
                kind: "category",
                name: "Device Twin",
                colour,
                contents: [
                    ...this._blocks.map(
                        ({ type }) =>
                            <BlockReference>{
                                kind: "block",
                                type,
                            }
                    ),
                ],
            },
        ]
    }
}

const deviceTwinDSL: BlockDomainSpecificLanguage =
    new DeviceTwinBlockDomainSpecificLanguage()

export default deviceTwinDSL
