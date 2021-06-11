import { useTheme } from "@material-ui/core"
import React, { useContext } from "react"
import useChange from "../../../jacdac/useChange"
import WorkspaceContext from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"

function VariablesWidget() {
    const { runner } = useContext(WorkspaceContext)
    const theme = useTheme()
    const variables = useChange(runner, _ => _?.globals(true))
    return (
        <>
            {variables && (
                <table style={{ color: theme.palette.text.primary }}>
                    {variables.map(({ name, value }) => (
                        <tr key={name}>
                            <td>{name}</td>
                            <td>{value}</td>
                        </tr>
                    ))}
                </table>
            )}
        </>
    )
}

export default class VariablesField extends ReactInlineField {
    static KEY = "jacdac_field_variables_view"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new VariablesField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <VariablesWidget />
    }
}
