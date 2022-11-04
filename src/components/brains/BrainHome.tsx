import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Grid,
    MenuItem,
    SelectChangeEvent,
    TextField,
    Typography,
} from "@mui/material"
import React, {
    lazy,
    useContext,
    useState,
    MouseEvent,
    useEffect,
    useId,
} from "react"
import SearchIcon from "@mui/icons-material/Search"
import DeviceIconFromProductIdentifier from "../devices/DeviceIconFromProductIdentifier"
import { BrainDevice, BrainScript } from "./braindom"
import useChange from "../../jacdac/useChange"
import BrainConnectedButton from "./BrainConnectedButton"
import BrainManagerContext from "./BrainManagerContext"
import GridHeader from "../ui/GridHeader"
import BrainLiveConnectionButton from "./BrainLiveConnectionButton"
import { shortDeviceId } from "../../../jacdac-ts/src/jacdac"
import CmdButton from "../CmdButton"
import RefreshIcon from "@mui/icons-material/Refresh"
import ArticleIcon from "@mui/icons-material/Article"
import Suspense from "../ui/Suspense"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import DeleteIcon from "@mui/icons-material/Delete"
import SelectWithLabel from "../ui/SelectWithLabel"
import { Button } from "gatsby-theme-material-ui"
import AddIcon from "@mui/icons-material/Add"
import { useDebounce } from "use-debounce"
import useEffectAsync from "../useEffectAsync"

const ConfirmDialog = lazy(() => import("../shell/ConfirmDialog"))

function BrainScriptCard(props: { script: BrainScript }) {
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
        const newVersion =
            newId === scriptId
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
                    label={`Script${scriptChanged ? "*" : ""}`}
                    value={currentScriptId}
                    fullWidth={true}
                    size="small"
                    onChange={handleScriptChange}
                >
                    {scripts.map(script => (
                        <MenuItem key={script.id} value={script.scriptId}>
                            {script.name}
                        </MenuItem>
                    ))}
                </SelectWithLabel>
            </Grid>
            <Grid item>
                <SelectWithLabel
                    label={`Version${versionChanged ? "*" : " "}`}
                    sx={{ minWidth: "5em" }}
                    value={currentVersion?.toString() || ""}
                    fullWidth={true}
                    size="small"
                    onChange={handleVersionChange}
                >
                    {currentVersions?.map(v => (
                        <MenuItem key={v.id} value={v.version}>
                            v{v.version}
                        </MenuItem>
                    ))}
                </SelectWithLabel>
            </Grid>
            <Grid item>
                <CmdButton
                    variant={
                        scriptChanged || versionChanged
                            ? "contained"
                            : "outlined"
                    }
                    onClick={handleDeploy}
                >
                    Deploy
                </CmdButton>
            </Grid>
        </Grid>
    )
}

function BrainDeviceCard(props: { brain: BrainDevice }) {
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

function BrainScriptGridItems() {
    const { brainManager, showNewScriptDialog } =
        useContext(BrainManagerContext)
    const scripts = useChange(brainManager, _ => _?.scripts())

    const handleRefresh = () => brainManager?.refreshScripts()
    const handleNewScript = (ev: MouseEvent<HTMLButtonElement>) => {
        ev.stopPropagation()
        ev.preventDefault()
        showNewScriptDialog()
    }

    return (
        <>
            <GridHeader
                title="Scripts"
                action={
                    <>
                        <Button
                            title="new script"
                            onClick={handleNewScript}
                            startIcon={<AddIcon />}
                            disabled={!brainManager}
                        />
                        <CmdButton
                            title="refresh"
                            onClick={handleRefresh}
                            icon={<RefreshIcon />}
                            disabled={!brainManager}
                        />
                    </>
                }
            />
            {scripts?.map(script => (
                <Grid item key={script.id}>
                    <BrainScriptCard script={script} />
                </Grid>
            ))}
        </>
    )
}

function BrainDeviceGridItems() {
    const { brainManager } = useContext(BrainManagerContext)
    const id = useId()
    const searchId = id + "-search"
    const [search, setSearch] = useState(false)
    const [query, setQuery] = useState("")
    const [debouncedFilter] = useDebounce(query, 200)
    const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) =>
        setQuery(event.target.value || "")

    const brains = useChange(
        brainManager,
        _ =>
            _?.devices()?.filter(
                d =>
                    !search ||
                    d.name.indexOf(debouncedFilter) > -1 ||
                    d.deviceId.indexOf(debouncedFilter) > -1
            ),
        [debouncedFilter]
    )

    const handleRefresh = () => brainManager?.refreshDevices()
    const handleSearchClick = () => setSearch(!search)
    return (
        <>
            <GridHeader
                title="Devices"
                action={
                    <>
                        <CmdButton
                            onClick={handleRefresh}
                            icon={<RefreshIcon />}
                            disabled={!brainManager}
                        />
                        <IconButtonWithTooltip
                            title={search ? "hide search" : "show search"}
                            onClick={handleSearchClick}
                        >
                            <SearchIcon />
                        </IconButtonWithTooltip>
                    </>
                }
            />
            {search && (
                <Grid item xs={12}>
                    <TextField
                        id={searchId}
                        margin="dense"
                        type="search"
                        size="small"
                        variant="outlined"
                        label="Search devices"
                        aria-label="Search devices"
                        fullWidth={true}
                        value={query}
                        onChange={handleQueryChange}
                    />
                </Grid>
            )}
            {brains?.map(brain => (
                <Grid item key={brain.id} xs={12} sm={6}>
                    <BrainDeviceCard brain={brain} />
                </Grid>
            ))}
        </>
    )
}

export default function BrainHome() {
    const { brainManager } = useContext(BrainManagerContext)
    if (!brainManager) return null
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle2">
                    connected to{" "}
                    <a href={`https://${brainManager.apiRoot}/swagger/`}>
                        {brainManager.apiRoot}
                    </a>
                </Typography>
            </Grid>
            <BrainScriptGridItems />
            <BrainDeviceGridItems />
        </Grid>
    )
}
