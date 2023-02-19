import React, { useContext } from "react"
import DataTableWidget from "./DataTableWidget"
import { TABLE_PREVIEW_MAX_ITEMS } from "../toolbox"
import { Grid } from "@mui/material"
import useBlockData from "../useBlockData"
import WorkspaceContext from "../WorkspaceContext"

export default function DataTablePreviewWidget(props: { compare?: boolean }) {
    const { compare } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData<{ id?: string } & unknown>(sourceBlock)

    if (!compare)
        return (
            <DataTableWidget
                tableHeight={295}
                empty={"no data"}
                transformed={false}
                maxItems={TABLE_PREVIEW_MAX_ITEMS}
            />
        )
    else if (!data?.length)
        return (
            <DataTableWidget
                label="after"
                tableHeight={295}
                empty={"no data"}
                transformed={true}
                maxItems={TABLE_PREVIEW_MAX_ITEMS}
            />
        )
    else
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
