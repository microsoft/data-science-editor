import React, { useContext, useEffect, useState, lazy } from "react"
import { Grid, NoSsr } from "@mui/material"
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
import useEffectAsync from "../useEffectAsync"
import Suspense from "../ui/Suspense"
import useWindowEvent from "../hooks/useWindowEvent"
import { JSONTryParse } from "../../../jacdac-ts/src/jacdac"
const Dashboard = lazy(() => import("../dashboard/Dashboard"))

function JacscriptTextEditorWithContext() {
    const { setProgram, compiled } = useJacscript()
    const bus = useBus()
    const roleManager = useRoleManager()
    const { scriptId } = useContext(BrainManagerContext)
    const script = useBrainScript(scriptId)
    const [source, setSource] = useState("")
    const [loading, setLoading] = useState(false)
    const [debouncedSource] = useDebounce(source, 1000)

    useWindowEvent("message", (msg: MessageEvent) => {
        const data = msg.data
        if (data && typeof data === "string") {
            const mdata = JSONTryParse(data) as any
            console.log(mdata)
            if (
                mdata &&
                mdata.channel === "jacscript" &&
                mdata.type === "source"
            ) {
                const source = mdata.source
                console.log(source)
                setSource(source)
            }
        }
    })

    // load script
    useEffectAsync(async () => {
        if (!script) {
            setSource("")
            return
        }

        // fetch latest body
        setLoading(true)
        try {
            await script.refreshBody()
            const { text } = script.body || {}
            setSource(text || "")
        } finally {
            setLoading(false)
        }
    }, [script?.id])

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
                    disabled={loading}
                />
            </Grid>
            <Grid item xs={12}>
                <Suspense>
                    <Dashboard
                        showAvatar={true}
                        showHeader={true}
                        showConnect={false}
                        showStartSimulators={true}
                        showStartRoleSimulators={true}
                        showDeviceProxyAlert={true}
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
