import React, { lazy, useContext, useEffect } from "react"
import { Grid, NoSsr } from "@mui/material"
import useLocalStorage from "../hooks/useLocalStorage"
import HighlightTextField from "../ui/HighlightTextField"
import useJacscript, { JacscriptProvider } from "./JacscriptContext"
import { useDebounce } from "use-debounce"
import JacscriptManagerChipItems from "./JacscriptManagerChipItems"
import useChange from "../../jacdac/useChange"
import FileSystemContext from "../FileSystemContext"
import useEffectAsync from "../useEffectAsync"
import useSnackbar from "../hooks/useSnackbar"
import FileTabs from "../fs/FileTabs"
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
import Suspense from "../ui/Suspense"

const Dashboard = lazy(() => import("../dashboard/Dashboard"))

const STORAGE_KEY = "jacdac:jacscripttexteditorsource"
const JACSCRIPT_FILENAME = "fw.js"
const JACSCRIPT_NEW_FILE_CONTENT = ""

function JacscriptTextEditorWithContext() {
    const { setProgram, compiled } = useJacscript()
    const { setError } = useSnackbar()
    const bus = useBus()
    const roleManager = useRoleManager()
    const { fileSystem } = useContext(FileSystemContext)
    const workspaceDirectory = useChange(fileSystem, _ => _?.workingDirectory)
    const workspaceFile = useChange(workspaceDirectory, _ =>
        _?.file(JACSCRIPT_FILENAME, { create: true })
    )
    const [source, setSource] = useLocalStorage(STORAGE_KEY, "")
    const [debouncedSource] = useDebounce(source, 1000)

    // debounced text buffer UI
    useEffect(() => {
        setProgram({
            program: debouncedSource?.split(/\n/g),
            debug: [],
        })
    }, [debouncedSource])
    // load from file
    useEffectAsync(
        async mounted => {
            if (!workspaceFile) return
            try {
                const text = await workspaceFile.textAsync()
                if (!mounted()) return

                setSource(text)
            } catch (e) {
                if (mounted()) setError(e)
                if (fileSystem) fileSystem.workingDirectory = undefined
            }
        },
        [workspaceFile]
    )
    // save to file on changes
    useEffectAsync(
        async mounted => {
            try {
                await workspaceFile?.write(source || "")
            } catch (e) {
                console.debug(e)
                if (mounted()) setError(e)
            }
        },
        [source, workspaceFile]
    )
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
            {!!fileSystem && (
                <Grid item xs={12}>
                    <FileTabs
                        newFileName={JACSCRIPT_FILENAME}
                        newFileContent={JACSCRIPT_NEW_FILE_CONTENT}
                        hideFiles={true}
                    />
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
            <Grid item xs={12}>
                <Suspense>
                    <Dashboard
                        showHeader={true}
                        showAvatar={true}
                        alwaysVisible={true}
                    />
                </Suspense>
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
