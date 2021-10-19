import {
    createStyles,
    darken,
    lighten,
    makeStyles,
    Theme,
} from "@material-ui/core"
import { Button } from "gatsby-theme-material-ui"
import React, {
    CSSProperties,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react"
import AppContext from "./AppContext"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import ErrorIcon from "@material-ui/icons/Error"
import IconButtonWithTooltip from "./ui/IconButtonWithTooltip"
import useAnalytics, { EventProperties } from "./hooks/useAnalytics"
import useMounted from "./hooks/useMounted"
import clsx from "clsx"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"

const ACK_RESET_DELAY = 500
const ERROR_RESET_DELAY = 2000

const useStyles = makeStyles((theme: Theme) => {
    const getBackgroundColor = theme.palette.type === "light" ? lighten : darken
    return createStyles({
        ack: {
            color: "#fff",
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: theme.palette.success.main,
        },
        error: {
            color: "#fff",
            backgroundColor: getBackgroundColor(theme.palette.error.main, 0.6),
        },
    })
})

export default function CmdButton(props: {
    onClick: (mounted: () => boolean) => Promise<void>
    className?: string
    style?: CSSProperties
    title?: string
    children?: ReactNode
    icon?: JSX.Element
    size?: "small" | undefined
    variant?: "outlined" | "contained" | undefined
    disabled?: boolean
    disableReset?: boolean
    autoRun?: boolean
    trackName?: string
    trackProperties?: EventProperties
    ackResetDelay?: number
    color?: "primary" | "secondary"
}) {
    const {
        onClick,
        className,
        style,
        children,
        icon,
        title,
        disabled,
        disableReset,
        autoRun,
        trackName,
        trackProperties,
        ackResetDelay,
        color,
        ...others
    } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { setError: setAppError } = useContext(AppContext)
    const classes = useStyles()
    const [working, setWorking] = useState(false)
    const [ack, setAck] = useState(false)
    const [error, setError] = useState(undefined)
    const { trackEvent } = useAnalytics()
    const mounted = useMounted()

    const _disabled = disabled || working

    const run = async () => {
        if (working) return // already working

        if (trackName) trackEvent("cmd." + trackName, trackProperties)
        try {
            setError(undefined)
            setAck(false)
            setWorking(true)
            await onClick(mounted)
            if (!mounted()) return
            setAck(true)
            if (!disableReset) {
                await bus.delay(ackResetDelay || ACK_RESET_DELAY)
                if (!mounted()) return
                setAck(false)
            }
        } catch (e) {
            if (!mounted()) return
            setAppError(e)
            setError(e)
            if (!disableReset) {
                await bus.delay(ERROR_RESET_DELAY)
                if (!mounted()) return
                setError(undefined)
            }
        } finally {
            if (mounted()) setWorking(false)
        }
    }

    const handleClick = async (ev: React.MouseEvent<HTMLButtonElement>) => {
        ev.stopPropagation()
        ev.preventDefault()
        run()
    }

    const statusIcon = error ? <ErrorIcon /> : undefined
    const modeClassName = error ? classes.error : ack ? classes.ack : undefined
    const elClassName = clsx(className, modeClassName)

    // run once
    useEffect(() => {
        if (autoRun && mounted()) run()
    }, [autoRun])

    if (!children && icon)
        return (
            <IconButtonWithTooltip
                className={elClassName}
                style={style}
                onClick={handleClick}
                aria-label={title}
                title={title}
                disabled={_disabled}
                color={color}
                {...others}
            >
                {statusIcon || icon}
            </IconButtonWithTooltip>
        )
    else
        return (
            <Button
                className={elClassName}
                style={style}
                startIcon={icon}
                endIcon={statusIcon}
                onClick={handleClick}
                aria-label={title}
                title={title}
                disabled={_disabled}
                color={color}
                {...others}
            >
                {children}
            </Button>
        )
}
