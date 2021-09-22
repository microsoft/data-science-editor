import { useState, useEffect } from "react"
import JDEventSource from "../../jacdac-ts/src/jdom/eventsource"

export default function useEventRaised<
    TEventSource extends JDEventSource,
    TValue
>(
    eventName: string | string[],
    node: TEventSource,
    query?: (n: TEventSource) => TValue
): TValue {
    const [value, setValue] = useState(query?.(node))
    useEffect(
        () => node?.subscribe(eventName, () => setValue(query?.(node))),
        [JSON.stringify(eventName), node]
    )
    return value
}
