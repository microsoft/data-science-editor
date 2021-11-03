import React, { useContext, useEffect, useState } from "react"
import {
    JSONTryParse,
    readBlobToText,
    readBlobToUint8Array,
} from "../../jacdac-ts/src/jdom/utils"
import DbContext, { DB_VALUE_CHANGE } from "./DbContext"
import useEffectAsync from "./useEffectAsync"

export function useDbBlob(id: string) {
    const { db } = useContext(DbContext)
    const [_value, _setValue] = useState<Blob>(undefined)
    const values = db?.blobs

    // listen to change
    useEffect(() => {
        let _mounted = true
        return values?.subscribe(DB_VALUE_CHANGE, async changed => {
            if (changed === id) {
                try {
                    const v = await values.get(id)
                    if (_mounted) {
                        _setValue(v)
                    }
                } catch (e) {
                    console.log(e)
                    await values?.set(id, undefined)
                }
            }
            return () => {
                _mounted = false
            }
        })
    }, [values])

    // load intial value
    useEffectAsync(
        async mounted => {
            try {
                const v = await values?.get(id)
                if (mounted()) _setValue(v)
            } catch (e) {
                console.log(e)
                // trash data
                await values?.set(id, undefined)
            }
        },
        [values]
    )

    return {
        blob: _value,
        setBlob: async (blob: Blob) => {
            await values?.set(id, blob)
        },
    }
}

export function useDbUint8Array(blobName: string) {
    const { blob, setBlob } = useDbBlob(blobName)
    const [model, setModel] = useState<Uint8Array>(undefined)

    useEffectAsync(
        async mounted => {
            if (!blob) {
                setModel(undefined)
            } else {
                const buf = await readBlobToUint8Array(blob)
                if (mounted()) setModel(buf)
            }
        },
        [blob]
    )

    return {
        data: model,
        setBlob,
    }
}

export function useDbString(blobName: string) {
    const { blob, setBlob } = useDbBlob(blobName)
    const [model, setModel] = useState<string>(undefined)

    useEffectAsync(async () => {
        if (!blob) {
            setModel(undefined)
        } else {
            const t = await readBlobToText(blob)
            setModel(t)
        }
    }, [blob])

    return {
        data: model,
        setBlob,
    }
}

export function useDbJSON<T>(blobName: string) {
    const { data, setBlob } = useDbString(blobName)
    const value: T = JSONTryParse(data) as T
    return {
        value,
        setBlob: async (blob: Blob) => {
            await setBlob(blob)
        },
    }
}
