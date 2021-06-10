import {
    BlockDefinition,
    CategoryDefinition,
    CODE_STATEMENT_TYPE,
    DummyInputDefinition,
    PRIMITIVE_TYPES,
    StatementInputDefinition,
    TextInputDefinition,
    ValueInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"

const colour = "#8a57c2"
class AzureIoTHubBlockDomainSpecificLanguage
    implements BlockDomainSpecificLanguage
{
    id = "azureiothub"
    private _blocks: BlockDefinition[]
    createBlocks() {
        return (this._blocks = [
            {
                kind: "block",
                type: "azureiothub_receive_telemetry",
                message0: "on receive cloud-to-device message",
                args0: [],
                nextStatement: CODE_STATEMENT_TYPE,
                colour,
            },
            {
                kind: "block",
                type: "azureiothub_receive_telemetry_number",
                message0: "received number %1",
                args0: [
                    <TextInputDefinition>{
                        type: "field_input",
                        name: "name",
                        text: "value",
                    },
                ],
                output: "Number",
                colour,
            },
            {
                kind: "block",
                type: "azureiothub_receive_telemetry_string",
                message0: "received string %1",
                args0: [
                    <TextInputDefinition>{
                        type: "field_input",
                        name: "name",
                        text: "value",
                    },
                ],
                output: "String",
                colour,
            },
            {
                kind: "block",
                type: "azureiothub_send_telemetry",
                message0: "send device-to-cloud message %1 %2",
                args0: [
                    <DummyInputDefinition>{
                        type: "input_dummy",
                    },
                    <StatementInputDefinition>{
                        type: "input_statement",
                        name: "fields",
                    },
                ],
                previousStatement: CODE_STATEMENT_TYPE,
                nextStatement: CODE_STATEMENT_TYPE,
                colour,
            },
            {
                kind: "block",
                type: "azureiothub_send_telemetry_value",
                message0: "with %1 = %2",
                args0: [
                    <TextInputDefinition>{
                        type: "field_input",
                        name: "name",
                        text: "value",
                    },
                    <ValueInputDefinition>{
                        type: "input_value",
                        name: "value",
                        check: PRIMITIVE_TYPES,
                    },
                ],
                previousStatement: CODE_STATEMENT_TYPE,
                nextStatement: CODE_STATEMENT_TYPE,
                colour,
            },
        ])
    }
    createCategory(): CategoryDefinition[] {
        return [
            {
                kind: "category",
                name: "Azure IoT Hub",
                colour,
                contents: [
                    ...this._blocks.map(
                        ({ type }) =>
                            <BlockDefinition>{
                                kind: "block",
                                type,
                            }
                    ),
                ],
            },
        ]
    }
}

const azureIoTHubDSL: BlockDomainSpecificLanguage =
    new AzureIoTHubBlockDomainSpecificLanguage()

export default azureIoTHubDSL
