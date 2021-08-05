import {
    Grid,
    Chip,
    Dialog,
    DialogContent,
    DialogContentText,
    TextField,
    DialogActions,
    Button,
} from "@material-ui/core"
import React, { ChangeEvent, useContext, useRef, useState } from "react"
import OpenInBrowserIcon from "@material-ui/icons/OpenInBrowser"
import AddIcon from "@material-ui/icons/Add"
import { useId } from "react-use-id-hook"
import useKeyboardNavigationProps from "../hooks/useKeyboardNavigationProps"
import FileSystemContext from "../FileSystemContext"
import useChange from "../../jacdac/useChange"
import { FileSystemDirectory } from "./fsdom"

function FileSystemHandleChip(props: {
    directory: FileSystemDirectory
    selected?: boolean
    onClick: () => void
}) {
    const { directory, selected, onClick } = props
    const { name } = directory
    return (
        <Chip
            clickable
            label={name.replace(/\.json$/i, "")}
            color={selected ? "primary" : undefined}
            onClick={onClick}
        />
    )
}

function NewFileDialogButton(props: {
    newFileName: string
    newFileContent: string
}) {
    const { newFileName, newFileContent } = props
    const { fileSystem } = useContext(FileSystemContext)
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const valueId = useId()

    const handleOpen = () => {
        setValue("")
        setOpen(true)
    }
    const handleOk = async () => {
        setOpen(false)
        const name = value.toLocaleLowerCase().replace(/\s+/g, "")
        await fileSystem.createWorkingDirectory(
            name,
            newFileName,
            newFileContent
        )
    }
    const handleCancel = () => setOpen(false)
    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value)
    }

    return (
        <>
            <Chip
                clickable
                label="new project..."
                icon={<AddIcon />}
                onClick={handleOpen}
            />
            <Dialog open={open} fullWidth={true}>
                <DialogContent>
                    <DialogContentText>Choose a project name</DialogContentText>
                    <TextField
                        id={valueId}
                        value={value}
                        label="Value"
                        fullWidth={true}
                        onChange={handleValueChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!value}
                        onClick={handleOk}
                    >
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default function FileTabs(props: {
    newFileName?: string
    newFileContent?: string
}) {
    const { newFileName, newFileContent } = props
    const { fileSystem, showDirectoryPicker } = useContext(FileSystemContext)
    const root = useChange(fileSystem, _ => _?.root)
    const workingDirectory = useChange(fileSystem, _ => _?.workingDirectory)
    const directories = useChange(root, _ => _?.directories)
    const gridRef = useRef()
    const keyboardProps = useKeyboardNavigationProps(gridRef.current)
    const handleOpenDirectory = showDirectoryPicker
    const handleCloseDirectory = () => (fileSystem.root = undefined)
    const handleDirectoryHandleSelected = handle => () =>
        (fileSystem.workingDirectory = handle)

    if (!fileSystem) return null

    return (
        <Grid ref={gridRef} container spacing={1} {...keyboardProps}>
            <Grid item>
                <Chip
                    clickable
                    avatar={<OpenInBrowserIcon />}
                    label={root?.name || "open directory"}
                    onClick={handleOpenDirectory}
                    onDelete={root ? handleCloseDirectory : undefined}
                />
            </Grid>
            {directories?.map(directory => (
                <Grid item key={directory.name}>
                    <FileSystemHandleChip
                        directory={directory}
                        selected={directory === workingDirectory}
                        onClick={handleDirectoryHandleSelected(directory)}
                    />
                </Grid>
            ))}
            {root && newFileName && newFileContent && (
                <Grid item>
                    <NewFileDialogButton
                        newFileName={newFileName}
                        newFileContent={newFileContent}
                    />
                </Grid>
            )}
        </Grid>
    )
}
