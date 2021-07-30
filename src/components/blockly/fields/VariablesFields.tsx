import { createStyles, makeStyles, Theme } from "@material-ui/core"
import React, { useContext, useEffect, useState } from "react"
import { VM_GLOBAL_CHANGE } from "../../../../jacdac-ts/src/vm/events"
import { atomic } from "../../../../jacdac-ts/src/vm/runner"
import WorkspaceContext from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        table: {
            padding: 0,
            margin: 0,
            fontSize: "0.9rem",
            lineHeight: "1rem",
            color: theme.palette.text.primary,

            "& td": {
                borderColor: "#ccc",
            },
        },
    })
)

function VariablesWidget() {
    const { runner } = useContext(WorkspaceContext)
    const classes = useStyles()
    const [variables, setVariables] = useState<
        { name: string; value: atomic }[]
    >(runner?.globals())
    useEffect(
        () =>
            runner?.subscribe(VM_GLOBAL_CHANGE, () =>
                setVariables(runner.globals())
            ),
        [runner]
    )

    return (
        <>
            {variables && (
                <table className={classes.table}>
                    <tbody>
                        {variables?.map(({ name, value }) => (
                            <tr key={name}>
                                <td>{name}</td>
                                <td>{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
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
        return <VariablesWidget />
    }
}
