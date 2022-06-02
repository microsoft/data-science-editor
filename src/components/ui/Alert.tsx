import { Collapse } from "@mui/material"
import { styled } from "@mui/material/styles"
import { Alert as MaterialAlert, AlertTitle } from "@mui/material"
import { AlertProps } from "@mui/lab"
import React, { ReactNode, useState } from "react"

const PREFIX = "Alert"

const classes = {
    icon: `${PREFIX}icon`,
}

const StyledCollapse = styled(Collapse)(() => ({
    [`& .${classes.icon}`]: {
        flexDirection: "column",
        justifyContent: "center",
    },
}))

export default function Alert(
    props: {
        closeable?: boolean
        title?: ReactNode
        children: ReactNode
    } & AlertProps
) {
    const { closeable, title, children, ...others } = props

    const [open, setOpen] = useState(true)
    const handleClose = () => setOpen(false)
    return (
        <StyledCollapse in={open}>
            <MaterialAlert
                sx={{ mt: 1, mb: 2 }}
                classes={{
                    icon: !title && classes.icon,
                }}
                onClose={closeable && handleClose}
                {...others}
            >
                {title && <AlertTitle>{title}</AlertTitle>}
                {children}
            </MaterialAlert>
        </StyledCollapse>
    )
}
