import { styled } from "@mui/material/styles"
import React, { ReactNode } from "react"

const PREFIX = "ChipList"

const classes = {
    root: `${PREFIX}-root`,
}

const Root = styled("span")(({ theme }) => ({
    [`&.${classes.root}`]: {
        display: "flex",
        justifyContent: "flex-start",
        flexWrap: "wrap",
        "& > *": {
            margin: theme.spacing(0.5),
        },
    },
}))

export default function ChipList(props: { children: ReactNode }) {
    const { children } = props

    if (!children) return null

    return <Root className={classes.root}>{children}</Root>
}
