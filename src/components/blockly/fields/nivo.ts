/* eslint-disable @typescript-eslint/ban-types */
import {
    tidy,
    select,
    rename,
    mutate,
    sliceHead,
    sliceTail,
    sliceMin,
    sliceMax,
    sliceSample,
} from "@tidyjs/tidy"
import { toMap, unique } from "../../../../jacdac-ts/src/jdom/utils"
import { tidyHeaders } from "./tidy"

export function tidyToNivo(
    // eslint-disable-next-line @typescript-eslint/ban-types
    data: object[],
    columns: string[],
    toColumns: string[],
    options: {
        sliceHead?: number
        sliceTail?: number
        sliceMax?: number
        sliceMin?: number
        sliceSample?: number
        sliceColumn?: string
    } = {}
): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    series: { id: string; data: object[] }[]
    labels: string[]
} {
    // avoid duplicates in column
    columns = unique(columns)

    // missing data
    if (columns.some(c => !c)) return { series: undefined, labels: undefined }

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
              options.sliceSample
                  ? sliceSample(options.sliceSample)
                  : undefined,
              options.sliceHead ? sliceHead(options.sliceHead) : undefined,
              options.sliceTail ? sliceTail(options.sliceTail) : undefined,
              options.sliceMin
                  ? sliceMin(options.sliceMin, options.sliceColumn)
                  : undefined,
              options.sliceMax
                  ? sliceMax(options.sliceMax, options.sliceColumn)
                  : undefined,
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
