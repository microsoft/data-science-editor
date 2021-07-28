import {
    BlockReference,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    DummyInputDefinition,
    identityTransformData,
    NumberInputDefinition,
    toolsColour,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import DataColumnChooserField from "../fields/DataColumnChooserField"
import GaugeWidgetField from "../fields/GaugeWidgetField"

const DASHBOARD_GAUGE_BLOCK = "jacdac_widget_gauge"

const colour = toolsColour
const widgetDSL: BlockDomainSpecificLanguage = {
    id: "widget",
    createBlocks: () => [
        {
            kind: "block",
            type: DASHBOARD_GAUGE_BLOCK,
            message0: "gauge min %1 max %2 %3 %4 %5",
            args0: [
                <NumberInputDefinition>{
                    type: "field_number",
                    name: "min",
                },
                <NumberInputDefinition>{
                    type: "field_number",
                    name: "max",
                    value: 100,
                },
                {
                    type: DataColumnChooserField.KEY,
                    name: "field",
                    dataType: "number",
                },
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: GaugeWidgetField.KEY,
                    name: "widget",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour,
            template: "meta",
            inputsInline: false,
            transformData: identityTransformData,
        },
    ],

    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Widgets",
            contents: [
                <BlockReference>{ kind: "block", type: DASHBOARD_GAUGE_BLOCK },
            ],
            colour,
        },
    ],
}

export default widgetDSL
