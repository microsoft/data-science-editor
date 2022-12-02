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
import React, { lazy, useContext, useState, MouseEvent, useEffect } from "react"
import { BrainDevice, BrainScript } from "./braindom"
import useChange from "../../jacdac/useChange"
import BrainManagerContext from "./BrainManagerContext"
import CmdButton from "../CmdButton"
import ArticleIcon from "@mui/icons-material/Article"
import Suspense from "../ui/Suspense"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import DeleteIcon from "@mui/icons-material/Delete"
import SelectWithLabel from "../ui/SelectWithLabel"
import { Button } from "gatsby-theme-material-ui"
import useEffectAsync from "../useEffectAsync"
import UploadIcon from "@mui/icons-material/Upload"

const ConfirmDialog = lazy(() => import("../shell/ConfirmDialog"))

export default function BrainScriptCard(props: { script: BrainScript }) {
    const { script } = props
    const { scriptId } = script
    const { openScript } = useContext(BrainManagerContext)
    const name = useChange(script, _ => _.name)
    const version = useChange(script, _ => _.version)
    const creationTime = useChange(
        script,
        _ => _.creationTime,
        [],
        (a, b) => a?.toLocaleString() === b?.toLocaleString()
    )
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const handleDelete = async () => await script.delete()
    const handleOpenDelete = (ev: MouseEvent<HTMLButtonElement>) => {
        ev.stopPropagation()
        ev.preventDefault()
        setConfirmDeleteOpen(true)
    }
    const handleOpen = () => openScript(scriptId)
    return (
        <Card>
            <CardHeader
                avatar={<ArticleIcon />}
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
                <Typography variant="subtitle1">
                    {name}{" "}
                    <Typography component="span" variant="caption">
                        v{version}
                    </Typography>
                </Typography>
                {creationTime && (
                    <Typography variant="subtitle2">
                        {creationTime.toLocaleString()}
                    </Typography>
                )}
            </CardContent>
            <CardActions>
                <Button variant="outlined" onClick={handleOpen}>
                    Open
                </Button>
            </CardActions>
            <Suspense>
                <ConfirmDialog
                    title="Delete Script?"
                    message="Are you sure you want to remove this script? There is no undo."
                    onConfirm={handleDelete}
                    open={confirmDeleteOpen}
                    setOpen={setConfirmDeleteOpen}
                    variant="delete"
                />
            </Suspense>
        </Card>
    )
}

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
