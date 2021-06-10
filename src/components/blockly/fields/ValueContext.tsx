/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, ReactNode, useState } from "react"

export interface ValueContextProps<T = any> {
    value: T
    onValueChange: (value: T) => void
}

export const ValueContext = createContext<ValueContextProps>({
    value: undefined,
    onValueChange: undefined,
})
ValueContext.displayName = "Value"

export default ValueContext

export function ValueProvider(props: {
    value: any
    onValueChange?: (newValue: any) => any
    children: ReactNode
}) {
    const {
        children,
        value: initialValue,
        onValueChange: onFieldValueChange,
    } = props
    const [value, setValue] = useState<any>(initialValue)
    const onValueChange = (newValue: any) => {
        setValue(newValue)
        onFieldValueChange?.(newValue)
    }
    return (
        // eslint-disable-next-line react/react-in-jsx-scope
        <ValueContext.Provider value={{ value, onValueChange }}>
            {children}
        </ValueContext.Provider>
    )
}
