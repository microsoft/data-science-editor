import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material"
import { Alert, AlertTitle } from "@mui/material"
import React from "react"
import { jdunpack, PackedValues } from "../../jacdac-ts/src/jdom/pack"
import { Packet } from "../../jacdac-ts/src/jdom/packet"
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

    const { info } = decoded || {}
    let unpacked: PackedValues
    let error: string
    try {
        unpacked =
            !!info?.packFormat &&
            !!data.length &&
            jdunpack(data, info.packFormat)
    } catch (e) {
        error = e + ""
    }
    return (
        <>
            {error && (
                <Alert sx={{ mb: 2 }} severity="error">
                    <AlertTitle>Invalid data payload</AlertTitle>
                    {error}
                </Alert>
            )}
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
                                            <code>
                                                {member.value}
                                                {typeof member.value ===
                                                "number"
                                                    ? ` (0x${(
                                                          member.value as number
                                                      ).toString(16)})`
                                                    : ""}{" "}
                                            </code>
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
            {showUnpacked && unpacked && (
                <Box pb={2}>
                    <CodeBlock className="language-json">
                        {JSON.stringify(unpacked, null, 4)}
                    </CodeBlock>
                </Box>
            )}
            {showJSON && unpacked && (
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
