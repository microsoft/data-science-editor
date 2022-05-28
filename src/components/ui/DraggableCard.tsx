/* eslint-disable jsx-a11y/media-has-caption */
import { Card, CardContent, CardHeader, CardMedia, Grid } from "@mui/material"
import { styled } from "@mui/material/styles"
import React, { ReactNode, useRef, useState } from "react"
import SettingsIcon from "@mui/icons-material/Settings"
import IconButtonWithTooltip from "./IconButtonWithTooltip"
import CloseIcon from "@mui/icons-material/Close"
import MinimizeIcon from "@mui/icons-material/Minimize"
import MaximizeIcon from "@mui/icons-material/Maximize"
import Draggable, { DraggableProps } from "react-draggable"

const PREFIX = "DraggableCard"

const classes = {
    cardContainer: `${PREFIX}cardContainer`,
    card: `${PREFIX}card`,
}

const Root = styled("div")(() => ({
    [`& .${classes.cardContainer}`]: {
        zIndex: 2101,
        position: "absolute",
        right: "2rem",
        bottom: "3rem",
    },

    [`& .${classes.card}`]: {
        "& .hostedcontainer": {
            position: "relative",
        },
        "& video": {
            border: "none",
            position: "relative",
            width: "100%",
            height: "100%",
        },
    },
}))

export default function DraggableCard(props: {
    onClose: () => void
    alert?: ReactNode
    settings?: ReactNode
    children: ReactNode
    fullWidth?: string
    minimizeWidth?: string
}) {
    const {
        onClose,
        children,
        settings,
        alert,
        minimizeWidth = "clamp(10rem, 20vw, 20vh)",
        fullWidth = "clamp(20rem, 80vh, 80vw)",
    } = props
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [minimize, setMinimize] = useState(true)
    const nodeRef = useRef<HTMLSpanElement>()

    const handleClose = async () => await onClose()
    const handleMinimize = () => setMinimize(!minimize)
    const handleSettings = () => {
        console.debug(`toggle settings`, { settingsOpen })
        setSettingsOpen(!settingsOpen)
    }

    const draggableProps: Partial<DraggableProps> = {
        nodeRef,
    }

    return (
        <Root>
            <Draggable {...draggableProps}>
                <span ref={nodeRef} className={classes.cardContainer}>
                    <Card className={classes.card}>
                        <CardHeader
                            title={settingsOpen && settings}
                            action={
                                <Grid container spacing={1} direction="row">
                                    <Grid item>
                                        <IconButtonWithTooltip
                                            onClick={handleMinimize}
                                            title={
                                                minimize
                                                    ? "Maximize"
                                                    : "Minimize"
                                            }
                                        >
                                            {minimize ? (
                                                <MaximizeIcon />
                                            ) : (
                                                <MinimizeIcon />
                                            )}
                                        </IconButtonWithTooltip>
                                    </Grid>
                                    {settings && (
                                        <Grid item>
                                            <IconButtonWithTooltip
                                                onClick={handleSettings}
                                                title="Settings"
                                            >
                                                <SettingsIcon />
                                            </IconButtonWithTooltip>
                                        </Grid>
                                    )}
                                    <Grid item>
                                        <IconButtonWithTooltip
                                            onClick={handleClose}
                                            title="Close"
                                        >
                                            <CloseIcon />
                                        </IconButtonWithTooltip>
                                    </Grid>
                                </Grid>
                            }
                        />
                        {alert && <CardContent>{alert}</CardContent>}
                        <CardMedia>
                            <div
                                className="hostedcontainer"
                                style={{
                                    width: !minimize
                                        ? minimizeWidth
                                        : fullWidth,
                                }}
                            >
                                {children}
                            </div>
                        </CardMedia>
                    </Card>
                </span>
            </Draggable>
        </Root>
    )
}
