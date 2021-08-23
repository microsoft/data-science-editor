import { Grid, MenuItem, TextField, Typography } from "@material-ui/core"
import React, { ChangeEvent, lazy, useMemo, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { lightEncode } from "../../../jacdac-ts/src/jdom/light"
import SelectWithLabel from "../ui/SelectWithLabel"
import JDService from "../../../jacdac-ts/src/jdom/service"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import RemoveIcon from "@material-ui/icons/Remove"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import AddIcon from "@material-ui/icons/Add"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import useServiceServer from "../hooks/useServiceServer"
import LedPixelServer from "../../../jacdac-ts/src/servers/ledpixelserver"
import LightWidget from "../widgets/LightWidget"
import { LedPixelCmd } from "../../../jacdac-ts/src/jdom/constants"
import ColorButtons from "../widgets/ColorButtons"
import Suspense from "../ui/Suspense"
const ColorInput = lazy(() => import("../ui/ColorInput"))

/*
0xD6: range P=0 N=length W=1 S=0- range from pixel P, Npixels long (currently unsupported: every Wpixels skip Spixels)
*/

interface LightCommand {
    name: string
    args: "C+" | "K" | "M"
    description: string
}

const lightCommands = [
    {
        name: "setall",
        args: "C+",
        description: "set all pixels in current range to given color pattern",
    },
    {
        name: "fade",
        args: "C+",
        description:
            "set pixels in current range to colors between colors in sequence",
    },
    {
        name: "rotfwd",
        args: "K",
        description: "rotate (shift) pixels away from the connector",
        valueDescription: "pixel positions to rotate",
    },
    {
        name: "rotback",
        args: "K",
        description: "rotate (shift) pixels towards the connector",
        valueDescription: "pixel positions to rotate",
    },
]

function LightCommand(props: { service: JDService; expanded: boolean }) {
    const { service } = props
    const [sending, setSending] = useState(false)

    const [command, setCommand] = useState(lightCommands[1])
    const [offset, setOffset] = useState("1")
    const [duration, setDuration] = useState("100")
    const [colors, setColors] = useState(["#0000ff", "#ff0000"])
    const [mode, setMode] = useState(0)

    const { name, args, description, valueDescription } = command
    const dcolors = args == "PC" ? colors.slice(0, 1) : colors

    const encoded = useMemo(() => {
        let sargs = ""
        let vargs = []
        switch (args) {
            case "C+":
                sargs = Array(colors.length).fill("#").join(" ")
                vargs = colors.map(c => parseInt(c.slice(1), 16))
                break
            case "K": {
                sargs = "%"
                vargs = [parseInt(offset)]
                break
            }
            case "PC": {
                sargs = "% #"
                vargs = [parseInt(offset), parseInt(colors[0].slice(1), 16)]
                break
            }
        }

        if (mode) vargs.unshift(mode)

        if (vargs.some(v => v === undefined || isNaN(v))) return undefined

        let ms = parseInt(duration)
        if (isNaN(ms)) ms = 100
        const src = [mode && `tmpmode %`, `${name} ${sargs}`, `show %`]
            .filter(l => !!l)
            .join("\n")
        const largs = [...vargs, ms]
        const r = lightEncode(src, largs)
        return r
    }, [command, colors, duration, offset, mode])

    const sendCommand = async () => {
        if (!encoded) return
        try {
            setSending(true)
            await service.sendCmdAsync(LedPixelCmd.Run, encoded)
        } finally {
            setSending(false)
        }
    }
    const handleCommandChange = (
        ev: ChangeEvent<{ name?: string; value: unknown }>
    ) => {
        const newName = ev.target.value as string
        setCommand(lightCommands.find(cmd => cmd.name === newName))
    }
    const handleOffsetChange = (ev: ChangeEvent<{ value: string }>) => {
        setOffset(ev.target.value)
    }
    const handleModeChange = (ev: ChangeEvent<any>) => {
        const v = parseInt(ev.target.value)
        if (!isNaN(v)) setMode(v)
    }
    const handleDurationChange = (ev: ChangeEvent<{ value: string }>) => {
        setDuration(ev.target.value)
    }
    const handleColorChange = (index: number) => async (color: string) => {
        const cs = colors.slice(0)
        cs[index] = color
        setColors(cs)
    }
    const handleRemoveColor = () => {
        const cs = colors.slice(0)
        cs.pop()
        setColors(cs)
    }
    const handleAddColor = () => {
        const cs = colors.slice(0)
        cs.push("#ff0000")
        setColors(cs)
    }

    return (
        <>
            <Grid item>
                <Grid
                    container
                    spacing={1}
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-start"
                >
                    <Grid item key="descr" xs={12}>
                        <Typography variant="caption">{description}</Typography>
                    </Grid>
                    <Grid item key="select" xs={12}>
                        <SelectWithLabel
                            disabled={sending}
                            fullWidth={true}
                            label="command"
                            value={name}
                            onChange={handleCommandChange}
                        >
                            {lightCommands.map(cmd => (
                                <MenuItem key={cmd.name} value={cmd.name}>
                                    {cmd.name}
                                </MenuItem>
                            ))}
                        </SelectWithLabel>
                    </Grid>
                    <Grid item key="time" xs={6}>
                        <TextField
                            variant="outlined"
                            label={"duration (milliseconds)"}
                            type="number"
                            value={duration}
                            onChange={handleDurationChange}
                        />
                    </Grid>
                    <Grid item key="mode" xs={6}>
                        <SelectWithLabel
                            fullWidth={true}
                            label="update mode"
                            value={mode + ""}
                            onChange={handleModeChange}
                        >
                            <MenuItem value={0}>replace</MenuItem>
                            <MenuItem value={1}>add</MenuItem>
                            <MenuItem value={2}>substract</MenuItem>
                            <MenuItem value={3}>multiply</MenuItem>
                        </SelectWithLabel>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Grid
                    container
                    spacing={1}
                    direction="row"
                    alignItems="center"
                    alignContent="flex-start"
                    justifyContent="flex-start"
                >
                    {(args === "K" || args === "PC") && (
                        <Grid item key="K">
                            <TextField
                                variant="outlined"
                                type="number"
                                helperText={valueDescription}
                                value={offset}
                                onChange={handleOffsetChange}
                            />
                        </Grid>
                    )}
                    {(args === "C+" || args === "PC") &&
                        dcolors.map((c, i) => (
                            <Grid item xs key={i}>
                                <Suspense>
                                    <ColorInput
                                        value={c}
                                        onChange={handleColorChange(i)}
                                    />
                                </Suspense>
                            </Grid>
                        ))}
                    {args === "C+" && (
                        <Grid item xs key="minuscolor">
                            <IconButtonWithTooltip
                                disabled={colors.length < 2}
                                title={"Remove color"}
                                onClick={handleRemoveColor}
                            >
                                <RemoveIcon />
                            </IconButtonWithTooltip>
                            <IconButtonWithTooltip
                                disabled={colors.length > 4}
                                title={"Add color"}
                                onClick={handleAddColor}
                            >
                                <AddIcon />
                            </IconButtonWithTooltip>
                        </Grid>
                    )}
                    <Grid item xs key="run">
                        <IconButtonWithTooltip
                            disabled={!encoded}
                            title={"Run command"}
                            onClick={sendCommand}
                        >
                            <PlayArrowIcon />
                        </IconButtonWithTooltip>
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}

export default function DashboardLEDPixel(props: DashboardServiceProps) {
    const { service, services, expanded } = props
    const [penColor, setPenColor] = useState<number>(0x020202)
    const server = useServiceServer<LedPixelServer>(
        service,
        () => new LedPixelServer()
    )
    const handleColorChange = (newColor: number) => setPenColor(newColor)
    const handleLedClick: (index: number) => void = async (index: number) => {
        const encoded = lightEncode(
            `setone % #
show 20`,
            [index, penColor]
        )
        await service?.sendCmdAsync(LedPixelCmd.Run, encoded)
    }
    return (
        <>
            {server && (
                <LightWidget
                    server={server}
                    widgetCount={services.length}
                    onLedClick={handleLedClick}
                    {...props}
                />
            )}
            <ColorButtons color={penColor} onColorChange={handleColorChange} />
            {expanded && <LightCommand service={service} expanded={expanded} />}
        </>
    )
}
