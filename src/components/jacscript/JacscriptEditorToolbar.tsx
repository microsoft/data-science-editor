import { Grid } from "@mui/material"
import React from "react"
import BlockRolesToolbar from "../blockly/BlockRolesToolbar"
import { WORKSPACE_FILENAME } from "../blockly/toolbox"
import FileTabs from "../fs/FileTabs"
import useFileSystem from "../FileSystemContext"
import { JACSCRIPT_NEW_FILE_CONTENT } from "./JacscriptEditor"
import JacscriptManagerChipItems from "./JacscriptManagerChipItems"

export default function JacscriptEditorToolbar() {
    const { fileSystem } = useFileSystem()

    return (
        <>
            {!!fileSystem && (
                <Grid item xs={12}>
                    <FileTabs
                        newFileName={WORKSPACE_FILENAME}
                        newFileContent={JACSCRIPT_NEW_FILE_CONTENT}
                        hideFiles={true}
                    />
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
