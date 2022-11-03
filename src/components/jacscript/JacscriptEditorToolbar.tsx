import { Grid } from "@mui/material"
import React, { useContext } from "react"
import BlockRolesToolbar from "../blockly/BlockRolesToolbar"
import JacscriptManagerChipItems from "./JacscriptManagerChipItems"
import BlockContext from "../blockly/BlockContext"
import BrainManagerContext from "../brains/BrainManagerContext"
import { BrainScript } from "../brains/braindom"
import useEffectAsync from "../useEffectAsync"
import { WorkspaceFile } from "../blockly/dsl/workspacejson"
import useBrainScript from "../brains/useBrainScript"
import { JSONTryParse } from "../../../jacdac-ts/src/jdom/utils"
import BrainManagerToolbar from "../brains/BrainManagerToolbar"

function useBrainScriptInBlocks(script: BrainScript) {
    const { loadWorkspaceFile, workspace } = useContext(BlockContext)

    useEffectAsync(async () => {
        if (!script || !workspace) return

        // fetch latest body
        await script.refreshBody()
        const body = script.body

        // update context
        if (!body) return

        // update blocks
        console.debug("current brain script", { body })
        const file = JSONTryParse<WorkspaceFile>(body.blocks)
        loadWorkspaceFile(file)
    }, [script?.id, workspace])
}

export default function JacscriptEditorToolbar() {
    const { scriptId } = useContext(BrainManagerContext)
    const script = useBrainScript(scriptId)
    useBrainScriptInBlocks(script)

    return (
        <>
            {script && (
                <Grid item xs={12}>
                    <BrainManagerToolbar script={script} />
                </Grid>
            )}
            <Grid item xs={12}>
                <BlockRolesToolbar>
                    <JacscriptManagerChipItems />
                </BlockRolesToolbar>
            </Grid>
        </>
    )
}
