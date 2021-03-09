import React, { ChangeEvent, useState } from "react"
import useLedAnimationStyle from "../hooks/useLedAnimationStyle"
import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    useTheme,
} from "@material-ui/core"
import SvgWidget from "../widgets/SvgWidget"
import Helmet from "react-helmet"
import Snippet from "../ui/Snippet"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import AddIcon from "@material-ui/icons/Add"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeleteIcon from "@material-ui/icons/Delete"
import { SliderPicker } from "react-color"
import {
    LedAnimationData,
    LedAnimationFrame,
} from "../../../jacdac-ts/src/hosts/ledservicehost"
import { clone } from "../../../jacdac-ts/src/jdom/utils"
import { useId } from "react-use-id-hook"

function LedAnimationFrameDesigner(props: {
    frame: LedAnimationFrame
    setFrame: (frame: LedAnimationFrame) => void
    onRemove: () => void
    onClone: () => void
}) {
    const { frame, setFrame, onRemove, onClone } = props
    const [hsv, setHsv] = useState({
        h: (frame[0] * 360) / 0xff,
        s: frame[1] / 0xff,
        v: frame[2] / 0xff,
    })
    const durationId = useId()
    const handleValue = (i: number) => (ev: ChangeEvent<HTMLInputElement>) => {
        const v = parseInt(ev.target.value)
        if (!isNaN(v)) {
            const newFrame = frame.slice(0)
            newFrame[i] = v >> 3 // 8ms units
            setFrame(newFrame as LedAnimationFrame)
        }
    }
    const handleColorChangeComplete = (c: {
        hsv: { h: number; s: number; v: number }
    }) => {
        const newFrame = frame.slice(0) as LedAnimationFrame
        const { hsv } = c
        const { h, s, v } = hsv
        newFrame[0] = ((h / 360) * 0xff) & 0xff
        newFrame[1] = (s * 0xff) & 0xff
        newFrame[2] = (v * 0xff) & 0xff
        setFrame(newFrame)
        setHsv(hsv)
    }

    return (
        <Card>
            <CardHeader
                action={
                    <>
                        <IconButtonWithTooltip
                            title="remove animation frame"
                            disabled={!onRemove}
                            onClick={onRemove}
                        >
                            <DeleteIcon />
                        </IconButtonWithTooltip>
                        <IconButtonWithTooltip
                            title="clone animation frame"
                            disabled={!onClone}
                            onClick={onClone}
                        >
                            <AddIcon />
                        </IconButtonWithTooltip>
                    </>
                }
            />
            <CardContent>
                <Grid container direction="column" spacing={1}>
                    <Grid item>
                        <SliderPicker
                            triangle="hide"
                            color={hsv}
                            onChangeComplete={handleColorChangeComplete}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            id={durationId}
                            label="duration"
                            helperText="ms"
                            inputProps={{
                                type: "number",
                                min: 0,
                            }}
                            value={frame[3] << 3}
                            onChange={handleValue(3)}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default function LedAnimationDesigner() {
    const [repetitions, setRepetitions] = useState(0)
    const [frames, setFrames] = useState<LedAnimationFrame[]>([
        [0, 255, 0, 128],
        [0, 255, 100, 128],
    ])
    const animation: LedAnimationData = [repetitions, frames]
    const { className, helmetStyle } = useLedAnimationStyle(animation, {
        cssProperty: "fill",
    })
    const theme = useTheme()
    const handleFrame = (i: number) => (frame: LedAnimationFrame) => {
        const newFrames = frames.slice(0)
        newFrames[i] = frame
        setFrames(newFrames)
    }
    const handleRemove = (i: number) => () => {
        const newFrames = frames.slice(0)
        newFrames.splice(i, 1)
        setFrames(newFrames)
    }
    const handleClone = (i: number) => () => {
        const frame = frames[i]
        const newFrame = clone(frame)
        const newFrames = [...frames.slice(0, i), newFrame, ...frames.slice(i)]
        setFrames(newFrames)
    }
    const handleAdd = () =>
        setFrames([
            ...frames,
            frames[frames.length - 1].slice(0) as LedAnimationFrame,
        ])
    const handleRepetitionChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const v = parseInt(event.target.value)
        if (!isNaN(v)) setRepetitions(v)
    }
    return (
        <Grid container spacing={1}>
            <Grid item>
                {helmetStyle && (
                    <Helmet>
                        <style>{helmetStyle}</style>
                    </Helmet>
                )}
                <Card>
                    <CardHeader title="preview" />
                    <CardContent>
                        <SvgWidget size={"14vh"} width={64} height={64}>
                            <circle
                                cx={32}
                                cy={32}
                                r={30}
                                className={className}
                                stroke={theme.palette.background.default}
                                strokeWidth={1}
                            />
                        </SvgWidget>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item>
                <Card>
                    <CardHeader title="repetition" />
                    <CardContent>
                        <TextField
                            aria-label="number of repetitions"
                            value={repetitions}
                            type="number"
                            onChange={handleRepetitionChange}
                        />
                    </CardContent>
                </Card>
            </Grid>
            {frames.map((frame, i) => (
                <Grid item xs={12} sm={6} lg={4} key={i}>
                    <LedAnimationFrameDesigner
                        key={i}
                        frame={frame}
                        setFrame={handleFrame(i)}
                        onClone={handleClone(i)}
                        onRemove={
                            frames.length > 1 ? handleRemove(i) : undefined
                        }
                    />
                </Grid>
            ))}
            <Grid item>
                <Card>
                    <CardContent>
                        <IconButtonWithTooltip
                            title="add animation frame"
                            onClick={handleAdd}
                        >
                            <AddIcon />
                        </IconButtonWithTooltip>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title="code" />
                    <CardContent>
                        <Snippet
                            value={() => JSON.stringify(animation, null, 2)}
                            mode={"json"}
                        />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}
