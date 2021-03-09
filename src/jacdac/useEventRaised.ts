import { useState, useEffect } from "react";
import { JDEventSource } from "../../jacdac-ts/src/jdom/eventsource";

export default function useEventRaised<TEventSource extends JDEventSource, TValue>(eventName: string | string[], node: TEventSource, query?: (n: TEventSource) => TValue): TValue {
    const [version, setVersion] = useState(0)
    const value = query ? query(node) : undefined

    useEffect(() => node?.subscribe(eventName, () => {
        setVersion(version + 1)
    }), [node, version])

    return value;
}
