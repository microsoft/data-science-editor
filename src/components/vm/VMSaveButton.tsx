import React, { useState } from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import SaveIcon from "@material-ui/icons/Save"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    TextField,
} from "@material-ui/core"
import { useId } from "react-use-id-hook"

export default function VMSaveButton(props: { xml: string }) {
    const { xml } = props
    const [url, setUrl] = useState("")
    const open = !!url
    const handleClick = () => {
        const baseUrl = window.location.href
        const hash = `blocksxml=${encodeURIComponent(xml)}`

        setUrl(`${baseUrl}#${hash}`)
    }
    const handleClose = () => setUrl(undefined)
    const urlId = useId()

    return (
        <>
            <IconButtonWithTooltip title="save" onClick={handleClick}>
                <SaveIcon />
            </IconButtonWithTooltip>
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <DialogContentText>
                        Share this URL to reload your program.
                    </DialogContentText>
                    <TextField fullWidth={true} id={urlId} value={url} label="URL" />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
