import React, { useContext, useEffect } from "react"
import { Grid, NoSsr } from "@mui/material"
import useLocalStorage from "../hooks/useLocalStorage"
import HighlightTextField from "../ui/HighlightTextField"
import useJacscript, { JacscriptProvider } from "./JacscriptContext"
import { useDebounce } from "use-debounce"
import JacscriptManagerChipItems from "./JacscriptManagerChipItems"
import useRoleManager from "../hooks/useRoleManager"
import {
    addServiceProvider,
    serviceProviderDefinitionFromServiceClass,
} from "../../../jacdac-ts/src/servers/servers"
import RolesToolbar from "../roles/RolesToolbar"
import {
    LiveRoleBinding,
    RoleBinding,
} from "../../../jacdac-ts/src/jdom/rolemanager"
import useBus from "../../jacdac/useBus"
import BrainManagerToolbar from "../brains/BrainManagerToolbar"
import BrainManagerContext from "../brains/BrainManagerContext"
import useBrainScript from "../brains/useBrainScript"

const STORAGE_KEY = "jacdac:jacscripttexteditorsource"

function JacscriptTextEditorWithContext() {
    const { setProgram, compiled } = useJacscript()
    const bus = useBus()
    const roleManager = useRoleManager()
    const { scriptId } = useContext(BrainManagerContext)
    const script = useBrainScript(scriptId)
    const [source, setSource] = useLocalStorage(STORAGE_KEY, "")
    const [debouncedSource] = useDebounce(source, 1000)

    // debounced text buffer UI
    useEffect(() => {
        setProgram({
            program: debouncedSource?.split(/\n/g),
            debug: [],
        })
    }, [debouncedSource])
    // update roles
    useEffect(() => {
        compiled &&
            roleManager?.updateRoles([
                ...compiled.dbg.roles.map(r => ({
                    role: r.name,
                    serviceClass: r.serviceClass,
                })),
            ])
    }, [roleManager, compiled])

    // start role on demand
    const handleRoleClick = (role: RoleBinding) => {
        const { service, preferredDeviceId, serviceClass } =
            role as LiveRoleBinding
        // spin off simulator
        if (!service && !preferredDeviceId) {
            addServiceProvider(
                bus,
                serviceProviderDefinitionFromServiceClass(serviceClass)
            )
        }
    }

    const annotations = compiled?.errors?.map(
        error =>
            ({
                file: error.filename,
                line: error.line,
                message: error.message,
            } as jdspec.Diagnostic)
    )

    return (
        <Grid spacing={1} container>
            {script && (
                <Grid item xs={12}>
                    <BrainManagerToolbar script={script} />
                </Grid>
            )}
            <Grid item xs={12}>
                <RolesToolbar
                    roleManager={roleManager}
                    onRoleClick={handleRoleClick}
                >
                    <JacscriptManagerChipItems />
                </RolesToolbar>
            </Grid>
            <Grid item xs={12}>
                <HighlightTextField
                    code={source}
                    language={"javascript"}
                    onChange={setSource}
                    annotations={annotations}
                />
            </Grid>
        </Grid>
    )
}

export default function JacscriptTextEditor() {
    return (
        <NoSsr>
            <JacscriptProvider>
                <JacscriptTextEditorWithContext />
            </JacscriptProvider>
        </NoSsr>
    )
}
