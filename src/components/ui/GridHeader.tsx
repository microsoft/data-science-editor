import { Box, Chip, Grid, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import React, { ReactNode } from "react"
import clsx from "clsx"

const PREFIX = "GridHeader"

const classes = {
    hr: `${PREFIX}hr`,
    start: `${PREFIX}start`,
}

const StyledGrid = styled(Grid)(({ theme }) => ({
    [`& .${classes.hr}`]: {
        background: theme.palette.text.disabled,
        marginBottom: "unset",
    },

    [`& .${classes.start}`]: {
        width: theme.spacing(2),
    },
}))

export default function GridHeader(props: {
    title?: ReactNode
    count?: number
    variant?: "subtitle1" | "caption" | "subtitle2"
    action?: JSX.Element
}) {
    const { title, count, variant, action } = props

    return (
        <StyledGrid item xs={12}>
            <Grid
                container
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
            >
                <Grid item>
                    <hr className={clsx(classes.hr, classes.start)} />
                </Grid>
                <Grid item>
                    {action && (
                        <Box component="span" mr={1}>
                            {action}
                        </Box>
                    )}
                    <Typography
                        component="span"
                        variant={variant || "subtitle1"}
                    >
                        {title}
                    </Typography>
                    {count !== undefined && (
                        <Box component="span" ml={0.5}>
                            <Chip label={count} />
                        </Box>
                    )}
                </Grid>
                <Grid item xs>
                    <hr className={classes.hr} />
                </Grid>
            </Grid>
        </StyledGrid>
    )
}
