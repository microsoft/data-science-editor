import React, { useContext } from "react"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import SaveIcon from "@material-ui/icons/Save"
import ServiceManagerContext from "../ServiceManagerContext"
import PacketsContext from "../PacketsContext"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"

export default function TraceSaveButton() {
    const { replayTrace, view, recording, tracing } = useContext(PacketsContext)
    const { fileStorage } = useContext(ServiceManagerContext)
    const saveTrace = () => {
        const savedTrace = replayTrace || view.trace
        const text = savedTrace.serializeToText()
        fileStorage.saveText("trace.jd.txt", text)
    }
    return (
        <IconButtonWithTooltip
            title="save trace"
            disabled={recording || tracing}
            size="small"
            key="save"
            onClick={saveTrace}
        >
            <SaveIcon />
        </IconButtonWithTooltip>
    )
}
