import React, { useState, useMemo, useContext } from "react"
import PaperBox from "../ui/PaperBox"
import { Button, Tab, Tabs } from "@mui/material"
import CodeBlock from "../CodeBlock"
import TabPanel from "../ui/TabPanel"
import MakeCodeSnippetContext from "./MakeCodeSnippetContext"
import { withPrefix } from "gatsby"
import parseMakeCodeSnippet from "./makecodesnippetparser"
import AppContext from "../AppContext"
import { JSONTryParse, toMap } from "../../../jacdac-ts/src/jdom/utils"
import MakeCodeIcon from "../icons/MakeCodeIcon"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import useMediaQueries from "../hooks/useMediaQueries"

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

function MakeCodeButton(props: { req: Request }) {
    const { req } = props
    const { setError } = useContext(AppContext)
    const { mobile } = useMediaQueries()
    const [importing, setImporting] = useState(false)
    const { code, options } = req
    const md = "\n"
    const name = "Jacdac demo"
    const target = "microbit"
    const editor = "https://makecode.microbit.org/"
    const deps = options?.package?.split(",").map(dep => dep.split("=", 2))
    const dependencies =
        toMap(
            deps,
            deps => deps[0],
            deps => deps[1]
        ) || {}
    const handleClick = async () => {
        try {
            setImporting(true)
            const x = await fetch("https://makecode.com/api/scripts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name,
                    target,
                    description: "Made with ❤️ in Microsoft Jacdac.",
                    editor: "blocksprj",
                    text: {
                        "README.md": md,
                        "main.blocks": "",
                        "main.ts": code,
                        "pxt.json": JSON.stringify({
                            name: name,
                            dependencies: {
                                core: "*",
                                ...dependencies,
                            },
                            description: "",
                            files: ["main.blocks", "main.ts", "README.md"],
                        }),
                    },
                    meta: {},
                }),
            })
            const data = await x.json()
            const url = `${editor}#pub:${data.shortid}`
            window.open(url, "_blank", "noreferrer")
        } catch (error) {
            setError(error)
        } finally {
            setImporting(false)
        }
    }

    return mobile ? (
        <IconButtonWithTooltip
            onClick={handleClick}
            color="primary"
            disabled={importing}
            title="Try in MakeCode"
        >
            <MakeCodeIcon />
        </IconButtonWithTooltip>
    ) : (
        <Button
            variant="outlined"
            color="primary"
            onClick={handleClick}
            disabled={importing}
            startIcon={<MakeCodeIcon />}
        >
            Try in MakeCode
        </Button>
    )
}

export default function MakeCodeSnippet(props: { renderedSource: string }) {
    const { renderedSource } = props
    console.log({ renderedSource })
    const { source, rendered } = useMemo(
        () =>
            JSONTryParse<{
                source?: string
                rendered?: Rendered
            }>(renderedSource, {}),
        [renderedSource]
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
    const snippet = useMemo(() => parseMakeCodeSnippet(source), [source])
    const { code } = snippet

    return (
        <PaperBox>
            {req && (
                <div style={{ float: "right" }}>
                    <MakeCodeButton req={req} />
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
