import { Grid } from "@mui/material"
import React, { useContext, useState } from "react"
import BlockRolesToolbar from "../blockly/BlockRolesToolbar"
import { WORKSPACE_FILENAME } from "../blockly/toolbox"
import FileTabs from "../fs/FileTabs"
import FileSystemContext from "../FileSystemContext"
import type { JacscriptCompileResponse } from "../../workers/jacscript/jacscript-worker"
import { SRV_JACSCRIPT_MANAGER } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import useServices from "../hooks/useServices"
import JacscriptManagerChip from "./JacscriptManagerChip"
import { JACSCRIPT_NEW_FILE_CONTENT } from "./JacscriptEditor"

export default function JacscriptEditorToolbar(props: {
    jscCompiled: JacscriptCompileResponse
}) {
    const { jscCompiled } = props
    const { fileSystem } = useContext(FileSystemContext)

    // grab the first jacscript manager, favor physical services first
    const services = useServices({ serviceClass: SRV_JACSCRIPT_MANAGER })
    const [manager, setManager] = useState(services[0])

    const handleSetSelected = service => () => setManager(service)

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
                    {services.map(service => (
                        <Grid item key={service.id}>
                            <JacscriptManagerChip
                                service={service}
                                selected={service === manager}
                                setSelected={handleSetSelected(service)}
                                jscCompiled={jscCompiled}
                            />
                        </Grid>
                    ))}
                </BlockRolesToolbar>
            </Grid>
        </>
    )
}
