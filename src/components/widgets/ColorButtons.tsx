import { Grid, IconButton } from "@material-ui/core"
import React from "react"
import { rgbToHtmlColor } from "../../../jacdac-ts/src/jdom/utils"
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked"
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked"

export default function ColorButtons(props: {
    colors?: number[]
    color: number
    onColorChange?: (newLedColor: number) => void
}) {
    const DEFAULT_COLORS = [
        0xff0000, 0xff00ff, 0x0000ff, 0x00ff00, 0xffff00, 0x020202,
    ]
    const { colors = DEFAULT_COLORS, color, onColorChange } = props
    const handleSetColor = (col: number) => () => onColorChange(col)
    return (
        <Grid container spacing={1}>
            {colors.map(col => (
                <Grid key={col} item xs={colors.length === 2 ? 4 : 2}>
                    <IconButton
                        style={{ color: rgbToHtmlColor(col) }}
                        onClick={handleSetColor(col)}
                    >
                        {col !== color ? (
                            <RadioButtonUncheckedIcon />
                        ) : (
                            <RadioButtonCheckedIcon />
                        )}
                    </IconButton>
                </Grid>
            ))}
        </Grid>
    )
}
