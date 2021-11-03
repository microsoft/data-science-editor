import { Card, CardActions, CardContent, CardHeader, Grid } from "@mui/material"
import { Button } from "gatsby-theme-material-ui"
import React, { useContext } from "react"
import { prettyDuration } from "../../jacdac-ts/src/jdom/pretty"
import ServiceManagerContext from "./ServiceManagerContext"
import Trend from "./Trend"
import useGridBreakpoints from "./useGridBreakpoints"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import SaveAltIcon from "@mui/icons-material/SaveAlt"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeleteIcon from "@mui/icons-material/Delete"
import FieldDataSet from "./FieldDataSet"
import IconButtonWithTooltip from "./ui/IconButtonWithTooltip"

export default function DataSetGrid(props: {
    tables: FieldDataSet[]
    handleDeleteTable?: (table: FieldDataSet) => void
}) {
    const { tables, handleDeleteTable } = props
    const { fileStorage } = useContext(ServiceManagerContext)
    const gridBreakpoints = useGridBreakpoints(tables?.length)

    const handleDownload = (table: FieldDataSet) => () => {
        const sep = ","
        const csv = table.toCSV(sep)
        fileStorage.saveText(`${table.name}.csv`, csv)
    }
    const handelDelete = (table: FieldDataSet) => () => handleDeleteTable(table)
    return (
        <Grid container spacing={1}>
            {tables.map(table => (
                <Grid item {...gridBreakpoints} key={`result` + table.id}>
                    <Card>
                        <CardHeader
                            subheader={`${
                                table.rows.length
                            } rows, ${prettyDuration(table.duration)}`}
                        />
                        <CardContent>
                            <div>{table.headers.join(", ")}</div>
                            <Trend dataSet={table} height={8} mini={true} />
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SaveAltIcon />}
                                onClick={handleDownload(table)}
                            >
                                Save
                            </Button>
                            {handleDeleteTable && (
                                <IconButtonWithTooltip
                                    title="delete"
                                    onClick={handelDelete(table)}
                                >
                                    <DeleteIcon />
                                </IconButtonWithTooltip>
                            )}
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    )
}
