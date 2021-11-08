import { Grid } from "@mui/material"
import React from "react"
import { rgbToHtmlColor } from "../../../jacdac-ts/src/jdom/utils"
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"

export default function ColorButtons(props: {
    colors?: { name: string; value: number }[]
    color: number
    onColorChange?: (newLedColor: number) => void
}) {
    const DEFAULT_COLORS = [
        {
            name: "red",
            value: 0xff0000,
        },
        {
            name: "violet",
            value: 0xff00ff,
        },
        { name: "blue", value: 0x0000ff },
        { name: "green", value: 0x00ff00 },
        { name: "yellow", value: 0xffff00 },
        { name: "black", value: 0x010101 },
    ]
    const { colors = DEFAULT_COLORS, color, onColorChange } = props
    const handleSetColor = (col: number) => () => onColorChange(col)
    return (
        <Grid container spacing={1}>
            {colors.map(({ name, value }) => (
                <Grid key={name} item xs={colors.length === 2 ? 4 : 2}>
                    <IconButtonWithTooltip
                        style={{ color: rgbToHtmlColor(value) }}
                        onClick={handleSetColor(value)}
                        size="large"
                        title={name}
                    >
                        {value !== color ? (
                            <RadioButtonUncheckedIcon />
                        ) : (
                            <RadioButtonCheckedIcon />
                        )}
                    </IconButtonWithTooltip>
                </Grid>
            ))}
        </Grid>
    )
}
