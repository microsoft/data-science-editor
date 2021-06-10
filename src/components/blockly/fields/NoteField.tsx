import React, { lazy, ReactNode } from "react"
import { createToneContext, ToneContext } from "../../hooks/toneContext"
import Suspense from "../../ui/Suspense"
import ReactField, {
    ReactFieldJSON,
    toShadowDefinition,
    UNMOUNT,
} from "./ReactField"
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
        this.events.on(UNMOUNT, () => {
            this.toneContext?.close()
            this.toneContext = undefined
        })
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
            this.toneContext?.playTone(newFrequency, 400)
        }
        return (
            <Suspense>
                <PianoWidget playTone={handlePlayTone} />
            </Suspense>
        )
    }
}
