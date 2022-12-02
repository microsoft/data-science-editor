import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Grid,
    MenuItem,
    SelectChangeEvent,
    Typography,
} from "@mui/material"
import React, { lazy, useContext, useState, useEffect } from "react"
import DeviceIconFromProductIdentifier from "../devices/DeviceIconFromProductIdentifier"
import { BrainDevice } from "./braindom"
import useChange from "../../jacdac/useChange"
import BrainConnectedButton from "./BrainConnectedButton"
import BrainManagerContext from "./BrainManagerContext"
import BrainLiveConnectionButton from "./BrainLiveConnectionButton"
import { shortDeviceId } from "../../../jacdac-ts/src/jacdac"
import CmdButton from "../CmdButton"
import Suspense from "../ui/Suspense"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import DeleteIcon from "@mui/icons-material/Delete"
import SelectWithLabel from "../ui/SelectWithLabel"
import useEffectAsync from "../useEffectAsync"
import UploadIcon from "@mui/icons-material/Upload"

const ConfirmDialog = lazy(() => import("../shell/ConfirmDialog"))

function BrainDeviceScriptSelect(props: { brain: BrainDevice }) {
    const { brain } = props
    const { brainManager } = useContext(BrainManagerContext)
    const scriptId = useChange(brain, _ => _?.scriptId) || ""
    const scriptVersion = useChange(brain, _ => _?.scriptVersion) || undefined
    const scripts = useChange(brainManager, _ => _?.scripts())

    const [currentScriptId, setCurrentScriptId] = useState(scriptId)
    const [currentVersion, setCurrentVersion] = useState<number>(undefined)
    const currentScript = useChange(
        brainManager,
        _ => _.script(currentScriptId),
        [currentScriptId]
    )
    const currentVersions = useChange(currentScript, _ => _?.versions())

    const handleScriptChange = (ev: SelectChangeEvent<string>) => {
        const newId = ev.target.value
        setCurrentScriptId(newId)
        const newVersion = !newId
            ? undefined
            : newId === scriptId
            ? scriptVersion
            : brainManager.script(newId)?.version
        setCurrentVersion(newVersion)
    }
    const handleVersionChange = (ev: SelectChangeEvent<string>) => {
        const newVersion = ev.target.value
        setCurrentVersion(parseInt(newVersion) || undefined)
    }
    const handleDeploy = async () => {
        await brain.updateScript(currentScriptId, currentVersion)
    }

    // refresh from cloud
    useEffect(() => {
        setCurrentScriptId(scriptId)
        setCurrentVersion(scriptVersion)
    }, [scriptId, scriptVersion])

    // refresh from cloud
    useEffectAsync(() => currentScript?.refreshVersions(), [currentScript])

    const scriptChanged = currentScriptId !== scriptId
    const versionChanged = currentVersion !== scriptVersion

    return (
        <Grid container spacing={1}>
            <Grid item xs>
                <SelectWithLabel
                    helperText={`Script${scriptChanged ? "*" : ""}`}
                    value={currentScriptId}
                    fullWidth={true}
                    size="small"
                    onChange={handleScriptChange}
                >
                    <MenuItem value="">None</MenuItem>
                    {scripts.map(script => (
                        <MenuItem key={script.id} value={script.scriptId}>
                            {script.name}
                        </MenuItem>
                    ))}
                </SelectWithLabel>
            </Grid>
            <Grid item>
                <SelectWithLabel
                    helperText={`Version${versionChanged ? "*" : " "}`}
                    sx={{ minWidth: "5em" }}
                    value={currentVersion?.toString() || ""}
                    fullWidth={true}
                    size="small"
                    onChange={handleVersionChange}
                >
                    <MenuItem value="">None</MenuItem>
                    {currentVersions?.map(v => (
                        <MenuItem key={v.id} value={v.version}>
                            v{v.version}
                        </MenuItem>
                    ))}
                </SelectWithLabel>
            </Grid>
            <Grid item>
                <CmdButton
                    color={
                        scriptChanged || versionChanged ? "primary" : undefined
                    }
                    onClick={handleDeploy}
                    icon={<UploadIcon />}
                />
            </Grid>
        </Grid>
    )
}

export default function BrainDeviceCard(props: { brain: BrainDevice }) {
    const { brain } = props
    const { productId } = useChange(brain, _ => _.meta)
    const { deviceId } = brain
    const name = useChange(brain, _ => _.name)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

    const handleOpenDelete = () => setConfirmDeleteOpen(true)
    const handleDelete = async () => {
        await brain.delete()
    }

    return (
        <Card>
            <CardHeader
                title={shortDeviceId(deviceId)}
                avatar={
                    <>
                        <BrainLiveConnectionButton brain={brain} />
                        <BrainConnectedButton brain={brain} />
                        {productId && (
                            <DeviceIconFromProductIdentifier
                                productIdentifier={productId}
                                avatar={true}
                            />
                        )}
                    </>
                }
                action={
                    <IconButtonWithTooltip
                        title="delete"
                        onClick={handleOpenDelete}
                    >
                        <DeleteIcon />
                    </IconButtonWithTooltip>
                }
            />
            <CardContent>
                <Typography variant="subtitle1">{name}</Typography>
                <Typography variant="caption">{deviceId}</Typography>
            </CardContent>
            <CardActions>
                <BrainDeviceScriptSelect brain={brain} />
            </CardActions>
            <Suspense>
                <ConfirmDialog
                    title="Delete Device?"
                    message="Are you sure you want to remove this device? There is no undo."
                    onConfirm={handleDelete}
                    open={confirmDeleteOpen}
                    setOpen={setConfirmDeleteOpen}
                    variant="delete"
                />
            </Suspense>
        </Card>
    )
}
