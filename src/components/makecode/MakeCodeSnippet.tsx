import React, { useState, useMemo, useContext } from "react"
import PaperBox from "../ui/PaperBox"
import { Tab, Tabs } from "@mui/material"
import CodeBlock from "../CodeBlock"
import TabPanel from "../ui/TabPanel"
import MakeCodeSnippetContext from "./MakeCodeSnippetContext"
import { withPrefix } from "gatsby"
import parseMakeCodeSnippet from "./makecodesnippetparser"
import { JSONTryParse } from "../../../jacdac-ts/src/jdom/utils"
import MakeCodeOpenSnippetButton from "./MakeCodeOpenSnippetButton"

interface Request {
    code: string
    options: {
        package: string
    }
}
interface Rendered {
    req: Request
    url: string
    width: number
    height: number
}

export default function MakeCodeSnippet(props: { renderedSource: string }) {
    const { renderedSource } = props
    const { source, rendered } = useMemo(
        () =>
            JSONTryParse<{
                source?: string
                rendered?: Rendered
            }>(renderedSource, {}),
        [renderedSource]
    )
    const snippet = useMemo(
        () => source && parseMakeCodeSnippet(source),
        [source]
    )
    const { url, req } = rendered || {}
    const tabs = ["blocks", "typescript"]
    const { editor, setEditor } = useContext(MakeCodeSnippetContext)
    const [tab, setTab] = useState(tabs.indexOf(editor) || 0)
    const handleTabChange = (
        event: React.ChangeEvent<unknown>,
        newValue: number
    ) => {
        if (newValue < tabs.length - 1) setEditor(tabs[newValue])
        setTab(newValue)
    }
    const { code } = snippet || {}

    if (!code)
        return <CodeBlock className="typescript">{renderedSource}</CodeBlock>

    return (
        <PaperBox>
            {req && (
                <div style={{ float: "right" }}>
                    <MakeCodeOpenSnippetButton {...req} />
                </div>
            )}
            <Tabs
                value={tab}
                onChange={handleTabChange}
                aria-label="Select MakeCode editor"
            >
                <Tab label={"Blocks"} />
                <Tab label={"JavaScript"} />
            </Tabs>
            <TabPanel value={tab} index={0}>
                <img src={withPrefix(url)} alt={source} loading="lazy" />
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <CodeBlock className="typescript">{code}</CodeBlock>
            </TabPanel>
        </PaperBox>
    )
}
