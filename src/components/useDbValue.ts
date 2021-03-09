import React, { useContext, useState, useEffect } from "react"
import useChange from "../jacdac/useChange"
import DbContext, { DB_VALUE_CHANGE } from "./DbContext"
import useEffectAsync from "./useEffectAsync"

export default function useDbValue(id: string, initialValue: string) {
    const { db } = useContext(DbContext)
    const [_value, _setValue] = useState<string>(undefined)
    const values = useChange(db, d => d?.values);
    let _mounted = true;

    const setValue = async (value: string) => {
        await values?.set(id, value)
    }

    // listen to change
    useEffect(() => values?.subscribe(DB_VALUE_CHANGE, async (changed) => {
        //    console.log(`db value changed`, id)
        if (changed === id) {
            const v = await values.get(id)
            if (_mounted) {
                _setValue(v);
            }
        }
        return () => {
            _mounted = false;
        }
    }), [db, values])

    // load intial value
    useEffectAsync(async (mounted) => {
        const v = await values?.get(id);
        if (mounted()) {
            //      console.log(`load dbvalue ${id}`, values, v)
            _setValue(v || initialValue)
        }
    }, [db, values])

    return {
        value: _value,
        setValue
    }
}

