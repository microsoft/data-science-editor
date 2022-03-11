import React, { ReactNode } from "react"
import { AlertColor, Box, Typography } from "@mui/material"
import SwitchWithLabel from "./SwitchWithLabel"
import Alert from "./Alert"

export default function AlertSwitch(props: {
    severity?: AlertColor
    title: string
    checked: boolean
    onChecked: (checked: boolean) => void
    children?: ReactNode
}) {
    const { severity, title, checked, onChecked, children } = props
    const handleChecked = (ev: unknown, newChecked: boolean) =>
        onChecked(newChecked)
    return (
        <Alert severity={severity}>
            <SwitchWithLabel
                checked={checked}
                onChange={handleChecked}
                label={
                    <Typography component="span" variant="body1">
                        {title}
                    </Typography>
                }
            />
            <Box mr={1}>
                <Typography component="span" variant="caption">
                    {children}
                </Typography>
            </Box>
        </Alert>
    )
}
