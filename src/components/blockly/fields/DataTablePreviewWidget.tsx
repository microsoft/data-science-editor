import React from "react"
import DataTableWidget from "./DataTableWidget"
import { TABLE_PREVIEW_MAX_ITEMS } from "../toolbox"
import { Grid } from "@material-ui/core"

export default function DataTablePreviewWidget(props: { compare?: boolean }) {
    const { compare } = props
    if (!compare)
        return (
            <DataTableWidget
                tableHeight={295}
                empty={"no data"}
                transformed={false}
                maxItems={TABLE_PREVIEW_MAX_ITEMS}
            />
        )
    return (
        <Grid container spacing={1} style={{ background: "#fff" }}>
            <Grid item xs={6}>
                <DataTableWidget
                    label="before"
                    tableHeight={295}
                    empty={"no data"}
                    transformed={false}
                    maxItems={TABLE_PREVIEW_MAX_ITEMS}
                />
            </Grid>
            <Grid item xs={6}>
                <DataTableWidget
                    label="after"
                    tableHeight={295}
                    empty={"no data"}
                    transformed={true}
                    maxItems={TABLE_PREVIEW_MAX_ITEMS}
                />
            </Grid>
        </Grid>
    )
}
