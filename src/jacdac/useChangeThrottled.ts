import { useState, useEffect } from "react"
import { CHANGE } from "../../jacdac-ts/src/jdom/constants"
import { IEventSource } from "../../jacdac-ts/src/jdom/eventsource"
import { useThrottledCallback } from "use-debounce"

const DEFAULT_THROTTLE = 200
export default function useChangeThrottled<TNode extends IEventSource, TValue>(
    node: TNode,
    query?: (n: TNode) => TValue,
    time?: number,
    deps?: React.DependencyList
): TValue {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [version, setVersion] = useState(node?.changeId || 0)
    const value = query ? query(node) : undefined
    const throttledSetVersion = useThrottledCallback(
        setVersion,
        time || DEFAULT_THROTTLE
    )

    useEffect(
        () => node?.subscribe(CHANGE, () => throttledSetVersion(node.changeId)),
        [node, ...(deps || [])]
    )

    return value
}
