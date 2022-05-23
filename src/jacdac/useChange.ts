import { useState, useEffect } from "react"
import { CHANGE } from "../../jacdac-ts/src/jdom/constants"
import { IEventSource } from "../../jacdac-ts/src/jdom/eventsource"
import useEffectAsync from "../components/useEffectAsync"
import useEventRaised from "./useEventRaised"

export default function useChange<TNode extends IEventSource, TValue>(
    node: TNode,
    query?: (n: TNode) => TValue,
    deps?: React.DependencyList,
    isEqual?: (a: TValue, b: TValue) => boolean
): TValue {
    return useEventRaised(CHANGE, node, query, deps, isEqual)
}

export function useChangeAsync<TNode extends IEventSource, TValue>(
    node: TNode,
    query?: (n: TNode) => Promise<TValue>,
    deps?: React.DependencyList
): TValue {
    const [version, setVersion] = useState(node?.changeId || 0)
    const [value, setValue] = useState(undefined)

    useEffect(() => {
        setVersion(node?.changeId || 0)
        node?.subscribe(CHANGE, () => {
            setVersion(node.changeId)
        })
    }, [node])

    useEffectAsync(
        async mounted => {
            const valuePromise = query ? query(node) : undefined
            if (!valuePromise) {
                if (mounted()) setValue(undefined)
            } else {
                const d = await valuePromise
                if (mounted()) setValue(d)
            }
        },
        [node, version, ...(deps || [])]
    )

    return value
}
