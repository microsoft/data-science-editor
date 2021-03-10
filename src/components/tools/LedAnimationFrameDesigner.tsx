import React, { ChangeEvent, useState } from "react"
import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    TextField,
} from "@material-ui/core"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import AddIcon from "@material-ui/icons/Add"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeleteIcon from "@material-ui/icons/Delete"
import { SliderPicker } from "react-color"
import {
    LedAnimationFrame,
} from "../../../jacdac-ts/src/hosts/ledservicehost"
import { useId } from "react-use-id-hook"

export default function LedAnimationFrameDesigner(props: {
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
