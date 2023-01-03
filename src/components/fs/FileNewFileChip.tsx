import {
    Chip,
    Dialog,
    DialogContent,
    DialogContentText,
    TextField,
    DialogActions,
    Button,
} from "@mui/material"
import React, { ChangeEvent, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import { useId } from "react"
import useFileSystem from "../FileSystemContext"

export default function FileNewFileChip(props: {
    name?: string
    content: string
    label?: string
    extension?: string
}) {
    const {
        name: newFileName,
        content: newFileContent,
        label,
        extension,
    } = props
    const { fileSystem } = useFileSystem()
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const valueId = useId()

    const handleOpen = () => {
        setValue("")
        setOpen(true)
    }
    const handleOk = async () => {
        setOpen(false)
        let name = value.toLocaleLowerCase().replace(/\s+/g, "")
        if (newFileName)
            await fileSystem.createWorkingDirectory(
                name,
                newFileName,
                newFileContent
            )
        else {
            if (extension) name += `.${extension}`
            const d = fileSystem.workingDirectory || fileSystem.root
            const f = await d.fileAsync(name, { create: true })
            await f.write(newFileContent)
            fileSystem.workingFile = f
        }
    }
    const handleCancel = () => setOpen(false)
    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value)
    }

    return (
        <>
            <Chip
                clickable
                label={label || "new..."}
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
