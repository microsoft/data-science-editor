import React, { useMemo } from "react"
import { NoSsr } from "@material-ui/core"
import { BlockProvider } from "../blockly/BlockContext"
import BlockEditor from "../blockly/BlockEditor"
import variablesDsl from "../blockly/dsl/variablesdsl"
import shadowDsl from "../blockly/dsl/shadowdsl"
import dataDsl from "./datadsl"

const DS_SOURCE_STORAGE_KEY = "data-science-blockly-xml"
export default function VMEditor() {
    const dsls = useMemo(() => {
        return [dataDsl, variablesDsl, shadowDsl]
    }, [])
    return (
        <NoSsr>
            <BlockProvider storageKey={DS_SOURCE_STORAGE_KEY} dsls={dsls}>
                <BlockEditor />
            </BlockProvider>
        </NoSsr>
    )
}
