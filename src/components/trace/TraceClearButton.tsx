// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ClearIcon from "@mui/icons-material/Clear"
import React, { useContext } from "react"
import PacketsContext from "../PacketsContext"
import { IconButtonWithProgressProps } from "../ui/IconButtonWithProgress"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"

export default function TraceClearButton(props: IconButtonWithProgressProps) {
    const { replayTrace, setReplayTrace } = useContext(PacketsContext)
    const clearTrace = () => setReplayTrace(undefined)
    return (
        <IconButtonWithTooltip
            title="Clear Trace"
            onClick={clearTrace}
            disabled={!replayTrace}
            {...props}
        >
            <ClearIcon />
        </IconButtonWithTooltip>
    )
}
