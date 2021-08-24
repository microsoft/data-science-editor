import React, { useContext } from "react"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import SaveIcon from "@material-ui/icons/Save"
import ServiceManagerContext from "../ServiceManagerContext"
import PacketsContext from "../PacketsContext"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"

export default function TraceSaveButton() {
    const { replayTrace, trace, recording, tracing } =
        useContext(PacketsContext)
    const { fileStorage } = useContext(ServiceManagerContext)
    const savedTrace = replayTrace || trace
    const saveTrace = () => {
        const text = savedTrace.serializeToText()
        fileStorage.saveText("trace.jd.txt", text)
    }
    return (
        <IconButtonWithTooltip
            title="save trace"
            disabled={recording || tracing || !savedTrace?.packets.length}
            size="small"
            key="save"
            onClick={saveTrace}
        >
            <SaveIcon />
        </IconButtonWithTooltip>
    )
}
