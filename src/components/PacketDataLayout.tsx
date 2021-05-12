import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core"
import React from "react"
import { jdunpack } from "../../jacdac-ts/src/jdom/pack"
import Packet from "../../jacdac-ts/src/jdom/packet"
import { unpackedToObject } from "../../jacdac-ts/src/jdom/packobject"
import { toHex } from "../../jacdac-ts/src/jdom/utils"
import CodeBlock from "./CodeBlock"
import PaperBox from "./ui/PaperBox"
import Tooltip from "./ui/Tooltip"

export default function PacketDataLayout(props: {
    packet: Packet
    showHex?: boolean
    showDecoded?: boolean
    showJSON?: boolean
    showUnpacked?: boolean
}) {
    const { packet, showHex, showDecoded, showUnpacked, showJSON } = props
    const { data, decoded } = packet
    const info = decoded?.info
    const unpacked = info?.packFormat && jdunpack(data, info.packFormat)
    return (
        <>
            {showHex && !!data.length && (
                <PaperBox padding={0}>
                    <Tooltip
                        title={
                            decoded?.info?.packFormat || "unknown data layout"
                        }
                    >
                        <pre>{toHex(data)}</pre>
                    </Tooltip>
                </PaperBox>
            )}
            {showDecoded && !!decoded?.decoded.length && (
                <PaperBox>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>name</TableCell>
                                    <TableCell>value</TableCell>
                                    <TableCell>pretty</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {decoded.decoded.map((member, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            {member.info.name == "_"
                                                ? info.name
                                                : member.info.name}
                                        </TableCell>
                                        <TableCell>
                                            <code>{member.value}</code>
                                        </TableCell>
                                        <TableCell>
                                            <code>{member.humanValue}</code>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </PaperBox>
            )}
            {showUnpacked && info?.packFormat && (
                <Box pb={2}>
                    <CodeBlock className="language-json">
                        {JSON.stringify(unpacked, null, 4)}
                    </CodeBlock>
                </Box>
            )}
            {showJSON && info?.packFormat && (
                <Box pb={2}>
                    <CodeBlock className="language-json">
                        {JSON.stringify(
                            unpackedToObject(unpacked, info.fields, info.name),
                            null,
                            4
                        )}
                    </CodeBlock>
                </Box>
            )}
        </>
    )
}
