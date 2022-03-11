import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import React from "react"
import CmdButton from "../CmdButton"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import RefreshIcon from "@mui/icons-material/Refresh"

export default function DeviceResetButton(props: { device: JDDevice }) {
    const { device } = props
    const handleReset = async () => await device.reset()
    return (
        <CmdButton
            disabled={!device}
            trackName="device.reset"
            size="small"
            title="reset"
            onClick={handleReset}
            icon={<RefreshIcon />}
        />
    )
}
