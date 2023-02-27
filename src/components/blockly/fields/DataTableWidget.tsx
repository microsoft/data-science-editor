import React, { ReactNode, useContext } from "react"
import { styled } from "@mui/material/styles"
import WorkspaceContext from "../WorkspaceContext"
import useBlockData from "../useBlockData"
import { Grid, Typography } from "@mui/material"
import { TABLE_HEIGHT, TABLE_WIDTH } from "../toolbox"
import { PointerBoundary } from "./PointerBoundary"
import CopyButton from "../../ui/CopyButton"
import { unparseCSV } from "../dsl/workers/csv.proxy"
import { tidyHeaders } from "./tidy"
import { humanify, roundWithPrecision, toMap } from "../../dom/utils"
import HistogramCell from "./chart/HistogramCell"
import { resolveColumns } from "./DataColumnChooserField"

const PREFIX = "DataTableWidget"

const classes = {
    empty: `${PREFIX}Empty`,
    button: `${PREFIX}Button`,
    root: `${PREFIX}Root`,
    table: `${PREFIX}Table`,
    chart: `${PREFIX}Chart`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")((props: StylesProps) => ({
    background: "#fff",
    color: "#000",

    [`& .${classes.empty}`]: {
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
        color: "#000",
        borderRadius: "0.25rem",
    },

    [`& .${classes.button}`]: {
        color: "grey",
    },

    [`& .${classes.root}`]: {
        marginTop: "0.25rem",
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
        background: "#fff",
        color: "#000",
        borderRadius: "0.25rem",
        width: `calc(${props.tableWidth}px - 0.25rem)`,
        height: `calc(${props.tableHeight}px - 0.25rem)`,
        overflow: "auto",
    },

    [`& .${classes.table}`]: {
        margin: "0.25rem",
        fontSize: "0.8rem",
        lineHeight: "1rem",

        "& th, td": {
            backgroundClip: "padding-box",
            scrollSnapAlign: "start",
        },
        "& th": {
            position: "sticky",
            top: 0,
            background: "#fff",
        },
        [`& td.${classes.chart}`]: {
            width: "8rem",
            verticalAlign: "top",
        },
        "& td": {
            borderColor: "#ccc",
            borderRight: "solid #ccc 1px",
            fontVariantNumeric: "tabular-nums",
        },
        "& td.number": {
            textAlign: "right",
        },
    },
}))

interface StylesProps {
    tableHeight: number
    tableWidth: number
}

export default function DataTableWidget(props: {
    label?: string
    transformed?: boolean
    tableHeight?: number
    tableWidth?: number
    empty?: ReactNode
    maxItems?: number
    selectColumns?: boolean
}): JSX.Element {
    const {
        label,
        transformed,
        tableHeight = TABLE_HEIGHT,
        tableWidth = TABLE_WIDTH,
        empty,
        maxItems,
        selectColumns,
    } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data, transformedData } = useBlockData<{ id?: string } & unknown>(
        sourceBlock
    )
    const raw = transformed ? transformedData : data

    if (!raw?.length)
        return empty ? <span className={classes.empty}>{empty}</span> : null

    const histogram = raw.length > 3
    const selectedColumns = selectColumns
        ? resolveColumns(data, sourceBlock, 6, { start: 0 })
        : []
    const columns = selectedColumns.length
        ? selectedColumns
        : tidyHeaders(raw).headers
    const table =
        raw.length > maxItems
            ? [
                  ...raw.slice(0, maxItems),
                  toMap(
                      columns,
                      c => c,
                      () => "..."
                  ),
              ]
            : raw

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderCell = (v: any) =>
        v === undefined || v === null
            ? ""
            : typeof v === "boolean"
            ? v
                ? "true"
                : "false"
            : typeof v === "number"
            ? roundWithPrecision(v, 3)
            : v + ""

    const handleCopy = async () => {
        const text = unparseCSV(raw)
        return text
    }

    return (
        <Root
            tableHeight={tableHeight}
            tableWidth={tableWidth}
            sx={{ height: `${tableHeight}px - 0.25rem)` }}
        >
            <PointerBoundary className={classes.root}>
                <Grid container direction="column" spacing={1}>
                    <Grid item xs={12}>
                        <Grid
                            container
                            direction="row"
                            justifyContent="flex-start"
                            alignItems="center"
                            spacing={1}
                        >
                            {label && (
                                <Grid item>
                                    <Typography variant="h6">
                                        {label}
                                    </Typography>
                                </Grid>
                            )}
                            <Grid item>
                                <CopyButton
                                    size="small"
                                    className={classes.button}
                                    onCopy={handleCopy}
                                    title="Copy data to clipboard"
                                />
                            </Grid>
                            {raw.length > 1 && (
                                <Grid item>
                                    <Typography variant="caption">
                                        {raw.length} rows x {columns.length}{" "}
                                        columns
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <table className={classes.table}>
                            <thead>
                                <tr>
                                    {columns.map(c => (
                                        <th key={c}>{humanify(c)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {histogram && (
                                    <tr key="charts">
                                        {columns.map(c => (
                                            <td
                                                key={c}
                                                className={classes.chart}
                                            >
                                                <HistogramCell
                                                    transformed={transformed}
                                                    column={c}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                )}
                                {table.map((r, i) => (
                                    <tr key={i}>
                                        {columns.map(c => (
                                            <td key={c} className={typeof r[c]}>
                                                {renderCell(r[c])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Grid>
                </Grid>
            </PointerBoundary>
        </Root>
    )
}
