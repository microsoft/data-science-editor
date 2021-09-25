import React, { useRef } from "react"
import {
    BlockJSON,
    getFieldValue,
    resolveFieldColumn,
} from "../../components/blockly/dsl/workspacejson"
import DataColumnChooserField from "../../components/blockly/fields/DataColumnChooserField"
import {
    BlockDataSet,
    BlockDefinition,
    BlockReference,
    CategoryDefinition,
    ContentDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    OptionsInputDefinition,
} from "../../components/blockly/toolbox"
import useWindowEvent from "../../components/hooks/useWindowEvent"
import { tidy, arrange, desc } from "@tidyjs/tidy"
import {
    DslBlocksResponse,
    DslMessage,
    DslTransformMessage,
} from "../../components/blockly/dsl/iframedsl"

export default function Page() {
    const frame = useRef<HTMLIFrameElement>()
    const colour = "#f01010"
    const blocks: BlockDefinition[] = [
        {
            kind: "block",
            type: "iframe_sort",
            message0: "iframe arrange %1 %2",
            colour,
            args0: [
                {
                    type: DataColumnChooserField.KEY,
                    name: "column",
                },
                {
                    type: "field_dropdown",
                    name: "order",
                    options: [
                        ["ascending", "ascending"],
                        ["descending", "descending"],
                    ],
                } as OptionsInputDefinition,
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            dataPreviewField: true,
            template: "meta",
        },
    ]
    const category: ContentDefinition[] = [
        {
            kind: "category",
            name: "Custom",
            colour,
            contents: blocks.map(
                block => ({ kind: "block", type: block.type } as BlockReference)
            ),
        } as CategoryDefinition,
    ]
    const transforms: Record<
        string,
        (
            b: BlockJSON,
            dataset: BlockDataSet
        ) => Promise<{ dataset: BlockDataSet; warning?: string }>
    > = {
        iframe_identity: async (b, dataset) => {
            console.debug(`hostdsl: identity`)
            return { dataset }
        },
        iframe_sort: async (b, dataset) => {
            const { column, warning } = resolveFieldColumn(dataset, b, "column")
            const order = getFieldValue(b, "order")
            const descending = order === "descending"

            console.debug(`hostdsl: sort`, {
                b,
                dataset,
                column,
                order,
                descending,
                warning,
            })

            if (!column) return Promise.resolve({ dataset, warning })
            const res = tidy(
                dataset,
                arrange(descending ? desc(column) : column)
            )
            return { dataset: res, warning }
        },
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    const post = (payload: object) => {
        frame.current.contentWindow.postMessage(payload, "*")
    }

    const handleBlocks = async (data: DslMessage) => {
        console.debug(`hostdsl: sending blocks`)
        post({ ...data, blocks, category } as DslBlocksResponse)
    }

    const handleTransform = async (data: DslTransformMessage) => {
        const { blockId, workspace, dataset, ...rest } = data
        const block = workspace.blocks.find(b => b.id === blockId)
        const transformer = transforms[block.type]
        const res = await transformer?.(block, dataset)
        post({ ...rest, ...(res || {}) })
    }

    useWindowEvent(
        "message",
        (msg: MessageEvent<DslMessage>) => {
            const { data } = msg
            if (data.type !== "dsl") return
            const { action } = data
            switch (action) {
                case "mount":
                    break
                case "unmount":
                    break
                case "blocks": {
                    handleBlocks(data)
                    break
                }
                case "transform": {
                    handleTransform(data as DslTransformMessage)
                    break
                }
            }
        },
        false,
        []
    )

    return (
        <>
            <h1>Data Editor + hosted blocks</h1>
            <p>
                The data editor below is an example of hosted editor with additional blocks injected by host (Custom category).
            </p>
            <iframe
                ref={frame}
                title="data editor"
                src="./data?embed=1"
                style={{
                    border: "none",
                    left: 0,
                    top: 0,
                    width: "100vh",
                    height: "80vh",
                }}
            ></iframe>
        </>
    )
}
