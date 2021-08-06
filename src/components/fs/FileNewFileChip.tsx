import {
    Chip,
    Dialog,
    DialogContent,
    DialogContentText,
    TextField,
    DialogActions,
    Button,
} from "@material-ui/core"
import React, { ChangeEvent, useContext, useState } from "react"
import AddIcon from "@material-ui/icons/Add"
import { useId } from "react-use-id-hook"
import FileSystemContext from "../FileSystemContext"

export default function FileNewFileChip(props: {
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
