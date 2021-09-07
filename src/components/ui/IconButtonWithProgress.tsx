import { Badge, IconButtonProps } from "@material-ui/core"
import { IconButton } from "gatsby-theme-material-ui"
import React from "react"
import CircularProgressBox, {
    CircularProgressBoxProps,
} from "./CircularProgressBox"
import Tooltip from "./Tooltip"

export type IconButtonWithProgressProps = {
    badgeColor?: "default" | "primary" | "secondary"
    badgeCount?: number
    indeterminate?: boolean
} & IconButtonProps &
    CircularProgressBoxProps

export default function IconButtonWithProgress(
    props: IconButtonWithProgressProps
) {
    const {
        indeterminate,
        title,
        children,
        badgeCount,
        badgeColor,
        progress,
        progressColor,
        progressStyle,
        progressSize,
        ...others
    } = props

    const badge = (
        <Badge
            color={badgeColor}
            badgeContent={badgeCount}
            invisible={!badgeCount}
        >
            {children}
        </Badge>
    )

    return (
        <Tooltip title={title} aria-label={props["aria-label"]}>
            <span>
                <IconButton {...others}>
                    {!indeterminate && badge}
                    {indeterminate && (
                        <CircularProgressBox
                            aria-label={title}
                            progress={progress}
                            progressColor={progressColor}
                            progressStyle={progressStyle}
                            progressSize={progressSize}
                        >
                            {badge}
                        </CircularProgressBox>
                    )}
                </IconButton>
            </span>
        </Tooltip>
    )
}
