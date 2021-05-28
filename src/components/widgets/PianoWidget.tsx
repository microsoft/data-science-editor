import { Box } from "@material-ui/core"
import React, { useMemo } from "react"
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano"
import "react-piano/dist/styles.css"

export default function PianoWidget(props: {
    playTone: (frequency: number) => Promise<void>
}) {
    const { playTone } = props
    const firstNote = MidiNumbers.fromNote("c4")
    const lastNote = MidiNumbers.fromNote("f5")
    const keyboardShortcuts = KeyboardShortcuts.create({
        firstNote: firstNote,
        lastNote: lastNote,
        keyboardConfig: KeyboardShortcuts.HOME_ROW,
    })
    const midiFrequencies = useMemo(
        () =>
            new Array(127)
                .fill(0)
                .map((_, x) => (440 / 32) * Math.pow(2, (x - 9) / 12)),
        []
    )

    return (
        <Box mb={1} mt={1}>
            <Piano
                noteRange={{ first: firstNote, last: lastNote }}
                playNote={midiNumber => {
                    const frequency = midiFrequencies[midiNumber]
                    playTone(frequency)
                }}
                stopNote={() => {
                    // not supported
                }}
                keyboardShortcuts={keyboardShortcuts}
            />
        </Box>
    )
}
