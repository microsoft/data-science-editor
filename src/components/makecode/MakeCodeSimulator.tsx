import { createStyles, makeStyles } from "@material-ui/core"
import React, { useContext, useEffect, useRef } from "react"
import {
    PACKET_PROCESS,
    PACKET_SEND,
} from "../../../jacdac-ts/src/jdom/constants"
import { PacketMessage } from "./iframebridgeclient"
import Packet from "../../../jacdac-ts/src/jdom/packet"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import PaperBox from "../ui/PaperBox"
import MakeCodeSnippetContext from "./MakeCodeSnippetContext"
import { MakeCodeSnippetSource } from "./makecodesnippetparser"

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: "100%",
        },
        root2: {
            position: "relative",
            paddingTop: "86.75%",
        },
        iframe: {
            position: "absolute",
            left: 0,
            top: 0,
            border: "none",
            width: "100%",
            height: "100%",
        },
    })
)

export default function MakeCodeSimulator(props: {
    snippet: MakeCodeSnippetSource
}) {
    const { simUrl } = useContext(MakeCodeSnippetContext)
    const { snippet } = props
    const { code, ghost, meta } = snippet
    const { dependencies } = meta
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const frameRef = useRef<HTMLIFrameElement>()
    const classes = useStyles()

    const src = `${ghost || ""}\n${code || ""}`
    const url = `${simUrl}#single=1&fullscren=1&nofooter=1&deps=${encodeURIComponent(
        dependencies.join(",")
    )}&code=${encodeURIComponent(src)}`
    const origin = new URL(url).origin

    useEffect(() =>
        bus.subscribe([PACKET_SEND, PACKET_PROCESS], (pkt: Packet) => {
            this.packetSent++
            const msg: PacketMessage = {
                type: "messagepacket",
                channel: "jacdac",
                broadcast: true,
                data: pkt.toBuffer(),
                sender: pkt.sender,
            }
            frameRef.current?.contentWindow?.postMessage(msg, origin)
        })
    )

    return (
        <PaperBox>
            <div className={classes.root}>
                <div className={classes.root2}>
                    <iframe
                        ref={frameRef}
                        className={classes.iframe}
                        src={url}
                        title="MakeCode rendering iframe to generate blocks images."
                    />
                </div>
            </div>
        </PaperBox>
    )
}
