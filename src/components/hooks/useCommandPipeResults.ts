import { DependencyList, useState } from "react"
import { PackedValues } from "../../../jacdac-ts/src/jdom/pack"
import JDService from "../../../jacdac-ts/src/jdom/service"
import useChange from "../../jacdac/useChange"
import useMounted from "./useMounted"

export default function useCommandPipeResults<TItem extends PackedValues>(
    service: JDService,
    cmd: number,
    packFormat: string,
    deps?: DependencyList
) {
    const [results, setResults] = useState<PackedValues[]>([])
    const mounted = useMounted()

    useChange(
        service,
        async _ => {
            const newResults = await _?.receiveWithInPipe(cmd, packFormat)
            if (mounted()) setResults(newResults || [])
        },
        [cmd, packFormat, ...(deps || [])]
    )

    return results as TItem[]
}
