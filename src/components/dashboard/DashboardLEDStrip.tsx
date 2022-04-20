import {
    Grid,
    MenuItem,
    SelectChangeEvent,
    TextField,
    Typography,
} from "@mui/material"
import React, {
    ChangeEvent,
    lazy,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { lightEncode } from "../../../jacdac-ts/src/jdom/light"
import SelectWithLabel from "../ui/SelectWithLabel"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import RemoveIcon from "@mui/icons-material/Remove"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import AddIcon from "@mui/icons-material/Add"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import useServiceServer from "../hooks/useServiceServer"
import { LedStripServer } from "../../../jacdac-ts/src/servers/ledstripserver"
import LightWidget from "../widgets/LightWidget"
import {
    LedStripCmd,
    LedStripReg,
    LedStripVariant,
    REFRESH,
    RENDER,
} from "../../../jacdac-ts/src/jdom/constants"
import ColorButtons, { DEFAULT_COLORS } from "../widgets/ColorButtons"
import Suspense from "../ui/Suspense"
import RotateLeftIcon from "@mui/icons-material/RotateLeft"
import RotateRightIcon from "@mui/icons-material/RotateRight"
import bus from "../../jacdac/providerbus"
import useRegister from "../hooks/useRegister"
import SettingsIcon from "@mui/icons-material/Settings"
import RegisterInput from "../RegisterInput"
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
            await service.sendCmdAsync(LedStripCmd.Run, encoded)
        } finally {
            setSending(false)
        }
    }
    const handleCommandChange = (ev: SelectChangeEvent<string>) => {
        const newName = ev.target.value
        setCommand(lightCommands.find(cmd => cmd.name === newName))
    }
    const handleOffsetChange = (ev: ChangeEvent<{ value: string }>) => {
        setOffset(ev.target.value)
    }
    const handleModeChange = (ev: SelectChangeEvent<string>) => {
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

const MAX_ROT = 6

function EffectButtons(props: {
    setEffect: (value: string) => void
    configure: boolean
    toggleConfigure: () => void
    addGradientColor: () => void
}) {
    const { setEffect, configure, toggleConfigure, addGradientColor } = props
    const [rot, setRot] = useState(0)

    const handleRotChanged = () =>
        setRot(value => (value < 0 ? 2 : value >= MAX_ROT ? 0 : value + 1))
    const handleCounterRotChanged = () =>
        setRot(value => (value > 0 ? -2 : value <= -MAX_ROT ? 0 : value - 1))

    useEffect(() => {
        const effect: string[] = []
        if (rot)
            effect.push(`${rot > 0 ? "rotfwd" : "rotback"} ${Math.abs(rot)}`)
        setEffect(effect.join("\n"))
    }, [rot])

    return (
        <Grid container spacing={1}>
            <Grid item>
                <IconButtonWithTooltip
                    selected={rot < 0}
                    title={
                        rot < 0
                            ? `rotate counter clockwise, ${rot} per frame`
                            : `rotate counter clockwise`
                    }
                    onClick={handleCounterRotChanged}
                >
                    <RotateLeftIcon />
                </IconButtonWithTooltip>
            </Grid>
            <Grid item>
                <IconButtonWithTooltip
                    selected={rot > 0}
                    title={
                        rot > 0
                            ? `rotate clockwise, ${rot} per frame`
                            : `rotate clockwise`
                    }
                    onClick={handleRotChanged}
                >
                    <RotateRightIcon />
                </IconButtonWithTooltip>
            </Grid>
            <Grid item>
                <IconButtonWithTooltip
                    title={"Add gradient color"}
                    onClick={addGradientColor}
                >
                    <AddIcon />
                </IconButtonWithTooltip>
            </Grid>
            <Grid item>
                <IconButtonWithTooltip
                    title={
                        configure ? "Hide configuration" : "Show configuration"
                    }
                    onClick={toggleConfigure}
                >
                    <SettingsIcon />
                </IconButtonWithTooltip>
            </Grid>
        </Grid>
    )
}

const configureRegisters = [
    LedStripReg.Brightness,
    LedStripReg.ActualBrightness,
    LedStripReg.NumPixels,
    LedStripReg.MaxPixels,
    LedStripReg.LightType,
    LedStripReg.MaxPower,
]

function RegisterInputItem(props: {
    service: JDService
    registerCode: number
    visible: boolean
}) {
    const { service, registerCode, visible } = props
    const register = useRegister(service, registerCode)
    return (
        <RegisterInput
            register={register}
            visible={visible}
            showRegisterName={true}
        />
    )
}

export default function DashboardLEDStrip(props: DashboardServiceProps) {
    const { service, services, expanded, visible } = props
    const [configure, setConfigure] = useState(false)
    const animationCounter = useRef(0)
    const [penColor, setPenColor] = useState<number>(undefined)
    const [gradientColors, setGradientColors] = useState<number[]>([])
    const [effect, setEffect] = useState("")
    const server = useServiceServer<LedStripServer>(
        service,
        () => new LedStripServer({ variant: LedStripVariant.Strip })
    )
    const handleColorChange = (newColor: number) =>
        setPenColor(current => (newColor === current ? undefined : newColor))
    const handleGradientColorChange = (index: number) => (newColor: number) =>
        setGradientColors(current =>
            newColor === current[index]
                ? [...current.slice(0, index), ...current.slice(index + 1)]
                : [
                      ...current.slice(0, index),
                      newColor,
                      ...current.slice(index + 1),
                  ]
        )
    const handleLedClick: (index: number) => void = async (index: number) => {
        if (isNaN(penColor)) return

        const encoded = lightEncode(
            `setone % #
show 20`,
            [index, penColor]
        )
        await service?.sendCmdAsync(LedStripCmd.Run, encoded)
    }
    const toggleConfigure = () => setConfigure(c => !c)
    const handleAddGradientColor = () =>
        setGradientColors(current => [...current, DEFAULT_COLORS[0].value])

    // rotation animation
    const animationSkip = 1
    useEffect(
        () =>
            effect
                ? bus.subscribe(REFRESH, () => {
                      const a = (animationCounter.current =
                          animationCounter.current + 1)
                      if (a % animationSkip === 0) {
                          const command: string[] = []
                          const args: number[] = []
                          if (!isNaN(penColor) && !gradientColors.length) {
                              command.push(`setone 0 #`)
                              args.push(penColor)
                          }
                          command.push(effect)
                          command.push(`show 0`)
                          const encoded = lightEncode(command.join("\n"), args)
                          service?.sendCmdAsync(LedStripCmd.Run, encoded)
                      }
                  })
                : undefined,
        [service, effect, penColor]
    )

    // set gradient
    useEffect(() => {
        if (gradientColors.length) {
            const command = [
                `fade ${Array(gradientColors.length + 1)
                    .fill(0)
                    .map(() => "#")
                    .join(" ")}`,
                `show 0`,
            ]
            const args = [penColor, ...gradientColors].map(c => c || 0)
            const encoded = lightEncode(command.join("\n"), args)
            console.log({ command, args })
            service?.sendCmdAsync(LedStripCmd.Run, encoded)
        }
    }, [service, penColor, gradientColors])
    const colors = useCallback(() => server?.colors, [server])
    const registers = useMemo(
        () => ({
            numPixels: LedStripReg.NumPixels,
            variant: LedStripReg.Variant,
            actualBrightness: LedStripReg.ActualBrightness,
            numColumns: LedStripReg.NumColumns,
        }),
        []
    )
    const subscribeColors = useCallback(
        handler => server?.subscribe(RENDER, handler),
        [server]
    )
    return (
        <>
            {server && (
                <LightWidget
                    colors={colors}
                    subscribeColors={subscribeColors}
                    registers={registers}
                    widgetCount={services?.length}
                    onLedClick={handleLedClick}
                    {...props}
                />
            )}
            <Grid container direction="column" spacing={1}>
                <Grid item>
                    <EffectButtons
                        setEffect={setEffect}
                        configure={configure}
                        toggleConfigure={toggleConfigure}
                        addGradientColor={handleAddGradientColor}
                    />
                </Grid>
                <Grid item>
                    <ColorButtons
                        color={penColor}
                        onColorChange={handleColorChange}
                    />
                </Grid>
                {gradientColors.map((gradientColor, index) => (
                    <Grid item key={`gradient${index}`}>
                        <ColorButtons
                            color={gradientColor}
                            onColorChange={handleGradientColorChange(index)}
                        />
                    </Grid>
                ))}
                {expanded && (
                    <Grid item>
                        <LightCommand service={service} expanded={expanded} />
                    </Grid>
                )}
                {configure &&
                    configureRegisters.map(code => (
                        <Grid item key={code}>
                            <RegisterInputItem
                                service={service}
                                registerCode={code}
                                visible={visible}
                            />
                        </Grid>
                    ))}
            </Grid>
        </>
    )
}
