import { styled } from "@mui/material/styles"
import React from "react"
import useChange from "../../../jacdac/useChange"
import { deviceScriptBridge } from "../dsl/workers/vm.proxy"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"

const PREFIX = "VariablesFields"

const classes = {
    table: `${PREFIX}table`,
}

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.table}`]: {
        padding: 0,
        margin: 0,
        fontSize: "0.9rem",
        lineHeight: "1rem",
        color: theme.palette.text.primary,

        "& td": {
            borderColor: "#ccc",
        },
    },
}))

function VariablesWidget() {
    const bridge = deviceScriptBridge()
    const variables = useChange(bridge, _ => _?.variables)

    if (!variables) return null
    return (
        <table className={classes.table}>
            <tbody>
                {Object.entries(variables).map(([name, value]) => (
                    <tr key={name}>
                        <td>{name}</td>
                        <td>{value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default class VariablesField extends ReactInlineField {
    static KEY = "jacdac_field_variables_view"
    EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new VariablesField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return (
            <Root>
                <VariablesWidget />
            </Root>
        )
    }
}
