import React, { useCallback, useContext, useEffect, useState } from "react"
import { Grid } from "@material-ui/core"
import {
    HidKeyboardAction,
    HidKeyboardCmd,
    HidKeyboardModifiers,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import CmdButton from "../CmdButton"
import ClearIcon from "@material-ui/icons/Clear"
import KeyboardKeyInput from "../ui/KeyboardKeyInput"
import KeyboardIcon from "@material-ui/icons/Keyboard"
import SelectEvent from "../select/SelectEvent"
import useEvents from "../hooks/useEvents"
import useChange from "../../jacdac/useChange"
import { EVENT } from "../../../jacdac-ts/src/jdom/constants"
import JDEvent from "../../../jacdac-ts/src/jdom/event"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"

export default function DashboardHIDKeyboard(props: DashboardServiceProps) {
    const { service } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [selector, setSelector] = useState(0)
    const [modifiers, setModifiers] = useState(HidKeyboardModifiers.None)
    const [triggerEventId, setTriggerEventId] = useState<string>("")
    const events = useEvents({ ignoreChange: true })

    const handleKeyChange = (
        newSelector: number,
        newModifiers: HidKeyboardModifiers
    ) => {
        setSelector(newSelector)
        setModifiers(newModifiers)
    }

    const handleClick = useCallback(async () => {
        const unpacked: [[number, HidKeyboardModifiers, HidKeyboardAction][]] =
            [[[selector, modifiers, HidKeyboardAction.Press]]]
        const data = jdpack("r: u16 u8 u8", unpacked)
        await service.sendCmdAsync(HidKeyboardCmd.Key, data)
    }, [selector, modifiers, service])

    useChange(
        bus,
        () => {
            const triggerEvent = bus.node(triggerEventId) as JDEvent
            console.log({ triggerEventId, triggerEvent, selector, modifiers })
            const un = triggerEvent?.subscribe(EVENT, handleClick)
            return () => un?.()
        },
        [triggerEventId, handleClick]
    )

    const disabled = !selector && !modifiers
    const handleTriggerChange = (eventId: string) => setTriggerEventId(eventId)

    return (
        <Grid container direction="column" spacing={1}>
            <Grid item xs={12}>
                <KeyboardKeyInput
                    selector={selector}
                    modifiers={modifiers}
                    onChange={handleKeyChange}
                />
            </Grid>
            <Grid item xs={12}>
                <Grid container spacing={1}>
                    <Grid item>
                        <CmdButton
                            variant="outlined"
                            title="send keys"
                            disabled={disabled}
                            onClick={handleClick}
                            icon={<KeyboardIcon />}
                        >
                            Send keys
                        </CmdButton>
                    </Grid>
                    <Grid item>
                        <SelectEvent
                            events={events}
                            eventId={triggerEventId}
                            onChange={handleTriggerChange}
                            label={"Choose Send Key event"}
                            friendlyName={true}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
