import React, { useState, useEffect } from "react"
import { JDEvent } from "../../jacdac-ts/src/jdom/event"
import { CHANGE } from "../../jacdac-ts/src/jdom/constants"

export default function useEventCount(event: JDEvent) {
    const [count, setCount] = useState(event.count)
    useEffect(() => event.subscribe(CHANGE, () => {
        setCount(event.count)
    }), [event])

    return count;
}