import { DependencyList, useEffect, useState } from "react"
import { EVENT } from "../../../jacdac-ts/src/jdom/constants"
import { JDEvent } from "../../../jacdac-ts/src/jdom/event"
import { PackedValues } from "../../../jacdac-ts/src/jdom/pack"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useChange from "../../jacdac/useChange"
import useMounted from "./useMounted"

export default function useCommandPipeResults<TItem extends PackedValues>(
    service: JDService,
    cmd: number,
    packFormat: string,
    changeEvent?: JDEvent,
    deps?: DependencyList
) {
    const [results, setResults] = useState<PackedValues[]>([])
    const mounted = useMounted()

    const update = async () => {
        const newResults = await service.receiveWithInPipe(cmd, packFormat)
        if (mounted()) setResults(newResults || [])
    }

    // listen to change event if any
    useEffect(() => changeEvent?.subscribe(EVENT, update), [changeEvent])
    useChange(service, update, [cmd, packFormat, ...(deps || [])])

    return results as TItem[]
}
