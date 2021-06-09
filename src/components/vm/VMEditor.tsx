import { Grid, NoSsr } from "@material-ui/core"
import React, { useRef, useState } from "react"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { WorkspaceJSON } from "../../components/vm/jsongenerator"
import VMBlockEditor from "../../components/vm/VMBlockEditor"
import useLocalStorage from "../../components/useLocalStorage"
import useVMRunner from "./useVMRunner"
import useRoleManager from "./useRoleManager"
import VMDiagnostics from "./VMDiagnostics"
import VMToolbar from "./VMToolbar"
import { WorkspaceSvg } from "blockly"
import { VMProgram } from "../../../jacdac-ts/src/vm/ir"
import { DslProvider } from "./dsl/DslContext"

const VM_SOURCE_STORAGE_KEY = "jacdac:tools:vmeditor"
export default function VMEditor(props: { storageKey?: string }) {
    const { storageKey } = props
    const workspaceRef = useRef<WorkspaceSvg>()
    const [xml, setXml] = useLocalStorage(
        storageKey || VM_SOURCE_STORAGE_KEY,
        ""
    )
    const [source, setSource] = useState<WorkspaceJSON>()
    const [program, setProgram] = useState<VMProgram>()
    const roleManager = useRoleManager()
    const autoStart = false
    const { runner, run, cancel } = useVMRunner(roleManager, program, autoStart)

    const handleXml = (xml: string) => setXml(xml)
    const handleJSON = (json: WorkspaceJSON) => setSource(json)
    const handleI4Program = (json: VMProgram) => {
        if (json) roleManager.setRoles(json.roles)
        setProgram(json)
    }

    return (
        <DslProvider>
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <VMToolbar
                        roleManager={roleManager}
                        runner={runner}
                        run={run}
                        cancel={cancel}
                        xml={xml}
                        program={program}
                        workspace={workspaceRef.current}
                    />
                </Grid>
                <Grid item xs={12}>
                    <NoSsr>
                        <VMBlockEditor
                            initialXml={xml}
                            onXmlChange={handleXml}
                            onJSONChange={handleJSON}
                            onVMProgramChange={handleI4Program}
                            runner={runner}
                            roleManager={roleManager}
                            workspaceRef={workspaceRef}
                        />
                    </NoSsr>
                </Grid>
                {Flags.diagnostics && (
                    <VMDiagnostics
                        program={program}
                        source={source}
                        xml={xml}
                    />
                )}
            </Grid>
        </DslProvider>
    )
}
