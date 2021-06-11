import { createStyles, makeStyles, Theme } from "@material-ui/core"
import React, { ReactNode } from "react"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            "& > *": {
                margin: theme.spacing(0.5),
            },
        },
    })
)

export default function ChipList(props: { children: ReactNode }) {
    const { children } = props
    const classes = useStyles()

    if (!children) return null

    return <span className={classes.root}>{children}</span>
}
