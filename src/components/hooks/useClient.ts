import { useEffect, useMemo } from "react"
import JDClient from "../../../jacdac-ts/src/jdom/client"

export default function useClient<TClient extends JDClient>(
    factory: () => TClient
) {
    const client = useMemo(factory, [])
    useEffect(() => () => client?.unmount(), [])
    return client
}
