import servicesDSL from "../blockly/dsl/servicesdsl"
import serverServicesDSL from "../blockly/dsl/serverservicesdsl"
import toolsDsl from "../blockly/dsl/toolsdsl"
import loopsDsl from "../blockly/dsl/loopsdsl"
import logicDsl from "../blockly/dsl/logicdsl"
import mathDsl from "../blockly/dsl/mathdsl"
import variablesDsl from "../blockly/dsl/variablesdsl"
import shadowDsl from "../blockly/dsl/shadowdsl"
import fieldsDsl from "../blockly/dsl/fieldsdsl"
import jsonDsl from "../blockly/dsl/jsondsl"
import chartDsl from "../blockly/dsl/chartdsl"
import dataDsl from "../blockly/dsl/datadsl"
import widgetDSL from "../blockly/dsl/widgetdsl"
import mlBlocksDsl from "../blockly/dsl/mlblocksdsl"
import { createIFrameDSL } from "../blockly/dsl/iframedsl"

const vmDsls = [
    servicesDSL,
    serverServicesDSL,
    loopsDsl,
    logicDsl,
    mathDsl,
    jsonDsl,
    variablesDsl,
    toolsDsl,
    widgetDSL,
    dataDsl,
    chartDsl,
    shadowDsl,
    fieldsDsl,
    mlBlocksDsl,
    createIFrameDSL("hostvm", "*"),
]
export default vmDsls
