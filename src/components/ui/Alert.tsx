import { Box, Collapse } from '@material-ui/core';
import { Alert as MaterialAlert, AlertProps } from '@material-ui/lab';
import React, { useState } from 'react';

export default function Alert(props: { closeable?: boolean; } & AlertProps) {
    const { closeable, ...others } = props;
    const [open, setOpen] = useState(true)
    const handleClose = () => setOpen(false)
    return <Box mb={2}>
        <Collapse in={open}>
            <MaterialAlert onClose={closeable && handleClose} {...others} />
        </Collapse>
    </Box>
}