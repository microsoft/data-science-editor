import React from "react"
import {
    CircularProgressProps,
    Box,
    CircularProgress,
    Typography,
} from "@mui/material"

export default function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number }
) {
    const { value } = props
    return (
        <Box position="relative" display="inline-flex">
            <CircularProgress variant="determinate" {...props} />
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                >{`${Math.round(value)}%`}</Typography>
            </Box>
        </Box>
    )
}
