import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import React from "react";
import Packet from "../../jacdac-ts/src/jdom/packet";
import { toHex } from "../../jacdac-ts/src/jdom/utils";
import PaperBox from "./ui/PaperBox";
import Tooltip from "./ui/Tooltip";

export default function PacketDataLayout(props: { packet: Packet, showHex?: boolean, showDecoded?: boolean }) {
    const { packet, showHex, showDecoded } = props;
    const { data, decoded } = packet;
    const info = decoded?.info;
    return <>
        {showHex && !!data.length && <PaperBox padding={0}>
            <Tooltip title={decoded?.info?.packFormat || "unknown data layout"}>
                <pre>
                    {toHex(data)}
                </pre>
            </Tooltip>
        </PaperBox>}
        {showDecoded && !!decoded?.decoded.length && <PaperBox>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                name
                        </TableCell>
                            <TableCell>
                                value
                        </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {decoded.decoded.map((member, i) => <TableRow key={i}>
                            <TableCell>{member.info.name == '_' ? info.name : member.info.name}</TableCell>
                            <TableCell><code>{member.humanValue}</code></TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>
        </PaperBox>}
    </>
}