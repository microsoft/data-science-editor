import React, { useContext, useState } from "react"
import { JDomTreeViewProps } from "../tools/JDomTreeViewItems"
import StyledTreeItem, { StyledTreeViewItemProps } from "../ui/StyledTreeItem"
import CloudQueueIcon from "@mui/icons-material/CloudQueue"
import { DEVICE_NODE_NAME } from "../../../jacdac-ts/src/jdom/constants"
import BrainManagerContext from "./BrainManagerContext"
import RefreshIcon from "@mui/icons-material/Refresh"
import CmdButton from "../CmdButton"
import useChange from "../../jacdac/useChange"
import { BrainDevice, BrainScript } from "./braindom"
import AddIcon from "@mui/icons-material/Add"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import RegisterBrainDeviceDialog from "./RegisterBrainDeviceDialog"
import { navigate } from "gatsby"
import useEffectAsync from "../useEffectAsync"
import DeviceIconFromProductIdentifier from "../devices/DeviceIconFromProductIdentifier"
import SourceIcon from "@mui/icons-material/Source"
import ArticleIcon from "@mui/icons-material/Article"
import BrainConnectedButton from "./BrainConnectedButton"
import { shortDeviceId } from "../../../jacdac-ts/src/jdom/pretty"
import FolderOpenIcon from "@mui/icons-material/FolderOpen"
import BrainLiveConnectionButton from "./BrainLiveConnectionButton"
import useBrainScript from "./useBrainScript"
export default function BrainManagerTreeItem(
    props: StyledTreeViewItemProps & JDomTreeViewProps
) {
    const nodeId = "brain-manager"
    const name = "brains"
    const { brainManager } = useContext(BrainManagerContext)

    const handleRefresh = async () => {
        await brainManager?.refresh()
    }
    const handleOpenBrains = ev => {
        ev.stopPropagation()
        ev.preventDefault()
        navigate("/brains")
    }
    useEffectAsync(handleRefresh, [brainManager])

    return (
        <StyledTreeItem
            nodeId={nodeId}
            labelText={name}
            icon={<CloudQueueIcon />}
            actions={
                <>
                    <IconButtonWithTooltip
                        title="go to brains manager"
                        onClick={handleOpenBrains}
                    >
                        <FolderOpenIcon fontSize="small" />
                    </IconButtonWithTooltip>
                    <CmdButton
                        title="refresh"
                        size="small"
                        icon={<RefreshIcon />}
                        onClick={handleRefresh}
                    />
                </>
            }
        >
            <BrainScriptsTreeItem {...props} />
            <BrainDevicesTreeItem {...props} />
        </StyledTreeItem>
    )
}

function BrainScriptsTreeItem(
    props: StyledTreeViewItemProps & JDomTreeViewProps
) {
    const { brainManager, setScriptId } = useContext(BrainManagerContext)
    const scripts = useChange(brainManager, _ => _?.scripts())
    const nodeId = "brain-manager-programs"
    const name = "programs"

    const handleNewScript = async () => {
        const script = await brainManager.createScript("my device.js")
        if (!script) return

        setScriptId(script.id)
        navigate("/editors/jacscript-text/")
    }

    return (
        <StyledTreeItem
            nodeId={nodeId}
            labelText={name}
            icon={<SourceIcon fontSize="small" />}
            actions={
                <CmdButton
                    title="New script"
                    onClick={handleNewScript}
                    icon={<AddIcon fontSize="small" />}
                />
            }
        >
            {scripts?.map(script => (
                <BrainScriptTreeItem
                    key={script.id}
                    script={script}
                    {...props}
                />
            ))}
        </StyledTreeItem>
    )
}

function BrainScriptTreeItem(
    props: { script: BrainScript } & StyledTreeViewItemProps & JDomTreeViewProps
) {
    const { script } = props
    const { scriptId, setScriptId } = useContext(BrainManagerContext)
    const { id } = script
    const name = useChange(script, _ => _.name)
    const version = useChange(script, _ => _.version)
    const nodeId = `brain-manager-programs-${id}`
    const current = id === scriptId
    const caption = `v${version || ""}`
    const info = useChange(script, _ => _.creationTime?.toLocaleString())

    const handleClick = () => {
        setScriptId(script.scriptId)
        navigate("/editors/jacscript-text/")
    }

    return (
        <StyledTreeItem
            nodeId={nodeId}
            labelText={name}
            labelCaption={caption}
            labelInfo={info}
            sx={{ fontWeight: current ? "bold" : undefined }}
            onClick={handleClick}
            icon={<ArticleIcon fontSize="small" />}
        ></StyledTreeItem>
    )
}

function BrainDevicesTreeItem(
    props: StyledTreeViewItemProps & JDomTreeViewProps
) {
    const { brainManager } = useContext(BrainManagerContext)
    const [open, setOpen] = useState(false)
    const devices = useChange(brainManager, _ => _?.devices())
    const nodeId = "brain-manager-devices"
    const name = "devices"

    const handleDialogOpenToggle = ev => {
        ev.stopPropagation()
        ev.preventDefault()
        setOpen(v => !v)
    }

    return (
        <StyledTreeItem
            nodeId={nodeId}
            labelText={name}
            kind={DEVICE_NODE_NAME}
            actions={
                <IconButtonWithTooltip
                    title="Register device"
                    onClick={handleDialogOpenToggle}
                >
                    <AddIcon fontSize="small" />
                </IconButtonWithTooltip>
            }
        >
            {devices?.map(device => (
                <BrainDeviceTreeItem
                    key={device.id}
                    brain={device}
                    {...props}
                />
            ))}
            <RegisterBrainDeviceDialog open={open} setOpen={setOpen} />
        </StyledTreeItem>
    )
}

function BrainDeviceTreeItem(
    props: { brain: BrainDevice } & StyledTreeViewItemProps & JDomTreeViewProps
) {
    const { brain } = props
    const { id } = brain
    const { deviceId, setDeviceId } = useContext(BrainManagerContext)
    const nodeId = `brain-manager-devices-${id}`
    const devId = brain.deviceId

    const connected = useChange(brain, _ => _.connected)
    const data = useChange(brain, _ => _.data)

    const { name, scriptId, meta = {} } = data
    const { productId } = meta
    const script = useBrainScript(scriptId)
    const current = devId === deviceId
    const caption = script?.toString() || scriptId || `no script`

    const handleClick = () => {
        setDeviceId(id)
    }

    return (
        <StyledTreeItem
            nodeId={nodeId}
            labelText={`${shortDeviceId(devId)}, ${name}`}
            labelCaption={caption}
            sx={{ fontWeight: current ? "bold" : undefined }}
            onClick={handleClick}
            icon={
                <DeviceIconFromProductIdentifier
                    size="small"
                    productIdentifier={productId}
                />
            }
            actions={
                <>
                    {connected && <BrainLiveConnectionButton brain={brain} />}
                    <BrainConnectedButton brain={brain} />
                </>
            }
        />
    )
}
