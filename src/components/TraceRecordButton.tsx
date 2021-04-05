import { FiberManualRecord } from '@material-ui/icons';
import React, { useContext } from "react";
import PacketsContext from "./PacketsContext";
import IconButtonWithProgress, { IconButtonWithProgressProps } from "./ui/IconButtonWithProgress";

export default function TraceRecordButton(props: { component?: string } & IconButtonWithProgressProps) {
    const { disabled, ...others } = props;
    const { recording, tracing, toggleRecording } = useContext(PacketsContext)
    const title = recording ? "Stop recording" : "Record trace";
    return <IconButtonWithProgress
        {...others}
        aria-label={title}
        title={title}
        indeterminate={recording}
        disabled={disabled || tracing}
        onClick={toggleRecording}
        progressStyle={{ color: "#f66" }}>
        {!recording && <FiberManualRecord />}
        {recording && <FiberManualRecord style={{ color: "#f00" }} />}
    </IconButtonWithProgress>

}