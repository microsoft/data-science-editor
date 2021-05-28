import React, { lazy, ReactNode } from "react"
import { createToneContext, ToneContext } from "../../hooks/toneContext"
import Suspense from "../../ui/Suspense"
import { ReactField, ReactFieldJSON, toShadowDefinition } from "./ReactField"
const PianoWidget = lazy(() => import("../../widgets/PianoWidget"))

export interface FrequencyFeld {
    frequency: number
}

export default class NoteField extends ReactField<FrequencyFeld> {
    static KEY = "jacdac_field_note"
    static SHADOW = toShadowDefinition(NoteField)
    toneContext: ToneContext

    static fromJson(options: ReactFieldJSON) {
        return new NoteField(options?.value, undefined, options)
    }

    get defaultValue() {
        return { frequency: 440 }
    }

    getText_() {
        const { frequency } = this.value
        return (frequency | 0) + ""
    }

    onUnmount() {
        this.toneContext?.close()
        this.toneContext = undefined
    }

    renderField(): ReactNode {
        const handlePlayTone = async (newFrequency: number) => {
            this.value = { frequency: newFrequency }
            if (!this.toneContext) this.toneContext = createToneContext()
            this.toneContext?.playTone(newFrequency, 400)
        }
        return (
            <Suspense>
                <PianoWidget playTone={handlePlayTone} />
            </Suspense>
        )
    }
}
