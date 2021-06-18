/* eslint-disable @typescript-eslint/ban-types */
import { tidy, select, rename, mutate } from "@tidyjs/tidy"
import { toMap, unique } from "../../../../jacdac-ts/src/jdom/utils"

export function tidyHeaders(data: object[]) {
    const row = data?.[0] || {}
    const headers = Object.keys(row)
    const types = headers.map(header => typeof row[header])
    return { headers, types }
}

export function tidyFindLastValue(data: object[], column: string) {
    if (!data?.length) return undefined
    return data[data.length - 1][column]
}

export function tidyToNivo(
    // eslint-disable-next-line @typescript-eslint/ban-types
    data: object[],
    columns: string[],
    toColumns: string[]
): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    series: { id: string; data: object[] }[]
    labels: string[]
} {
    // avoid duplicates in column
    columns = unique(columns)
    const { headers } = tidyHeaders(data)
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
    const tidied: object[] = data
        ? (tidy(
              data,
              mutate({ index: () => index++ }),
              select(labels),
              rename(renaming)
          ) as object[])
        : []
    const series: { id: string; data: object[] }[] = [
        {
            id: "data",
            data: tidied,
        },
    ]
    return { series, labels }
}
