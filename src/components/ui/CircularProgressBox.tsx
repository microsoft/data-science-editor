import { Box, CircularProgress, useTheme } from "@mui/material"
import React, { AriaAttributes, ReactNode } from "react"
import { useId } from "react"

export interface CircularProgressBoxProps {
    progress?: number
    progressSize?: React.ReactText
    progressColor?: "inherit" | "primary" | "secondary"
    progressStyle?: React.CSSProperties
}

export default function CircularProgressBox(
    props: {
        children?: ReactNode
    } & CircularProgressBoxProps &
        AriaAttributes
) {
    const {
        progress,
        progressColor,
        progressStyle,
        progressSize,
        children,
        ...others
    } = props
    const hasProgress = progress !== undefined
    const theme = useTheme()
    const id = useId()

    return (
        <Box position="relative" display="inline-flex">
            <CircularProgress
                id={id}
                variant={hasProgress ? "determinate" : "indeterminate"}
                disableShrink={!hasProgress}
                value={progress}
                size={progressSize || theme.spacing(3)}
                color={progressColor}
                style={progressStyle}
                {...others}
            />
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
                {children}
            </Box>
        </Box>
    )
}
