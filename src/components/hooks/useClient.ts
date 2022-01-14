import { DependencyList, useEffect, useMemo } from "react"
import { JDClient } from "../../../jacdac-ts/src/jdom/client"

export default function useClient<TClient extends JDClient>(
    factory: () => TClient,
    deps?: DependencyList
) {
    const client = useMemo(factory, deps || [])
    useEffect(() => () => client?.unmount(), [client])
    return client
}
