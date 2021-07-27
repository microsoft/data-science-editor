import React, { ReactNode, useContext } from "react"
import WorkspaceContext from "../WorkspaceContext"
import useBlockData from "../useBlockData"
import { Grid, makeStyles } from "@material-ui/core"
import { TABLE_HEIGHT, TABLE_WIDTH } from "../toolbox"
import { PointerBoundary } from "./PointerBoundary"
import CopyButton from "../../ui/CopyButton"
import { unparseCSV } from "../dsl/workers/csv.proxy"

interface StylesProps {
    tableHeight: number
}

const useStyles = makeStyles(() => ({
    empty: {
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
        background: "#fff",
        color: "#000",
        borderRadius: "0.25rem",
    },
    button: {
        color: "grey",
    },
    root: (props: StylesProps) => ({
        marginTop: "0.25rem",
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
        background: "#fff",
        color: "#000",
        borderRadius: "0.25rem",
        width: `calc(${TABLE_WIDTH}px - 0.25rem)`,
        height: `calc(${props.tableHeight}px - 0.25rem)`,
        overflow: "auto",
    }),
    table: {
        margin: 0,
        fontSize: "0.8rem",
        lineHeight: "1rem",

        "& th, td": {
            backgroundClip: "padding-box",
            "scroll-snap-align": "start",
        },
        "& th": {
            position: "sticky",
            top: 0,
            background: "white",
        },
        "& td": {
            borderColor: "#ccc",
            borderRightStyle: "solid 1px",
        },
    },
}))

export function DataTableWidget(props: {
    transformed?: boolean
    tableHeight?: number
    empty?: ReactNode
}): JSX.Element {
    const { transformed, tableHeight = TABLE_HEIGHT, empty } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data, transformedData } = useBlockData<{ id?: string } & unknown>(
        sourceBlock
    )
    const table = transformed ? transformedData : data
    const classes = useStyles({ tableHeight })

    if (!table?.length)
        return empty ? <span className={classes.empty}>{empty}</span> : null

    const columns = Object.keys(table[0] || {})

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderCell = (v: any) =>
        typeof v === "boolean" ? (v ? "true" : "false") : v + ""

    const handleCopy = async () => {
        const text = unparseCSV(table)
        return text
    }

    return (
        <PointerBoundary className={classes.root}>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <CopyButton
                        size="small"
                        className={classes.button}
                        onCopy={handleCopy}
                    />
                </Grid>
                <Grid item xs={12}>
                    <table className={classes.table}>
                        <thead>
                            <tr>
                                {columns.map(c => (
                                    <th key={c}>{c}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {table.map((r, i) => (
                                <tr key={r.id || i}>
                                    {columns.map(c => (
                                        <td key={c}>{renderCell(r[c])}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Grid>
            </Grid>
        </PointerBoundary>
    )
}
