import React, { useState } from 'react';
import { DropzoneDialog } from 'material-ui-dropzone'
import { Box, Button } from '@material-ui/core';
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import IconButtonWithTooltip from './ui/IconButtonWithTooltip';

export default function ImportButton(props: {
    icon?: boolean,
    text: string,
    onFilesUploaded: (files: File[]) => void,
    disabled?: boolean,
    acceptedFiles?: string[],
    filesLimit?: number
    className?: string
}) {
    const { text, onFilesUploaded, disabled, acceptedFiles, icon, filesLimit, className } = props;
    const [open, setOpen] = useState(false)

    const handleOpen = () => {
        setOpen(true)
    }
    const handleSave = (files: File[]) => {
        if (files?.length)
            onFilesUploaded(files)
        setOpen(false)
    }
    const handleClose = () => setOpen(false)

    return <Box className={className}>
        {icon && <IconButtonWithTooltip title={text} onClick={handleOpen}>
            <OpenInBrowserIcon />
        </IconButtonWithTooltip>}
        {!icon && <Button disabled={disabled} variant="outlined" onClick={handleOpen} startIcon={<OpenInBrowserIcon />}>
            {text}
        </Button>}
        <DropzoneDialog
            open={open}
            onSave={handleSave}
            maxFileSize={5000000}
            onClose={handleClose}
            acceptedFiles={acceptedFiles}
            clearOnUnmount={true}
            filesLimit={filesLimit || 1}
            submitButtonText={"import"}
        />
    </Box>
}