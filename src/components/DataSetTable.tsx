import React from "react"
import { makeStyles } from "@material-ui/core/styles"
// tslint:disable-next-line: no-submodule-imports
import Table from "@material-ui/core/Table"
// tslint:disable-next-line: no-submodule-imports
import TableBody from "@material-ui/core/TableBody"
// tslint:disable-next-line: no-submodule-imports
import TableCell from "@material-ui/core/TableCell"
// tslint:disable-next-line: no-submodule-imports
import TableContainer from "@material-ui/core/TableContainer"
// tslint:disable-next-line: no-submodule-imports
import TableHead from "@material-ui/core/TableHead"
// tslint:disable-next-line: no-submodule-imports
import TableRow from "@material-ui/core/TableRow"
// tslint:disable-next-line: no-submodule-imports
import Paper from "@material-ui/core/Paper"
import { DataSet } from "./DataSet"
import { prettyDuration } from "../../jacdac-ts/src/jdom/pretty"

const useStyles = makeStyles({
    table: {
        minWidth: "10rem",
    },
})

export default function DataSetTable(props: {
    dataSet: DataSet
    maxRows?: number
    minRows?: number
    className?: string
}) {
    const { dataSet, maxRows, minRows, className } = props
    const { headers, startTimestamp } = dataSet
    const classes = useStyles()

    const data = dataSet.rows.slice(maxRows !== undefined ? -maxRows : 0)
    while (minRows !== undefined && data.length < minRows) data.push(undefined)

    return (
        <TableContainer className={className} component={Paper}>
            <Table
                className={classes.table}
                aria-label="simple table"
                size="small"
            >
                <TableHead>
                    <TableRow>
                        <TableCell align="right" key="time">
                            Time
                        </TableCell>
                        {headers.map(header => (
                            <TableCell align="right" key={`header` + header}>
                                {header}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={`row` + index}>
                            <TableCell align="right" key="timestamp">
                                {row
                                    ? prettyDuration(
                                          row.timestamp - startTimestamp
                                      )
                                    : "_"}
                            </TableCell>
                            {row
                                ? row.data.map((v, i) => (
                                      <TableCell key={"cell" + i} align="right">
                                          {v}
                                      </TableCell>
                                  ))
                                : headers.map((h, i) => (
                                      <TableCell key={"cell" + i} align="right">
                                          _
                                      </TableCell>
                                  ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
