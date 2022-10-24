import React, { useContext, useState } from "react"
import { JDomTreeViewProps } from "../tools/JDomTreeViewItems"
import StyledTreeItem, { StyledTreeViewItemProps } from "../ui/StyledTreeItem"
import CloudQueueIcon from "@mui/icons-material/CloudQueue"
import CodeIcon from "@mui/icons-material/Code"
import { DEVICE_NODE_NAME } from "../../../jacdac-ts/src/jdom/constants"
import BrainManagerContext from "./BrainManagerContext"
import RefreshIcon from "@mui/icons-material/Refresh"
import CmdButton from "../CmdButton"
import useChange from "../../jacdac/useChange"
import { BrainDevice, BrainScript } from "./braindom"
import AddIcon from "@mui/icons-material/Add"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import RegisterBrainDeviceDialog from "./RegisterBrainDeviceDialog"
import DeleteIcon from "@mui/icons-material/Delete"
import { navigate } from "gatsby"
import Suspense from "../ui/Suspense"
import ConfirmDialog from "../shell/ConfirmDialog"
import { Button } from "gatsby-theme-material-ui"
import useEffectAsync from "../useEffectAsync"
import DeviceIconFromProductIdentifier from "../devices/DeviceIconFromProductIdentifier"
import ServiceConnectedIconButton from "../buttons/ServiceConnectedIconButton"

export default function BrainManagerTreeItem(
    props: StyledTreeViewItemProps & JDomTreeViewProps
) {
    const nodeId = "brain-manager"
    const name = "brains"
    const description = "Manage remote brains and programs"
    const { brainManager } = useContext(BrainManagerContext)

    const handleRefresh = async () => {
        await brainManager?.refresh()
    }

    useEffectAsync(handleRefresh, [brainManager])

    return (
        <StyledTreeItem
            nodeId={nodeId}
            labelText={name}
            labelCaption={description}
            icon={<CloudQueueIcon fontSize="small" />}
            actions={
                <CmdButton
                    title="refresh"
                    size="small"
                    icon={<RefreshIcon />}
                    onClick={handleRefresh}
                />
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
        const scriptId = await brainManager.createScript("new script")
        if (scriptId) {
            setScriptId(scriptId)
            navigate("/editors/jacscript")
        }
    }

    return (
        <StyledTreeItem
            nodeId={nodeId}
            labelText={name}
            icon={<CodeIcon fontSize="small" />}
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
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const name = useChange(script, _ => _.name)
    const version = useChange(script, _ => _.version)
    const nodeId = `brain-manager-programs-${id}`
    const current = id === scriptId
    const info = `v${version || ""}`

    const handleClick = () => {
        setScriptId(id)
        navigate("/editors/jacscript")
    }
    const handleOpen = () => setConfirmDeleteOpen(true)
    const handleDelete = async () => await script.delete()

    return (
        <>
            <StyledTreeItem
                nodeId={nodeId}
                labelText={name}
                labelInfo={info}
                sx={{ fontWeight: current ? "bold" : undefined }}
                onClick={handleClick}
                actions={
                    <Button
                        title="delete"
                        startIcon={<DeleteIcon color="action" />}
                        onClick={handleOpen}
                    />
                }
            ></StyledTreeItem>
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
        </>
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
                    device={device}
                    {...props}
                />
            ))}
            <RegisterBrainDeviceDialog open={open} setOpen={setOpen} />
        </StyledTreeItem>
    )
}

function BrainDeviceTreeItem(
    props: { device: BrainDevice } & StyledTreeViewItemProps & JDomTreeViewProps
) {
    const { device } = props
    const { id } = device
    const { deviceId, setDeviceId } = useContext(BrainManagerContext)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const nodeId = `brain-manager-devices-${id}`
    const devId = useChange(device, _ => _.data.id)
    const productIdentifier = useChange(device, _ => _?.data.meta?.productId)
    const name = useChange(device, _ => _.name)
    const connected = useChange(device, _ => _.connected)
    const current = devId === deviceId

    const handleClick = () => {
        setDeviceId(id)
    }
    const handleOpenConfirmDelete = () => setConfirmDeleteOpen(true)
    const handleDelete = async () => {
        await device.delete()
    }
    const handleConnectionClick = ev => {
        ev.stopPropagation()
        ev.preventDefault()
    }

    return (
        <>
            <StyledTreeItem
                nodeId={nodeId}
                labelText={name}
                labelCaption={devId}
                sx={{ fontWeight: current ? "bold" : undefined }}
                onClick={handleClick}
                icon={
                    <DeviceIconFromProductIdentifier
                        size="small"
                        productIdentifier={productIdentifier}
                    />
                }
                actions={
                    <>
                        <ServiceConnectedIconButton
                            connected={connected}
                            onClick={handleConnectionClick}
                        />
                        <IconButtonWithTooltip
                            title="delete"
                            onClick={handleOpenConfirmDelete}
                        >
                            <DeleteIcon color="action" />
                        </IconButtonWithTooltip>
                    </>
                }
            ></StyledTreeItem>{" "}
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
        </>
    )
}
