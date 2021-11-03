import React from "react"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material"

import MBModel, { MCU_FLOAT_SIZE, MCU_SPEED } from "../MBModel"
import MBDataSet from "../MBDataSet"

export default function ModelSummary(props: {
    reactStyle: any
    dataset: MBDataSet
    model: MBModel
}) {
    const { model, dataset } = props

    return (
        <>
            {!!dataset && (
                <>
                    {" "}
                    {dataset.summary.map((line, lineIdx) => {
                        return (
                            <span key={"dataset-summary-" + lineIdx}>
                                {" "}
                                {line} <br />
                            </span>
                        )
                    })}{" "}
                </>
            )}
            {model.summary.map((line, lineIdx) => {
                return (
                    <span
                        style={{ whiteSpace: "pre-wrap" }}
                        key={"model-summary-" + lineIdx}
                    >
                        {line}
                        <br />
                    </span>
                )
            })}
            {!!model.modelStats && (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Layer</TableCell>
                            <TableCell align="right">Shape</TableCell>
                            <TableCell align="right"># of Params</TableCell>
                            <TableCell align="right"># of Bytes (%)</TableCell>
                            <TableCell align="right"># of Cycles (%)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow key="input">
                            <TableCell component="th" scope="row">
                                INPUT
                            </TableCell>
                            <TableCell align="right">
                                [{model.inputShape.join(", ")}]
                            </TableCell>
                            <TableCell align="right"></TableCell>
                            <TableCell align="right"></TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                        {model.modelStats.layers.map(layer => (
                            <TableRow key={layer.name}>
                                <TableCell component="th" scope="row">
                                    {layer.name}
                                </TableCell>
                                <TableCell align="right">
                                    [{layer.outputShape.join(", ")}]
                                </TableCell>
                                <TableCell align="right">
                                    {layer.weightBytes / 2}
                                </TableCell>
                                <TableCell align="right">
                                    {layer.weightBytes + layer.codeBytes} (
                                    {(
                                        ((layer.weightBytes + layer.codeBytes) *
                                            100) /
                                        (model.modelStats.total.weightBytes +
                                            model.modelStats.total.codeBytes)
                                    ).toPrecision(3)}
                                    %)
                                </TableCell>
                                <TableCell align="right">
                                    {layer.optimizedCycles} (
                                    {(
                                        (layer.optimizedCycles * 100) /
                                        model.modelStats.total.optimizedCycles
                                    ).toPrecision(3)}
                                    %)
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell>TOTAL</TableCell>
                            <TableCell align="right"></TableCell>
                            <TableCell align="right">
                                {model.modelStats.layers
                                    .map(layer => {
                                        return layer.weightBytes
                                    })
                                    .reduce((total, current) => {
                                        return total + current
                                    }) / MCU_FLOAT_SIZE}
                            </TableCell>
                            <TableCell align="right">
                                {model.modelStats.total.weightBytes +
                                    model.modelStats.total.codeBytes}
                                <br />(
                                {(
                                    (model.modelStats.total.weightBytes +
                                        model.modelStats.total.codeBytes -
                                        model.modelStats.layers
                                            .map(layer => {
                                                return (
                                                    layer.weightBytes +
                                                    layer.codeBytes
                                                )
                                            })
                                            .reduce((total, current) => {
                                                return total + current
                                            })) /
                                    1000
                                ).toPrecision(2)}{" "}
                                KB overhead)
                            </TableCell>
                            <TableCell align="right">
                                {model.modelStats.total.optimizedCycles} <br />(
                                {(
                                    model.modelStats.total.optimizedCycles /
                                    MCU_SPEED
                                ).toPrecision(2)}
                                ms @ 64MHz)
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            )}
        </>
    )
}
