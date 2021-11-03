import { Grid, GridSpacing } from "@mui/material"
import React from "react"

export default function AutoGrid(props: {
    children: JSX.Element | JSX.Element[]
    spacing?: GridSpacing
}) {
    const { children, spacing } = props
    if (children && Array.isArray(children))
        return (
            <Grid container spacing={spacing}>
                {(children as JSX.Element[]).map((child, i) => (
                    <Grid item xs={12} key={child.key || i}>
                        {child}
                    </Grid>
                ))}
            </Grid>
        )
    else return children as JSX.Element
}
