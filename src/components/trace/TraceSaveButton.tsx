import React, { useContext } from "react"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import SaveIcon from "@material-ui/icons/Save"
import ServiceManagerContext from "../ServiceManagerContext"
import PacketsContext from "../PacketsContext"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"

export default function TraceSaveButton(props: { disabled?: boolean }) {
    const { disabled } = props
    const { replayTrace, recording } = useContext(PacketsContext)
    const { fileStorage } = useContext(ServiceManagerContext)
    const saveTrace = () => {
        fileStorage.saveText("trace.jd.txt", replayTrace.serializeToText())
    }
    return (
        <IconButtonWithTooltip
            title="save trace"
            disabled={disabled || recording || !replayTrace?.packets.length}
            size="small"
            key="save"
            onClick={saveTrace}
        >
            <SaveIcon />
        </IconButtonWithTooltip>
    )
}
