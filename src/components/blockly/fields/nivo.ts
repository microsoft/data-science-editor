import { tidy, select, rename, mutate } from "@tidyjs/tidy"
import { toMap } from "../../../../jacdac-ts/src/jdom/utils"

export function tidyToNivo(
    // eslint-disable-next-line @typescript-eslint/ban-types
    data: object[],
    columns: string[],
    toColumns: string[]
): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    series: any
    labels: string[]
} {
    const headers = Object.keys(data?.[0] || {})
    let k = 0
    const renaming = toMap(
        columns,
        (c, i) => columns[i] || headers?.[k++],
        (c, i) => toColumns[i]
    )
    const labels = Object.keys(renaming)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // todo handle time
    let index = 0
    const tidied: { x: number; y: number }[] = data
        ? (tidy(
              data,
              mutate({ index: () => index++ }),
              select(labels),
              rename(renaming)
          ) as any)
        : []
    const series: { id: string; data: { x: number; y: number }[] }[] = [
        {
            id: "data",
            data: tidied,
        },
    ]
    return { series, labels }
}
