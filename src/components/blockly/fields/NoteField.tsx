import React, { lazy, ReactNode } from "react"
import { createToneContext, ToneContext } from "../../ui/WebAudioContext"
import Suspense from "../../ui/Suspense"
import ReactField, { ReactFieldJSON, toShadowDefinition } from "./ReactField"
const PianoWidget = lazy(() => import("../../widgets/PianoWidget"))

export default class NoteField extends ReactField<number> {
    static KEY = "jacdac_field_note"
    static SHADOW = toShadowDefinition(NoteField)
    toneContext: ToneContext

    static fromJson(options: ReactFieldJSON) {
        return new NoteField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options?.value, undefined, options)
    }

    get defaultValue() {
        return 440
    }

    getText_() {
        return (this.value | 0) + ""
    }

    renderField(): ReactNode {
        const handlePlayTone = async (newFrequency: number) => {
            this.value = newFrequency
            if (!this.toneContext) this.toneContext = createToneContext()
            this.toneContext?.playTone(newFrequency, 400, 0.5)
        }
        return (
            <Suspense>
                <PianoWidget playTone={handlePlayTone} />
            </Suspense>
        )
    }
}
