import { Collapse, createStyles, makeStyles } from "@material-ui/core"
import {
    Alert as MaterialAlert,
    AlertProps,
    AlertTitle,
} from "@material-ui/lab"
import React, { ReactNode, useState } from "react"

const useStyles = makeStyles(theme =>
    createStyles({
        root: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(2),
        },
        icon: {
            flexDirection: "column",
            justifyContent: "center",
        },
    })
)

export default function Alert(
    props: {
        closeable?: boolean
        title?: ReactNode
        children: ReactNode
    } & AlertProps
) {
    const { closeable, title, children, ...others } = props
    const classes = useStyles()
    const [open, setOpen] = useState(true)
    const handleClose = () => setOpen(false)
    return (
        <Collapse in={open}>
            <MaterialAlert
                className={classes.root}
                classes={{
                    icon: !title && classes.icon,
                }}
                onClose={closeable && handleClose}
                {...others}
            >
                {title && <AlertTitle>{title}</AlertTitle>}
                {children}
            </MaterialAlert>
        </Collapse>
    )
}
