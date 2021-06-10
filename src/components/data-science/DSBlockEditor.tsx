import React, { useMemo } from "react"
import { NoSsr } from "@material-ui/core"
import { BlockProvider } from "../blockly/BlockContext"
import BlockEditor from "../blockly/BlockEditor"
import variablesDsl from "../blockly/dsl/variablesdsl"
import shadowDsl from "../blockly/dsl/shadowdsl"
import dataDsl from "./datadsl"
import fieldsDsl from "../blockly/dsl/fieldsdsl"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import BlockDiagnostics from "../blockly/BlockDiagnostics"

const DS_SOURCE_STORAGE_KEY = "data-science-blockly-xml"
export default function VMEditor() {
    const dsls = useMemo(() => {
        return [dataDsl, variablesDsl, shadowDsl, fieldsDsl]
    }, [])
    return (
        <NoSsr>
            <BlockProvider storageKey={DS_SOURCE_STORAGE_KEY} dsls={dsls}>
                <BlockEditor />
                {Flags.diagnostics && <BlockDiagnostics />}
            </BlockProvider>
        </NoSsr>
    )
}
