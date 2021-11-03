import { Dialog, DialogContent } from "@mui/material"
import React, { useState } from "react"
import { CirclePicker } from "react-color"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
import IconButtonWithTooltip from "./IconButtonWithTooltip"

export default function ColorInput(props: {
    value: string
    onChange: (color: string) => void
}) {
    const { value, onChange } = props
    const [picker, setPicker] = useState(false)
    const handleClick = () => setPicker(!picker)
    const handleClose = () => setPicker(false)
    const handleChange = (color: { hex: string }) => {
        setPicker(false)
        onChange(color.hex)
    }
    const colorStyle = { background: value }

    return (
        <>
            <IconButtonWithTooltip
                title="choose color"
                style={colorStyle}
                onClick={handleClick}
            >
                <FiberManualRecordIcon />
            </IconButtonWithTooltip>
            <Dialog open={picker} onClose={handleClose}>
                <DialogContent>
                    <CirclePicker
                        color={value}
                        onChangeComplete={handleChange}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}
