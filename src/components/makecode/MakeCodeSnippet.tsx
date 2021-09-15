import React, { useState, useMemo, useContext } from "react"
import PaperBox from "../ui/PaperBox"
import { Tab, Tabs } from "@material-ui/core"
import CodeBlock from "../CodeBlock"
import TabPanel from "../ui/TabPanel"
import MakeCodeSnippetContext from "./MakeCodeSnippetContext"
import { withPrefix } from "gatsby"
import parseMakeCodeSnippet from "./makecodesnippetparser"

interface Rendered {
    url: string
    width: number
    height: number
}

export default function MakeCodeSnippet(props: { renderedSource: string }) {
    const { renderedSource } = props
    const { source, rendered } = JSON.parse(renderedSource) as {
        source: string
        rendered: Rendered
    }
    const { url } = rendered || {}
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
    const snippet = useMemo(() => parseMakeCodeSnippet(source), [source])
    const { code } = snippet

    return (
        <PaperBox>
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
