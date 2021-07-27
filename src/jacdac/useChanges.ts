import { useState, useEffect } from "react"
import { CHANGE } from "../../jacdac-ts/src/jdom/constants"
import {
    dependencyChangeId,
    IEventSource,
} from "../../jacdac-ts/src/jdom/eventsource"

export default function useChanges<TNode extends IEventSource, TValue>(
    nodes: TNode[],
    query?: (n: TNode[]) => TValue,
    deps?: React.DependencyList
): TValue {
    const [, setVersion] = useState(dependencyChangeId(nodes))
    const value = query ? query(nodes) : undefined

    useEffect(() => {
        const unsubs = nodes?.map(node =>
            node.subscribe(CHANGE, () => setVersion(dependencyChangeId(nodes)))
        )
        return () => unsubs?.forEach(unsub => unsub())
    }, [nodes, ...(deps || [])])

    return value
}
