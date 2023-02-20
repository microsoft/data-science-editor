import React, { useContext } from "react"
import DataTableWidget from "./DataTableWidget"
import {
    FULL_TABLE_WIDTH,
    PREVIEW_TABLE_HEIGHT,
    TABLE_PREVIEW_MAX_ITEMS,
    TABLE_WIDTH,
} from "../toolbox"
import useBlockData from "../useBlockData"
import WorkspaceContext from "../WorkspaceContext"
import { Panel, PanelGroup } from "react-resizable-panels"
import ResizeHandle from "../../ui/ResizeHandle"

export default function DataTablePreviewWidget(props: { compare?: boolean }) {
    const { compare } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData<{ id?: string } & unknown>(sourceBlock)

    if (!compare)
        return (
            <DataTableWidget
                tableHeight={PREVIEW_TABLE_HEIGHT}
                empty={"no data"}
                transformed={false}
                tableWidth={FULL_TABLE_WIDTH}
                maxItems={TABLE_PREVIEW_MAX_ITEMS}
            />
        )
    else if (!data?.length)
        return (
            <DataTableWidget
                label="after"
                tableHeight={PREVIEW_TABLE_HEIGHT}
                tableWidth={FULL_TABLE_WIDTH}
                empty={"no data"}
                transformed={true}
                maxItems={TABLE_PREVIEW_MAX_ITEMS}
            />
        )
    else
        return (
            <div style={{ background: "#fff" }}>
                <PanelGroup direction="horizontal">
                    <Panel>
                        <DataTableWidget
                            label="before"
                            tableHeight={PREVIEW_TABLE_HEIGHT}
                            empty={"no data"}
                            transformed={false}
                            maxItems={TABLE_PREVIEW_MAX_ITEMS}
                        />
                    </Panel>
                    <ResizeHandle />
                    <Panel>
                        <DataTableWidget
                            label="after"
                            tableHeight={PREVIEW_TABLE_HEIGHT}
                            empty={"no data"}
                            transformed={true}
                            maxItems={TABLE_PREVIEW_MAX_ITEMS}
                        />
                    </Panel>
                </PanelGroup>
            </div>
        )
}
