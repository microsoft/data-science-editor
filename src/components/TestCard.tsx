import { Card, CardActions, CardContent, CardHeader } from "@material-ui/core"
import React, { useState } from "react"
import { toHex } from "../../jacdac-ts/src/jdom/utils"
import CmdButton from "./CmdButton"
import Snippet from "./ui/Snippet"

export type TestLogger = (name: string, ...msg: any) => void
export type Test = (log: TestLogger) => Promise<void>

export default function TestCard(props: {
    title: string
    subheader?: string
    children?: JSX.Element | JSX.Element[]
    onTest: Test
    autoRun?: boolean
}) {
    const { title, subheader, onTest, children, autoRun } = props
    const [output, setOutput] = useState("")

    const runTest = async () => {
        const log: string[] = []

        const toValue = (msg: any) => {
            if (msg === undefined || msg === null) return ""
            else if (typeof msg === "string") return msg
            else if (msg instanceof Uint8Array) return toHex(msg)
            else if (Array.isArray(msg)) return msg.map(toValue)
            else return JSON.stringify(msg)
        }

        const logger = (msg: any) => {
            if (msg instanceof Error) log.push(msg + "")
            if (typeof msg === "object") {
                Object.keys(msg).forEach(k =>
                    log.push(`${k}: ${toValue(msg[k])}`)
                )
            } else log.push(toValue(msg))
        }

        try {
            await onTest(logger)
        } catch (e) {
            logger(e)
            throw e
        } finally {
            setOutput(log.join("\n"))
        }
    }

    const handleClick = async () => await runTest()

    return (
        <Card>
            <CardHeader title={title} subheader={subheader} />
            <CardContent>
                {children}
                {output && <Snippet value={output} />}
            </CardContent>
            <CardActions>
                <CmdButton
                    variant="outlined"
                    onClick={handleClick}
                    disableReset={true}
                    autoRun={autoRun}
                >
                    Test
                </CmdButton>
            </CardActions>
        </Card>
    )
}
