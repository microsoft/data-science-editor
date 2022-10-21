import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material"
import { Button } from "gatsby-theme-material-ui"
import React, { ReactNode } from "react"
import CmdButton from "../CmdButton"

export default function ConfirmDialog(props: {
    open: boolean
    setOpen: (open: boolean) => void
    title: ReactNode
    message: ReactNode
    okLabel?: string
    okColor?: "primary" | "error"
    variant?: "delete"
    onConfirm: () => Promise<void>
}) {
    const {
        title,
        message,
        variant,
        okLabel,
        okColor,
        onConfirm,
        open,
        setOpen,
    } = props
    const del = variant === "delete"
    const handleCancel = () => setOpen(false)
    const handleConfirm = async () => {
        await onConfirm()
        setOpen(false)
    }
    return (
        <Dialog open={open} onClose={handleCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    onClick={handleCancel}
                    color="primary"
                    sx={{ mr: 1 }}
                >
                    Cancel
                </Button>
                <CmdButton
                    variant="contained"
                    onClick={handleConfirm}
                    color={del ? "error" : okColor || "primary"}
                >
                    {del ? "delete" : okLabel || "OK"}
                </CmdButton>
            </DialogActions>
        </Dialog>
    )
}
