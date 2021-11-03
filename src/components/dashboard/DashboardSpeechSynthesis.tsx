import React, { useState } from "react"
import {
    SpeechSynthesisCmd,
    SpeechSynthesisReg,
} from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { Grid, TextField } from "@mui/material"
import VoiceChatIcon from "@mui/icons-material/VoiceChat"
import CmdButton from "../CmdButton"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import { useId } from "react-use-id-hook"
import useRegister from "../hooks/useRegister"

export default function DashboardSpeechSynthesis(props: DashboardServiceProps) {
    const { service } = props
    const enabled = useRegister(service, SpeechSynthesisReg.Enabled)
    const [text, setText] = useState("jacdac")
    const textId = useId()

    const handleChange = ev => {
        const newValue = ev.target.value
        setText(newValue)
    }

    const handleSpeak = async () => {
        console.log(`speak ${text}`)
        if (!enabled.boolValue)
            await enabled.sendSetAsync(jdpack<[boolean]>("u8", [true]), true)
        await service.sendCmdAsync(
            SpeechSynthesisCmd.Speak,
            jdpack<[string]>("s", [text])
        )
    }

    return (
        <>
            <Grid item xs={12}>
                <TextField
                    id={textId}
                    spellCheck={false}
                    value={text}
                    label={"speech synthesis"}
                    helperText={"Enter text to speak out"}
                    onChange={handleChange}
                    type={"text"}
                />
                <CmdButton
                    disabled={!text}
                    title="speak text"
                    onClick={handleSpeak}
                    icon={<VoiceChatIcon />}
                />
            </Grid>
        </>
    )
}
