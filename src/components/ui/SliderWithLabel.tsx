import {
    makeStyles,
    Slider,
    SliderProps,
    Theme,
    Tooltip,
    Typography,
} from "@material-ui/core"
import React from "react"
import { useId } from "react-use-id-hook"

const useStyle = makeStyles((theme: Theme) => ({
    arrow: {
        color: theme.palette.primary.main,
    },
    tooltip: {
        backgroundColor: theme.palette.primary.main,
    },
}))

function ValueLabelComponent(props: {
    children: React.ReactElement
    open: boolean
    value: number
}) {
    const { children, open, value } = props
    const classes = useStyle()

    return (
        <Tooltip
            classes={classes}
            open={open}
            arrow={true}
            color="primary"
            enterTouchDelay={0}
            placement="top"
            title={value}
        >
            {children}
        </Tooltip>
    )
}

export default function SliderWithLabel(
    props: {
        label?: string
    } & SliderProps
) {
    const { label, ...others } = props
    const labelId = useId()
    const sliderId = useId()

    return (
        <>
            <Typography id={labelId} variant="caption" gutterBottom>
                {label}
            </Typography>
            <Slider
                id={sliderId}
                aria-labelledby={labelId}
                aria-label={label}
                ValueLabelComponent={ValueLabelComponent}
                {...others}
            />
        </>
    )
}
