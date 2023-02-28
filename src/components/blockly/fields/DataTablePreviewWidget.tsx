import React, { useContext } from "react"
import DataTableWidget from "./DataTableWidget"
import { TABLE_PREVIEW_MAX_ITEMS, TABLE_WIDTH } from "../toolbox"
import { Grid } from "@mui/material"
import useBlockData from "../useBlockData"
import WorkspaceContext from "../WorkspaceContext"

export default function DataTablePreviewWidget(props: {
    compare?: boolean
    hideSummary?: boolean
    transformed?: boolean
}) {
    const { compare, hideSummary, transformed } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData<{ id?: string } & unknown>(sourceBlock)

    if (!compare)
        return (
            <div style={{ background: "#fff" }}>
                <DataTableWidget
                    tableHeight={295}
                    empty={"no data"}
                    transformed={!!transformed}
                    tableWidth={TABLE_WIDTH * 2}
                    maxItems={TABLE_PREVIEW_MAX_ITEMS}
                    hideSummary={hideSummary}
                />
            </div>
        )
    else if (!data?.length)
        return (
            <div style={{ background: "#fff" }}>
                <DataTableWidget
                    label="after"
                    tableHeight={295}
                    tableWidth={TABLE_WIDTH * 2}
                    empty={"no data"}
                    transformed={true}
                    maxItems={TABLE_PREVIEW_MAX_ITEMS}
                    hideSummary={hideSummary}
                />
            </div>
        )
    else
        return (
            <Grid container spacing={1} style={{ background: "#fff" }}>
                <Grid item xs={6}>
                    <DataTableWidget
                        label="before"
                        tableHeight={295}
                        tableWidth={TABLE_WIDTH}
                        empty={"no data"}
                        transformed={false}
                        maxItems={TABLE_PREVIEW_MAX_ITEMS}
                        hideSummary={hideSummary}
                    />
                </Grid>
                <Grid item xs={6}>
                    <DataTableWidget
                        label="after"
                        tableHeight={295}
                        empty={"no data"}
                        transformed={true}
                        maxItems={TABLE_PREVIEW_MAX_ITEMS}
                        hideSummary={hideSummary}
                    />
                </Grid>
            </Grid>
        )
}
